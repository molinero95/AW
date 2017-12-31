const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    getMatchState(id, callback) {
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
    //TODO
    insertMatch(name, userId) {
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
                    connect.query("INSERT INTO PARTIDAS(NOMBRE, ESTADO) VALUES (?,?)",[name, userId],(err, res) =>{   
                        if(err){ 
                            connect.rollback((err)=>{
                                if(err){callback(err); return;}
                            });
                            callback(err); 
                            return;
                        }
                        else{
                            let matchId = res.insertId;
                            connect.query("INSERT INTO JUEGA_EN(IDUSUARIO, IDPARTIDA) VALUES (?,?)",[userId, marthId], (err, res) =>{
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

    close() {
        this.pool.end();
    }
}

module.exports = DAO;