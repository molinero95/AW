const utilidades = require("./utilidades");

function getFriends(req, res) {
    res.status(200);
    req.daoFriends.getFriendsRequests(req.session.user, (err, datos) =>{
        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
        else{
            console.log(datos);
            res.render("friends", {user: req.session.user, friends: {requests: null} });//añadir amigos al render
        }
    });

}

function getSearchFriend(req, res) {
    res.status(200);
    //res.send(req.params.friend);
    if(!req.query.friend){
        res.render("searchFriend", {user: req.session.user, friend: null});
    }
    else{
        req.daoUsers.searchUser(req.query.friend, (err, fila) => {
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            else{
                if(fila) { //Existe el usuario
                    let us = utilidades.makeUser(null, null, fila.nombreCompleto, fila.sexo, fila.nacimiento, fila.imagen, fila.puntos);
                    req.daoFriends.requestSent(req.session.user, fila.id,(err, resultado) => {
                        if(err){console.error(err); res.status(404);}
                        if(resultado.length >= 1){ //usuario existente, aparece en friends con el logueado.
                            us.areFriends = resultado.accepted;
                            res.render("searchFriend", {user: req.session.user, friend: us} ); 
                        }
                        else{//usuario existente, no aparece en friends con el logueado.
                            us.areFriends = fila.id === req.session.user;
                            res.render("searchFriend", {user: req.session.user, friend: us});
                        }
                    });
                }
                else{//vacio/usuario inexistente
                    res.render("searchFriend", {user: req.session.user, friend: null});
                }
            }
        });
    }
    
}


function addFriend(req, res) {
    res.status(200);
}


function postAcceptFriend(req, res) {

}

function postRejectFriend(req, res) {

}

module.exports = {
    getFriends: getFriends,
    getSearchFriend: getSearchFriend,
    addFriend: addFriend,
    postAcceptFriend: postAcceptFriend,
    postRejectFriend: postRejectFriend,
}