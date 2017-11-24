const express = require("express");//express
const mysql = require("mysql");//mysql
const path = require("path");//path
const bodyParser = require("body-parser");//procesamiento post
const config = require("./config");//modulo config.js
const daoTasks = require("./dao_tasks");//modulo dao_task.js
const taskUtils = require("./task_utils");//modulo task_utils.
const daoUsers = require("./dao_users");
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


let daoT = new daoTasks.DAOTasks(pool);
let daoU = new daoUsers.DAOUsers(pool);
//Es un middleware para evitar que un usuario logeado pueda ir a loggin
function prohibeLogin(req, res, next) {
    if(req.session.currentUser)
        res.redirect("/tasks");
    else
        next();
}

app.get("/login.html", prohibeLogin,(req, res) =>{
    res.status(200);
    let error = null;
    res.render("login", {errorMsg: error});
});

app.post('/login', prohibeLogin,(req, res) => {
    res.status(200);
    let mail = req.body.mail;
    daoU.isUserCorrect(mail, req.body.pass, (err, existe) =>{
        if(err){console.error(err); return;}
        if(existe){
            req.session.currentUser = mail;
            res.redirect('/tasks');
        }
        else
            res.render("login", {errorMsg: "Dirección de correo y/o contraseña no validos."});
    });
});

//A partir de aqui solo AUTENTICACIÓN REQ.
/*Si quieremos que no afecte a todo:
function compruebaSession(req, res, next){
    if(req.session.currentUser){
        res.locals.userEmail = req.session.currentUser;
        next();
    }
    else
         res.redirect('login.html');
}
app.get("/task", compruebaSession, (req, res) =>{

});
app.get...
*/
//este afecta a todo lo de abajo, aplicacion dividida en 2
app.use(function compruebaSession(req, res, next){
    if(req.session.currentUser){
        res.locals.userEmail = req.session.currentUser;
        next();
    }
    else
        res.redirect('login.html');
});




app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){console.error(err); return;}
        res.redirect("login.html");
    });
});



app.get("/tasks",(req, res) => {
    res.status(200);
    daoT.getAllTasks(res.locals.userEmail, (err, tasks) => {
        if(err){console.log(err); return;}
        res.render("tasks", {taskList : tasks, user: res.locals.userEmail});
    })
});

app.get("/imagenUsuario", (req, res) => {
    console.log("aqui estoy");
    daoU.getUserImageName(res.locals.userEmail, (err, dato) => {
        if(err){console.error(err);return;}
        if(dato){
            res.sendFile(path.join(__dirname,"profile_imgs",dato));
        }
        else
            res.sendFile(path.join(ficherosEstaticos,"img","NoPerfil.png"));
    });
});


app.post('/addTask', (req, res) => {
    res.status(200);
    let task = taskUtils.createTask(req.body.taskText);
    task.done = false;
    daoT.insertTask(res.locals.userEmail, task, (err) =>{
        if(err){console.log(err); return;}
        res.redirect("/tasks");         
    });
});

app.post('/finish', (req, res) => {
    res.status(200);
    daoT.markTaskDone(req.body.idTarea, (err)=>{
        if(err){console.error(err); return;}
         res.redirect('/tasks');
    });
})

app.get("/deleteCompleted", (req, res) => {
    res.status(200);
    daoT.deleteCompleted(res.locals.userEmail, (err) =>{
        if(err){console.error(err); return;}
         res.redirect('/tasks');
    })
})


app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});