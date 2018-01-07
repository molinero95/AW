const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    getGamePlayerNames(id, callback) {
        this.pool.getConnection((err, connect) => {
            connect.query("SELECT T2.LOGIN AS NOMBRE FROM JUEGA_EN AS T1 JOIN USUARIOS AS T2 ON T1.IDUSUARIO = T2.ID WHERE T1.IDPARTIDA = ?",[id],(err, res) =>{
                if(err){callback(err); return;}
                else{
                    let result = [];
                    res.forEach(element => {
                        result.push(element);
                    });
                    res.length > 0 ? callback(null, result):callback(null, null);
                }
            });
            connect.release();
        });
    }

    getGameStatus(id, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT ESTADO FROM PARTIDAS WHERE ID = ?",[id],(err, res) =>{
                if(err){callback(err); return;}
                else{
                    res.length > 0 ? callback(null, res[0].ESTADO):callback(null, null);
                }
            });
            connect.release();
        });
    }

    alterGameStatus(gameId, status, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("UPDATE PARTIDAS SET ESTADO = ? WHERE ID = ?",[status, gameId],(err, res) =>{
                if(err){callback(err); return;}
                else
                    callback(null, true);
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
        this.pool.getConnection((err, connect) => {//Transacción
            if(err){
                callback(err); 
                return;
            }
            else{
                connect.query("SELECT COUNT(IDUSUARIO) AS NUM_PLAYERS FROM JUEGA_EN WHERE IDPARTIDA = ?",[gameId], (err, res) =>{
                    if(err){
                        callback(err); return;}
                    else{
                        callback(null, res[0].NUM_PLAYERS);
                    }
                });
            }
            connect.release();
        });
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;