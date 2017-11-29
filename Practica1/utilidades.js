
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


function makeUser(us, pass, name, gender, age, img, points) {
    if(gender && gender.length == 1){
        gender = decodifyGender(gender);
    }
    return {
        user: us,
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

module.exports = {
    makeUser: makeUser,
    checkRegister: checkRegister
}