
const utilidades = require('./utilidades');

function getProfile(req,res){
    res.status(200);
    let user = req.session.user;
    req.daoUsers.getUserProfile(user, (err, datos) =>{
        if(err){
            res.redirect('/logout');
            return;
        }
        else{
            if(datos.length > 0){
                let us = utilidades.makeUser(user , datos[0].EMAIL, "", datos[0].NOMBRECOMPLETO, datos[0].SEXO, datos[0].NACIMIENTO, datos[0].IMAGEN, datos[0].PUNTOS);
                us.age = utilidades.getAge(datos[0].NACIMIENTO);
                let imagenes = [];
                datos.forEach(element => {
                    imagenes.push(element.IMG);
                });
                imagenes = utilidades.arrayNullClear(imagenes);
                res.render("profile", {user: us, searched: us, pictures: imagenes});
            }
            else
                res.redirect('/logout');
        }
    });
}

function uploadPicture(req, res){
    res.status(200);
    let user = req.session.user;
    if(req.file){
        let photo = {
            photo: req.file.filename,
            user: user,
        };
        req.daoUsers.insertUserPhoto(photo, (err, result) => {
            if(err){
                res.setFlash("Ha ocurrido un error", 0);
                res.redirect('/profile');
                return;
            }
            res.setFlash("Imagen insertada correctamente",2);
            res.redirect('/profile');
        });
    }
    else{
        res.setFlash("No se ha seleccionado ninguna foto", 0);
        res.redirect('/profile');
    }
}

module.exports = {
    getProfile: getProfile,
    uploadPicture: uploadPicture,
}