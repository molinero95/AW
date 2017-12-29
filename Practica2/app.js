"use strict";
const express = require("express");
const passport = require("passport");
const passportHTTP = require("passport-http");
const config = require("./config");
const mysql = require("mysql");//mysql
const path = require("path");
const bodyParser = require("body-parser");


const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoApp = require("./dao");
let dao = new daoApp(pool);

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
    dao.userCorrect(request.body.user, request.body.password, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) {response.status(200); response.json()}
            else{ response.status(404); response.json()}
        }
    });
});

app.post("/register", (request, response) => {
    dao.insertUser(request.body.user, request.body.password, (err, res) => {
        if(err){ response.status(500); return;}
        else{
            if(res) {response.status(200); response.json()}
            else{ response.status(404); response.json()}
        }
    })
});


//IMAGENES
app.get("/img/:nombre", (req, res) =>{
    let ruta = path.join(__dirname, "img", req.params.nombre);
    res.sendFile(ruta);
});


app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});