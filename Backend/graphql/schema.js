const { buildSchema } = require("graphql");

/**
 * buildSchema() generates a Schema object.
 * To buildSchema() we pass string where we describe our schema.
 * This (below) is a very simple schema where we can send "hello" query
 * to get back some "TestData".
 * the text is defined in the resolver.
 * We can define the return value to be required by adding "!".
 */
module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }
    type RootQuery {
        hello: TestData!
    }    
    schema {
            query: RootQuery
        }
`);
