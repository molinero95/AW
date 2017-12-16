const mysql = require("mysql");

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    //Obtenemos 5 preguntas aleatorias
    getRandomQuestions(callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM QUESTIONS ORDER BY RAND() LIMIT 5 ", (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
            });
            con.release();
        });
    }

    //Utilizada para obtener una pregunta por su ID
    getQuestionById(id, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM QUESTIONS WHERE ID = ?", [id] , (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
            });
            con.release();
        });
    }
    //Utilizada al obtener respuestas
    getRandomAnswersById(id, numRes, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM ANSWERS WHERE ID_PREGUNTA = ? ORDER BY RAND() LIMIT ? ", [id, numRes] , (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
            });
            con.release();                        
        });
    }

    //Implementado con transacciones
    //Insertar una pregunta y sus respuestas
    //En caso de que alguno de los 2 falle, rollback
    insertQuestion(question, answers, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.beginTransaction(error =>{
                if(error) {con.rollback(err =>{
                    if(err) {callback(err);return;}
                    callback(error);
                })};
                con.query("INSERT INTO QUESTIONS (PREGUNTA, NUM_RESPUESTAS_INICIAL) VALUES (?,?)", [question.question, question.numRes],(error, resp) => {
                    if(error) {
                        con.rollback(err =>{
                        if(err) {callback(err);return;}
                        callback(error);
                        });
                    }
                    else{
                        let questionId = resp.insertId;
                        let respuestas=[]
                        answers.forEach(e=>{
                            respuestas.push([questionId, e.toLowerCase().trim()]);
                        })
                        con.query("INSERT INTO ANSWERS (ID_PREGUNTA, RESPUESTA) VALUES ?", [respuestas],(error, resp) => {
                            if(error) {
                                con.rollback(err =>{
                                if(err) {callback(err);return;}
                                callback(error);
                                });
                            }
                            else{
                                con.commit(error=>{
                                    if(error) {
                                        con.rollback(err =>{
                                        if(err) {callback(err);return;}
                                        callback(error);
                                        });
                                    }
                                    else{
                                        callback(null, true);  
                                    }                          
                                });
                            }
                        });
                    }
                });
            });
            con.release();                                        
        });
    }

    //Comprueba si la respuesta ya existía(para el caso OTRA)
    answerExists(response, idQuestion, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT COUNT(RESPUESTA) AS RESULTADO FROM ANSWERS WHERE ID_PREGUNTA = ? AND RESPUESTA = ?", [idQuestion, response],(err, filas) => {
                if(err) {callback(err); return;}
                filas[0].RESULTADO == 1 ? callback(null, true):callback(null, false);
            });
            con.release();                        
        });
    }
    //Utilidaza al crear la pregunta o al meter una respuesta nueva
    insertAnswer(response, idQuestion, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO ANSWERS (ID_PREGUNTA, RESPUESTA) VALUES (?,?)", [idQuestion, response],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
            });
            con.release();                        
        });
    }
    
    //Utilizada para que los usuarios metan sus propias respuestas
    insertUserAnswer(idQuestion, idUser, response, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO ANSWER_USER (ID_PREGUNTA, ID_USER, RESPUESTA) VALUES (?,?,?)", [idQuestion, idUser, response],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
            });
            con.release();                        
        });
    }

    //Obtener las respuestas de un usuario para una respuesta 
    getUserAnswer(idQuestion, idUser, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT RESPUESTA FROM ANSWER_USER WHERE ID_PREGUNTA = ? AND ID_USER = ?", [idQuestion, idUser],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
            });
            con.release();                        
        });
    }

    //Obtiene amigos que han respondido y sus respuestas
    getFriendsWhoAnswered(idQuestion, idUser, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM(SELECT * FROM (SELECT A.ID_USER, A.ID_PREGUNTA FROM ANSWER_USER AS A WHERE A.ID_PREGUNTA = ? AND "
            + "((A.ID_USER = SOME(SELECT ID1 FROM FRIENDS WHERE ID2 = ? ) OR (A.ID_USER = SOME (SELECT ID2 FROM FRIENDS WHERE ID1 = ?))))) "
            + "AS T1 JOIN USERS AS U ON T1.ID_USER = U.ID) AS T LEFT JOIN USER_ANSWER_USER AS UAU ON UAU.ID_OTHER = T.ID AND UAU.ID_PLAYER = ? AND "
            + "T.ID_PREGUNTA = UAU.ID_PREGUNTA ", 
            [idQuestion, idUser, idUser, idUser],(err, resp) => {
                console.log(resp);
                if(err) {callback(err); return;}
                callback(null, resp);
            });
            con.release();                        
        });
    }
   

    //Devuelve todas las respuestas posibles para la pregunta quitando la buena
    getQuiz(questionId, friendId, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM QUESTIONS AS Q JOIN ANSWERS AS A ON Q.ID = A.ID_PREGUNTA WHERE "
            + "Q.ID = ? AND A.RESPUESTA <> (SELECT AU.RESPUESTA FROM ANSWER_USER AS AU WHERE AU.ID_PREGUNTA = ? AND AU.ID_USER = ?) "
            + "ORDER BY RAND()", [questionId, questionId, friendId],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
            });
            con.release();
        });
    }

    //Sin usar
    close() {
        this.pool.end();
    }

    //Inserta una respuesta en el adivina
    userQuizResponse(userId, friendId, questionId, correct, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO USER_ANSWER_USER (iD_PREGUNTA, ID_PLAYER, ID_OTHER, CORRECT) VALUES (?,?,?,?)", [questionId, userId, friendId, correct],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
            });
            con.release(); 
        });
    }


}

module.exports = DAO;