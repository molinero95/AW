const mysql = require("mysql");//mysql

class DAO {
    tructor(pool) {
      this.pool = pool;
    }

    getGameState(id, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT ESTADO FROM PARTIDAS WHERE ID = ?",[id],(err, res) =>{
                if(err){callback(err); return;}
                else{
                    res.length > 0 ? callback(null, res[0].STATUS):callback(null, null);
                }
            });
            connect.release();
        });
    }
    insertGame(name, userId, callback) {
        this.pool.getConnection((err, connect) => { //Transacción
            if(err) {callback(err); return;}
            connect.beginTransaction((err) => {
                if(err){ 
                    connect.rollback((err)=>{
                        if(err){callback(err); return;}
                    });
                    callback(err);
                    return;
                }
                else{
                    connect.query("INSERT INTO PARTIDAS(NOMBRE, ESTADO) VALUES (?,?)",[name, ""],(err, res) =>{ 
                        if(err){ 
                            connect.rollback((err)=>{
                                if(err){callback(err); return;}
                            });
                            callback(err); 
                            return;
                        }
                        else{
                            let gameId = res.insertId;
                            connect.query("INSERT INTO JUEGA_EN(IDUSUARIO, IDPARTIDA) VALUES (?,?)",[userId, gameId], (err, res) =>{
                                if(err){ 
                                    connect.rollback((err)=>{
                                        if(err){callback(err); return;}
                                    });
                                    callback(err);
                                    return;
                                }
                                else{
                                    connect.commit((err) => {
                                        if(err) {
                                            connect.rollback((err)=>{
                                                if(err){callback(err); return;}
                                            });
                                        }
                                    });
                                    callback(null, true);
                                }
                            });
                        }
                    });
                }
            });
            connect.release();
        });
    }

    joinGame(gameId, userId, callback){
        this.pool.getConnection((err, connect) => { //Transacción
            if(err){callback(err); return;}
            else{
                connect.query("INSERT INTO JUEGA_EN(IDUSUARIO, IDPARTIDA) VALUES (?,?)",[userId, gameId], (err, res) =>{
                    if(err){callback(err); return;}
                    else
                        callback(null, true);
                });
            }
            connect.release();
        });
    }

    countGameUsers(gameId, callback) {
        this.pool.getConnection((err, connect) => { //Transacción
            if(err){callback(err); return;}
            else{
                connect.query("SELECT COUNT(IDUSUARIO) AS NUM_PLAYERS FROM JUEGA_EN WHERE IDPARTIDA = ?",[gameId], (err, res) =>{
                    if(err){callback(err); return;}
                    else{
                        console.log(res.NUM_PLAYERS);
                    }
                });
            }
        });
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;