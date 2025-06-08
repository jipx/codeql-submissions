
// Insecure Design: Missing authorization check
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
    posts = posts.filter(post => post.id !== postId); // ❌ No auth check
    res.send('Post deleted');
});

app.listen(port, () => {
    console.log(`Vulnerable A4 app listening at http://localhost:${port}`);
});
