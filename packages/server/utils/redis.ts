import { Redis } from 'ioredis';
require('dotenv').config();

const redisURL = process.env.REDIS_URL;

if (!redisURL) {
  console.error('CRITICAL ERROR: REDIS_URL environment variable is not defined!');
  throw new Error('Redis connection failed: URL not found.');
}

console.log("Attempting to connect to Redis...");

// The 'lazyConnect' option is crucial. It prevents the app from
// crashing immediately if the connection briefly fails on startup.
export const redis = new Redis(redisURL, { lazyConnect: true });

redis.on('connect', () => {
    console.log('Redis client connected successfully.');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
