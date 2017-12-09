const utilidades = require("./utilidades");

function getFriends(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoFriends.getFriendsRequests(req.session.user, (err, datos) =>{
        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
        else{
            datos.forEach(element => {
                req.daoUsers.searchUserById(element.ID1, (err, info) => {
                    if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}

                });
                
            });
            res.render("friends", {user: user, friends: {requests: null}});
        }
    });

}



function getSearchFriend(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    //res.send(req.params.friend);
    if(!req.query.friend){
        res.render("searchUsers", {user: req.session.user, searched: null});
    }
    else{
        req.daoUsers.searchUsers(req.query.friend, (err, filas) => {
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            if(filas.length > 0){
                console.log(filas);
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
            req.daoFriends.requestSent(user.id, req.params.user, (err, areFriends) => {
                if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error");}
                if(areFriends)
                    res.render("profile", {user: user, searched: u});                    
                else{
                    //poner boton de añadir amigo
                }
            });
        }
        else{
            res.render("profile", {user: user, searched: null});
        }
    });
};


function addFriend(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoFriends.insertFriendRequest(req.session.user, req.body.friendId, (err, sol) =>{
        if(err){console.log(err); res.status(404); res.send("Ha ocurrido un error.");}
        console.log(sol);
        res.setFlash("Solicitud enviada correctamente", 2);
        res.redirect(`http://localhost:3000/searchFriend?friend=${req.body.friendName}`);
    });

}


function postAcceptFriend(req, res) {

}

function postRejectFriend(req, res) {

}

module.exports = {
    getFriends: getFriends,
    getSearchFriend: getSearchFriend,
    searchUser: searchUser,
    addFriend: addFriend,
    postAcceptFriend: postAcceptFriend,
    postRejectFriend: postRejectFriend,
}