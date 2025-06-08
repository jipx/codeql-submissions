
// ✅ No eval or remote code execution. Only whitelisted module names.
const express = require('express');
const app = express();
const port = 3000;

// Example whitelist of actions
const actions = {
    greet: () => "Hello Secure World",
    date: () => new Date().toISOString()
};

app.get('/run-action', (req, res) => {
    const action = req.query.action;
    if (!actions[action]) {
        return res.status(400).send('Invalid action');
    }
    const result = actions[action]();
    res.send(`Result: ${result}`);
});

app.listen(port, () => {
    console.log(`Secure A8 app listening on http://localhost:${port}`);
});
