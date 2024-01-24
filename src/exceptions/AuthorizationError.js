const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(msg) {
    super(msg, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
