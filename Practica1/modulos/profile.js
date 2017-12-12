const utilidades = require('./utilidades');

function getProfile(req,res){
    res.status(200);
    let user = req.session.user;
    req.daoUsers.searchUserById(user, (err, datos) =>{
        console.log(datos);
        if(err){
            req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/login");
            });
            return;
        }
        if(datos){
            let us = utilidades.makeUser(user , datos.email, "", datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
            us.age = utilidades.getAge(datos.nacimiento);
            res.render("profile", {user: us, searched: us});
        }
        else{//Ojo aqui, si no se encuentra el perfil, del usuario logeado... 
            res.redirect("/logout");
        }
    }); 
}

module.exports = {
    getProfile: getProfile,
}