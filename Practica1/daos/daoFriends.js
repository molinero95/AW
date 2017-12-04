const mysql = require("mysql");
//DAOUsers
class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    hasFriends(user, callback){

    }


    getFriendsRequests(userId, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM FRIENDS WHERE ACCEPTED = 1 AND ID1 = ? OR ID2 = ?", [userId, userId], (err, filas) =>{
                if(err){callback(err); return}
                callback(null,filas);
            });
            con.release();            
        })
    }

    requestSent(userId, friendId, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT ACCEPTED FROM FRIENDS WHERE ID1 = ? AND ID2 = ? OR ID1 = ? AND ID2 = ?", [userId, friendId, friendId, userId], (err, fila) =>{
                if(err){ callback(err); return;}
                callback(null, fila);
            });
            con.release();
        });
    };

    close() {
      this.pool.end();
    }

}

module.exports = DAO;