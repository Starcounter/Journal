const downloadData = require('./fetchData');
const express = require('express');
const app = express();

// serve static files (index.html and vue app (app.js) and some styles)
app.use(express.static('static'));

// the caching logic haha
let currentData = [];

// initial download (the interval below only fires after one hour)
downloadData().then(data => (currentData = data));

setInterval(
  () => downloadData().then(data => (currentData = data)),
  3600 * 1000 // update very hour
);

// serve the cached data as a JSON file. 
app.get('/data.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(currentData));
});

// don't worry about this, now.sh channels traffic to this port, your site will use 80 and 443 (HTTPS) out of the box
app.listen(3000);
