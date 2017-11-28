
//Comprobaciones registro correcto
function checkName(name){
    if(name.length == 0)
        return "usuario vacio ";
    else
        return "";
}

function checkDate(date){
    if(!date)
        return "fecha vacía ";
    else
        return "";
    //Comprobar fecha
}

function checkPass(pass){
    if(!pass)
        return "contraseña vacía ";
    else
        return "";
}

function parseGender(user){
    switch(user.gender) {
        case "hombre": user.gender='H'; break;
        case "mujer": user.gender='M'; break;
        case "otro": user.gender='O'; break;
    }
}

exports.checkRegister = function(user) {
    let res = "Error: ";
    if(user.gender) parseGender(user);
    else res += "género no especificado.";
    res += checkPass(user.pass);
    res += checkName(user.name);
    res += checkDate(user.date);
    return res;
}