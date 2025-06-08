
// Vulnerable to SQL Injection
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testdb'
});

connection.connect();

app.get('/user', (req, res) => {
    const userId = req.query.id; // no validation
    const query = `SELECT * FROM users WHERE id = ${userId}`; // vulnerable
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error occurred');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});
