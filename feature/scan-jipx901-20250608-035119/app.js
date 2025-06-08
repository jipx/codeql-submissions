
// Secure Design: Authorization check included
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(bodyParser.json());

let posts = [
    { id: 1, content: 'First post', owner: 'alice' },
    { id: 2, content: 'Second post', owner: 'bob' }
];

app.delete('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const username = req.header('X-User'); // Simulated auth

    const post = posts.find(p => p.id === postId);
    if (!post) return res.status(404).send('Post not found');
    if (post.owner !== username) return res.status(403).send('Unauthorized');

    posts = posts.filter(post => post.id !== postId);
    res.send('Post deleted');
});

app.listen(port, () => {
    console.log(`Secure A4 app listening at http://localhost:${port}`);
});
