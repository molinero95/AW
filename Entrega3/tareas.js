/**
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */
"use strict";

let listaTareas = [
  { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
  { text: "Mirar fechas congreso", done: true, tags: [] },
  { text: "Ir al supermercado", tags: ["personal"] },
  { text: "Mudanza", done: false, tags: ["personal"] },
];

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
	return tasks.filter(n=>n.done === false || n.done === undefined).map(n=>n.text);
}

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
	return tasks.filter(n=>n.tags.indexOf(tag) !== -1);
}

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, tags) {
	return tasks.filter(n=>n.tags.some(n=>tags.indexOf(n) !== -1));
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
	return tasks.filter(n=>n.done === true).reduce(ac => ac + 1, 0);
}

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
	let exp = /\@[A-z]{0,}/g;
	let nuevaCadena = text;
	let tarea, etiq, simple;
	tarea = {text:"", tags: []}
	while(etiq = exp.exec(text)){
		nuevaCadena = nuevaCadena.replace(etiq[0], "");
		simple = etiq[0].replace("@","");
		tarea.tags.push(simple);
	}
	nuevaCadena = nuevaCadena.trim();
	tarea["text"] = nuevaCadena;
	return tarea;
}

console.log(createTask("hola mundo"));


/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
  getToDoTasks: getToDoTasks,
  findByTag: findByTag,
  findByTags: findByTags,
  countDone: countDone,
  createTask: createTask
}