exports.getPosts = (req, res, next) => {
  let dummyData = [{ FirstName: "Remez", LastName: "David" }];
  /**
   * Send response Back.
   * When sding a json response we want to set the status code.
   * (The default value of the status code is 200)
   * We want to be clear about the status code our response have.
   *  */
  res.status(200).json({
    posts: dummyData,
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;
  // In real use case we want to store the post in DB
  // 201 code - sucess a resource was created!
  res.status(201).json({
    message: "Post crated successfully!",
    post: { id: new Date().toISOString(), title, content },
  });
};
