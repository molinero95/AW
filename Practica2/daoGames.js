const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
        this.pool = pool;
    }

    getGamePlayers(id, callback) {
        this.pool.getConnection((err, connect) => {
            connect.query("SELECT T1.IDUSUARIO as id, T2.LOGIN AS name FROM JUEGA_EN T1 JOIN USUARIOS T2 ON T1.IDUSUARIO = T2.ID WHERE T1.IDPARTIDA = ?", [id], (err, res) => {
                if (err) { callback(err); return; }
                else {
                    let result = [];
                    res.forEach(element => {
                        result.push({ id: element.id, name: element.name });
                    });
                    if (result.length > 0)
                        callback(null, { players: result });
                    else
                        callback(null, null);
                }
            });
            connect.release();
        });
    }

    getUserGames(id, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            connect.query("SELECT P.NOMBRE as name, P.ID as id FROM JUEGA_EN J JOIN PARTIDAS P ON P.ID = J.IDPARTIDA WHERE J.IDUSUARIO = ?", [id], (err, res) => {
                if (err) { callback(err); return; }
                else {
                    if (res.length > 0) {
                        callback(null, res);
                    }
                    else
                        callback(null, null);
                }
            });
        });
    }
    getGameStatus(id, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            connect.query("SELECT ESTADO FROM PARTIDAS WHERE ID = ?", [id], (err, res) => {
                if (err) { callback(err); return; }
                else {
                    if(res.length > 0) callback(null, res[0].ESTADO);
                    else callback(null, null);
                }
            });
            connect.release();
        });
    }

    setGameStatus(id, status, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            connect.query("UPDATE PARTIDAS SET ESTADO = ? WHERE ID = ?", [status, id], (err, res) => {
                if (err) { callback(err); return; }
                else callback(null, true);
            });
            connect.release();
        });
    }

    getGameName(id, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            else {
                connect.query("SELECT NOMBRE FROM PARTIDAS WHERE ID = ?", [id], (err, res) => {
                    if (err) { callback(err); return; }
                    else {
                        res.length > 0 ? callback(null, res[0].NOMBRE) : callback(null, null);
                    }
                });
            }
            connect.release();
        });
    }

    alterGameStatus(gameId, status, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            connect.query("UPDATE PARTIDAS SET ESTADO = ? WHERE ID = ?", [status, gameId], (err, res) => {
                if (err) { callback(err); return; }
                else
                    callback(null, true);
            });
            connect.release();
        });
    }


    insertGame(name, userId, callback) {
        this.pool.getConnection((err, connect) => { //Transacción
            if (err) { callback(err); return; }
            connect.beginTransaction((err) => {
                if (err) {
                    connect.rollback((err) => {
                        if (err) { callback(err); return; }
                    });
                    callback(err);
                    return;
                }
                else {
                    connect.query("INSERT INTO PARTIDAS(NOMBRE, ESTADO) VALUES (?,?)", [name, ""], (err, res) => {
                        if (err) {
                            connect.rollback((err) => {
                                if (err) { callback(err); return; }
                            });
                            callback(err);
                            return;
                        }
                        else {
                            let gameId = res.insertId;
                            connect.query("INSERT INTO JUEGA_EN(IDUSUARIO, IDPARTIDA) VALUES (?,?)", [userId, gameId], (err, res) => {
                                if (err) {
                                    connect.rollback((err) => {
                                        if (err) { callback(err); return; }
                                    });
                                    callback(err);
                                    return;
                                }
                                else {
                                    connect.commit((err) => {
                                        if (err) {
                                            connect.rollback((err) => {
                                                if (err) { callback(err); return; }
                                            });
                                        }
                                    });
                                    callback(null, gameId);
                                }
                            });
                        }
                    });
                }
            });
            connect.release();
        });
    }

    joinGame(gameId, userId, callback) {
        this.pool.getConnection((err, connect) => {
            if (err) { callback(err); return; }
            else {
                connect.query("INSERT INTO JUEGA_EN(IDUSUARIO, IDPARTIDA) VALUES (?,?)", [userId, gameId], (err, res) => {
                    if (err) { callback(err); return; }
                    else
                        callback(null, true);
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