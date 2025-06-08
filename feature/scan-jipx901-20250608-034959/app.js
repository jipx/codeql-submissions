
// Vulnerable login: no hashing, no rate limiting, clear error messages
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const users = {
    alice: 'password123',
    bob: 'qwerty'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username]) {
        return res.status(401).send('User does not exist'); // ❌ Reveals user
    }
    if (users[username] !== password) {
        return res.status(401).send('Incorrect password'); // ❌ Reveals password mismatch
    }
    res.send('Login successful');
});

app.listen(port, () => {
    console.log(`Vulnerable A7 app listening at http://localhost:${port}`);
});
