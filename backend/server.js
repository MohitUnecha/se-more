const express = require('express');
const path = require('path');
const chatHandler = require('../api/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.all('/api/chat', chatHandler);
app.use(express.static(path.join(__dirname, '..', 'docs')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'docs', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SE:MORE server running on port ${PORT}`);
});
