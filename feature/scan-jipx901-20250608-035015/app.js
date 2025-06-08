
// Secure login: bcrypt, generic error, account lockout
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const users = {
    alice: { passwordHash: bcrypt.hashSync('password123', 10), attempts: 0, locked: false },
    bob: { passwordHash: bcrypt.hashSync('qwerty', 10), attempts: 0, locked: false }
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (!user) return res.status(401).send('Invalid username or password');
    if (user.locked) return res.status(403).send('Account locked. Contact support.');

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        user.attempts++;
        if (user.attempts >= 3) user.locked = true;
        return res.status(401).send('Invalid username or password');
    }

    user.attempts = 0; // Reset attempts on success
    res.send('Login successful');
});

app.listen(port, () => {
    console.log(`Secure A7 app listening at http://localhost:${port}`);
});
