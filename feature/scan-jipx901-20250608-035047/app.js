
// Secure version: uses Helmet, restricted CORS, generic error handling
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const port = 3000;

// ✅ Secure HTTP headers
app.use(helmet());

// ✅ Restrictive CORS
app.use(cors({
    origin: 'https://yourdomain.com'
}));

app.get('/', (req, res) => {
    res.send('Hello from a secure server!');
});

app.get('/crash', (req, res) => {
    throw new Error("Unexpected crash for demo");
});

// ✅ Generic error handler
app.use((err, req, res, next) => {
    res.status(500).send('Internal server error');
});

app.listen(port, () => {
    console.log(`Secure A5 app listening at http://localhost:${port}`);
});
