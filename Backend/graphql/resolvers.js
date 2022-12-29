const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

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
};
