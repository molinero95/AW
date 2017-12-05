

function getLogin(req, res){
    res.status(200);
    res.render("login");
}
//CUIDADO CON ESTA FUNCION
function postLogin(req, res) {
    res.status(200);
    let user = req.body.user;
    req.daoUsers.userCorrect(user, req.body.password,(err, id) =>{  //seria mejor devolver el ID y meterlo a la sesión.
        if(err){console.error(err); return;}        
        if(id){
            req.session.user = id;//guardamos el id en la sesión para facilitar futuras busquedas
            //¿Guardamos la imagen?
            //etc?
            res.redirect('profile');
        }
        else{
            res.setFlash("Usuario y/o contraseña no validos.", 0);
            res.render("login");
        }
    });
}


module.exports = {
    getLogin: getLogin,
    postLogin: postLogin,
}