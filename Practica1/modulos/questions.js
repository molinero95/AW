const utilidades = require('./utilidades');

//Al seleccionar questions en el menu
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
            let questions = []
            filas.forEach(elem => {
                questions.push(utilidades.makeQuestion(elem.ID, elem.PREGUNTA, elem.NUM_RESPUESTAS_INICIAL));
            });
            
            res.render("questions", {user: user, questions: questions});
        }
        else
            res.render("questions", {user: user, questions: null});
    })

    
    
}
//Funcion que renderiza la pagina de añadir pregunta
function addQuestion(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    res.render("newQuestion", {user: user});
    
}

//Al pulsar sobre "Añadir pregunta"
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
            req.daoQuestions.insertAnswer(element, question.id, (err, datos) => {
                if(err){res.status(404); res.send("Ha ocurrido un error...");}
                if(element === question.responses[question.numRes - 1]){ //ultimo elemento, 
                    res.setFlash("Pregunta y respuesta/s añadidas correctamente", 2);                    
                    res.redirect("/questions");
                }
            });
        }); 
    });
}


//Al seleccionar una pregunta se llama a esta función.
function getQuestionById(req, res){
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoQuestions.getQuestionById(req.params.idQuestion, (err, datos) => {
        if(err){res.status(404); res.send("Ha ocurrido un error...");}
        if(datos.length > 0){
            let question = utilidades.makeQuestion(datos[0].ID, datos[0].PREGUNTA, datos[0].NUM_RESPUESTAS_INICIAL);
            console.log(question);
            res.render("question", {user:user, question: question, answer: null});        
        }else{
            res.setFlash("No se ha encontrado la pregunta", 0);
            res.redirect("/questions");
        }
    });

}
//Al darle a responder a pregunta...
function answerQuestion(req, res){
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    req.daoQuestions.getQuestionById(req.params.idQuestion, (err, datos) => {
        if(err){res.status(404); res.send("Ha ocurrido un error...");}
        if(datos.length > 0){
            let question = utilidades.makeQuestion(datos[0].ID, datos[0].PREGUNTA, datos[0].NUM_RESPUESTAS_INICIAL);
            req.daoQuestions.getRandomAnswersById(question.id, question.numRes, (err, answ) => {
                if(err){res.status(404); res.send("Ha ocurrido un error...");}
                let answers = [];
                answ.forEach(a => {
                    answers.push({
                        id: a.ID_PREGUNTA,
                        answer: a.RESPUESTA
                    });
                });
                res.render("answerQuestion", {user:user, question: question, answers: answers});        
            });
        }else{
            res.setFlash("No se ha encontrado la pregunta", 0);
            res.redirect("/questions");
        }
    });
}

//Al responder la pregunta...
function postAnswerQuestion(req, res) {

}


module.exports = {
    getQuestions: getQuestions,
    addQuestion: addQuestion,
    postAddQuestion: postAddQuestion,
    getQuestionById: getQuestionById,
    answerQuestion: answerQuestion,
    postAnswerQuestion: postAnswerQuestion,
}