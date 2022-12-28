const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");

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
