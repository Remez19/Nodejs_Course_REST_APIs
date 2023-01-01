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
    type AuthData {
        token: String!
        userId: String!
    }
    input UserInputData {
        email: String!
        password: String!
        name: String!
    }
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostData!
        post(id: ID!): Post!
    }
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
