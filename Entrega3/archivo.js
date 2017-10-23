let tareas = [
{ text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
{ text: "Mirar fechas congreso", done: true, tags: [] },
{ text: "Ir al supermercado", tags: ["personal"] },
{ text: "Mudanza", done: false, tags: ["personal"] },
];



//ejercicio 1
//primero filtramos por done === false o undefined.
//segundo mapeo para obtener solo el campo text en un vector.
function getToDoTask(tasks) {
	return tasks.filter(n=>n.done === false || n.done === undefined).map(n=>n.text);
}

//console.log(getToDoTask(tareas));


//ejercicio 2
//filtramos y comprobamos que el atributo tags contenga el tag (es decir, que no devuelva -1)
function findByTag(tasks, tag) {
	return tasks.filter(n=>n.tags.indexOf(tag) !== -1)
}

//console.log(findByTag(tareas, "personal"));

//ejercicio 3

function findByTags(tasks, tags) {
	return tasks.filter(n=>n.tags.some(n=>tags.indexOf(n) !== -1));
}

//console.log(findByTags(tareas, ["personal","pdap"]));


//ejercicio 4

function countDone(tasks) {
	return tasks.filter(n=>n.done === true).reduce((ac, n) => ac + 1, 0);
}

//console.log(countDone(tareas));

//ejercicio 5

function createTask(texto) {
	//let exp = /(\@[A-z]{0,}\s)/;
	let exp = /\@[A-z]{0,}/g;
	let nuevaCadena = texto;
	let tarea, etiq, simple;
	tarea = {text:"", tags: []}
	while(etiq = exp.exec(texto)){
		nuevaCadena = nuevaCadena.replace(etiq[0], "");
		simple = etiq[0].replace("@","");
		tarea.tags.push(simple);
	}
	nuevaCadena = nuevaCadena.trim();
	tarea["text"] = nuevaCadena;
	return tarea;
	
}

console.log(createTask("Esto es una cadena @de @texto"));
console.log(createTask("Y por aquí va otra @personal"));