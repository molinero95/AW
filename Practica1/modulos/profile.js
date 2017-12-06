const utilidades = require('./utilidades');

function getProfile(req,res){
    res.status(200);
    let user = req.session.user;
    req.daoUsers.searchUserById(user, (err, datos) =>{
        if(err){
            req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/login");
            });
            return;
        }
        let us = utilidades.makeUser(user , datos.email, "", datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
        res.render("profile", {user: us, searched: us});
    }); 
}

module.exports = {
    getProfile: getProfile,
}