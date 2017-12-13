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
        if(datos){
            let us = utilidades.makeUser(user , datos.EMAIL, "", datos.NOMBRECOMPLETO, datos.SEXO, datos.NACIMIENTO, datos.IMAGEN, datos.PUNTOS);
            us.age = utilidades.getAge(datos.NACIMIENTO);
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