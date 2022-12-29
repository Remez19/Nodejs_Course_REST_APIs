const User = require("../models/user");
const Post = require("../models/post");

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
      { expiresIn: "1h" }
    );
    return {
      token: token,
      userId: user._id.toString(),
    };
  },
  createPost: async function ({ postInput }, req) {
    const errors = [];
    const { title, content, imageUrl } = postInput;
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
    const newPost = new Post({
      title,
      content,
      imageUrl,
    });
    const createdPost = await newPost.save();
    // Add post to user's posts
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
};
