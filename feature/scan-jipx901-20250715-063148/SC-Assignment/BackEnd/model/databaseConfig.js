

const mysql = require("mysql2");

var dbconnect = {
  getConnection: function () {

    var conn = mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'store',
    });

    return conn;
  }
};

module.exports = dbconnect;
