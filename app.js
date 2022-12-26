const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const PORT = process.env.PORT;

const feedRoutes = require("./routes/feed");

const app = express();

// Register the routes for feed
// by that any request that starts with "/feed"
// will be forwarded to the routes in "feed" file
app.use("/feed", feedRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}.`);
});
