
// SSRF Protection: validate URL against whitelist and block internal IPs
const express = require('express');
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');
const app = express();
const port = 3000;

const allowedHostnames = ['example.com', 'api.example.com'];

function isPrivateIP(ip) {
    return /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^127\.|^169\.254\.|^::1/.test(ip);
}

app.get('/fetch', async (req, res) => {
    try {
        const inputUrl = new URL(req.query.url);
        if (!allowedHostnames.includes(inputUrl.hostname)) {
            return res.status(403).send('URL not allowed');
        }

        const addresses = await dns.lookup(inputUrl.hostname);
        if (isPrivateIP(addresses.address)) {
            return res.status(403).send('Blocked internal IP');
        }

        const response = await axios.get(req.query.url);
        res.send(response.data);
    } catch (err) {
        res.status(500).send('Error fetching URL');
    }
});

app.listen(port, () => {
    console.log(`Secure A10 app listening at http://localhost:${port}`);
});
