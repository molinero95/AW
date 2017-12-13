const mysql = require("mysql");
//DAOUsers
class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    //Utilizada para la llamada a /friends
    //Obtenemos todas las personas que deben aparecer en esta vista
    //Sean o no amigos
    getFriendsPage(userId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT ID1, ID, NOMBRECOMPLETO, IMAGEN, ACCEPTED FROM "
                + "(SELECT * FROM USERS AS U JOIN FRIENDS AS F1 ON U.ID = F1.ID1 UNION " 
                + "SELECT * FROM USERS AS U JOIN FRIENDS AS F2 ON U.ID = F2.ID2) AS T1 WHERE "
                + "ID <> ? AND (ID1 = ? OR ID2 = ?);", [userId, userId, userId], (err, resul) => {
                if(err) {callback(err); return;}
                callback(null, resul);
                con.release();
            })
        });
    }


    checkIfAreFriends(userId, searchId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT COUNT(*) AS RES FROM FRIENDS WHERE (ID1 = ? AND ID2= ?) OR (ID1 = ? AND ID2 = ?)", 
            [searchId, userId, userId, searchId], (err, resul) => {
                if(err) {callback(err); return;}
                resul[0].RES === 0 ?  callback(null, false):callback(null, true);
                con.release();
            })
        });
    }

    //Utilizada al buscar un usuario en friends
    searchUserAndStatusById(userId, searchId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM (SELECT * FROM USERS WHERE ID = ?) AS T1, "
            +"(SELECT * FROM FRIENDS WHERE (ID1 = ? AND ID2 = ?) OR (ID1 = ? AND ID2 = ?)) AS T2", 
            [searchId, searchId, userId, userId, searchId], (err, resul) => {
                if(err) {callback(err); return;}
                callback(null, resul);
                con.release();
            })
        });
    }


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