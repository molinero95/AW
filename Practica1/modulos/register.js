const utilidades = require("./utilidades");


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
    let correct = utilidades.checkRegister(user);
    if(correct){
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
        res.setFlash("Datos incorrectos", 0);
        res.render("register");    
    }
}


module.exports = {
    getRegister: getRegister,
    postRegister: postRegister,
}