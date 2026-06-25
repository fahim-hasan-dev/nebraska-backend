import { Worker, Job } from 'bullmq';
import { queueConnection } from '../helpers/queue';
import { PushNotificationService } from '../app/modules/notification/pushNotification.service';
import { logger, errorLogger } from '../shared/logger';

interface INotificationJobData {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const startNotificationWorker = () => {
  const notificationWorker = new Worker(
    'notification',
    async (job: Job<INotificationJobData>) => {
      const { token, title, body, data } = job.data;
      logger.info(`[Notification Worker] Processing push notification job ${job.id} for token: ${token.substring(0, 10)}...`);
      await PushNotificationService.sendPushNotification(token, title, body, data);
    },
    {
      connection: queueConnection,
      concurrency: 5, // Process up to 5 push notifications concurrently
    }
  );

  notificationWorker.on('completed', (job) => {
    logger.info(`[Notification Worker] Push notification job ${job.id} sent successfully`);
  });

  notificationWorker.on('failed', (job, err) => {
    errorLogger.error(`[Notification Worker] Push notification job ${job?.id} failed with error:`, err);
  });

  logger.info('🚀 Notification worker initialized successfully');
};
