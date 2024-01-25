/* eslint-disable require-jsdoc */
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePlaylistPayload(req.payload);
    const {name} = req.payload;
    const {id: user} = req.auth.credentials;
    const id = await this._service.addPlaylist(name, user);
    const res = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId: id,
      },
    });
    res.code(201);
    return res;
  }

  async getPlaylistsHandler(req, h) {
    const {id: user} = req.auth.credentials;
    const playlists = await this._service.getPlaylists(user);

    const res = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    res.code(200);
    return res;
  }

  async deletePlaylistByIdHandler(req) {
    const {id: user} = req.auth.credentials;
    const {playistId} = req.payload;

    await this._service.deletePlaylistById(playistId, user);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(req, h) {
    this._validator.validatePlaylistSongPayload(req.payload);
    const {songId} = req.payload;
    const {id: playlistId} = req.params;
    console.log(`payload: ${songId}, params: ${playlistId}`);

    await this._service.addSongToPlaylist(playlistId, songId);
    const res = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan kedalam playlist',
    });
    res.code(201);
    return res;
  }

  async getPlaylistsSongsHandler(req, h) {
    const {id: playlistId} = req.params;
    const {id: user} = req.auth.credentials;
    const playlists = this._service.getListOfSongs(user, playlistId);

    const res = h.responses({
      status: 'success',
      data: {
        playlists,
      },
    });
    res.code(200);
    return res;
  }

  async deletePlaylistSongHandler(req) {
    const {id: playlistId} = req.params;
    const {id: songId} = req.payload;
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil berhasil dihapus dari playlist',
    };
  }

  async getActivitiesHandler(req) {}
}

module.exports = PlaylistsHandler;
