const express = require("express");
const passport = require("passport");
const passportHTTP = require("passport-http");
const config = require("./config");
const mysql = require("mysql");//mysql
const path = require("path");


const app = express();

app.use(express.static(path.join(__dirname, "public")));

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
let strategy = new passportHTTP.BasicStrategy(
    {realm: "Pagina protegida"},
    function (user, pass, f){
        dao.userCorrect(user, pass, (err, res) =>{
            if(err){ f(err); return;}
            else f(null, res);
        });
    }
);

/*
Para los links protegidos: MIDDLEWARE PARA LAS FUNCIONES
passport.authenticate('basic', {session: false}),
    function(request, response) {
        response.json({
            permitido: true
        });
    });
*/

app.get("/", (request, response) => {
    response.redirect("/mentiroso.html");
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