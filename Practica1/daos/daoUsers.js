const mysql = require("mysql");
//DAOUsers
class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    userCorrect(name, password,callback){
      this.pool.getConnection((err, connect) => {
          if(err) {console.error(err); return;}
          connect.query("SELECT users.id as resultado FROM users where email = ? and password = ? ",[name, password],(err, filas) =>{
            connect.release();   
            if(err){callback(err); return;}
            filas.length == 1 ? callback(null, filas[0].resultado):callback(null, false);
          });
      });
    }

    userExists(name, callback) {
      this.pool.getConnection((err, connect) => {
        if(err){console.error(err); return;}
        connect.query("SELECT COUNT (users.id) as resultado FROM users AS users where email = ? ",[name],(err, filas) =>{
          connect.release();            
          if(err){callback(err); return;}
          filas[0].resultado == 1 ? callback(null, true):callback(null, false);
        });
      });
    }

    userExistsById(id, callback){
      this.pool.getConnection((err, connect) => {
        if(err){console.error(err); return;}
        connect.query("SELECT COUNT (users.id) as resultado FROM users AS users where id = ? ",[id],(err, filas) =>{
          connect.release();            
          if(err){callback(err); return;}
          filas[0].resultado == 1 ? callback(null, true):callback(null, false);
        });
      });
    }

    insertUser(user, callback) {
      this.pool.getConnection((err, con) =>{
        if(err)
          callback(err);
        else{
          con.query("INSERT INTO users (email, password, nombreCompleto, sexo, nacimiento, imagen, puntos) VALUES(?,?,?,?,?,?,?)", [user.email, user.password, user.name, user.gender, user.age, user.img, user.points], (err, fila)=>{
            if(err){callback(err); return;}
            else
              callback(null,true);
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
          con.query("UPDATE users SET email = ?,nombreCompleto = ?, nacimiento = ?,sexo = ?,imagen = ?, puntos = ? WHERE ID = ?",[user.email, user.name, user.age, user.gender, user.img, user.points, user.id], (err,fila) => {
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
          con.query("UPDATE users SET email = ?,nombreCompleto = ?,password = ?, nacimiento = ?,sexo = ?,imagen = ?, puntos = ? WHERE ID = ?",[user.email, user.name, user.password,user.age, user.gender, user.img, user.points, user.id], (err,fila) => {
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
          con.query("select id, nombreCompleto, sexo, nacimiento, imagen, puntos from users AS us where nombreCompleto like ?", [us], (err, filas) =>{
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
          con.query("select email, nombreCompleto, sexo, nacimiento, imagen, puntos from users AS us where ID = ?", [id], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(null, fila[0]);
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