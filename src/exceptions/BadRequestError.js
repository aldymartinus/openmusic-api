/* eslint-disable require-jsdoc */
const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(msg) {
    super(msg, 400);
    this.name = 'BadRequestError';
  }
}

module.exports = AuthenticationError;
