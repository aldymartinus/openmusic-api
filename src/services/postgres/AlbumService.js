/* eslint-disable require-jsdoc */
const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
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

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return res.rows[0];
  }

  async getSongList(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const res = await this._pool.query(query);

    return res.rows;
  };

  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyUserLikes(albumId, user) {
    const query = {
      text: `SELECT * FROM user_album_likes WHERE 
      album_id = $1 AND user_id = $2`,
      values: [albumId, user],
    };
    const res = await this._pool.query(query);

    if (res.rowCount) throw new BadRequestError('Album sudah disukai');
  }

  async likeAlbumById(albumId, user) {
    await this.getAlbumById(albumId);
    await this.verifyUserLikes(albumId, user);

    const likeId = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [likeId, user, albumId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getAlbumLikesCountById(albumId) {
    try {
      const res = await this._cacheService.get(`likes:${albumId}`);
      return JSON.parse(res);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const res = await this._pool.query(query);
      const likes = res.rowCount;
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));

      return likes;
    }
  }

  async deleteAlbumLikeById(albumId, user) {
    const query = {
      text: `DELETE FROM user_album_likes 
      WHERE album_id = $1 AND user_id = $2`,
      values: [albumId, user],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async addCoverUrlToAlbum(albumId, url) {
    const query = {
      text: `UPDATE albums SET cover = $1 WHERE id = $2`,
      values: [url, albumId],
    };

    await this._pool.query(query);
  }
}

module.exports = AlbumService;
