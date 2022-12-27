const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT;

const MONGODB_URI = `mongodb+srv://${process.env.MongodbUser}:${process.env.MongodbPassword}@${process.env.MongodbDataBaseName}.7vjdhyd.mongodb.net/${process.env.MongodbCollectionName}?retryWrites=true&w=majority`;

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// To serve the images folder statically
// we need to use the path core module
// to construct a absolute path to images folder
// __dirname = > the path to the app.js file
// Second argument is the path to the folder we want to serve
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

// Erorr middleware to catch requests that ended up
// in a error.
app.use((error, req, res, next) => {
  console.log(error);
  // if error.statusCode not defined than 500 will be default
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(PORT, (err) => {
      if (!err) {
        console.log("Connected to Database");
        console.log(`Server listening on port ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.log("Failed to connect to mongodb");
    console.log(err);
  });
