exports.getPosts = (req, res, next) => {
    res.status(200)
        .json({ posts: [{ 
            _id: '1',
            title: 'First Post', 
            content: 'This is the First Post!!',
            creator: {
                name: "Vaibhav"
            },
            createdAt: new Date(),
            imageUrl: 'images/IMG_6597.jpg'
         
        }] })
        // console.log("Response is",res.json);
};

exports.createPost = (req, res, next) =>{
    const title = req.body.title;
    const content = req.body.content;
    // console.log(title, content);

    //Create post in db
    res.status(201).json({
        message: 'Post Created Successfully!',
        post: { 
            _id: new Date().toISOString, 
            title: title, 
            content: content,
            creator: {
                name: 'Vaibhav'
            },
            createdAt: new Date()
         }
    })
}