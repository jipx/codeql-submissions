const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
  db.run(`INSERT INTO users (username, password) VALUES ('guest', 'guest123')`);
});

module.exports = db;