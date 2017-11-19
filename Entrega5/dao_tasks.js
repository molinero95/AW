"use strict";


/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     * 
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {//Intentar poner mas claro
        this.pool.getConnection((err,con) => {
            if(err){ callback(err,null); return;}
            con.query("select t.id, t.text, t.done, g.tag  from task as t left join tag as g on t.id = g.taskId where t.user = ?  order by t.id",[email],(err,filas) => {
                if(err){callback(err,null); return;}
                let resultado = [];
                    let anterior;
                    for(let fila of filas) {
                        let dato = {
                            id: fila.id,
                            text: fila.text,
                            done: fila.done,
                            tags: []
                        }
                        dato.tags.push(fila.tag);
                        if(anterior && anterior.id === dato.id){    //ac = ant
                            anterior.tags.push(fila.tag);
                            if(fila === filas[filas.length - 1])//ultimo caso
                               resultado.push(anterior);
                        }
                        else if(anterior && anterior.id !== dato.id){   //ac != ant
                            resultado.push(anterior);
                            if(fila === filas[filas.length - 1])//ultimo caso
                                resultado.push(dato);
                            anterior = new Object();
                            anterior = dato;
                        }
                        else{//primer caso
                            anterior = dato;
                            if(fila === filas[filas.length - 1])//ultimo caso
                                resultado.push(anterior);
                        }
                    }
                    con.release();                        
                    callback(null,resultado);
            
            });
        })
    }

    /**
     * Inserta una tarea asociada a un usuario.
     * 
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     * 
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email, task, callback) {
        this.pool.getConnection((err, conn) => {
            if(err) {callback(err); return;}
            conn.query("INSERT INTO task(user, text, done) VALUES (?,?,?)",[email, task.text, task.done], (err, filas) =>{
                if(err) {callback(err); return;}
                //console.log(filas.insertId);
                if(task.tags.length != 0){
                    let sentence = "INSERT INTO tag(taskId, tag) VALUES "
                    let arrayDatos = [];
                    for(let tag of task.tags){//añadimos a la consulta el numero de tags a insertar
                        if(tag == task.tags[task.tags.length - 1])
                            sentence = sentence + "(?,?);";
                        else
                            sentence = sentence + "(?,?), ";
                        arrayDatos.push(filas.insertId);
                        arrayDatos.push(tag);
                    }                    
                    conn.query(sentence, arrayDatos, (err,filas) => {
                        if(err){callback(err); return;}
                        callback(null);
                    })
                }
                callback(null);
                conn.release();                
            });
        });
        
    }

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     * 
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     * 
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}