const User = require("../models/user");
const Post = require("../models/post");
const { clearImage } = require("../util/file");

const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

require("dotenv").config(); // to get the salt value from env

module.exports = {
  createUser: async function (args, request) {
    // from the args var we can extract the data we defined in the schema which is
    // name, email, password
    // We access them by args.userInput
    // Because we defined in the schema - createUser(userInput: UserInputData): User!
    // We can also destructure the args object like - createUser({ userInput }, request)

    const email = args.userInput.email;
    const { name, password } = args.userInput;
    const errors = [];

    if (!validator.default.isEmail(email)) {
      errors.push({ messsage: "Not a valid email!" });
    }
    if (
      validator.default.isEmpty(password) ||
      !validator.default.isLength(password, { min: 5 })
    ) {
      errors.push({ messsage: "Password too short!" });
    }
    if (errors.length > 0) {
      // Have erros
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, +process.env.SALT_VALUE);
    const user = new User({
      password: hashedPassword,
      name,
      email,
    });
    const newUser = await user.save();
    return {
      ...newUser._doc,
      _id: newUser._id.toString(),
    };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email: email });
    if (!user) {
      // user not exist
      const error = new Error("User not found");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Invalid password or email");
      error.code = 401;
      throw error;
    }
    // creating a token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );
    return {
      token: token,
      userId: user._id.toString(),
    };
  },
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const errors = [];
    const { title, content, imageUrl } = postInput;
    console.log(title, content, imageUrl);
    if (
      validator.default.isEmpty(title) ||
      !validator.default.isLength(title, { min: 5 })
    ) {
      errors.push({ messsage: "Title is invalid." });
    }
    if (
      validator.default.isEmpty(content) ||
      !validator.default.isLength(content, { min: 5 })
    ) {
      errors.push({ messsage: "Content is invalid." });
    }
    if (errors.length > 0) {
      // Have erros
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.data = errors;
      error.code = 401;
      throw error;
    }
    const newPost = new Post({
      title,
      content,
      imageUrl,
      creator: user,
    });
    const createdPost = await newPost.save();
    user.posts.push(createdPost);
    await user.save();
    // Add post to user's posts
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updated: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },
  post: async function ({ id }, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatePost: async function ({ id, postInput }, req) {
    const { title, content, imageUrl } = postInput;
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not autherized to edit this post!");
      error.code = 403;
      throw error;
    }
    const errors = [];
    if (
      validator.default.isEmpty(title) ||
      !validator.default.isLength(title, { min: 5 })
    ) {
      errors.push({ messsage: "Title is invalid." });
    }
    if (
      validator.default.isEmpty(content) ||
      !validator.default.isLength(content, { min: 5 })
    ) {
      errors.push({ messsage: "Content is invalid." });
    }
    if (errors.length > 0) {
      // Have erros
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    post.title = title;
    post.content = content;
    if (imageUrl !== "undefined") {
      post.imageUrl = imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.updatedAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ id }, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not autherized to edit this post!");
      error.code = 403;
      throw error;
    }
    try {
      clearImage(post.imageUrl);
      await Post.findByIdAndRemove(id);
      const user = await User.findById(req.userId);
      user.posts.pull(id);
      await user.save();
      return true;
    } catch (error) {
      return false;
    }
  },
  user: async function (args, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      // User is not authenticated
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return { ...user._doc, _id: user._id.toString() };
  },
};
