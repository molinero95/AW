const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();
const ficherosEstaticos = path.join(__dirname, "public");

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


app.get("/tasks",(req, res) => {
    res.status(200);
    daoT.getAllTasks("usuario@ucm.es", (err, tasks) => {
        if(err){console.log(err); return;}
        res.render("tasks", {taskList : tasks});
    })
})


app.post('/addTask', (req, res) => {
    res.status(200);
    let task = taskUtils.createTask(req.body.taskText);
    task.done = false;
    daoT.insertTask("usuario@ucm.es", task, (err) =>{
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
    daoT.deleteCompleted("usuario@ucm.es", (err) =>{
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