const mysql = require("mysql");
//DAOUsers
class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    getUserFriends(userId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("select ID1, ID2 FROM FRIENDS WHERE ACCEPTED = 1 AND (ID1 = ? OR ID2 = ?)", [userId, userId], (err, resul) => {
                let dev = [];
                resul.forEach(element => {
                    if(element.ID1 === userId)
                        dev.push(element.ID2);
                    else
                        dev.push(element.ID1);
                });
                callback(null, dev);
            })
        });
    }

    

    //Para en friends mostrar los amigos
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
    //Para comprobar si ha habido una solicitud de amistad entre ambos.
    /*
    Si ha habido una solicitud de uno a otro ó son amigos se devuelve fila*/
    requestSent(userId, friendId, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT ACCEPTED as accepted FROM FRIENDS WHERE ID1 = ? AND ID2 = ? OR ID1 = ? AND ID2 = ?", [userId, friendId, friendId, userId], (err, fila) =>{
                if(err){ callback(err); return;}
                if(fila.length > 0)
                    callback(null, true);
                else
                    callback(null, false);
            });
            con.release();
        });
    };
    //Solicitud de amistad
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

    acceptFriendRequest(userId, friendId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            console.log(userId, friendId);
            con.query("UPDATE FRIENDS SET ACCEPTED = 1 WHERE ID1 = ? AND ID2 = ?", [friendId, userId], (err, fila) =>{
                if(err){ callback(err); return;}
                console.log("UPDATE");                
                callback(null, fila);
            });
            con.release();
        });
    }

    rejectFriendRequest(userId, friendId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("DELETE FROM FRIENDS WHERE ID1 = ? AND ID2 = ?", [friendId, userId], (err, fila) =>{
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