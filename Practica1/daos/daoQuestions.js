const mysql = require("mysql");

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    getRandomQuestions(callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM QUESTIONS ORDER BY RAND() LIMIT 5 ", (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
                con.release();                
            });
        });
    }


    getQuestionById(id, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM QUESTIONS WHERE ID = ?", [id] , (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
                con.release();                            
            });
        });
    }

    getRandomAnswersById(id, numRes, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT * FROM ANSWERS WHERE ID_PREGUNTA = ? ORDER BY RAND() LIMIT ? ", [id, numRes] , (err, resp) => {
                if(err) {callback(err); return;}
                callback(null,resp);
                con.release(); 
            });
        });
    }

    insertQuestion(question, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO QUESTIONS (PREGUNTA, NUM_RESPUESTAS_INICIAL) VALUES (?,?)", [question.question, question.numRes],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
                con.release();                            
            });
        });
    }
    //Comprueba si la respuesta ya existía(para el caso OTRA)
    answerExists(response, idQuestion, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT COUNT(RESPUESTA) AS RESULTADO FROM ANSWERS WHERE ID_PREGUNTA = ? AND RESPUESTA = ?", [idQuestion, response],(err, filas) => {
                if(err) {callback(err); return;}
                filas[0].RESULTADO == 1 ? callback(null, true):callback(null, false);
                con.release();                            
            });
        });
    }
    //Utilidaza al crear la pregunta o al meter una respuesta nueva
    insertAnswer(response, idQuestion, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO ANSWERS (ID_PREGUNTA, RESPUESTA) VALUES (?,?)", [idQuestion, response],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
                con.release();                            
            });
        });
    }

    insertAnswers(answers, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO ANSWERS (ID_PREGUNTA, RESPUESTA) VALUES ?", [answers],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
                con.release();                            
            });
        });
    }
    
    //Utilizada para que los usuarios metan sus propias respuestas
    insertUserAnswer(idQuestion, idUser, response, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO ANSWER_USER (ID_PREGUNTA, ID_USER, RESPUESTA) VALUES (?,?,?)", [idQuestion, idUser, response],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
                con.release();                            
            });
        });
    }

    getUserAnswer(idQuestion, idUser, callback) {
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT RESPUESTA FROM ANSWER_USER WHERE ID_PREGUNTA = ? AND ID_USER = ?", [idQuestion, idUser],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
                con.release();                            
            });
        });
    }


    getFriendsWhoAnswered(idQuestion, idUser, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("SELECT DISTINCT U.ID, U.NOMBRECOMPLETO, U.IMAGEN, UAU.CORRECT, T1.ID_PREGUNTA FROM (SELECT A.ID_USER, A.ID_PREGUNTA FROM "
            + "ANSWER_USER AS A WHERE A.ID_PREGUNTA = ? AND (A.ID_USER = SOME"
            + "(SELECT ID1 FROM FRIENDS WHERE ID2 = ? ) OR A.ID_USER = SOME"
            + "(SELECT ID2 FROM FRIENDS WHERE ID1 = ?))) AS T1 JOIN USERS AS U "
            + "ON T1.ID_USER = U.ID LEFT JOIN USER_ANSWER_USER AS UAU ON UAU.ID_OTHER = U.ID WHERE T1.ID_PREGUNTA = UAU.ID_PREGUNTA ", 
            [idQuestion, idUser, idUser],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
                con.release();                            
            });
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
                con.release();                            
            });
        });
    }

    close() {
        this.pool.end();
    }

    userQuizResponse(userId, friendId, questionId, correct, callback){
        this.pool.getConnection((err, con) => {
            if(err) {callback(err); return;}
            con.query("INSERT INTO USER_ANSWER_USER (iD_PREGUNTA, ID_PLAYER, ID_OTHER, CORRECT) VALUES (?,?,?,?)", [questionId, userId, friendId, correct],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, true);
                con.release();                            
            });
        });
    }


}

module.exports = DAO;