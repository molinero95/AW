/*UTILIZAR EXPRESS-VALIDATOR*/
//Comprobaciones registro correcto
function checkName(name){
    if(!name) return false;
    return true;
}

function checkDate(date){
    if(!date) return false;
    return true;
    //Comprobar fecha
}

function checkPass(pass){
    if(!pass) return false;
    return true;
}

function parseGender(user){
    switch(user.gender) {
        case "hombre": user.gender='H'; break;
        case "mujer": user.gender='M'; break;
        case "otro": user.gender='O'; break;
    }
}

function checkGender(user){
    if(user.gender){
        parseGender(user);
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


function checkRegister(user) {
    return checkGender(user) && checkPass(user.password) && checkName(user.name) && checkDate(user.age);
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
    checkRegister: checkRegister,
    getAge: getAge,
    parseGender: parseGender, 
    makeQuestion: makeQuestion,
    decodifyGender: decodifyGender
}