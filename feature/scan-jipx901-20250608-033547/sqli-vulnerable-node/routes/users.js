const express = require('express');
const router = express.Router();
const db = require('../db');

// ❌ Vulnerable to SQLi: input is directly embedded into the SQL string
router.get('/login', (req, res) => {
  const { username, password } = req.query;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, row) => {
    if (err) return res.status(500).send('Database error');
    if (row) return res.send(`Welcome ${row.username}!`);
    return res.status(401).send('Invalid credentials');
  });
});

module.exports = router;