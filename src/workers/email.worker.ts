import { Worker, Job } from 'bullmq';
import { queueConnection } from '../helpers/queue';
import { emailHelper } from '../helpers/emailHelper';
import { logger, errorLogger } from '../shared/logger';
import { ISendEmail } from '../interfaces/email';

export const startEmailWorker = () => {
  const emailWorker = new Worker(
    'email',
    async (job: Job<ISendEmail>) => {
      logger.info(`[Email Worker] Processing email job ${job.id} to: ${job.data.to}`);
      await emailHelper.sendEmail(job.data);
    },
    {
      connection: queueConnection,
      concurrency: 2, // Process up to 2 emails concurrently
    }
  );

  emailWorker.on('completed', (job) => {
    logger.info(`[Email Worker] Email job ${job.id} sent successfully to ${job.data.to}`);
  });

  emailWorker.on('failed', (job, err) => {
    errorLogger.error(`[Email Worker] Email job ${job?.id} failed with error:`, err);
  });

  logger.info('🚀 Email worker initialized successfully');
};
