// Initializing app
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // for application/json format

const feedRoutes = require('./routes/feed');

app.use('/feed',feedRoutes);

app.listen(8080);