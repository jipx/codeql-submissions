
// Security Misconfiguration: Missing headers, verbose errors, wide-open CORS
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // ❌ Allows all origins

app.get('/', (req, res) => {
    res.send('Hello from a misconfigured server!');
});

app.get('/crash', (req, res) => {
    throw new Error("Unexpected crash for demo"); // ❌ Stack trace exposed
});

app.use((err, req, res, next) => {
    res.status(500).send(err.stack); // ❌ Reveals internals
});

app.listen(port, () => {
    console.log(`Vulnerable A5 app listening at http://localhost:${port}`);
});
