/* eslint-disable require-jsdoc */
const autoBind = require('auto-bind');

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(req, h) {
    this._validator.validateSongPayload(req.payload);
    const {title, year, genre, performer, duration, albumId} = req.payload;
    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const res = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    res.code(201);
    return res;
  }

  async getSongsHandler(req) {
    const songs = await this._service.getSongs();
    const {title = '', performer = ''} = req.query;
    if (title || performer) {
      const songs = await this._service.getSongsWithParams(title, performer);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(req) {
    const {id} = req.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(req) {
    this._validator.validateSongPayload(req.payload);
    const {id} = req.params;
    await this._service.editSongById(id, req.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(req) {
    const {id} = req.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongHandler;
