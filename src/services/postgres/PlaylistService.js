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
      text: `
      select playlists.id, playlists.name, users.username from playlists left join users on 
      users.id = playlists.username left join collaborations on playlists.id = collaborations.playlist_id where 
      playlists.username = $1 or collaborations.user_id = $1;
      `,
      values: [username],
    };

    const res = await this._pool.query(query);
    return res.rows;
  }

  async deletePlaylistById(id, username) {
    await this.verifyPlaylistOwner(username, id);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(username, playistId) {
    const query = {
      text: 'SELECT * FROM playlists',
    };

    const res = await this._pool.query(query);

    const playlistArr = res.rows.map((p) => ({
      id: p.id,
      username: p.username,
    }));

    const matchingId = playlistArr.filter((p) => p.id == playistId).length;
    const matchingUsername = playlistArr.filter((p) => p.username == username).length;

    const errMsg = 'Anda tidak berhak mengakses resource ini';
    if (matchingId < 1) throw new NotFoundError('Playlist tidak ditemukan');
    if (matchingUsername < 1) throw new AuthorizationError(errMsg);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(userId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyPlaylistCollaborator(playlistId, userId);
      } catch (error) {
        throw error;
      }
    }
  }

  async addSongToPlaylist(playlistId, songId, owner) {
    await this._songService.verifySongId(songId, owner);
    await this.verifyPlaylistAccess(playlistId, owner);

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
    await this.verifyPlaylistAccess(playlistId, username);

    const query = {
      text: `select name, songs.id, songs.title, songs.performer from 
      playlists left join playlist_songs on playlists.id = playlist_songs.playlist_id 
      left join songs on playlist_songs.song_id = songs.id 
      left join users on users.id = $1
      WHERE users.id = $1 AND playlists.id = $2;
      `,
      values: [username, playlistId],
    };

    const playlistsUsername = await this._pool.query(`
    select users.username from 
    users left join playlists on 
    users.id = playlists.username where playlists.id = $1
    `, [playlistId]);

    const res = await this._pool.query(query);
    res.rows[0].username = playlistsUsername.rows[0].username;

    if (!res.rowCount) throw new InvariantError('Playlist tidak valid');
    return res.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, owner) {
    await this._songService.validateSongPayload(songId);
    await this.verifyPlaylistAccess(playlistId, owner);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const res = await this._pool.query(query);
    const errMsg = 'Gagal menghapus lagu dari playlist';
    if (!res.rowCount) throw new InvariantError(errMsg);
  }

  async addActivities(playlistId, username, songId, action) {
    const time = new Date().toISOString();
    const id = `activities-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, username, action, time],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new InvariantError('Activity gagal ditambahkan');
  }

  async getActivities(playlistId, username) {
    await this.verifyPlaylistAccess(playlistId, username);
    const query = {
      text: `
      select users.username, songs.title, playlist_song_activities.action, 
      playlist_song_activities.time
      from songs left join playlist_song_activities 
      on playlist_song_activities.song_id = songs.id left join users on 
      playlist_song_activities.user_id = users.id where playlist_id = $1;
      `,
      values: [playlistId],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new NotFoundError('Gagal mendapatkan activities');
    return res.rows;
  }
}

module.exports = PlaylistsService;
