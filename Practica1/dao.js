"use strict";
const mysql = require("mysql");
//Clase reutilizada del ejercicio 2
class DAO {
    constructor(host, user, password, database) {
      this.pool = mysql.createPool({
        host: host,
        user: user,
        password: password,
        database: database,
      });
    }

    existeUsuario(nombreUsr, callback){
      pool.getConnection((err, connect) => {
          if(err) {console.log(err); return;}
          connect.query("SELECT COUNT (users.id) as resultado FROM usuarios AS users where nombre= ? ",[nombreUsr],(err, filas) =>{
              if(err){callback(err); return;}
              connect.release();
              //console.log(filas.resultado);
              filas.resultado == 1 ? callback(null, true):callback(null, false);
          });
      });
  }

    insertarUsuario(usuario, callback) {
      this.pool.getConnection((err, con) =>{
        if(err)
          callback(err);
        else{
          con.query("INSERT INTO usuarios(nombre, correo, telefono) VALUES(?,?,?)", [usuario.nombre, usuario.correo, usuario.telefono], (err, fila)=>{
            if(err)
              callback(err);
            else
              callback(fila);
          });
        }
        con.release();
      });
    }

    enviarMensaje(usuarioOrigen, usuarioDestino, mensaje, callback) {
      this.pool.getConnection((err, con) => {
        if(err)
          callback(err);
        else{
          con.query("INSERT INTO mensajes(idOrigen, idDestino, mensaje, leido) VALUES (?,?,?,?)", [usuarioOrigen.id, usuarioDestino.id, mensaje, false], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(fila);
          })
        }
        con.release();
      });
    
    }

    bandejaEntrada(usuario, callback) {
      this.pool.getConnection((err, con) => {
        if(err)
          callback(err);
        else{
          con.query("select * from mensajes where idDestino = ?", [usuario.id], (err, fila) =>{
            if(err)
              callback(err);
            else
              callback(fila);
          });
        }
        con.release();
      });
    }

    buscarUsuario(str, callback) {
      this.pool.getConnection((err, con) => {
        if(err){
          callback(err);
        }
        else{
          con.query("select id from usuarios us where nombre like %?%", [str], (err, fila) =>{
            if(err){
              callback(err);
            }
            else{
              callback(fila);
            }
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