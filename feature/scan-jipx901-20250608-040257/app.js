
// Secure version using prepared statements
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
    const userId = req.query.id;
    const query = 'SELECT * FROM users WHERE id = ?'; // safe query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).send('Error occurred');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Secure app listening at http://localhost:${port}`);
});
