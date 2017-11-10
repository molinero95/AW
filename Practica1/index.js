//Funciones interesantes para cuando empecemos con JS

"use strict";
let mysql = require("mysql");

let pool = mysql.createPool({
    host:"localhost",
    database:"nombreDB",
    user: "admin",
    password: "",
});

function existeUsuario(nombreUsr){
    pool.getConnection((err, connect) => {
        if(err) {
            console.log(err);
        }
        else{
            let res = connect.query("SELECT COUNT (users.id) FROM usuarios AS users where nombre= ? ",nombreUsr);
            connect.release();
            if(res == 1)
                return true;
            else
                return false;  
        }
    })
}


