/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistCollaborator(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1, AND song_id = $2',
      values: [playlistId, songId],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('Kolaborasi gagal diverifikasi');
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('Kolaborasi gagal ditambahkan');

    return res.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('Kolaborasi gagal dihapus');
  }
}

module.exports = CollaborationsService;
