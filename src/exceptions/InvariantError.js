const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(msg) {
    super(msg);
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;
