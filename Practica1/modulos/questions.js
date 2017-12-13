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
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
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
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
        question.id = result.insertId;
        question.responses.forEach(element => {
            req.daoQuestions.insertAnswer(element, question.id, (err, datos) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                if(element === question.responses[question.numRes - 1]){ //ultimo elemento, 
                    res.setFlash("Pregunta y respuesta/s añadidas correctamente", 2);                    
                    res.redirect("/questions");
                }
            });
        }); 
    });
}


//Al seleccionar una pregunta se llama a esta función.
//PREGUNTAR A PROFESOR: FOR EACH y BD van en orden?
function getQuestionById(req, res){
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };

    req.daoQuestions.getQuestionById(req.params.idQuestion, (err, q) => {
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
        if(q.length > 0){
            let question = utilidades.makeQuestion(q[0].ID, q[0].PREGUNTA, q[0].NUM_RESPUESTAS_INICIAL);
            req.daoQuestions.getUserAnswer(req.params.idQuestion, user.id, (err, resp) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                let answer = null;
                if(resp.length > 0) answer = resp[0].RESPUESTA;
                req.daoQuestions.getFriendsWhoAnswered(question.id, user.id,(err, f) =>{
                    if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                    let friends = [];
                    f.forEach(e=>{
                        friends.push({
                            id: e.ID,
                            name: e.NOMBRECOMPLETO,
                            img: e.IMAGEN,
                        });
                    });//fin forEach 
                    res.render("question", {user:user, question: question, answer: answer, friends: friends});
                });    
            });          
        }
        else{
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
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
        if(datos.length > 0){
            let question = utilidades.makeQuestion(datos[0].ID, datos[0].PREGUNTA, datos[0].NUM_RESPUESTAS_INICIAL);
            req.daoQuestions.getRandomAnswersById(question.id, question.numRes, (err, answ) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
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
    res.status(200);
    //res.send(req.body);
    if(req.body.answer){
        let respuesta = req.body.answer;
        if(respuesta == "otra"){
            if(req.body.otraInput.length == 0){
                res.setFlash("No se ha introducido una respuesta", 0);        
                res.redirect("/questions");
            }
            else{//tenemos que guardar la respuesta y además la respuesta del usuario
                respuesta = req.body.otraInput;
                req.daoQuestions.insertAnswer(respuesta, req.params.idQuestion, (err, data) => {
                    if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                    req.daoQuestions.insertUserAnswer(req.params.idQuestion, req.session.user, respuesta, (err, result) => {
                        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                        res.setFlash("Respuesta introducida correctamente", 2);        
                        res.redirect("/questions");
                    });
                });
            }
        }
        else{//Guardamos sólo la respuesta del usuario, no hay respuesta nueva.
            req.daoQuestions.insertUserAnswer(req.params.idQuestion, req.session.user, respuesta, (err, data) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                    res.setFlash("Respuesta introducida correctamente", 2);        
                    res.redirect("/questions");
            });
        }
    }
    else{
        res.setFlash("No se ha introducido una respuesta", 0);        
        res.redirect("/questions");
    }
}

function getFriendQuiz(req, res){
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    let idQuestion = req.params.idQuestion;
    let idFriend = req.params.idFriend;
    //Reducir consultas
    req.daoQuestions.getQuestionById(idQuestion,(err, q) => {
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");} 
        if(q.length > 0){
            let question = utilidades.makeQuestion(q[0].ID, q[0].PREGUNTA, q[0].NUM_RESPUESTAS_INICIAL);
            req.daoUsers.searchUserById(idFriend, (err, us) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                if(us){//Por aqui vamos bien
                    let friend = {
                        id: us.id,
                        name: us.nombreCompleto,
                        img: us.imagen
                    }
                    req.daoQuestions.getUserAnswer(idQuestion, idFriend, (err, resCorrecta) => {
                        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                        let correcta = resCorrecta[0].RESPUESTA;
                        req.daoQuestions.getQuizAnswers(idQuestion, friend.id, question.numRes, (err, respuestas) => {
                            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");} 
                            res.send(respuestas);
                            //res.send(respuestas);
                            //res.render("answerFriendQuestion", [])
                        });                     
                    });
                    /*req.daoQuestions.getUserAnswer(idQuestion, idFriend, (err, resCorrecta)=>{
                        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");} 
                        req.daoQuestions.getQuizAnswers(idQuestion, q, question.numRes, (err, respuestas) => {
                            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");} 
                            res.send(respuestas);
                            res.render("answerFriendQuestion", [])
                        });
                    });*/
                }
                else{
                    res.setFlash("Usuario no encontrado...", 0);
                    res.redirect("/questions");
                }
            });
        }
        else{
            res.setFlash("Pregunta no encontrada...", 0);
            res.redirect("/questions");
        }

        /*req.daoQuestions.getUserAnswer(idQuestion, idFriend, (err, ans) => {
            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
            req.daoQuestions.getQuizAnswers(ans[0].id)
            res.send(ans);
        });*/
    });
    
}

function postFriendQuiz(req, res){
    res.status(200);
}


module.exports = {
    getQuestions: getQuestions,
    addQuestion: addQuestion,
    postAddQuestion: postAddQuestion,
    getQuestionById: getQuestionById,
    answerQuestion: answerQuestion,
    postAnswerQuestion: postAnswerQuestion,
    getFriendQuiz: getFriendQuiz,
    postFriendQuiz: postFriendQuiz,
}