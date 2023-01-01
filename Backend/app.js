const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();
const auth = require("./middleware/auth");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const { graphqlHTTP } = require("express-graphql");

const PORT = process.env.PORT;

const MONGODB_URI = `mongodb+srv://${process.env.MongodbUser}:${process.env.MongodbPassword}@${process.env.MongodbDataBaseName}.7vjdhyd.mongodb.net/${process.env.MongodbCollectionName}?retryWrites=true&w=majority`;

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
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: req.file.path });
});

// common convention to use "/graphql"
// To graphqlHttp() we pass an object with two keys:
// "schema" - the schema we created in the schema file.
// "rootValue" - the resolver we created in the resolvers file
// graphiql: true, - gives us a special tool a ui to play with our server GraphQl
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    // formatError(err) - a method that recives the error
    // and allows to return our own error format.
    formatError(err) {
      // originalError will be set by graphql automatically when
      // we throw error in our code (or some other package).
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred";
      const code = err.originalError.code || 500;
      return {
        message: message,
        status: code,
        data: data,
      };
    },
  })
);

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
    app.listen(PORT, (err) => {
      if (!err) {
        console.log("Connected to Database");
        console.log(`Server listening on port ${PORT}`);
      }
    });
    // socker.io return a function that we need to excute and pass the server
  })
  .catch((err) => {
    console.log("Failed to connect to mongodb");
    console.log(err);
  });

// Helper function to delete image
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
