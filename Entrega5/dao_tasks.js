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
    getAllTasks(email, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err, null); return;}
            con.query("SELECT t.id, t.text, t.done, g.tag FROM task as t left join tag as g on t.id = g.taskId where t.user = ? order by t.id", [email], (err, filas)=>{
                if(err){callback(err,null); return;}
                let anterior;
                let res = [];
                let tags = [];
                filas.forEach(element => {
                    if(anterior && anterior.id !== element.id){//no coinciden
                        res.push(anterior);//guardamos el dato anterior
                        if(element === filas[filas.length - 1])//si es el ultimo, guardamos tambien el actual
                            res.push([element.id, element.text, element.done, element.tag]);
                        tags = [];
                        anterior = new Object();
                    }
                    tags.push(element.tag);//metemos el elemento   
                    anterior = {
                        id: element.id,
                        text: element.text,
                        done: element.done,
                        tags: tags
                    } 
                    if(element === filas[filas.length - 1] && anterior.id === element.id)
                        res.push(anterior);
                });
                callback(null, res);
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
                if(task.tags.length != 0){
                    let valores = [];
                    for(let tag of task.tags){//añadimos a la consulta el numero de tags a insertar
                        valores.push([filas.insertId, tag]);
                    }
                    conn.query("INSERT INTO tag (taskId, tag) VALUES ?", [valores], (err, fila) => {
                        if(err){callback(err); return;}
                        callback(null);
                    });                
                }
                else
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