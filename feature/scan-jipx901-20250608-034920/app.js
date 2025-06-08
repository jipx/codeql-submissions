
// No logging or monitoring
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const users = { alice: 'password123' };

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        res.send('Login successful');
    } else {
        res.status(401).send('Login failed');
    }
});

app.listen(port, () => {
    console.log(`Vulnerable A9 app listening at http://localhost:${port}`);
});
