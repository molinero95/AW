const utilidades = require('./utilidades');


function getModificar(req,res){
    res.status(200);
    let user = {
        id:req.session.user,
    };
    req.daoUsers.searchUserById(user.id, (err, datos) =>{
        if(err){ 
            res.setFlash("Ha ocurrido un error",0);
            res.redirect("/modificar");
        }
        
        let us = utilidades.makeUser(user.id, datos.EMAIL, "",datos.NOMBRECOMPLETO, datos.SEXO, datos.NACIMIENTO, datos.IMAGEN, datos.PUNTOS);
        let date = new Date(datos.NACIMIENTO);
        us.age = utilidades.getDate(us.age);
        res.render("modificar", {user: us});
    });
   
}

function postModificar(req,res){
    res.status(200);
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
   

    req.checkBody("email","Dirección de correo no válida").isEmail(),
    req.checkBody("age","Fecha de nacimiento no válida").isBefore(),
    req.checkBody("name", "El nombre no es válido").isLength({min:2}),
    req.checkBody("gender", "El género no es válido").isLength({min:1});

    utilidades.parseGender(user);
    
    if(req.file) {//Si cambia la imagen.
        user.img = req.file.filename;
    }

    if(user.password.length !== 0){
        //modificar user con contraseña
        req.checkBody("password","La contraseña no es válida").isLength({min: 6});
        let error = req.validationErrors();
        if(!error){
            req.daoUsers.modifyUserNewPass(user, (err, insert) =>{
                if(err){
                    res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                    res.redirect("/modificar");
                }
                user.age = utilidades.getAge(user.age);       
                res.setFlash("Datos modificados correctamente", 2);
                res.redirect("/profile");
            }); 
        }
        else{
            let mensaje = "";
             for(let i = 0; i < error.length; i++){
                mensaje += "<p>" + error[i].msg + "</p>";
             }
             res.setFlash(mensaje,0);
             res.redirect("/modificar");
      
         }
    }
    else{
        //modificar user sin contraseña
        let error = req.validationErrors();
        if(!error){        
            user.password = req.password;
            req.daoUsers.modifyUser(user, (err, insert) =>{
                if(err){
                    res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                    user.gender = utilidades.decodifyGender(user.gender);
                    res.render("modificar", {user:user});
                }
                user.age = utilidades.getAge(user.age);  
                console.log(user);         
                res.setFlash("Datos modificados correctamente", 2);
                user.gender = utilidades.decodifyGender(user.gender);
                res.redirect("profile");    
            }); 
        } 
        else{
            let mensaje = "";
             for(let i = 0; i < error.length; i++){
                mensaje += "<p>" + error[i].msg + "</p>";
             }
             res.setFlash(mensaje,0);
             res.redirect("/modificar");
      
        }
    }
    
}



module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}