
const utilidades = require("./utilidades");


//friends, colocar mas bonito (utilizando funciones para no repetir codigo)
function getFriends(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoFriends.getFriendsRequests(req.session.user, (err, datos) =>{
        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
        let requ = [];
        if(datos.length > 0){   //Si tenemos requests       
            datos.forEach(element => {
                req.daoUsers.searchUserById(element.ID1, (err, info) => {
                    if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
                    requ.push({
                        id: element.ID1,
                        name: info.nombreCompleto,
                        img: info.imagen,
                    });
                    if(element === datos[datos.length - 1]){ //ultimo elemento de todos
                        req.daoFriends.getUserFriends(req.session.user, (err, datos) =>{
                            if(datos.length > 0){
                                let ag = [];
                                datos.forEach(elem => {
                                    req.daoUsers.searchUserById(elem, (err, aggreg) => {
                                        ag.push({
                                            id: elem,
                                            name: aggreg.nombreCompleto,
                                            img: aggreg.imagen,
                                        });
                                        if(elem === datos[datos.length - 1]){
                                            console.log("AQUI");                                                                                    
                                            res.render("friends", {user: user, friends: {requests: requ, aggregated: ag}});   
                                        }                                     
                                    })
                                });
                            }
                            else
                                res.render("friends", {user: user, friends: {requests: requ, aggregated: null}});
                        });
                    }
                });        
            });
        }
        else{   //Si no tenemos requests
            req.daoFriends.getUserFriends(req.session.user, (err, datos) =>{
                if(datos.length > 0){
                    let ag = [];
                    datos.forEach(elem => {
                        req.daoUsers.searchUserById(elem, (err, aggreg) => {
                            ag.push({
                                id: elem,
                                name: aggreg.nombreCompleto,
                                img: aggreg.imagen,
                            });
                            if(elem === datos[datos.length - 1])
                                res.render("friends", {user: user, friends: {requests: null, aggregated: ag}});
                        })
                    });                    
                }
                else
                    res.render("friends", {user: user, friends: {requests: null, aggregated: null}});                        
            });
        }   
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
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            if(filas.length > 0){
                let result = [];
                filas.forEach(us => {
                    result.push(utilidades.makeUser(us.id, null, null, us.nombreCompleto, us.sexo, us.nacimiento, us.imagen, us.puntos));
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
    req.daoUsers.searchUserById(req.params.user, (err, us) => {
        if(err){console.error(err);res.status(404); res.send("Ha ocurrido un error");}
        if(us){
            let u = utilidades.makeUser(req.params.user, null, null, us.nombreCompleto, us.sexo, us.nacimiento, us.imagen, us.puntos);
            u.age = utilidades.getAge(u.age);
            req.daoFriends.requestSent(user.id, req.params.user, (err, areFriends) => {
                if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error");}
                res.render("profile", {user: user, searched: u, areFriends: areFriends});                
            });
        }
        else{
            res.render("profile", {user: user, searched: null});
        }
    });
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
        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
        res.setFlash("Solicitud enviada correctamente", 2);
        res.redirect("friends");
    });

}


function actionRequest(req, res) {
    res.status(200);   
    if(req.body.aceptar)
        req.daoFriends.acceptFriendRequest(req.session.user, req.params.friendId, (err, result) => {
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            res.redirect("/friends");
        });
    else   //rechazar
        req.daoFriends.rejectFriendRequest(req.session.user, req.params.friendId, (err, result) => {
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            res.redirect("/friends");
        });
    
}



function postRejectFriend(req, res) {
    res.status(200);
    
}

module.exports = {
    getFriends: getFriends,
    getSearchFriend: getSearchFriend,
    searchUser: searchUser,
    addFriend: addFriend,
    actionRequest: actionRequest,
}