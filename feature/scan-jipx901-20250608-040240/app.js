
// Vulnerable to cryptographic failures
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

let users = [];

app.use(bodyParser.json());

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    // ❌ Storing plaintext password
    users.push({ username, password });
    res.send('User registered');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});
