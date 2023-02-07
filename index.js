if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { gatherAsyncData } = require('./GatherGlobalData');

const { BasicStrategy } = require('passport-http');
const passport = require('passport');

const AUTHUSER = process.env.AUTH_USER;
const AUTHPASSWORD = process.env.AUTH_PASSWORD;

passport.use(
  new BasicStrategy((user, pw, done) => {
    try {
      if (user !== AUTHUSER) return done(null, false);
      if (pw !== AUTHPASSWORD) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

gatherAsyncData().then(() => {
  // const jwtCheck = require('./auth');
  const schema = require('./Schema').Schema;
  const app = express();
  app.use(cors());
  if (process.env.NODE_ENV === 'production') app.use(jwtCheck);

  app.use(passport.authenticate('basic', { session: false }));
  app.use(
    '/gql',
    graphqlHTTP({ schema, graphiql: process.env.NODE_ENV !== 'production' })
  );
  app.listen(4444, () =>
    console.log(`Running a GraphQL API server at http://localhost:4444/gql`)
  );
});
