const utilidades = require('./utilidades');

function getModificar(req,res){
    res.status(200);
    let user = req.session.user;
    console.log(user);
    req.daoUsers.searchUser(user, (err, datos) =>{
        if(err){
            req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/profile");
            });
            return;
        }
        let us = utilidades.makeUser(user, datos.email, "",datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
        console.log(us);
        res.render("modificar", {user: us});
    });
   
}

function postModificar(req,res){
    res.status(200);
    let user = req.session.user;

    if(req.file){
        user.file = req.file;  
    } 
    if(req.nacimiento){
        user.nacimiento = req.nacimento;
    }
    if(req.nombreCompleto){
        user.nombreCompleto = req.nombreCompleto;
    }
    if(req.sexo){
        user.sexo = req.sexo;
    }
    if(req.email){
        user.email = req.email;
    }
    if(req.password){
        user.password = req.password;
    }

    req.daoUsers.modifyUser(user);
    res.setFlash("Datos modificados correctamente", 2)
    res.render("modificar", {user: user});
}



module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}