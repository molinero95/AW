
function getFriends(req, res) {
    res.status(200);
    //req.daoFriends.getFriendsRequests();
    res.render("friends", {user: req.session.user});//añadir amigos al render
}



function postAcceptFriend(req, res) {

}

function postRejectFriend(req, res) {

}

module.exports = {
    getFriends: getFriends,
    postAcceptFriend: postAcceptFriend,
    postRejectFriend: postRejectFriend,
}