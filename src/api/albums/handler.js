/* eslint-disable require-jsdoc */
const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator, uploadValidator, storageService) {
    this._service = service;
    this._validator = validator;
    this._uploadValidator = uploadValidator;
    this._storageService = storageService;

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

  async getAlbumByIdHandler(req) {
    const {id} = req.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongList(id);
    album.songs = songs;

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(req) {
    this._validator.validateAlbumPayload(req.payload);
    const {id} = req.params;
    await this._service.editAlbumById(id, req.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(req) {
    const {id} = req.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikeToAlbumHandler(req, h) {
    const {id: albumId} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._service.likeAlbumById(albumId, credentialId);

    const res = h.response({
      status: 'success',
      message: `${credentialId} menyukai sebuah album`,
    });
    res.code(201);

    return res;
  }

  async getLikesFromAlbumHandler(req) {
    const {id: albumId} = req.params;
    const likes = await this._service.getAlbumLikesCountById(albumId);

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }

  async deleteLikeFromAlbumHandler(req) {
    const {id: albumId} = req.params;
    const {id: credentialId} = req.auth.credentials;
    await this._service.deleteAlbumLikeById(albumId, credentialId);

    return {
      status: 'success',
      message: 'Album batal disukai',
    };
  }

  async postUploadAlbumCoverHandler(req, h) {
    const data = req.payload;
    const coverData = data.cover.hapi;
    const {id: albumId} = req.params;
    this._uploadValidator.validateImageHeaders(coverData.headers);
    const filename = await this._storageService.writeFile(data, coverData);
    const url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    await this._service.addCoverUrlToAlbum(albumId, url);

    const res = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    res.code(201);

    return res;
  }
}

module.exports = AlbumHandler;
