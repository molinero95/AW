
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


exports.checkRegister = function(user) {
    return checkGender(user) && checkPass(user.password) && checkName(user.name) && checkDate(user.date);
}