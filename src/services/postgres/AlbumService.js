/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const {InvariantError, NotFoundError} = require('../../exceptions');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;

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

  async getAlbumById(id) {
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

  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const res = await this._pool.query(query);

    if (!res.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = AlbumService;
