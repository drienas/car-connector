const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./Schema').Schema;

const app = express();
app.use(cors());
app.use('/gql', graphqlHTTP({ schema, graphiql: true }));

app.listen(4444, () =>
  console.log(`Running a GraphQL API server at http://localhost:4444/gql`)
);
