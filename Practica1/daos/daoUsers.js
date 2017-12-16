const mysql = require("mysql");
//DAOUsers
class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    userCorrect(name, password,callback){
      this.pool.getConnection((err, connect) => {
          if(err) {console.error(err); return;}
          connect.query("SELECT ID FROM USERS WHERE EMAIL = ? and PASSWORD = ? ",[name, password],(err, filas) =>{
            connect.release();   
            if(err){callback(err); return;}
            filas.length == 1 ? callback(null, filas[0].ID):callback(null, false);
          });
      });
    }

    userExists(name, callback) {
      this.pool.getConnection((err, connect) => {
        if(err){console.error(err); return;}
        connect.query("SELECT COUNT (ID) AS RESULTADO FROM USERS WHERE EMAIL = ? ",[name],(err, filas) =>{
          connect.release();            
          if(err){callback(err); return;}
          filas[0].RESULTADO == 1 ? callback(null, true):callback(null, false);
        });
      });
    }

    userExistsById(id, callback){
      this.pool.getConnection((err, connect) => {
        if(err){console.error(err); return;}
        connect.query("SELECT COUNT (ID) AS RESULTADO FROM USERS WHERE ID = ? ",[id],(err, filas) =>{
          connect.release();            
          if(err){callback(err); return;}
          filas[0].RESULTADO == 1 ? callback(null, true):callback(null, false);
        });
      });
    }

    userExistsCorrectName(id, name, callback){
      this.pool.getConnection((err, connect) => {
        if(err){console.error(err); return;}
        connect.query("SELECT COUNT (ID) AS RESULTADO FROM USERS WHERE ID = ? AND NOMBRECOMPLETO= ?",[id, name],(err, filas) =>{
          connect.release();            
          if(err){callback(err); return;}
          filas[0].RESULTADO == 1 ? callback(null, true):callback(null, false);
        });
      });
    }

    insertUser(user, callback) {
      this.pool.getConnection((err, con) =>{
        if(err)
          callback(err);
        else{
          con.query("INSERT INTO USERS (EMAIL, PASSWORD, NOMBRECOMPLETO, SEXO, NACIMIENTO, IMAGEN, PUNTOS) VALUES(?,?,?,?,?,?,?)", [user.email, user.password, user.name, user.gender, user.age, user.img, user.points], (err, fila)=>{
            if(err){callback(err); return;}
            else
              callback(null,true);
          });
        }
        con.release();
      });
    }

    getImagenes(user,callback){
      this.pool.getConnection((err,con) =>{
        if(err){
          callback(err);
        }
        else{
          con.query("SELECT IMAGEN FROM USER_PHOTOS WHERE USER_ID = ?", [user.id], (err,fila) => {
            if(err){
              callback(err); 
              return;
            }
            else{
              callback(null,true);
            }
          });
        }
        con.release();
      });
    }

    modifyUser(user,callback){
      this.pool.getConnection((err,con) =>{
        if(err)
          callback(err);
        else{
          con.query("UPDATE USERS SET EMAIL = ?, NOMBRECOMPLETO = ?, NACIMIENTO = ?, SEXO = ?, IMAGEN = ?, PUNTOS = ? WHERE ID = ?",[user.email, user.name, user.age, user.gender, user.img, user.points, user.id], (err,fila) => {
          if(err){callback(err); return;}
          else
            callback(null,true);
        });
      }
        con.release();
      });
    }
    
    modifyUserNewPass(user, callback){
      this.pool.getConnection((err,con) => {
        if(err)
          callback(err);
        else{
          con.query("UPDATE USERS SET EMAIL = ?, NOMBRECOMPLETO = ?, PASSWORD = ?, NACIMIENTO = ?, SEXO = ?, IMAGEN = ?, PUNTOS = ? WHERE ID = ?",[user.email, user.name, user.password,user.age, user.gender, user.img, user.points, user.id], (err,fila) => {
          if(err){callback(err); return;}
          else
            callback(null,true);
          });
        }
        con.release();
      });
    }

    //Búsqueda de usuario por nombre
    searchUsers(user, callback) {
      this.pool.getConnection((err, con) => {
        if(err){
          callback(err);
        }
        else{
          let us = "%"+user+"%";
          con.query("SELECT ID, NOMBRECOMPLETO, SEXO, NACIMIENTO, IMAGEN, PUNTOS FROM USERS WHERE NOMBRECOMPLETO LIKE ?", [us], (err, filas) =>{
            if(err)
              callback(err);
            else
              callback(null, filas);
          });
        }
        con.release();
      });
    }
    //Busqueda de usuario por ID
    searchUserById(id, callback) {
      this.pool.getConnection((err, con) => {
        if(err){callback(err);}
        else{
          con.query("SELECT EMAIL, NOMBRECOMPLETO, SEXO, NACIMIENTO, IMAGEN, PUNTOS FROM USERS WHERE ID = ?", [id], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(null, fila[0]);
          });
        }
        con.release();
      });
    }

    modifyPoints(id, points, callback) {
      this.pool.getConnection((err, con) => {
        if(err){callback(err);}
        else{
          con.query("UPDATE USERS SET PUNTOS = ? WHERE ID = ?", [points,id], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(null, true);
          });
        }
        con.release();
      });
    }

    getUserProfile(id, callback){
      this.pool.getConnection((err, con) => {
        if(err){callback(err);}
        else{
          con.query("SELECT U.EMAIL, U.NOMBRECOMPLETO, U.SEXO, U.NACIMIENTO, U.IMAGEN, U.PUNTOS, "
          + "P.IMAGEN AS IMG FROM USERS AS U LEFT JOIN USER_PHOTOS AS P ON P.USER_ID = U.ID WHERE U.ID = ?", [id], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(null, fila);
          });
        }
        con.release();
      });
    }


    close() {
      this.pool.end();
    }

}

module.exports = DAO;