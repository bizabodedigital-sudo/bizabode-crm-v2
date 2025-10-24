import cron from 'node-cron'
import { NotificationService } from '../lib/services/notification-service'

/**
 * Cron job to clean up expired notifications.
 * Runs daily at 3 AM to remove notifications that have passed their expiration date.
 */
export function startNotificationCleanup() {
  cron.schedule('0 3 * * *', async () => { // Daily at 3 AM
    console.log('Running notification cleanup...')

    try {
      await NotificationService.cleanupExpiredNotifications()
      console.log('Notification cleanup completed.')
    } catch (error) {
      console.error('Error in notification cleanup cron job:', error)
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'UTC'
  })

  console.log('Notification cleanup cron job scheduled (daily at 3 AM)')
}
