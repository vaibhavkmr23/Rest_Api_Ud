// Initializing app
const express = require('express');

const app = express();

const cors = require('cors');

const feedRoutes = require('./routes/feed');

const bodyParser = require('body-parser');

app.use(cors());

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // for application/json format

app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-AlLow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow_Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed',feedRoutes);

app.listen(8080);