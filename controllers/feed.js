const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    // since  use of async await makes it look like synchornous so we use try and catch to catch the error
    try {
        // Use of await where used then function
        totalItems = await Post.find().countDocuments()
        const posts = await Post.find().skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: "Fetched posts successfully!!",
            posts: posts,
            totalItems: totalItems
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed..Entered Data is Incorrect!!');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided!');
        error.statusCode = 422;
        throw error;
    }
    // const imageUrl = req.file.path; // doesnt shows pic in windows use bottom one
    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    try {
        await post.save()
        const user = await User.findById(req.userId)
        user.posts.push(post);
        await user.save();
        io.getIO().emit('posts', { action: 'create', post: post });
        res.status(201).json({
            message: 'Post Created Successfully!',
            post: post,
            creator: { _id: user._id, name: user.name }
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error("Could not find Post.");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post Fetched',
            post: post
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed..Entered Data is Incorrect!!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new Error("No file Picked!");
        error.statusCode = 422;
        throw error;
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error("Could not find Post.");
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized!!');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl,
            post.content = content;
        const result = await post.save();
        res.status(200).json({ message: "Post Updated Successfully!", post: result })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error("Could not find Post.");
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized!!');
            error.statusCode = 403;
            throw error;
        }
        // Check Logged in user
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        // REmoving link between user and post

        const user = User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        console.log(result);
        res.status(200).json({ message: 'Deleted post.' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

// Helper function to delete image from file

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}