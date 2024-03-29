/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING ID',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const res = await this._pool.query(query);
    if (!res.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return res.rows[0].id;
  }

  async getSongs() {
    const res = await this._pool.query('SELECT id, title, performer FROM songs');
    return res.rows;
  }

  async getSongsWithParams(title, performer) {
    const query = {
      text: `SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2`,
      values: [title + '%', performer + '%'],
    };
    const res = await this._pool.query(query);
    return res.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return res.rows[0];
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const query = {
      text: `UPDATE songs SET 
      title = $1, 
      year = $2, 
      genre = $3, 
      performer = $4, 
      duration = $5, 
      "albumId" = $6 
      WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifySongId(id) {
    const query = {
      text: 'SELECT * from songs WHERE id = $1',
      values: [id],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new NotFoundError('Lagu tidak valid');
  }

  async validateSongPayload(id) {
    const query = {
      text: 'SELECT * from songs WHERE id = $1',
      values: [id],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new BadRequestError('Lagu tidak valid');
  }
}

module.exports = SongService;
