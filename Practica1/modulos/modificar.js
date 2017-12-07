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
        console.log(us);
        res.render("modificar", {user: us});
    });
   
}

//NECESITA VALIDACION DE FORMULARIOS
//Hay que ver como poner lo de la edad
function postModificar(req,res){
    res.status(200);
    console.log("hola");
    console.log(req.body.age);
    let user = {
        id:req.session.user,
        img: req.img,        
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        gender: req.body.gender,
        age: req.body.age,
        points: req.points,
    };
    let edad = utilidades.getAge(user.age);

    if(req.file) {//Si cambia la imagen.
        user.img = req.file.filename;
    }//No necesita else, ya esta en user.

    if(user.password.length !== 0){
        //modificar user con contraseña
        req.daoUsers.modifyUserNewPass(user, (err, insert) =>{
            if(err){
                console.error(err);
                res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                res.render("modificar");
            }
            else{
                res.setFlash("Datos modificados correctamente", 2);
                res.render("profile", {user: user, searched: user, edad: edad});
            }
        }); 
    }
    else{
        //modificar user sin contraseña
        user.password = req.password;
        req.daoUsers.modifyUser(user, (err, insert) =>{
            if(err){
                console.error(err);
                res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                res.render("modificar", {user:user});
            }
            else{
                res.setFlash("Datos modificados correctamente", 2);
                res.render("profile", {user: user, searched: user, edad: edad});
            }
        }); 
    } 
    
}



module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}