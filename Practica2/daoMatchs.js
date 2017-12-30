const mysql = require("mysql");//mysql

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    getMatchState(id, callback) {
        this.pool.getConnection((err, connect) => {
            if(err) {callback(err); return;}
            connect.query("SELECT STATUS FROM PARTIDAS WHERE ID = ?",[id],(err, filas) =>{
                if(err){callback(err); return;}
                filas.length > 0 ? callback(null, filas[0].STATUS):callback(null, null);
            });
            connect.release();
        });
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;