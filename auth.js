if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const AUTH_ISSUER = process.env.AUTH_ISSUER || null;
if (!AUTH_ISSUER) throw `No AUTH_ISSUER environment variable set`;
const AUTH_AUDIENCE = process.env.AUTH_AUDIENCE || null;
if (!AUTH_AUDIENCE) throw `No AUTH_AUDIENCE environment variable set`;

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
