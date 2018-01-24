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
                                let status = playerStatus(playerName, res);
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

function playerStatus(player, status) {
    let split = status.split(";");
    let res = {
        table: split[0],
        turn: split[5],
        numCards: [],  //Contendra las cartas del usuario y el numero de cartas del resto
        names: [],
    };
    for (let i = 6; i < 10; i++) {
        let cards = split[i - 5].split(",");
        res.numCards.push(cards.length);
        res.names.push(split[i]);
        if (player === split[i])   //Si es el turno del jugador, mandamos sus cartas
            res.myCards = cards;
    }
    return res;

}

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
                    statusSplit[10] = ";";
                else
                    statusSplit[10] += ",";
                if(statusSplit[0] === "NULL")
                    statusSplit[0] = "";
                else
                    statusSplit[0] += ",";
                for (let i = 0; i < cards.length; i++) {
                    if (i === cards.length - 1){
                        statusSplit[0] += cards[i];
                        statusSplit[10] += game.getRandomCardByNumber(request.body.number);
                    }
                    else{
                        statusSplit[0] += cards[i] + ",";
                        statusSplit[10] += game.getRandomCardByNumber(request.body.number) + ",";
                    }
                }
                //console.log(statusSplit[0]);
                //borramos cartas del usuario
                let myCards = statusSplit[turn - 5].split(",");
                let temp = "";
                let quito = cards.pop();
                let cuenta = 0;
                let quitoCant = cards.length;
                for(let i = myCards.length - 1; i >= 0; i--){
                    if(quito && quito === myCards[i]){
                        if(cards.length > 0)
                            quito = cards.pop();
                        else
                            quito = null;
                    }
                    else{
                        cuenta++;
                        if(cuenta + quitoCant === myCards.length - 1)    //ultima
                            temp += myCards[i];
                        else
                            temp += myCards[i] + ","
                    }
                }
                statusSplit[turn - 5] = temp;
                //Establecemos nuevo turno
                statusSplit[5] = game.getNextTurn(statusSplit, statusSplit[5]);
                let newStatus = "";
                //Generamos el nuevo status
                for(let i = 0; i < statusSplit.length; i++){
                    if(i === 10)
                        newStatus += statusSplit[i];
                    else
                        newStatus += statusSplit[i] + ";";
                }
                
                daoG.updateGameStatus(request.body.id, newStatus, (err, res)=>{
                    if(err){
                        response.status(500); return
                    }
                    else{
                        response.redirect("/status/"+ request.body.id +"/" +statusSplit[turn]);
                    }
                });
            }
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




