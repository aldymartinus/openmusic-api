/* eslint-disable max-len */
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
    const {id: playistId} = req.params;

    await this._service.deletePlaylistById(playistId, user);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(req, h) {
    const {id: user} = req.auth.credentials;

    this._validator.validatePlaylistSongPayload(req.payload);
    const {songId} = req.payload;
    const {id: playlistId} = req.params;

    await this._service.addSongToPlaylist(playlistId, songId, user);
    await this._service.addActivities(playlistId, user, songId, 'add');

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
    const playlists = await this._service.getListOfSongs(user, playlistId);
    const songs = playlists.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
    const res = h.response({
      status: 'success',
      data: {
        playlist: {
          id: playlistId,
          name: playlists[0].name,
          username: playlists[0].username,
          songs,
        },
      },
    });
    res.code(200);
    return res;
  }

  async deletePlaylistSongHandler(req) {
    const {id: playlistId} = req.params;
    const {id: user} = req.auth.credentials;
    const {songId} = req.payload;
    await this._service.deleteSongFromPlaylist(playlistId, songId, user);
    await this._service.addActivities(playlistId, user, songId, 'delete');
    return {
      status: 'success',
      message: 'Lagu berhasil berhasil dihapus dari playlist',
    };
  }

  async getActivitiesHandler(req) {
    const {id: playlistId} = req.params;
    const {id: user} = req.auth.credentials;
    const activities = await this._service.getActivities(playlistId, user);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
