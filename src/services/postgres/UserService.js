/* eslint-disable require-jsdoc */
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const {nanoid} = require('nanoid');
const bcryptjs = require('bcryptjs');
const {Pool} = require('pg');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser(username, password, fullname) {
    this.verifyUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = bcryptjs.hash(password, 10);

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

    const errMsg = 'Gagal menambahkan user. Username sudah digunakan.';
    if (res.rowCount > 0) throw new InvariantError(errMsg);
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname from users WHERE id = $1',
      values: [id],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) throw new InvariantError('User tidak ditemukan');

    return res.rows[0];
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const res = await this._pool.query(query);
    const errMsg = 'Kredensial yang Anda berikan salah';

    if (!res.rowCount) throw new AuthenticationError(errMsg);

    const {id, password: hashedPassword} = res.rows[0];

    const match = await bcryptjs.compare(password, hashedPassword);
    if (!match) throw new AuthenticationError(errMsg);

    return id;
  }
}

module.exports = UserService;
