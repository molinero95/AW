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
const deck = require("./cards");
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
app.get("/status/:id", passport.authenticate('basic', { session: false }), (request, response) => {
    if (isNaN(request.params.id)) {
        response.status(404);   //COMPROBAR
        response.json({});
    }
    else {
        let id = Number(request.params.id); //Obtenemos el id
        daoG.getGamePlayers(id, (err, res) => {
            if (err) { response.status(500); return; }
            else {//Aqui devolver tambien el status de la partida en el if: getGameStatus()
                if (res) {
                    console.log(res.players);
                    let names = [];
                    res.players.forEach(e => {
                        names.push(e.name);
                    });
                    response.status(200);
                    response.json({ names: names });
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
                    else {
                        daoG.joinGame(gameId, userId, (err, res) => {
                            if (err) { response.status(500); return; }
                            else {
                                if (res) { //Se devuelve true si se une, si no ocurrira un err
                                    daoG.getGameName(gameId, (err, res) => {    //Necesario para añadir la pestaña
                                        if (err) { res.status(500); return; }
                                        else {
                                            response.status(200);
                                            response.json({ name: res });
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


app.get("/userGameInfo", passport.authenticate('basic', { session: false }), (request, response) => {
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



function startGame(gameId) {
    //Comenzar partida
    let newGameDeck = new deck();
    newGameDeck.shuffleDeck();
    let gameDeck = newGameDeck.getDeck();
    console.log(gameDeck);
    let p1 = [], p2 = [], p3 = [], p4 = [];
    for (let i = 0; i < 52; i++) {
        if (i % 4 === 0)
            p1.push(gameDeck.pop());
        else if (i % 4 === 1)
            p2.push(gameDeck.pop());
        else if (i % 4 === 2)
            p3.push(gameDeck.pop());
        else
            p4.push(gameDeck.pop());
    }
    console.log(p1);
    console.log(p2);
    console.log(p3);
    console.log(p4);

    /*
    Status
    Orden jugadores
    Asignacion de cartas
    Cartas sobre la mesa
    Turno
    Cartas ultimo jugador sobre la mesa
    Separación por ;
    */
    let turno = Math.floor(Math.random() * 4); //numero [0,3] Turno del primer jugador sacados en orden de la BD
    let status = "Mesa: []" + ";" + p1.toString() + "; " + p2.toString() + "; " + p3.toString() + "; " + p4.toString() + "; Turno: " + turno + "; ";
    /*alterGameStatus(gameId, status, (err, res) => {
        if (err) { response.status(500); return; }
        else{
            //mandar datos necesarios al útlimo usr en entrar
        }
    });*/
    console.log(status);
}

