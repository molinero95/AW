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

function checkRegister(user) {
    return checkGender(user) && checkPass(user.password) && checkName(user.name) && checkDate(user.age);
}

function getAge(date){
    var cadena = date.toString();
    var fecha = cadena.split("-");
    var dia = fecha[2];
    var mes = fecha[1];
    var ano = fecha[0];

    console.log(ano);

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
    
    console.log(edad);
    return edad;

}

module.exports = {
    makeUser: makeUser,
    checkRegister: checkRegister,
    getAge: getAge,
}