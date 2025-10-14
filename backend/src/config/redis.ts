import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

export const publisher = createClient({
  url: redisUrl,
});

export const subscriber = createClient({
  url: redisUrl,
});

export const connectRedis = async () => {
  try {
    await redis.connect();
    await publisher.connect();
    await subscriber.connect();
    
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    process.exit(1);
  }
};