const express = require('express');
const https = require('https');
const fs = require('fs');
const apiRouter = require('./server/routes');

const app = express();
// TODO: Add logger middleware
app.use(express.static(__dirname + '/client/public'));
app.use('/api', apiRouter);

app.get(/^\/(upload|gallery)$/, (req, res) => {
  res.sendFile(__dirname + '/client/public/index.html');
})

app.get('/*', (req, res) => {
  res.redirect('/')
})

const port = process.env.PORT || 3000;
https.createServer({
  key: fs.readFileSync('.ssl/key.pem'),
  cert: fs.readFileSync('.ssl/cert.pem')
}, app).listen(port, () => console.log(`🚀 Server listening on https://localhost:${port}`));
