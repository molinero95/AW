
//Comprueba si hay un usuario iniciado.
//Si no, redirige a login.
function isLogged(req, res, next) {
    if(req.session.user)
        next();
    else
        res.redirect('/login');
    
}

function logger(req, res, next) {
    console.log(`Recibida peticion: ${req.url}`);
    next();
}


//Middleware para mostrar mensajes de error
/*
Un objeto flash contendra 2 atributos:
    - msg: contiene el mensaje.
    - type: contiene el tipo del mensaje:
        - 0: error
        - 1: atención
        - 2: afirmación
*/
function flash(req, res, next) {
    res.setFlash = (msg, type) => {
        req.session.flashMsg = msg;
        req.session.flashType = type;
    };
    res.locals.getAndClearFlash = () => {
        let flash = {
            msg : req.session.flashMsg,
            type: req.session.flashType
        }
        delete req.session.flashMsg;
        delete req.session.flashType;
        return flash;
    };
    next();
}

function userLoggedData (req, res, next) {
    req.daoUsers.searchUserById(req.session.user, (err, datos) => {
        if(err){console.error(err); return;}
        if(datos) {  //Se deberia cumplir siempre
            req.img = datos.IMAGEN;
            req.points = datos.PUNTOS;
            next();
        }
    });
}



module.exports = {
    isLogged: isLogged,
    logger: logger,
    flash: flash,
    userLoggedData: userLoggedData,
}