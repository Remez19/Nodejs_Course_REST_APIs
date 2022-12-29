const { buildSchema } = require("graphql");

//  "ID" - special type provided by graphql
// createUser(userInput: UserInputData) - we expect getting some data that looks like
// UserInputData we define in "input".
// We expect to get back some User which hes data defined in the "User" type.
// createUser(userInput: UserInputData): User! -> we want to get UserInputData
// and return User
module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]
    }
    input UserInputData {
        email: String!
        password: String!
        name: String!
    }
    type RootQuery {
        hello: String
    }
    type RootMutation {
        createUser(userInput: UserInputData): User!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
