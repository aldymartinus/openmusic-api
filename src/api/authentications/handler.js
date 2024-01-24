/* eslint-disable max-len */
const autoBind = require('auto-bind');

/* eslint-disable require-jsdoc */
class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._userService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePostAuthenticationPayload(req.payload);
    const {username, password} = req.payload;

    const id = await this._userService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({id});
    const refreshToken = this._tokenManager.generateRefreshToken({id});

    await this._authenticationsService.addRefreshToken(refreshToken);

    const res = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    res.code(201);
    return res;
  }

  async putAuthenticationHandler(req) {
    this._validator.validatePutAuthenticationPayload(req.payload);

    const {refreshToken} = req.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const {id} = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({id});
    return {
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(req, h) {
    this._validator.validateDeleteAuthenticationPayload(req.payload);

    const {refreshToken} = req.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
