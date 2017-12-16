
const utilidades = require("./utilidades");


//Cuando pulsamos sobre "amigos"
function getFriends(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoFriends.getFriendsPage(user.id, (err, datos) => {
        if(err){ 
            res.setFlash("Ha ocurrido un error.",0);
            res.redirect("/friends");
        }
        let friends = {
            requests: [],
            aggregated: [],
        }
        datos.forEach(d => {
            let f = utilidades.makeUser(d.ID, null, null, d.NOMBRECOMPLETO, null, null, d.IMAGEN, null);
            if(d.ACCEPTED === 1)  //Son amigos
                friends.aggregated.push(f);
            else if(d.ID1 !== user.id) //guardamos solo aquellos que nos han mandado solicitud.
                friends.requests.push(f);
        });  
        if(friends.requests.length === 0)
            friends.requests = null;
        if(friends.aggregated.length === 0)
            friends.aggregated = null;
        
        res.render("friends", {user: user, friends: friends}); 
    }); 
}


//Utilizada para la busqueda de amigos tras escribir el nombre
function getSearchFriend(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    if(!req.query.friend){
        res.render("searchUsers", {user: req.session.user, searched: null});
    }
    else{
        req.daoUsers.searchUsers(req.query.friend, (err, filas) => {
            if(err){
                res.setFlash("Ha ocurrido un error.",0);
                res.redirect("/friends");
            }
            if(filas.length > 0){
                console.log(filas);
                let result = [];
                filas.forEach(us => {
                    console.log(us);
                    result.push(utilidades.makeUser(us.ID, null, null, us.NOMBRECOMPLETO, us.SEXO, us.NACIMIENTO, us.IMAGEN, us.PUNTOS));
                });
                res.render("searchUsers", {user: user, searched: result});
            }
            else
                res.render("searchUsers", {user: user, searched: null});
        });
    }
    
}

//Cuando seleccionas un usuario
function searchUser(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    if(Number(user.id) === Number(req.params.user))
        res.redirect('/profile');
    else{
        req.daoFriends.searchUserAndStatusById(user.id, req.params.user, (err, us) => {
            if(err){
                res.setFlash("Ha ocurrido un error");
                res.redirect("/friends");
            }
            if(us.length > 0){  //Son amigos ó ha habido solicitud de amistad
                let areFriends = Boolean(us[0].ACCEPTED);
                let searched = utilidades.makeUser(req.params.user, null,null, us[0].NOMBRECOMPLETO, us[0].SEXO, us[0].NACIMIENTO, us[0].IMAGEN, us[0].PUNTOS);
                searched.age = utilidades.getAge(searched.age);
                if(!areFriends) { //Para dar información sobre qué ocurre con la solicitud de amistad
                    res.setFlash("Hay una petición pendiente por aprobar con este usuario", 1);
                    req.daoFriends.getFriendPictures(searched.id,(err,fotos)=>{
                        if(err){
                            res.setFlash("Ha ocurrido un error");
                            res.redirect("/friends");
                        }
                        if(fotos.length > 0){
                            pictures = [];
                            fotos.forEach(e=> {
                                pictures.push(e.IMAGEN);
                            });
                            pictures = utilidades.arrayNullClear(pictures);
                            res.render("profile", {user: user, searched: searched, areFriends: true, pictures: pictures});  //Es true ya que no debe aparecer el boton añadir amigo
                        }else
                            res.render("profile", {user: user, searched: searched, areFriends: true, pictures: []});  //Es true ya que no debe aparecer el boton añadir amigo
                    })
                }
                else{//Son amigos, busco fotos
                    req.daoFriends.getFriendPictures(searched.id,(err,fotos)=>{
                        if(err){
                            res.setFlash("Ha ocurrido un error");
                            res.redirect("/friends");
                        }
                        if(fotos.length > 0){
                            pictures = [];
                            fotos.forEach(e=> {
                                pictures.push(e.IMAGEN);
                            });
                            pictures = utilidades.arrayNullClear(pictures);
                            res.render("profile", {user: user, searched: searched, areFriends: true, pictures: pictures});  //Es true ya que no debe aparecer el boton añadir amigo
                        }else
                            res.render("profile", {user: user, searched: searched, areFriends: true, pictures: []});  //Es true ya que no debe aparecer el boton añadir amigo
                    })
                }
            }
            else{//Comprobar si existe usuario y buscar por Id, si no error
                req.daoUsers.searchUserById(req.params.user, (err, d)=>{
                    if(err){
                        res.setFlash("Ha ocurrido un error");
                        res.redirect("/friends");
                    }
                    if(d){
                        let searched = utilidades.makeUser(req.params.user, null,null, d.NOMBRECOMPLETO, d.SEXO, d.NACIMIENTO, d.IMAGEN, d.PUNTOS);
                        searched.age = utilidades.getAge(searched.age);
                        req.daoFriends.getFriendPictures(searched.id,(err,fotos)=>{
                            if(err){
                                res.setFlash("Ha ocurrido un error");
                                res.redirect("/friends");
                            }
                            if(fotos.length > 0){
                                pictures = [];
                                fotos.forEach(e=> {
                                    pictures.push(e.IMAGEN);
                                });
                                pictures = utilidades.arrayNullClear(pictures);
                                 //No son amigos ni ha habido solicitud de amistad  
                                res.render("profile", {user: user, searched: searched, areFriends: false, pictures: pictures});  
                            }else
                                res.render("profile", {user: user, searched: searched, areFriends: false, pictures: []});  
                        });
                    }
                    else{//El usuario no existe
                        res.setFlash("No se ha encontrado el usuario", 0);
                        res.redirect("/friends");
                    }
                });
            }
        });
    }
};

//Al pulsar sobre añadir amigo
function addFriend(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoFriends.insertFriendRequest(req.session.user, req.body.friendId, (err, sol) =>{
        if(err){
            res.setFlash("Ha ocurrido un error.",0);
            res.redirect("/friends");
        }
        res.setFlash("Solicitud enviada correctamente", 2);
        res.redirect("/friends");
    });

}


function actionRequest(req, res) {
    res.status(200);   
    if(req.body.aceptar)
        req.daoFriends.acceptFriendRequest(req.session.user, req.params.friendId, (err, result) => {
            if(err){
                res.setFlash("Ha ocurrido un error.",0);
                res.redirect("/friends");
            }
            res.redirect("/friends");
        });
    else   //rechazar
        req.daoFriends.rejectFriendRequest(req.session.user, req.params.friendId, (err, result) => {
            if(err){ 
                res.setFlash("Ha ocurrido un error.",0);
                res.redirect("/friends");
            }
            res.redirect("/friends");
        });
    
}



module.exports = {
    getFriends: getFriends,
    getSearchFriend: getSearchFriend,
    searchUser: searchUser,
    addFriend: addFriend,
    actionRequest: actionRequest,
}