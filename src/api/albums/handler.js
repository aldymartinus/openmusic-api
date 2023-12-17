/* eslint-disable require-jsdoc */
const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);
    const {name, year} = req.payload;
    const albumId = await this._service.addAlbum({name, year});

    const res = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    res.code(201);
    return res;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getNotes();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler() {
    const {id} = req.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }
}

module.exports = AlbumHandler;
