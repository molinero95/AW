
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


function setDAOUsers(req, res, next) {
    req.daoUsers = daoUsuarios;
    next();
}



module.exports = {
    isLogged: isLogged,
    logger: logger,
    setDAOUsers: setDAOUsers,
}