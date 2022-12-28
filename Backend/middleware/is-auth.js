require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  // Toget the token from the headeres in the request
  // we can use req.get()
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    // With jwt.verify() we can decode and verify the token.
    // With jwt.decode() we can decode.
    // To jwt.verify() we pass the token and the secret key.
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    // if it wasnt able to verify
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  // Valid token
  // Storing the userId for later use
  req.userId = decodedToken.userId;
  next();
};
