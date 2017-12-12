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

    close() {
        this.pool.end();
    }
}

module.exports = DAO;