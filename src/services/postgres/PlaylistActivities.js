/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities(playlistId, username, songId, action) {
    const time = new Date().toISOString();
    const songTitle = this._pool.query('SELECT title FROM songs WHERE id = $1', songId);

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4)',
      values: [playlistId, username, songTitle, action, time],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new InvariantError('Activity gagal ditambahkan');
  }

  async getActivities() {}
}

module.exports = PlaylistActivitiesService;
