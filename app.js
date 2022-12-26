const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const PORT = process.env.PORT;

const feedRoutes = require("./routes/feed");

const app = express();

// In order to parse incoming json data
app.use(bodyParser.json()); // Good to parse apllication/json data type

app.use((req, res, next) => {
  // The first value that we pass is always "Access-Control-Allow-Origin"
  // We want to set this header to all the the domains that get data
  // from our server.
  // The second value is the domain we want to give access to.
  // Setting the second value to "*" will alow access to the server to all
  // domains out-there
  // if we have multiple domains we sperate thier names with ","
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Here we allowed the origins we specify before to use this methods
  // We can allows what we want (only get, only get and post, or only get post put
  // basically every method we want).
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // With headers we control which headers our clients can set.
  // We spicaly want to allow the "Content-Type" header to be set and the
  // "Authorization" header.
  // (we can use * here to)
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// Register the routes for feed
// by that any request that starts with "/feed"
// will be forwarded to the routes in "feed" file
app.use("/feed", feedRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}.`);
});
