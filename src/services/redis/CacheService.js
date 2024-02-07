/* eslint-disable require-jsdoc */
const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  async set(key, value, expInSec = 1800) {
    await this._client.set(key, value, {
      EX: expInSec,
    });
  }

  async get(key) {
    const res = await this._client.get(key);

    if (res === null) throw new Error('Cache tidak ditemukan');
    return res;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
