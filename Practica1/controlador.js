"use strict";

const express = require("express");//express
const mysql = require("mysql");//mysql
const path = require("path");//path
const bodyParser = require("body-parser");//procesamiento post
const config = require("./config");//modulo config.js
const daoApp = require("./dao");//modulo dao_task.js
const session = require("express-session");//sesiones
const mysqlSession = require("express-mysql-session");//guardar session para mysql
const mysqlStore = mysqlSession(session);
const sessionStore = new mysqlStore(config.mysqlConfig);
const app = express();
const ficherosEstaticos = path.join(__dirname, "public");



const middlewareSession = session({//datos de la sesion
    saveUninitialized:false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});
app.use(middlewareSession);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));


let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});


let dao = new daoApp(pool);


app.use(function logger (req, res, next) {
    console.log(`Recibida peticion: ${req.url}`);
    next();
});


app.get('/login', (req, res) => {
    res.status(200);
    res.render("login", {errorMsg:null});
});

app.get('/login.html', (req, res) =>{
    res.status(200);
    res.redirect("/login");
})

app.post('/login', (req, res) => {
    res.status(200);
    let user = req.body.user;
    dao.userCorrect(user, req.body.password,(err, exists) =>{
        if(err){console.error(err); return;}        
        if(exists){
            req.session.user = user;
             res.redirect('login');//esto redirigira a perfil o a home no se
            console.log("usuario existe");//continuar
        }
        else{
            let error = "Usuario y/o contraseña no validos.";
            res.render("login", {errorMsg:error});
        }
        
    });
    //res.redirect('/login');
})

app.get('/register.html', (req, res) => {
    res.status(200);
    res.render("register");
});

function isLogged(req, res, next) {
    if(req.session.user)
        next();
    else
         res.redirect('/login');
    
}



app.get('/', isLogged, (req, res) => {
    res.status(200);
     res.redirect('/profile');
})


app.get('/profile', isLogged, (req, res) => {
    res.status(200);    
    res.render("profile", {user: usuario})
});








app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});