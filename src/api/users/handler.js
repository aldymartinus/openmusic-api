const autoBind = require('auto-bind');

/* eslint-disable require-jsdoc */
class userHandler {
  constructor(validator, service) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUserHandler(req, h) {
    this._validator.validateUserPayload(req.payload);
    const {username, password, fullname} = req.payload;

    const userId = await this._service.addUser(username, password, fullname);
    const res = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    res.code(201);
    return res;
  }
  async getUserHandler(req, h) {
    const {id} = req.params;
    const user = await this._service.getUser(id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

module.exports = userHandler;
