import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 5000);
  },
});

redis.on('connect', () => logger.info('Redis: connected'));
redis.on('error', (err) => logger.error('Redis: connection error', { error: err.message }));
