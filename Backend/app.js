const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT;

const MONGODB_URI = `mongodb+srv://${process.env.MongodbUser}:${process.env.MongodbPassword}@${process.env.MongodbDataBaseName}.7vjdhyd.mongodb.net/${process.env.MongodbCollectionName}?retryWrites=true&w=majority`;

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

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
