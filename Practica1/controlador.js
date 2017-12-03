"use strict";
const express = require("express");//express
const mysql = require("mysql");//mysql
const path = require("path");//path
const bodyParser = require("body-parser");//procesamiento post
const config = require("./config");//modulo config.js
const daoUsuariosApp = require("./daoUsuarios");//modulo daoUsuarios_task.js
const session = require("express-session");//sesiones
const mysqlSession = require("express-mysql-session");//guardar session para mysql
const mysqlStore = mysqlSession(session);
const sessionStore = new mysqlStore(config.mysqlConfig);
const app = express();
const ficherosEstaticos = path.join(__dirname, "public");
const multer = require('multer');
const middlewares = require("./middlewares");
let upload = multer({ dest: path.join(__dirname, "uploads") });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const middlewareSession = session({//datos de la sesion
    saveUninitialized:false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
let daoUsuarios = new daoUsuariosApp(pool);

app.use(middlewareSession);
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
 //Este middleware tiene que estar aqui para obtener el DAO
app.use(function setDAOUsers(req, res, next) { 
    req.daoUsers = daoUsuarios;
    next();
});
app.use(middlewares.logger);
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


const login = require("./login");
app.route('/login').get(login.getLogin).post(login.postLogin);

const register = require("./register");
app.route('/register')
    .get(register.getRegister)
    .post(upload.single("img"), register.postRegister);

const profile = require("./profile");
app.route('/profile').get(middlewares.isLogged, profile.getProfile);
//post(middlewares.isLogged, profile.postProfile);

//Peticiones generales aqui: ejemplo '/','/logout','img/:nombre' 
app.get('/', middlewares.isLogged, (req, res) => {
    res.status(200);
    res.redirect('/profile');
});

//LOGOUT
app.get("/logout", middlewares.isLogged, (req, res) => {
    req.session.destroy((err => {
        if(err){ console.error(err); return;}
         res.redirect('login');
    }));
});

//MODIFICAR
const modificar = require("./modificar");
app.route("/modificar").get(modificar.getModificar).post(modificar.postModificar);



//IMAGENES
app.get("/img/:nombre", (req, res) =>{
    let ruta = path.join(__dirname, "uploads", req.params.nombre);
    res.sendfile(ruta);
})

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});


