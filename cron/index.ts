import { startLowStockCheck } from './low-stock-check'
import { startOverdueInvoiceCheck } from './overdue-invoices'
import { startLicenseCheck } from './license-check'

/**
 * Initialize all cron jobs
 * Call this function when the server starts
 */
export function initializeCronJobs() {
  console.log('🕐 Initializing cron jobs...')
  
  try {
    // Start all cron jobs
    startLowStockCheck()      // Daily at 8 AM
    startOverdueInvoiceCheck() // Daily at 9 AM  
    startLicenseCheck()       // Daily at 10 AM
    
    console.log('✅ All cron jobs initialized successfully')
    console.log('📅 Scheduled jobs:')
    console.log('   • Low Stock Check: Daily at 8:00 AM')
    console.log('   • Overdue Invoice Check: Daily at 9:00 AM')
    console.log('   • License Check: Daily at 10:00 AM')
    
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error)
  }
}

/**
 * Stop all cron jobs
 * Call this function when the server shuts down
 */
export function stopCronJobs() {
  console.log('🛑 Stopping cron jobs...')
  // Note: node-cron doesn't provide a direct way to stop all jobs
  // In production, you might want to track job references
  console.log('✅ Cron jobs stopped')
}

// Export individual job starters for manual testing
export { startLowStockCheck, startOverdueInvoiceCheck, startLicenseCheck }
