
// SQL Injection vulnerable code
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testdb'
});

db.connect();

app.get('/search', (req, res) => {
    const term = req.query.term;
    const query = `SELECT * FROM products WHERE name LIKE '%${term}%'`; // ❌ SQL injection vulnerable
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Query failed');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Vulnerable A3 app listening at http://localhost:${port}`);
});
