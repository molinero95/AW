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

//Debe devolver los nombres de los jugadores
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
                            if (res) {    //Devolvemos la info relevante para el jugador
                                let status = game.playerStatus(playerName, res);
                                response.json({ status: status })
                            }
                            else
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
                                                            else response.json({ name: name });
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
                let cards = request.body.cards; //cartas buenas
                let statusSplit = status.split(";");
                let turn = game.getTurnIndex(statusSplit, statusSplit[5]);
                //colocar falsas y colocar verdaderas
                //Colocamos verdaderas y falsas
                if(statusSplit[10] === "NULL")
                    statusSplit[10] = "";
                else
                    statusSplit[10] += ","; //vamos a añadirle mas a las buenas
                if(statusSplit[0] === "NULL")
                    statusSplit[0] = "";
                else
                    statusSplit[0] += ","; //vamos a añadirle mas a las falsas
                statusSplit[11] = "";
                for (let i = 0; i < cards.length; i++) {
                    if (i === cards.length - 1){ //Ultima carta para añadir
                        statusSplit[10] += cards[i];    //originales sobre mesa
                        statusSplit[0] += game.getRandomCardByNumber(request.body.number); //falsas sobre mesa
                        statusSplit[11] += cards[i];    //originales ultima jugada
                    }
                    else{
                        statusSplit[10] += cards[i] + ",";
                        statusSplit[0] += game.getRandomCardByNumber(request.body.number) + ",";
                        statusSplit[11] += cards[i] + ",";
                    }
                }
                //Eliminamos las cartas echadas del mazo del jugador
                let myCards = statusSplit[turn - 5].split(",");
                statusSplit[turn - 5] = game.removeCardsSelected(myCards, cards);
                //Establecemos nuevo turno
                statusSplit[5] = statusSplit[game.getNextTurn(statusSplit, statusSplit[5])];
                console.log(statusSplit);
                let newStatus = "";
                //Generamos el nuevo status
                for(let i = 0; i < statusSplit.length; i++){
                    if(i === 11)
                        newStatus += statusSplit[i];
                    else
                        newStatus += statusSplit[i] + ";";
                }
                daoG.updateGameStatus(request.body.id, newStatus, (err, res)=>{
                    if(err){
                        response.status(500); return;
                    }
                    else{
                        response.json({cardsInTable: statusSplit[0], turn: statusSplit[5]});
                    }
                });
            }
        }
    });
});
//Cuando se pulsa el boton mentiroso! se hace una petición a esta url
//En la ultima posicion del status (11) están las cartas autenticas que ha lanzado el últumo jugador
app.put("/isLiar", passport.authenticate('basic', { session: false }), (request, response) => {
    let idGame = request.body.id;
    daoG.getGameStatus(idGame, (err, status) => {
        if(err){ response.status(500); return;}
        else{
            if(status){
                let split = status.split(";");
                let cartasAnterior = split[11].split(",");
                let liar = false;
                let number = split[0].split(" ")[0];
                cartasAnterior.forEach(e => {
                    if(!liar){
                        if(e.split(" ")[0] !== number)
                            liar = true;
                    }
                });
                let turnoActual = split[5]; //nombre del jugador del turno act
                let turnoRecibe; //El indice del jugador que recibira las cartas
                if(liar) //miente, se las lleva el anterior, empieza el actual
                    turnoRecibe = game.getLastTurn(split, turnoActual); //Indice del turno anterior
                else{ //No mentia, se las lleva actual, empieza el siguiente
                    turnoRecibe = game.getTurnIndex(split, turnoActual); //Indice del turno actual
                    turnoActual = game.getNextTurn(split, split[turnoRecibe]); //El turno pasa al siguiente, obtengo su indice
                    split[5] = split[turnoActual];
                }
                console.log(split[5]);
                split[turnoRecibe - 5] += "," + split[10];
                split[11] = "NULL";
                split[0] = "NULL";
                split[10] = "NULL";
                let newStatus = "";
                for(let i = 0; i < split.length; i++){
                    if(i === 11)
                        newStatus += split[i];
                    else
                        newStatus += split[i] + ";";
                }
                daoG.updateGameStatus(request.body.id, newStatus, (err, res)=>{
                    if(err){
                        response.status(500); return;
                    }
                    else{
                        response.json({liar: liar});
                    }
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
            let split = status.split(";");
            let index = game.getTurnIndex(split, playerName);
            let cards = split[index - 5].split(",");
            cards = cards.sort(game.compare);
            let newCards = game.discard(cards);
            console.log(newCards);
            console.log("----");
            split[index - 5] = "";
            for(let i = 0; i < newCards.length; i++){
                if(i !== newCards.length -1)
                    split[index - 5] += newCards[i] + ",";
                else
                    split[index - 5] += newCards[i];
            }
            let discardDone = false;
            cards.length === newCards.length ? discardDone = false : discardDone = true;
            let newStatus = "";
            for(let i = 0; i < split.length; i++){
                if(i === 11)
                    newStatus += split[i];
                else
                    newStatus += split[i] + ";";
            }
            console.log(newStatus);
            daoG.updateGameStatus(idGame, newStatus, (err, resp) =>{
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




