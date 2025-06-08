
// ❌ Dangerous dynamic module loading and eval
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.get('/run-remote-script', async (req, res) => {
    try {
        const url = req.query.url; // ❌ unvalidated external URL
        const response = await axios.get(url);
        const result = eval(response.data); // ❌ dangerous
        res.send(`Executed: ${result}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.listen(port, () => {
    console.log(`Vulnerable A8 app listening on http://localhost:${port}`);
});
