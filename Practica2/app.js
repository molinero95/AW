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

let privateKey = fs.readFileSync("./clave.pem");
let cert = fs.readFileSync("./certificado_firmado.crt");
const app = express();
let server = https.createServer({key: privateKey, cert: cert}, app);
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
    {realm: "Pagina protegida"},
    function (user, pass, f){
        daoU.userCorrect(user, pass, (err, res) =>{
            if(err){ f(err); return;}
            else f(null, res); //En res tenemos el ID
        });
    }
));

app.get("/", (request, response) => {
    response.redirect("/mentiroso.html");
});

app.post("/login", (request, response) => {    
    daoU.userCorrect(request.body.user, request.body.password, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) {response.status(200); response.json({id:res})}//Vamos a guardar el id en un hidden
            else{ response.status(404); response.json({})}
        }
    });
});

app.post("/register", (request, response) => {
    request.checkBody("user", "Nombre de usuario no vacio").notEmpty();
    request.checkBody("user", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
    request.checkBody("password","La contraseña no es válida").isLength({ min: 6, max: 10});
    let errors = request.validationErrors();
    if(errors){
        response.status(404); 
        response.json({}); 
    }
    else{
        daoU.insertUser(request.body.user, request.body.password, (err, res) => {
            if(err){ response.status(500); return;}
            else{
                if(res) { response.status(200); response.json({}); }
                else{ response.status(404); response.json({}); }
            }
        });
    }
});

app.get("/state/:id", passport.authenticate('basic', {session:false}),(request, response) => {
    let id = request.params.id;
    if(isNaN(id)){
        response.status(400);//Bad request
        response.json({});
    }
    daoG.getGameState(id, (err, res) => {
        console.log(res);
        if(err){ response.status(500); return;}
        else{
            if(res) { response.status(200); response.json({status: res.status}); }
            else{ response.status(404); response.json({}); }
        }
    });
});

app.post("/createGame", passport.authenticate('basic', {session:false}),(request, response) => {
    let name = request.body.gameName; 
    let userId = request.user;
    console.log(userId);
    daoG.insertGame(name, userId, (err, res) => {
        if(err) { response.status(500); return;}
        else {
            if(res){
                console.log("BIEN");
                response.status(201); response.json({}); 
            }
            else{
                console.log("MAL");
                response.status(500); 
                return;
            }
        }
    });

});


//IMAGENES
app.get("/img/:nombre", (req, res) =>{
    let ruta = path.join(__dirname, "img", req.params.nombre);
    res.sendFile(ruta);
});


server.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});