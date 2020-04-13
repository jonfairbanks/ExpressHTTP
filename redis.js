const Redis = require('ioredis');

exports.redis = new Redis(
  process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379, // eslint-disable-line radix
  process.env.REDIS_HOST ? process.env.REDIS_HOST : '127.0.0.1',
);
