
// Secure logging and monitoring
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const app = express();
const port = 3000;

const users = { alice: 'password123' };
const failedAttempts = {};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()]
});

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip;

    const success = users[username] && users[username] === password;

    logger.info({
        event: 'login_attempt',
        username,
        success,
        ip,
        timestamp: new Date().toISOString()
    });

    if (!success) {
        failedAttempts[username] = (failedAttempts[username] || 0) + 1;
        if (failedAttempts[username] >= 3) {
            logger.warn({ alert: 'Multiple failed logins', username, ip });
        }
        return res.status(401).send('Login failed');
    }

    failedAttempts[username] = 0; // reset on success
    res.send('Login successful');
});

app.listen(port, () => {
    console.log(`Secure A9 app listening at http://localhost:${port}`);
});
