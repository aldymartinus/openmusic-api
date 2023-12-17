/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const {InvariantError, NotFoundError} = require('../../exceptions');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING ID',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const res = await this._pool.query(query);
    if (!res.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return res.rows[0].id;
  }

  async getSongs() {
    const res = await this._pool.query('SELECT * FROM songs');
    return res.rows();
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const res = await this._pool(query);

    if (!res.row.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return res.rows;
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const query = {
      text: `UPDATE albums SET 
      title = $1, 
      year = $2, 
      genre = $3, 
      performer = $4, 
      duration = $5, 
      albumId = $6,
      WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const res = await this._pool.query(query);

    if (!res.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = SongService;
