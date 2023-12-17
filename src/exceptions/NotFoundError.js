const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(msg) {
    super(msg, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
