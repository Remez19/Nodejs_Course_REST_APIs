require("dotenv").config();
const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_VALUE = 12;

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid Input");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  bcrypt
    .hash(password, SALT_VALUE)
    .then((hashedPasword) => {
      const user = new User({
        email,
        password: hashedPasword,
        name,
      });
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "User created successfully.", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (isEqual === false) {
        const error = new Error("Worng password.");
        error.statusCode = 401;
        throw error;
      }
      // password and email validated => create JWT (Json Web Token)
      // jwt.sign() - Creates a new signure and packs it in a new json web token.
      // We can add any data we want to the token.
      // The second argument we need to pass is the secret key (only the server knows about).
      // Generally we want to pass long string.
      // The last argument is a configuration object
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.SECRET_KEY,
        // Will make sure that the token will be expired in 1 hour
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
