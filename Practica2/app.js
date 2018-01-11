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
            if (res) { response.status(200); response.json({ id: res }) }//Vamos a guardar el id en un hidden
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
                if (res) { response.status(200); response.json({}); }
                else { response.status(404); response.json({}); }
            }
        });
    }
});

//Debe devolver los nombres de los jugadores
app.get("/status", passport.authenticate('basic', { session: false }), (request, response) => {
    let id = request.body.id; //Obtenemos el id
    if (isNaN(id)) {
        response.status(400);//Bad request
        response.json({});
    }
    daoG.getGamePlayerNames(id, (err, res) => {
        console.log(res);
        if (err) { response.status(500); return; }
        else {//Aqui devolver tambien el status de la partida en el if: getGameStatus()
            if (res) { response.status(200); response.json({ nombres: res }); }
            else { response.status(404); response.json({}); }
        }
    });
});

app.post("/createGame", passport.authenticate('basic', { session: false }), (request, response) => {
    let name = request.body.gameName;
    let userId = request.user;
    console.log(userId);
    daoG.insertGame(name, userId, (err, res) => {
        if (err) { response.status(500); return; }
        else {
            if (res) {
                response.status(201); response.json({});
            }
            else{
                response.status(500); response.json({});
            }
        }
    });
    /*
    daoG.getUserGames(userId, (err, res) => {
        if (err) { response.status(500); return; }
        else {
            if (res) {
                response.status(201);
                //poner aqui los nombres en los menus res.name?
                response.json({});
            }
            else{
                response.status(500); 
                response.json({});
            }
        }
    });
    console.log("app");
    */
    
});

app.post("/joinGame", passport.authenticate('basic', { session: false }), (request, response) => {
    let gameId = request.body.gameId;
    let userId = request.user;
    daoG.countGameUsers(gameId, (err, res) => {
        if (err) {
            res.status(500);
            return;
        }
        else {
            if (res === 0){ //La partida no existe
                response.status(404);
            }
            if (res < 4) {
                let numPlayers = res;
                daoG.joinGame(gameId, userId, (err, res) => {
                    if (err) { response.status(500); return; }
                    else {
                        if (res) {
                            numPlayers++;
                            if(numPlayers === 4){
                                startGame();
                            }
                            response.status(201); 
                            response.json({});
                        }
                        else {
                            response.status(500);
                            response.json({});
                        }
                    }
                });
            }
            else{   //Partida llena
                response.status(400);
                return;
            }
        }       
    });    
});

function startGame(gameId){
    //Comenzar partida
    let newGameDeck = new deck();
    newGameDeck.shuffleDeck();
    let gameDeck = newGameDeck.getDeck();
    console.log(gameDeck);
    let p1 =[], p2 = [], p3 = [], p4 = [];
    for (let i = 0; i < 52; i++) {
        if(i % 4 === 0)
            p1.push(gameDeck.pop());
        else if(i % 4 === 1)
            p2.push(gameDeck.pop());
        else if(i % 4 === 2)
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