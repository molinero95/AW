

function getLogin(req, res){
    res.status(200);
    res.render("login");
}

function postLogin(req, res) {
    res.status(200);
    let user = req.body.user;
    req.daoUsers.userCorrect(user, req.body.password,(err, exists) =>{
        if(err){console.error(err); return;}        
        if(exists){
            req.session.user = user;
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