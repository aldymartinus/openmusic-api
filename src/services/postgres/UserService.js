/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-underscore-dangle */
const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const bcryptjs = require('bcryptjs');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser(username, password, fullname) {
    await this.verifyUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcryptjs.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new InvariantError('User gagal ditambahkan');

    return res.rows[0].id;
  }

  async verifyUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const res = await this._pool.query(query);

    if (res.rowCount) {
      throw new InvariantError(
          'Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new NotFoundError('User tidak ditemukan');

    return res.rows[0];
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const res = await this._pool.query(query);

    if (!res.rowCount) throw new AuthenticationError('Kredensial yang Anda berikan salah');

    const {id, password: hashedPassword} = res.rows[0];
    const match = await bcryptjs.compare(password, hashedPassword);
    if (!match) throw new AuthenticationError('Kredensial yang Anda berikan salah');

    return id;
  }
}

module.exports = UsersService;
