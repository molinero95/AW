"use strict";

/*
    Antes de ejecutar este script, modifica el fichero "config.js"
    con la información de tu instalación de MySQL.
*/

const config = require("./config");
const mysql = require("mysql");
const daoUsers = require("./dao_users");
const daoTasks = require("./dao_tasks");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUser = new daoUsers.DAOUsers(pool);
let daoTask = new daoTasks.DAOTasks(pool);
daoUser.isUserCorrect("usuario@ucm.es", "mipass", (err, result) => {
    if (err) {
        console.error(err);
    } else if (result) {
        console.log("Usuario y contraseña correctos");
    } else {
        console.log("Usuario y/o contraseña incorrectos");
    }

    daoTask.getAllTasks("usuario@ucm.es", (err, tasks) => {
        if (err) {
            console.error(err);
        } else {
            console.log(tasks);
        }

        let newTask = {
            text: "Terminar ejercicio entregable 5",
            done: true,
            tags: ["aw", "ejercicio"]
        }
        daoTask.insertTask("usuario@ucm.es", newTask, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("Elemento insertado correctamente");
            }
            pool.end();
        });
    });
});




