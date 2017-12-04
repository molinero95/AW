const utilidades = require('./utilidades');

function getProfile(req,res){
    res.status(200);
    let user = req.session.user;
    console.log(user);
    req.daoUsers.searchUserById(user, (err, datos) =>{
        if(err){
            req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/login");
            });
            return;
        }
        let us = utilidades.makeUser(user, "",datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
        console.log(us);
        res.render("profile", {user: us});
    }); 
}

module.exports = {
    getProfile: getProfile,
}