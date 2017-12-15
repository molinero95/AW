const utilidades = require("./utilidades");
const { check, validationResult } = require('express-validator/check');


function getRegister (req, res) {
    res.status(200);
    res.render("register");
};

function postRegister (req, res) {
    res.status(200);
    let user;
    if(req.file)
        user = utilidades.makeUser(null, req.body.user, req.body.password, req.body.name, req.body.gender,
    req.body.age, req.file.filename, 0);
    else
        user = utilidades.makeUser(null, req.body.user, req.body.password, req.body.name, req.body.gender,
    req.body.age, "default.png", 0);   
    req.checkBody("user","Dirección de correo no válida").isEmail(),
    req.checkBody("age","Fecha de nacimiento no válida").isBefore(),
    req.checkBody("password","La contraseña no es válida").isLength({min: 6}),
    req.checkBody("name", "El nombre no es válido").isLength({min:2})
    req.checkBody("gender", "El género no es válido").isLength({min:1});

    let error = req.validationErrors();
    
    if(!error){
    req.daoUsers.userExists(user.email,(err, exists) =>{
        if(err){
            console.error(err);
            res.status(404); 
            res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
            res.render("register");            
        }
        console.log(user);      
            if(exists){
                res.setFlash("Usuario no valido", 0);
                res.render("register");
            }
            else{
                req.daoUsers.insertUser(user, (err, insert) =>{
                    if(err){
                        console.error(err);
                        res.setFlash("Ha ocurrido un error, intentelo mas tarde", 0);
                        res.render("register");
                    }
                    else{
                        res.setFlash("Usuario creado correctamente", 2)
                        res.render("login");
                    }
                });
            }
            
        });
    }
    else{
       let mensaje = "";
        for(let i = 0; i < error.length; i++){
           mensaje += "<p>" + error[i].msg + "</p>";
        }
        res.setFlash(mensaje,0);
        res.redirect("/register");
 
    }
}



module.exports = {
    getRegister: getRegister,
    postRegister: postRegister,
}