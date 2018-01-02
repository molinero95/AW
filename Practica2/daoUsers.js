const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    userCorrect(login, password,callback){
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT ID FROM USUARIOS WHERE LOGIN = ? AND PASSWORD = ? ",[login, password],(err, res) =>{
                if(err){callback(err); return;}
                res.length > 0 ? callback(null, res[0].ID):callback(null, false);
            });
            connect.release();
        });
    }

    insertUser(login, password, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT COUNT(ID) AS EXISTE FROM USUARIOS WHERE LOGIN = ?",[login],(err, res) =>{
                if(err){callback(err); return;}
                if(res[0].EXISTE > 0)//Usuario ya existente
                    callback(null, false);
                else{
                    connect.query("INSERT INTO USUARIOS(LOGIN, PASSWORD) VALUES (?,?)",[login, password],(err, res) =>{
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