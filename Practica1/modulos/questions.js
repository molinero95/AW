

function getQuestions(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };

    res.render("questions", {user: user, questions: {}});
    
}

function addQuestion(req, res) {
    res.status(200);
    res.send("CREAR PREGUNTA");
}

module.exports = {
    getQuestions: getQuestions,
    addQuestion: addQuestion,
}