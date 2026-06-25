import { Worker, Job } from 'bullmq';
import { queueConnection } from '../helpers/queue';
import { User } from '../app/modules/user/user.model';
import { logger, errorLogger } from '../shared/logger';

export const startUserCleanupWorker = () => {
  const userCleanupWorker = new Worker(
    'user-cleanup',
    async (job: Job<{ userId: string }>) => {
      if (job.name === 'cleanup-user') {
        const { userId } = job.data;
        logger.info(`[User Cleanup Worker] Checking verification status for user ${userId}...`);
        
        const user = await User.findById(userId);
        if (user && !user.verified) {
          await User.findByIdAndDelete(userId);
          logger.info(`[User Cleanup Worker] Deleted unverified user account ${userId} after grace period expiration.`);
        } else {
          logger.info(`[User Cleanup Worker] User ${userId} is verified or does not exist. Cleanup skipped.`);
        }
      }
    },
    {
      connection: queueConnection,
      concurrency: 5,
    }
  );

  userCleanupWorker.on('completed', (job) => {
    logger.info(`[User Cleanup Worker] Delayed cleanup job "${job.name}" (${job.id}) processed successfully`);
  });

  userCleanupWorker.on('failed', (job, err) => {
    errorLogger.error(`[User Cleanup Worker] Delayed cleanup job "${job?.name}" (${job?.id}) failed:`, err);
  });

  logger.info('🚀 User cleanup worker initialized successfully');
};
