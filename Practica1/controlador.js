"use strict";
const express = require("express");//express
const mysql = require("mysql");//mysql
const path = require("path");//path
const bodyParser = require("body-parser");//procesamiento post
const config = require("./config");//modulo config.js
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

//Inicialización DAOs
let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
const daoUsuariosApp = require("./daos/daoUsers");
let daoUsuarios = new daoUsuariosApp(pool);
const daoFriendsApp = require("./daos/daoFriends")
let daoFriends = new daoFriendsApp(pool);

//Middlewares de sesion, ficheros estáticos y bodyParser
app.use(middlewareSession);
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
 //Este middleware para obtener el DAO de usuarios
app.use(function setDAOUsers(req, res, next) { 
    req.daoUsers = daoUsuarios;
    next();
});
app.use(function setDAOFriends(req, res, next) {
    req.daoFriends = daoFriends;
    next();
});
app.use(middlewares.logger);

app.use(middlewares.flash);

//LOGIN
const login = require("./modulos/login");
app.route('/login').get(login.getLogin).post(login.postLogin);

//REGISTER
const register = require("./modulos/register");
app.route('/register')
    .get(register.getRegister)
    .post(upload.single("img"), register.postRegister);

//PROFILE
const profile = require("./modulos/profile");
app.route('/profile').get(middlewares.isLogged, profile.getProfile);


//MODIFICAR
const modificar = require("./modulos/modificar");
app.route("/modificar").get(middlewares.isLogged,modificar.getModificar);
app.route("/modificar").post(middlewares.isLogged, modificar.postModificar);


//FRIENDS
const friends = require("./modulos/friends");
app.route('/friends').get(middlewares.isLogged, friends.getFriends);
//post(middlewares.isLogged, profile.postProfile);
app.route('/searchFriend').get(middlewares.isLogged, friends.getSearchFriend);
app.route('/addFriend').post(middlewares.isLogged, friends.addFriend);


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



//IMAGENES
app.get("/img/:nombre", (req, res) =>{
    let ruta = path.join(__dirname, "uploads", req.params.nombre);
    res.sendFile(ruta);
})

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});


