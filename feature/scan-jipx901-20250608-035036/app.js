
// Simple server using lodash
const express = require('express');
const _ = require('lodash');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const users = [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' }
    ];
    res.json(_.filter(users, { role: 'user' }));
});

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});
