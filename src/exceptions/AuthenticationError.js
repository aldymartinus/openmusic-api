/* eslint-disable require-jsdoc */
const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(msg) {
    super(msg, 401);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
