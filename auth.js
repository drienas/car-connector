if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const AUTH_USER = process.env.AUTH_USER || null;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || null;

module.exports = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH_ISSUER}/.well-known/jwks.json`,
  }),
  audience: AUTH_AUDIENCE,
  issuer: `${AUTH_ISSUER}/`,
  algorithms: ['RS256'],
});
