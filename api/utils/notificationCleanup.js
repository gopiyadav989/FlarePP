import Notification from '../models/notificationModel.js';
import cron from 'node-cron';

// Clean up old notifications
export const cleanupOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  console.log(`Cleaned up ${result.deletedCount} notifications older than ${daysOld} days`);
  return result;
};

// Clean up read notifications
export const cleanupReadNotifications = async (daysOld = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });

  console.log(`Cleaned up ${result.deletedCount} read notifications older than ${daysOld} days`);
  return result;
};

// Start cleanup job
export const startNotificationCleanupJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running notification cleanup job...');
    await cleanupOldNotifications(30);
    await cleanupReadNotifications(7);
    console.log('Notification cleanup job completed');
  });

  console.log('Notification cleanup cron job started (runs daily at 2:00 AM)');
};

// Stop cleanup jobs
export const stopNotificationCleanupJob = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('Notification cleanup jobs stopped');
};

// Run cleanup now
export const runCleanupNow = async () => {
  console.log('Running immediate notification cleanup...');
  await cleanupOldNotifications(30);
  await cleanupReadNotifications(7);
  console.log('Immediate cleanup completed');
};