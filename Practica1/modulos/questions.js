
function getQuestions(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };

    req.daoQuestions.getRandomQuestions((err, filas) => {
        if(err){res.status(404); res.send("Ha ocurrido un error...");}
        if(filas.length > 0){
            res.render("questions", {user: user, questions: null});
        }
        else
            res.render("questions", {user: user, questions: null});
    })

    
    
}

function addQuestion(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    res.render("newQuestion", {user: user});
    
}

//Comprobar si existe pregunta
function postAddQuestion(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    let respuestas = req.body.respuestas.split('\n');
    let question = {
        question: req.body.pregunta,
        numRes: respuestas.length,
    }
    question.responses = respuestas;
    req.daoQuestions.insertQuestion(question, (err, result) => {
        if(err){res.status(404); res.send("Ha ocurrido un error...");}
        question.id = result.insertId;
        question.responses.forEach(element => {
            req.daoQuestions.insertResponse(element, question.id, user.id, (err, datos) => {
                if(err){res.status(404); res.send("Ha ocurrido un error...");}
                if(element === question.responses[question.numRes - 1]){ //ultimo elemento, 
                    res.setFlash("Pregunta y respuesta/s añadidas correctamente", 2);                    
                    res.redirect("/questions");
                }
            });
        });
        
    });
    
    
}

module.exports = {
    getQuestions: getQuestions,
    addQuestion: addQuestion,
    postAddQuestion: postAddQuestion,
}