const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/spiderman.jpg",
        creator: {
          name: "Remez",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Have errors in validation
    return res.status(422).json({
      message: "Invalid Input",
      errors: errors.array(),
    });
  }
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  const post = new Post({
    title,
    content,
    imageUrl: "images/spiderman.jpg",
    creator: { name: "Remez" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
