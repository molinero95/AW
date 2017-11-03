"use strict";


class FlujoNumeros {
    constructor() {
        this.numeros = [6, 1, 4, 3, 10, 9, 8];
    }
    
    siguienteNumero(f) {
        setTimeout(() => {
          let result = this.numeros.shift();
          f(result);
        }, 100);
    }
}


/**
 * Imprime la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDosLog(flujo) {
	let num1;
	flujo.siguienteNumero(num=>num1=num);
	flujo.siguienteNumero(num=>console.log(num1+num));
	
}
sumaDosLog(new FlujoNumeros());

/**
 * Llama a la función f con la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDos(flujo, f) {
	let num1;
	flujo.siguienteNumero(num=>num1=num);
	flujo.siguienteNumero(num=>f(num1+num));
}

sumaDos(new FlujoNumeros(), suma => {
	console.log(`El resultado de la suma de los dos primeros números es ${suma}`);
	});

/**
 * Llama a la función f con la suma de todos los números del flujo pasado como parámetro
 */
function sumaTodo(flujo, f) {
	suma(0, flujo, f);
}

function suma(acum, flujo, f){
	flujo.siguienteNumero(num=>{  	
		if(num !== undefined)
			suma(acum + num, flujo, f);
		else
			f(acum);
	});
}

sumaTodo(new FlujoNumeros(), suma => {
console.log(`El resultado de la suma de todos los números es ${suma}`);
});



/* NO MODIFICAR A PARTIR DE AQUÍ */

module.exports = {
    FlujoNumeros: FlujoNumeros,
    sumaDosLog: sumaDosLog,
    sumaDos: sumaDos,
    sumaTodo: sumaTodo
}