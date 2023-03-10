const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const PORT = process.env.PORT;

const MONGODB_URI = `mongodb+srv://${process.env.MongodbUser}:${process.env.MongodbPassword}@${process.env.MongodbDataBaseName}.7vjdhyd.mongodb.net/${process.env.MongodbCollectionName}?retryWrites=true&w=majority`;

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const { Socket } = require("socket.io");

const app = express();

// Control where the files will be stored
const fileStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "images");
  },
  // Controls how the files should be named on save
  filename: (req, file, callBack) => {
    callBack(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callBack) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // Valid file
    callBack(null, true);
  } else {
    // invalid file type
    callBack(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// single("image") - inform multer we expecting to get one file
// in the filed name "image" in the incoming request

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

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
app.use("/auth", authRoutes);

// Erorr middleware to catch requests that ended up
// in a error.
app.use((error, req, res, next) => {
  console.log(error);
  // if error.statusCode not defined than 500 will be default
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(PORT, (err) => {
      if (!err) {
        console.log("Connected to Database");
        console.log(`Server listening on port ${PORT}`);
      }
    });
    // socker.io return a function that we need to excute and pass the server
    // to.
    // Gives back a socket.io object
    const io = require("./socket").init(server);
    // From here we can define a eventListeners
    // connection - wait on a new connection.
    // this function will get fired for every new connection (client)
    // the socket var is the connection.
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => {
    console.log("Failed to connect to mongodb");
    console.log(err);
  });
