/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const {InvariantError, NotFoundError} = require('../../exceptions');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({name, year}) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING ID',
      values: [id, name, year],
    };

    const res = await this._pool.query(query);
    if (!res.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return res.rows[0].id;
  }

  async getAlbums() {
    const res = await this._pool.query('SELECT * FROM albums');
    return res.rows();
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const res = await this._pool(query);

    if (!res.row.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return res.rows;
  }
}

module.exports = AlbumService;
