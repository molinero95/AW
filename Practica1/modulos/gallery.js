const utilidades = require('./utilidades');

function getGaleria(){
    res.status(200);
    let user = {
        id:req.session.user,
    };
    let imagenes = req.daoUsers.getImagenes(user.id, (err, datos) =>{
        if(err){ 
            res.setFlash("Ha ocurrido un error",0);
            res.redirect("/profile");
        }

        res.render("/gallery", {user: us}, {imagenes: imagenes});
    });
}

function postGaleria(){

}