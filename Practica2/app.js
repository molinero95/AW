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

let privateKey = fs.readFileSync("./clave.pem");
let cert = fs.readFileSync("./certificado_firmado.crt");
const app = express();
let server = https.createServer({key: privateKey, cert: cert}, app);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoUsers = require("./daoUsers");
let daoU = new daoUsers(pool);
const daoMatchs = require("./daoMatchs");
let daoM = new daoMatchs(pool);


//PDF 90, falta parte AJAX
app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy(
    {realm: "Pagina protegida"},
    function (user, pass, f){
        dao.userCorrect(user, pass, (err, res) =>{
            if(err){ f(err); return;}
            else f(null, res);
        });
    }
));

/*
Para los links protegidos: MIDDLEWARE PARA LAS FUNCIONES
passport.authenticate('basic', {session: false}),
*/

app.get("/", (request, response) => {
    response.redirect("/mentiroso.html");
});

app.post("/login", (request, response) => {    
    daoU.userCorrect(request.body.user, request.body.password, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) {response.status(200); response.json({})}
            else{ response.status(404); response.json({})}
        }
    });
});

app.post("/register", (request, response) => {
    daoU.insertUser(request.body.user, request.body.password, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) { response.status(200); response.json({}); }
            else{ response.status(404); response.json({}); }
        }
    })
});

app.get("/state/:id", (request, response) => {
    let id = request.params.id;
    if(isNaN(id)){
        response.status(400);//Bad request
        response.json({});
    }
    daoM.getMatchState(id, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) { response.status(200); response.json({status: res.status}); }
            else{ response.status(404); response.json({}); }
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