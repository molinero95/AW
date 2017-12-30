const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    userCorrect(login, password,callback){
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT ID FROM USUARIOS WHERE LOGIN = ? AND PASSWORD = ? ",[login, password],(err, filas) =>{
                if(err){callback(err); return;}
                filas.length > 0 ? callback(null, true):callback(null, false);
            });
            connect.release();
        });
    }

    insertUser(login, password, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT COUNT(ID) AS EXISTE FROM USUARIOS WHERE LOGIN = ?",[login],(err, filas) =>{
                if(err){callback(err); return;}
                if(filas[0].EXISTE > 0)//Usuario ya existente
                    callback(null, false);
                else{
                    connect.query("INSERT INTO USUARIOS(LOGIN, PASSWORD) VALUES (?,?)",[login, password],(err, filas) =>{
                        if(err){callback(err); ; return;}
                        callback(null, true);
                    });
                }
            });
            connect.release();
        });
    }



    close() {
        this.pool.end();
    }
}

module.exports = DAO;