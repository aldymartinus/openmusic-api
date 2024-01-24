/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(songService, collaborationService) {
    this._pool = new Pool();
    this._songService = songService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist(name, username) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, username],
    };

    const res = await this._pool.query(query);
    if (!res.rows[0].id) throw new InvariantError('Playlist gagal ditambahkan');

    return res.rows[0].id;
  }

  async getPlaylists(username) {
    const query = {
      text: 'SELECT * FROM playlists WHERE username = $1',
      values: [username],
    };

    const res = await this._pool.query(query);
    return res.rows;
  }

  async deletePlaylistById(id, username) {
    this.verifyPlaylistOwner(username);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(username) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [username],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('Playlist tidak ditemukan');
    const playlist = res.rows[0];

    const errMsg = 'Anda tidak berhak mengakses resource ini';
    if (playlist.username != username) throw new AuthorizationError(errMsg);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch (error) {
        throw error;
      }
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    this._songService.verifySongId(songId);

    const id = `track-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const res = await this._pool.query(query);
    const errMsg = 'Lagu gagal ditambahkan kedalam playlist';
    if (!res.rowCount) throw new InvariantError(errMsg);

    return res.rows[0].id;
  }

  async getListOfSongs(username, playlistId) {
    const query = {
      text: `select playlists.id, name, username, songs.id, songs.title, songs.performer from 
      playlists left join playlist_songs on playlists.id = playlist_songs.playlist_i
      d left join songs on playlist_songs.song_id = songs.id WHERE username = $1 AND playlist.id = $2;
      `,
      values: [username, playlistId],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('Playlist tidak valid');
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    this._songService.verifySongId(id);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const res = await this._pool.query(query);
    const errMsg = 'Gagal menghapus lagu dari playlist';
    if (!res.rowCount) throw new InvariantError(errMsg);
  }
}

module.exports = PlaylistsService;
