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
            con.query("SELECT ID1, ID2, ACCEPTED AS accepted FROM FRIENDS WHERE ACCEPTED = 0 AND ID2 = ?", [userId], (err, filas) =>{
                if(err){callback(err); return}
                callback(null,filas);
            });
            con.release();            
        })
    }

    requestSent(userId, friendId, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT ACCEPTED as accepted FROM FRIENDS WHERE ID1 = ? AND ID2 = ? OR ID1 = ? AND ID2 = ?", [userId, friendId, friendId, userId], (err, fila) =>{
                if(err){ callback(err); return;}
                callback(null, fila);
            });
            con.release();
        });
    };

    insertFriendRequest(userId, friendId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO FRIENDS (ID1, ID2, ACCEPTED) VALUES (?,?,0)", [userId, friendId], (err, fila) =>{
                if(err){ callback(err); return;}
                callback(null, fila);
            });
            con.release();
        });
    }

    close() {
      this.pool.end();
    }

}

module.exports = DAO;