/*UTILIZAR EXPRESS-VALIDATOR*/
//Comprobaciones registro correcto
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');


function parseGender(gender){
    switch(gender) {
        case "hombre": user.gender='H'; break;
        case "mujer": user.gender='M'; break;
        case "otro": user.gender='O'; break;
    }
}

function checkGender(gender){
    if(gender){
        parseGender(gender);
        return true;
    }
    return false;
}


function decodifyGender(gender) {
    let gen = "";
    switch(gender) {
        case "H": gen='Hombre'; break;
        case "M": gen='Mujer'; break;
        case "O": gen='Otro'; break;
        case "1": 'Hombre'; break;
    }
    return gen;
}




function makeUser(iden, us, pass, name, gender, age, img, points) {
    if(gender && gender.length == 1){
        gender = decodifyGender(gender);
    }
    return {
        id: iden,
        email: us,
        name: name,
        password: pass,
        gender: gender,
        age: age,
        img: img,
        points: points
    };
}



function makeQuestion(id, question, numRes) {
    return {
        id: id,
        question: question,
        numRes: numRes
    }
}



function getDate(date){
    let year = date.getFullYear();
    let month = Number(date.getMonth() + 1);
    if(month < 10){
        month = "1"+String(month);
    }
    let day = date.getDate();
    return year + "-" + month + "-" + day;
}

function getAge(date){

    if(typeof(date) === "string"){
        var values = date.split("-");
        var dia = values[2];
        var mes = values[1];
        var ano = values[0];
    }
   else{
        var ano = date.getYear()+1900;
        var mes = date.getMonth()+1;
        var dia = date.getDate();
   }
    
    var hoy = new Date();
    var anoAct = hoy.getYear()+1900;
    var mesAct = hoy.getMonth()+1;
    var diaAct = hoy.getDate();

    var edad = anoAct - ano;
    
    if(mesAct < mes){
        edad--;
    }
    if (mesAct === mes && diaAct < dia){
        edad--;
    }
    return edad;
}

module.exports = {
    makeUser: makeUser,
    getAge: getAge,
    parseGender: parseGender, 
    makeQuestion: makeQuestion,
    decodifyGender: decodifyGender,
    getDate: getDate,
}