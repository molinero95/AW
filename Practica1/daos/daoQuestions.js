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
            con.query("SELECT U.ID, U.NOMBRECOMPLETO, U.IMAGEN FROM (SELECT A.ID_USER FROM "
            + "ANSWER_USER AS A WHERE A.ID_PREGUNTA = ? AND (A.ID_USER = "
            + "(SELECT ID1 FROM FRIENDS WHERE ID2 = ?) OR A.ID_USER = "
            + "(SELECT ID2 FROM FRIENDS WHERE ID1 = ?))) AS T1 JOIN USERS AS U "
            + "ON T1.ID_USER = U.ID", [idQuestion, idUser, idUser],(err, resp) => {
                if(err) {callback(err); return;}
                callback(null, resp);
                con.release();                            
            });
        });
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;