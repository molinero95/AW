
function getModificar(req,res){
    res.status(200);
    res.render("modificar");
}

function postModificar(req,res){
    res.status(200);
    //codigo de comprobaciones y demás
}

module.exports = {
    getModificar: getModificar,
    postModificar: postModificar,

}