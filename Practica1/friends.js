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
                if(fila) {
                    let user = utilidades.makeUser(null, null, fila.nombreCompleto, fila.sexo, fila.nacimiento, fila.imagen, fila.puntos);
                    req.daoFriends.requestSent(req.session.user, fila.id,(err, res) => {
                        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
                        console.log(res);
                        if(res){
                            if(fila.id === req.session.user || res.accepted)
                                res.render("searchFriend", {user: req.session.user, friend: user, areFriends: true} ); 
                            else
                                res.render("searchFriend", {user: req.session.user, friend: user, areFriends: false} ); 
                        }
                        else
                            res.render("searchFriend", {user: req.session.user, friend: user, areFriends: null} );                                               
                    });
                }
                else
                    res.render("searchFriend", {user: req.session.user, friend: null, areFriends: null});
            }
        });
    }
    
}

function postSearchFriend(req, res) {
    res.status(200);
    res.redirect("/searchFriend/:i")
}




function postAcceptFriend(req, res) {

}

function postRejectFriend(req, res) {

}

module.exports = {
    getFriends: getFriends,
    getSearchFriend: getSearchFriend,
    postSearchFriend: postSearchFriend,
    postAcceptFriend: postAcceptFriend,
    postRejectFriend: postRejectFriend,
}