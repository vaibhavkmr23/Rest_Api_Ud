const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const feedController = require('../controllers/feed');

// Get /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post',
    [
        body('title')
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ], feedController.createPost);

module.exports = router;