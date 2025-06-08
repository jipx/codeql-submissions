
// Secure against cryptographic failures
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

let users = [];

app.use(bodyParser.json());

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // ✅ Secure hashing
    users.push({ username, password: hashedPassword });
    res.send('User registered securely');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.listen(port, () => {
    console.log(`Secure app listening at http://localhost:${port}`);
});
