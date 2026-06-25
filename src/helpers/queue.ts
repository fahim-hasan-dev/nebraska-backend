import { Queue } from 'bullmq';
import config from '../config';

export const queueConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
};

// Create queue instances
export const emailQueue = new Queue('email', { connection: queueConnection });
export const notificationQueue = new Queue('notification', { connection: queueConnection });
export const userCleanupQueue = new Queue('user-cleanup', { connection: queueConnection });
