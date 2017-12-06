const downloadData = require('./fetchData');
const express = require('express');
const app = express();
app.use(express.static('static'));

let currentData = {};

downloadData().then(data => (currentData = data));

setInterval(
  () => downloadData().then(data => (currentData = data)),
  3600 * 12 * 1000
);

app.get('/data.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(currentData));
});

app.listen(3000);
