/* eslint-disable require-jsdoc */
class ClientError extends Error {
  constructor(msg, statusCode = 400) {
    super(msg);
    this.statusCode = statusCode;
    this.name = 'ClientError;';
  }
}

module.exports = ClientError;
