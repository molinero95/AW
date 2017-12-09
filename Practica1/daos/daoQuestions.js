const mysql = require("mysql");

class DAO {
    constructor(pool) {
      this.pool = pool;
    }

    insertQuestion(question, callback) {
        
    }

    close() {
        this.pool.end();
    }
}

module.exports = DAO;