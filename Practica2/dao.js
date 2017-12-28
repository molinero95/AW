const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    userCorrect(login, password,callback){
        this.pool.getConnection((err, connect) => {
            if(err) {console.error(err); return;}
            connect.query("SELECT ID FROM USUARIOS WHERE LOGIN = ? AND PASSWORD = ? ",[login, password],(err, filas) =>{
                if(err){callback(err); return;}
                filas.length == 1 ? callback(null, true):callback(null, false);
            });
            connect.release();
        });
    }
    /*Continuar*/
    insertUser(data, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {console.error(err); return;}
            connect.query("INSERT INTO USUARIOS() ",[login, password],(err, filas) =>{
                if(err){callback(err); return;}
                filas.length == 1 ? callback(null, true):callback(null, false);
            });
            connect.release();
        });
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;