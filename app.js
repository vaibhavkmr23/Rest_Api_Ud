const path = require('path');

// Initializing app
const express = require('express');
const app = express();

const mongoose = require('mongoose');

const cors = require('cors');

const multer = require("multer");

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const bodyParser = require('body-parser');

// const { v4: uuidv4 } = require('uuid');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname); // .toLocal() doesnt work in windows
        // or
        // cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false);
    }
}

app.use(cors());

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // for application/json format

app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-AlLow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow_Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

mongoose.connect('mongodb+srv://Vaibhav:23101995@cluster0.gsxn3bf.mongodb.net/messages')
    .then(result => {
        app.listen(8080);
        console.log("Connected");
    })
    .catch(err => {
        console.log("Error is:", err)
    })

