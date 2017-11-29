"use strict";

const express = require("express");//express
const mysql = require("mysql");//mysql
const path = require("path");//path
const bodyParser = require("body-parser");//procesamiento post
const config = require("./config");//modulo config.js
const daoApp = require("./dao");//modulo dao_task.js
const utilidades = require("./utilidades");
const session = require("express-session");//sesiones
const mysqlSession = require("express-mysql-session");//guardar session para mysql
const mysqlStore = mysqlSession(session);
const sessionStore = new mysqlStore(config.mysqlConfig);
const app = express();
const ficherosEstaticos = path.join(__dirname, "public");
const multer = require('multer');

let multerFactory = multer({
    dest: path.join(__dirname, "uploads")
})


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const middlewareSession = session({//datos de la sesion
    saveUninitialized:false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

app.use(middlewareSession);
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
//Middleware para mostrar mensajes de error
/*
Un objeto flash contendra 2 atributos:
    - msg: contiene el mensaje.
    - type: contiene el tipo del mensaje:
        - 0: error
        - 1: atención
        - 2: afirmación
*/
app.use((req, res, next) =>{
    res.setFlash = (msg, type) => {
        req.session.flashMsg = msg;
        req.session.flashType = type;
    };
    res.locals.getAndClearFlash = () => {
        let flash = {
            msg : req.session.flashMsg,
            type: req.session.flashType
        }
        delete req.session.flashMsg;
        delete req.session.flashType;
        return flash;
    };
    next();
});

//LOGIN
app.get('/login', (req, res) => {
    res.status(200);
    res.render("login");
});
app.post('/login', (req, res) => {
    res.status(200);
    let user = req.body.user;
    dao.userCorrect(user, req.body.password,(err, exists) =>{
        if(err){console.error(err); return;}        
        if(exists){
            req.session.user = user;
            res.redirect('profile');
        }
        else{
            res.setFlash("Usuario y/o contraseña no validos.", 0);
            res.render("login");
        }
    });
});
//FIN LOGIN

//REGISTRO
app.get('/register', (req, res) => {
    res.status(200);
    res.render("register");
});

//utilizar multer para subida de fichero
app.post('/register', (req, res) => {
    res.status(200);
    let user = utilidades.makeUser(req.body.user, req.body.password, req.body.name, req.body.gender,
    req.body.age, req.body.img, 0);
    console.log(user);
    let correct = utilidades.checkRegister(user);
    if(correct){
        dao.userExists(user.user,(err, exists) =>{
            if(err){console.error(err); return;}        
            if(exists){
                res.setFlash("Usuario no valido", 0);
                res.render("register");
            }
            else{
                dao.insertUser(user, (err, insert) =>{
                    if(err){
                        res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                        res.render("register")
                    }
                    else{
                        res.setFlash("Usuario creado correctamente", 2)
                        res.render("login");
                    }
                });
            }
            
        });
    }
    else{
        res.setFlash("Datos incorrectos", 0);
        res.render("register");    
    }
});
//FIN REGISTRO


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

//PROFILE
app.get('/profile', isLogged, (req, res) => {
    res.status(200);
    let user = req.session.user;
    dao.searchUser(user, (err, datos) =>{
        if(err){
            req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/login");
            });
            return;
        }
        let us = utilidades.makeUser(user, "",datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
        console.log(us);
        res.render("profile", {user: us});
    }); 
});
//post aqui
//...
//FIN PROFILE

app.get("/logout", isLogged, (req, res) => {
    req.session.destroy((err => {
        if(err){ console.error(err); return;}
         res.redirect('login');
    }
));
});








app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});