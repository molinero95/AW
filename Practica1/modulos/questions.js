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
/*Si añaden alguna repetida, no introducimos la pregunta y listo */
function postAddQuestion(req, res) {
    res.status(200);
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    let resp = req.body.respuestas.split('\n');
    let respuestas = [];
    resp.forEach(e=> {
        if(e !== "\n" && e !=="\r" && e != "")
            respuestas.push(e);
    });

    if(respuestas.length > 0 && req.body.pregunta.length > 0){   
        let question = {
            question: req.body.pregunta,
            numRes: respuestas.length,
        }
        req.daoQuestions.insertQuestion(question, respuestas, (err, data)=>{
            if(err){
                res.setFlash("No se ha podido insertar la pregunta", 0);
                res.redirect('/questions');
            } 
            else{
                res.setFlash("Pregunta insertada correctamente", 2);
                res.redirect('/questions');
            }
        })
    }
    else{
        res.setFlash("No se ha podido insertar la pregunta", 0);
        res.redirect('/questions');
    }
}

function checkResponses(question, responses){
    let comprueba = new Object();
    responses.forEach(e=>{
        if(!comprueba[e.trim()])
            comprueba[e] = e;
    });
    question.numRes = comprueba.length;
    let res = [];
    /*comprueba.forEach(e=>{
        res.push(e.toLowerCase().trim());
    });*/
    return res;
}




//Al seleccionar una pregunta se llama a esta función.
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
                    if(f) {
                        f.forEach(e=>{
                            friends.push({
                                id: e.ID,
                                name: e.NOMBRECOMPLETO,
                                img: e.IMAGEN,
                                correct : e.CORRECT
                            });
                        });//fin forEach 
                    }
                    res.render("question", {user:user, question: question, answer: answer, friends: friends})
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
    if(req.body.answer){
        let respuesta = req.body.answer;
        if(respuesta == "otra") {    //Respuesta OTRA
            if(req.body.otraInput.length == 0){
                res.setFlash("No se ha introducido una respuesta", 0);        
                res.redirect("/questions");
            }
            else{//tenemos que guardar la respuesta y además la respuesta del usuario
                respuesta = req.body.otraInput.toLowerCase().trim();
                req.daoQuestions.answerExists(respuesta, req.params.idQuestion, (err, exists) =>{
                    if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                    if(exists){//Si ya existe la respuesta en la BD
                        req.daoQuestions.insertUserAnswer(req.params.idQuestion, req.session.user, respuesta, (err, result) => {
                            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                            res.setFlash("Respuesta introducida correctamente", 2);        
                            res.redirect("/questions");
                        });
                    }
                    else{//Si no existe la respuesta en la BD
                        req.daoQuestions.insertAnswer(respuesta, req.params.idQuestion, (err, data) => {
                            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                            req.daoQuestions.insertUserAnswer(req.params.idQuestion, req.session.user, respuesta, (err, result) => {
                                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                                res.setFlash("Respuesta introducida correctamente", 2);        
                                res.redirect("/questions");
                            });
                        });
                    }
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
    let friend = {
        name: req.query.friendName,
        id: req.query.friendId
    }
    let idQuestion = req.query.questionId;
    req.daoUsers.userExistsCorrectName(friend.id, friend.name, (err, exist) =>{
        if(exist){
            req.daoQuestions.getQuiz(idQuestion, friend.id, (err, qa) => {
                if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                if(qa.length > 0){
                    let question = {    //Para crear question nos vale con cualquiera devuelta
                        id: idQuestion,
                        question: qa[0].PREGUNTA,
                        numRes: qa[0].NUM_RESPUESTAS_INICIAL,
                    }
                    if(question.numRes > 1){
                        req.daoQuestions.getUserAnswer(question.id, friend.id, (err, resp) => {
                            if(resp.length > 0){
                                let resCorrect = resp[0].RESPUESTA;
                                let answers = answersInsert(question, resCorrect, qa);
                                res.render("answerFriendQuestion", {user: user, question: question, answers: answers, friend: friend})
                            }else{//Por si acaso de modifica la URL
                                res.setFlash("La pregunta introducida no existe ó usuario no válido", 0);
                                res.redirect("/questions");
                            }
                        });
                    }else{
                        res.setFlash("La pregunta seleccionada no es válida, sólo una respuesta", 0);   //Esto ocurre cuando sólo se puede seleccionar una opción
                        res.redirect("/questions");
                    }
                }
                else{//Por si acaso de modifica la URL
                    res.setFlash("La pregunta introducida no existe ó usuario no válido", 0);
                    res.redirect("/questions");
                }
            })
        }
        else{//Por si acaso se modifica la URL
            res.setFlash("Usuario no encontrado", 0);
            res.redirect("/questions");
        }
    })
    
    
}


function answersInsert(question, correct, rest) {
    let answers = [];
    let random = Math.round(Math.random() * (question.numRes - 1));
    let added = false;
    for(let i = 0; i < question.numRes; i++){
        if(i === random){
            added = true;
            answers.push(correct);
        }
        else{
            if(!added)
                answers.push(rest[i].RESPUESTA);
            else
                answers.push(rest[i - 1].RESPUESTA);
        }
    }
    return answers;
}


function postFriendQuiz(req, res){
    let user = {
        id:req.session.user,
        points: req.points,
        img: req.img,
    };
    res.status(200);
    req.daoQuestions.getUserAnswer(req.body.questionId, req.body.friendId, (err, resp) => {
        if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
        let acierto = resp[0].RESPUESTA === req.body.answer;
        req.daoQuestions.userQuizResponse(user.id, req.body.friendId, req.body.questionId, acierto, (err, acc)=>{
            if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
            if(acierto){
                req.daoUsers.modifyPoints(user.id, Number(user.points) + 50, (err, result) => {
                    if(err){res.status(404); console.error(err); res.send("Ha ocurrido un error...");}
                    res.setFlash("Has acertado!", 2);           
                    res.redirect("/questions");                                
                });
            }
            else {
                res.setFlash("Vaya... has fallado.", 0);
                res.redirect("/questions");            
            }                
        });      
    });
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