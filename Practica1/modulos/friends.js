
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
        if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
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
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error.");}
            if(filas.length > 0){
                console.log(filas);
                let result = [];
                filas.forEach(us => {
                    console.log(us);
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
/*
Necesitamos buscar un usuario por ID y comprobar si es amigo
 */
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
            if(err){console.error(err); res.status(404); res.send("Ha ocurrido un error");}
            if(us.length > 0){
                let areFriends = Boolean(us[0].ACCEPTED);
                let searched = utilidades.makeUser(req.params.user, null,null, us[0].NOMBRECOMPLETO, us[0].SEXO, us[0].NACIMIENTO, us[0].IMAGEN, us[0].PUNTOS);
                console.log(us);
                searched.age = utilidades.getAge(searched.age);
                res.render("profile", {user: user, searched: searched, areFriends: areFriends});
            }
            else{
                res.setFlash("No se ha encontrado el usuario", 0);
                res.redirect("/friends");
            }
        });
    }
    /*
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
            res.setFlash("No se ha encontrado el usuario", 0);
            res.redirect("/friends");
        }
    });
    */
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