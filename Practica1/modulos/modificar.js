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
    
    if(req.file) {//Si cambia la imagen.
        user.img = req.file.filename;
    }//No necesita else, ya esta en user.

    console.log(user);    
    //No poner el req.daoUsers.modify... hasta que tengamos lo de las fechas arreglado.
    if(user.password.length == 0){
        //modificar user sin contraseña
        //req.daoUsers.modifyUserNewPass(user) <- CREAR función
    }
    else{
        //modificar user con contraseña
        //req.daoUsers.modifyUser(user); No poner hasta que esté correcto lo de las fechas
    } 
    //lo dejo asi para no modificar la bd hasta que esten bien recogidos los datos
    res.setFlash("Datos modificados correctamente", 2); //Este flash ira dentro de cada callback del DAO, como en el resto de funciones.
    res.render("profile", {user: user, searched: user});
}



module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}