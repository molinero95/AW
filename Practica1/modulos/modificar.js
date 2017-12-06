const utilidades = require('./utilidades');

/* Esto veremos si lo metemos en el err
req.session.destroy((err) => {
                if(err){console.error(err); return;}
                res.redirect("/profile");
            }); */
function getModificar(req,res){
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoUsers.searchUserById(user.id, (err, datos) =>{
        if(err){ console.error(err); return;}
        let us = utilidades.makeUser(user.id, datos.email, "",datos.nombreCompleto, datos.sexo, datos.nacimiento, datos.imagen, datos.puntos);
        res.render("modificar", {user: us});
    });
   
}

function postModificar(req,res){
    res.status(200);
    console.log("hola");
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    if(req.file){
        user.file = req.file.filename;  
    } 
    if(req.body.age){
        user.age = req.body.age;
    }
    if(req.body.name){
        user.name = req.name;
    }
    if(req.body.gender){
        user.gender = req.body.gender;
    }
    if(req.body.email){
        user.email = req.body.email;
    }
    if(req.body.password){
        user.password = req.body.password;
    }
    console.log(req.body);
    console.log(user);
    //req.daoUsers.modifyUser(user);
    res.setFlash("Datos modificados correctamente", 2)
    res.render("modificar", {user: user});
}



module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}