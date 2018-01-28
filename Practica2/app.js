
"use strict";
const express = require("express");
const https = require("https");
const fs = require("fs");
const passport = require("passport");
const passportHTTP = require("passport-http");
const config = require("./config");
const mysql = require("mysql");//mysql
const path = require("path");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const game = require("./game");

let privateKey = fs.readFileSync("./clave.pem");
let cert = fs.readFileSync("./certificado_firmado.crt");
const app = express();
let server = https.createServer({ key: privateKey, cert: cert }, app);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(expressValidator());

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoUsers = require("./daoUsers");
let daoU = new daoUsers(pool);
const daoGames = require("./daoGames");
let daoG = new daoGames(pool);


app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy(
    { realm: "Pagina protegida" },
    function (user, pass, f) {
        daoU.userCorrect(user, pass, (err, res) => {
            if (err) { f(err); return; }
            else f(null, res); //En res tenemos el ID
        });
    }
));

app.get("/", (request, response) => {
    response.redirect("/mentiroso.html");
});

app.post("/login", (request, response) => {
    daoU.userCorrect(request.body.user, request.body.password, (err, res) => {
        if (err) { response.status(500); return; }
        else {
            if (res) { response.status(200); response.json({ id: res }); }
            else { response.status(404); response.json({}) }
        }
    });
});


app.post("/register", (request, response) => {
    request.checkBody("user", "Nombre de usuario no vacio").notEmpty();
    request.checkBody("user", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
    request.checkBody("password", "La contraseña no es válida").isLength({ min: 6, max: 10 });
    let errors = request.validationErrors();
    if (errors) {
        response.status(404);
        response.json({});
    }
    else {
        daoU.insertUser(request.body.user, request.body.password, (err, res) => {
            if (err) { response.status(500); return; }
            else {
                if (res) { response.status(201); response.json({}); }
                else { response.status(400); response.json({}); }   //Usuario ya existente
            }
        });
    }
});

//Devuelve el estado para el jugador concreto si la partida esta completa
//En caso de que la partida no esté completa devuelve sólamente el nombre de los jugadores
app.get("/status/:idGame/:player", passport.authenticate('basic', { session: false }), (request, response) => {
    if (isNaN(request.params.idGame)) {
        response.status(404);
        response.json({});
    }
    else {
        let idGame = Number(request.params.idGame); //Obtenemos el id del juego
        let playerName = request.params.player; //Obtenemos el id del jugador
        daoG.getGamePlayers(idGame, (err, res) => {
            if (err) { response.status(500); return; }
            else {//Aqui devolver tambien el status de la partida en el if: getGameStatus()
                if (res) {
                    let names = [];
                    res.players.forEach(e => {
                        names.push(e.name);
                    });
                    daoG.getGameStatus(idGame, (err, res) => {
                        if (err) { response.status(500); return; }
                        else {
                            //Si la partida ha comenzado, hay status
                            if (res) {    //Devolvemos la info relevante para el jugador
                                res = JSON.parse(res);
                                let player = -1;
                                for(let i = 0; i < res.names.length; i++){
                                    if(playerName === res.names[i])
                                        player = i; //Obtenemos el numero del jugador
                                }
                                let status = {
                                    names: res.names,
                                    myCards: res.cards[player],
                                    numCards: res.numCards,
                                    table: res.falseOnTable,
                                    turn: res.turn,
                                    end: res.end,
                                }
                                console.log(status);
                                //let status = game.playerStatus(playerName, res);
                                response.json({ status: status })
                            }
                            else    //Si la partida no ha comenzado, devolvemos sólo los nombres
                                response.json({ names: names });
                        }
                    })
                }
                else { response.status(404); response.json({}); }
            }
        });
    }
});


app.post("/createGame", passport.authenticate('basic', { session: false }), (request, response) => {
    let name = request.body.gameName;
    let userId = request.user;
    daoG.insertGame(name, userId, (err, res) => {
        if (err) { response.status(500); return; }
        else {
            if (res) {
                response.status(201); response.json({ id: res });
            }
            else {  //No debería llegar aqui
                response.status(400); response.json({});
            }
        }
    });
});


app.post("/joinGame", passport.authenticate('basic', { session: false }), (request, response) => {
    let gameId = request.body.gameId;
    let userId = request.user;
    let userName = request.body.name;
    console.log(userName);
    daoG.getGamePlayers(gameId, (err, res) => {
        if (err) { res.status(500); return; }
        else {
            if (!res) { //La partida no existe
                response.status(404);
                response.json({ error: "ERROR: Partida no existente" });
            }
            else {
                let players = res.players;
                if (players.length < 4) { //Comprobar si el usuario está ya incluido
                    let included = false;
                    players.forEach(element => {
                        if (element.id === userId) //Usuario ya incluido
                            included = true;
                    });
                    if (included) {   //Usuario ya incluido
                        response.status(400);
                        response.json({ error: "ERROR: Usuario ya en partida" });
                    }
                    else {  //Insertamos al jugador
                        daoG.joinGame(gameId, userId, (err, res) => {
                            if (err) { response.status(500); return; }
                            else {
                                if (res) { //Se devuelve true si se une, si no ocurrira un err
                                    daoG.getGameName(gameId, (err, res) => {    //Necesario para añadir la pestaña
                                        if (err) { res.status(500); return; }
                                        else {
                                            response.status(200);
                                            let name = res;
                                            if (players.length + 1 === 4) { //ultimo jugador
                                                daoG.getGamePlayers(gameId, (err, players) => {
                                                    if (err) { res.status(500); return; }
                                                    else {
                                                        let status = game.startGame(gameId, players);
                                                        daoG.updateGameStatus(gameId, status, (err, res) => {
                                                            if (err) { res.status(500); return; }
                                                            else{
                                                                let event = userName+" se ha unido a la partida";
                                                                daoG.insertEvent(gameId, event, (err, res) => {
                                                                    if (err) { res.status(500); return; }
                                                                    else response.json({});
                                                                });
                                                                response.json({ name: name });
                                                            }
                                                        });
                                                    }
                                                })

                                            }
                                            else
                                                response.json({ name: name });
                                        }
                                    });
                                }
                            }
                            
                        });
                    }
                }
                else {   //Partida llena
                    response.status(400);
                    response.json({ error: "ERROR: Partida completa" });
                }
            }
        }
    });
});

//Obtenemos el id y los nombres de las partidas para el jugador
app.get("/userGamesInfo", passport.authenticate('basic', { session: false }), (request, response) => {
    let id = request.user;
    daoG.getUserGames(id, (err, res) => {
        if (err) { response.status(500); return; }
        else {
            if (res) {
                response.status(200);
                let ids = [];
                let names = [];
                for (let i = 0; i < res.length; i++) {
                    ids.push(res[i].id);
                    names.push(res[i].name);
                }
                response.json({ ids: ids, names: names });
            }
            else {
                response.status(200);   //Usuario sin partidas
                response.json({});
            }
        }
    });
});

//Realiza las acciones del juego
app.put("/action", passport.authenticate('basic', { session: false }), (request, response) => {
    daoG.getGameStatus(request.body.id, (err, status) => {  //Obtenemos el estado
        if (err) { response.status(500); return }
        else {
            if (status) {
                let cards = request.body.cards; //cartas buenas del jugador
                status = JSON.parse(status);
                status.lastCards = [];
                cards.forEach(card => {
                    status.trueOnTable.push(card);
                    status.lastCards.push(card);
                    status.falseOnTable.push(game.getRandomCardByNumber(request.body.number));
                });
                let playerIndex = game.getPlayerIndex(status.turn, status);
                //Eliminamos las cartas echadas del mazo del jugador
                status.cards[playerIndex] = game.removeCardsSelected(status.cards[playerIndex], cards);//Borra las cartas del usuario
                status.numCards[playerIndex] -= cards.length;
                //Establecemos nuevo turno
                status.turn = status.names[game.getNextTurn(playerIndex)];
                let lastPlayer = game.getLastTurn(playerIndex);
                if(status.numCards[lastPlayer] === 0){  //En este caso, el jugador anterior gana la partida
                    status.end.isEnded = true;
                    status.end.winner = status.names[lastPlayer];
                }
                console.log(status);
                daoG.updateGameStatus(request.body.id, JSON.stringify(status), (err, res)=>{
                    if(err){
                        response.status(500); return;
                    }
                    else{
                        response.json({});
                    }
                });
            }
        }
    });
});
//Cuando se pulsa el boton mentiroso! se hace una petición a esta url
app.put("/isLiar", passport.authenticate('basic', { session: false }), (request, response) => {
    let idGame = request.body.id;
    daoG.getGameStatus(idGame, (err, status) => {
        if(err){ response.status(500); return;}
        else{
            if(status){
                status = JSON.parse(status);
                //console.log(status);
                let playerIndex = game.getPlayerIndex(status.turn, status);
                let number = status.falseOnTable[0].split(" ")[0];  //Obtenemos el numero que se está jugando
                let liar = game.checkIfLiar(status.lastCards, number);

                if(liar){ //El anterior miente, se las lleva el anterior, empieza que ha pulsado "mentiroso"
                    status.cards[game.getLastTurn(playerIndex)] = game.addCards(status.trueOnTable, status.cards[game.getLastTurn(playerIndex)]);
                    status.numCards[game.getLastTurn(playerIndex)] += status.trueOnTable.length;
                }
                else{ //No mentia, se las lleva actual, empieza el siguiente al que ha pulsado
                    status.cards[playerIndex] = game.addCards(status.trueOnTable, status.cards[playerIndex]);
                    status.turn = game.getNextTurn(playerIndex);
                    status.numCards[playerIndex] += status.trueOnTable.length;
                    let lastPlayer = game.getLastTurn(playerIndex);
                    if(status.numCards[lastPlayer] === 0){  //Gana el jugador anterior
                        status.end.isEnded = true;
                        status.end.winner = status.names[lastPlayer];
                    }
                }
                //Actualizamos tablero
                status.trueOnTable = [];
                status.lastCards = [];
                status.falseOnTable = [];

                daoG.updateGameStatus(idGame, JSON.stringify(status), (err, res)=>{
                    if(err){
                        response.status(500); return;
                    }
                    else
                        response.json({liar: liar});
                });
                
            }
        }
    });
});

app.put("/discard", passport.authenticate('basic', { session: false }), (request, response) => {
    let idGame = request.body.id;
    let playerName = request.body.player;
    daoG.getGameStatus(idGame, (err, status) => {
        if(err){ response.status(500); return;}
        if(status){
            status = JSON.parse(status);
            let playerIndex = game.getPlayerIndex(playerName, status);
            let newCards = game.discard(status.cards[playerIndex]);
                        
            let discardDone = false;
            status.cards[playerIndex].length === newCards.length ? discardDone = false : discardDone = true;
            status.cards[playerIndex] = newCards;
            status.numCards[playerIndex] = newCards.length;
            daoG.updateGameStatus(idGame, JSON.stringify(status), (err, resp) =>{
                if(err){respose.status(500);return;}
                else
                    response.json({discard: discardDone});
            });
        }
    });
});

//IMAGENES
app.get("/img/:nombre", (req, res) => {
    let ruta = path.join(__dirname, "img", req.params.nombre);
    res.sendFile(ruta);
});


server.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});



//Funciones modulo game




