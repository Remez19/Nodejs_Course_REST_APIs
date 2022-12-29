require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
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
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    // if it wasnt able to verify
    req.isAuth = false;
    return next();
  }
  // Valid token
  // Storing the userId for later use
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
