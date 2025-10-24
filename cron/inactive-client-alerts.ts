import connectDB from '@/lib/mongodb'
import Customer from '@/lib/models/Customer'
import Task from '@/lib/models/Task'
import Activity from '@/lib/models/Activity'
import SalesOrder from '@/lib/models/SalesOrder'
import User from '@/lib/models/User'
import { NotificationService } from '@/lib/services/notification-service'

/**
 * Inactive Client Re-engagement Cron Job
 * 
 * This job runs daily to:
 * 1. Identify customers with no orders in 30+ days
 * 2. Auto-create follow-up tasks for assigned sales reps
 * 3. Flag customers with no contact in 60+ days
 * 4. Send weekly digest email to sales managers
 */

export async function checkInactiveClients() {
  try {
    console.log('Starting inactive client alerts check...')
    await connectDB()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // 1. Find customers with no orders in 30+ days
    const customersWithNoRecentOrders = await Customer.find({
      status: 'Active',
      $or: [
        { lastOrderDate: { $lt: thirtyDaysAgo } },
        { lastOrderDate: { $exists: false } }
      ]
    }).populate('assignedTo', 'name email')
      .populate('companyId', 'name')

    console.log(`Found ${customersWithNoRecentOrders.length} customers with no recent orders`)

    // 2. Find customers with no contact in 60+ days
    const customersWithNoRecentContact = await Customer.find({
      status: 'Active',
      $or: [
        { lastContactDate: { $lt: sixtyDaysAgo } },
        { lastContactDate: { $exists: false } }
      ]
    }).populate('assignedTo', 'name email')
      .populate('companyId', 'name')

    console.log(`Found ${customersWithNoRecentContact.length} customers with no recent contact`)

    // 3. Find customers with no contact in 90+ days (high risk)
    const highRiskCustomers = await Customer.find({
      status: 'Active',
      $or: [
        { lastContactDate: { $lt: ninetyDaysAgo } },
        { lastContactDate: { $exists: false } }
      ]
    }).populate('assignedTo', 'name email')
      .populate('companyId', 'name')

    console.log(`Found ${highRiskCustomers.length} high-risk customers (90+ days no contact)`)

    let tasksCreated = 0
    let notificationsSent = 0

    // Process customers with no recent orders
    for (const customer of customersWithNoRecentOrders) {
      try {
        // Check if follow-up task already exists for this customer
        const existingTask = await Task.findOne({
          companyId: customer.companyId,
          relatedTo: 'Customer',
          relatedId: customer._id,
          type: 'Follow-up',
          status: { $in: ['Pending', 'In Progress'] },
          title: { $regex: /no recent order/i }
        })

        if (!existingTask && customer.assignedTo) {
          // Create follow-up task
          const followUpTask = new Task({
            companyId: customer.companyId,
            title: `Follow up: ${customer.companyName} - No recent orders`,
            description: `${customer.companyName} hasn't placed an order in 30+ days. Reach out to check on their needs and offer assistance.`,
            type: 'Follow-up',
            relatedTo: 'Customer',
            relatedId: customer._id,
            assignedTo: customer.assignedTo._id,
            createdBy: customer.assignedTo._id,
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
            priority: 'Medium',
            status: 'Pending',
            notes: `Auto-generated: Customer hasn't ordered in 30+ days. Last order: ${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}`
          })

          await followUpTask.save()
          tasksCreated++

          // Send notification to assigned sales rep
          await NotificationService.sendNotification({
            userId: customer.assignedTo._id,
            title: 'Customer Re-engagement Task',
            message: `${customer.companyName} hasn't ordered in 30+ days. A follow-up task has been created.`,
            type: 'customer_reengagement',
            priority: 'High',
            data: {
              taskId: followUpTask._id,
              customerId: customer._id,
              customerName: customer.companyName,
              daysSinceLastOrder: customer.lastOrderDate 
                ? Math.floor((now.getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
                : 'Unknown'
            },
            relatedCustomerId: customer._id,
            relatedTaskId: followUpTask._id,
            sendEmail: true
          })
          notificationsSent++

          console.log(`Created re-engagement task for customer: ${customer.companyName}`)
        }
      } catch (error) {
        console.error(`Failed to create re-engagement task for customer ${customer._id}:`, error)
      }
    }

    // Process customers with no recent contact
    for (const customer of customersWithNoRecentContact) {
      try {
        // Check if contact task already exists for this customer
        const existingTask = await Task.findOne({
          companyId: customer.companyId,
          relatedTo: 'Customer',
          relatedId: customer._id,
          type: 'Call',
          status: { $in: ['Pending', 'In Progress'] },
          title: { $regex: /no recent contact/i }
        })

        if (!existingTask && customer.assignedTo) {
          // Create contact task
          const contactTask = new Task({
            companyId: customer.companyId,
            title: `Contact: ${customer.companyName} - No recent contact`,
            description: `${customer.companyName} hasn't been contacted in 60+ days. Make a call or visit to maintain the relationship.`,
            type: 'Call',
            relatedTo: 'Customer',
            relatedId: customer._id,
            assignedTo: customer.assignedTo._id,
            createdBy: customer.assignedTo._id,
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Due in 1 day
            priority: 'High',
            status: 'Pending',
            notes: `Auto-generated: Customer hasn't been contacted in 60+ days. Last contact: ${customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : 'Never'}`
          })

          await contactTask.save()
          tasksCreated++

          // Send notification to assigned sales rep
          await NotificationService.sendNotification({
            userId: customer.assignedTo._id,
            title: 'Customer Contact Task',
            message: `${customer.companyName} hasn't been contacted in 60+ days. A contact task has been created.`,
            type: 'customer_contact',
            data: {
              taskId: contactTask._id,
              customerId: customer._id,
              customerName: customer.companyName,
              daysSinceLastContact: customer.lastContactDate 
                ? Math.floor((now.getTime() - new Date(customer.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
                : 'Unknown'
            }
          })
          notificationsSent++

          console.log(`Created contact task for customer: ${customer.companyName}`)
        }
      } catch (error) {
        console.error(`Failed to create contact task for customer ${customer._id}:`, error)
      }
    }

    // Process high-risk customers (90+ days no contact)
    for (const customer of highRiskCustomers) {
      try {
        // Check if high-priority task already exists for this customer
        const existingTask = await Task.findOne({
          companyId: customer.companyId,
          relatedTo: 'Customer',
          relatedId: customer._id,
          type: 'Follow-up',
          status: { $in: ['Pending', 'In Progress'] },
          title: { $regex: /high risk/i }
        })

        if (!existingTask && customer.assignedTo) {
          // Create high-priority task
          const highRiskTask = new Task({
            companyId: customer.companyId,
            title: `URGENT: ${customer.companyName} - High risk of churn`,
            description: `${customer.companyName} hasn't been contacted in 90+ days. This customer is at high risk of churning. Immediate action required.`,
            type: 'Follow-up',
            relatedTo: 'Customer',
            relatedId: customer._id,
            assignedTo: customer.assignedTo._id,
            createdBy: customer.assignedTo._id,
            dueDate: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Due in 4 hours
            priority: 'Urgent',
            status: 'Pending',
            notes: `Auto-generated: Customer hasn't been contacted in 90+ days. HIGH RISK of churn. Last contact: ${customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : 'Never'}`
          })

          await highRiskTask.save()
          tasksCreated++

          // Send urgent notification to assigned sales rep
          await NotificationService.sendNotification({
            userId: customer.assignedTo._id,
            title: 'URGENT: High Risk Customer',
            message: `${customer.companyName} is at high risk of churning. No contact in 90+ days.`,
            type: 'customer_high_risk',
            data: {
              taskId: highRiskTask._id,
              customerId: customer._id,
              customerName: customer.companyName,
              daysSinceLastContact: customer.lastContactDate 
                ? Math.floor((now.getTime() - new Date(customer.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
                : 'Unknown'
            }
          })
          notificationsSent++

          console.log(`Created high-risk task for customer: ${customer.companyName}`)
        }
      } catch (error) {
        console.error(`Failed to create high-risk task for customer ${customer._id}:`, error)
      }
    }

    // 4. Send weekly digest to managers
    const managers = await User.find({
      role: { $in: ['admin', 'manager'] },
      companyId: { $exists: true }
    }).populate('companyId', 'name')

    for (const manager of managers) {
      try {
        const inactiveCustomersCount = await Customer.countDocuments({
          companyId: manager.companyId,
          status: 'Active',
          $or: [
            { lastContactDate: { $lt: sixtyDaysAgo } },
            { lastContactDate: { $exists: false } }
          ]
        })

        const highRiskCount = await Customer.countDocuments({
          companyId: manager.companyId,
          status: 'Active',
          $or: [
            { lastContactDate: { $lt: ninetyDaysAgo } },
            { lastContactDate: { $exists: false } }
          ]
        })

        if (inactiveCustomersCount > 0 || highRiskCount > 0) {
          await NotificationService.sendNotification({
            userId: manager._id,
            title: 'Weekly Customer Health Report',
            message: `Customer health summary: ${inactiveCustomersCount} inactive customers, ${highRiskCount} high-risk customers`,
            type: 'weekly_digest',
            data: {
              inactiveCustomersCount,
              highRiskCount,
              companyId: manager.companyId
            }
          })
        }
      } catch (error) {
        console.error(`Failed to send weekly digest to manager ${manager._id}:`, error)
      }
    }

    console.log('Inactive client alerts check completed successfully')
    return {
      success: true,
      customersWithNoOrders: customersWithNoRecentOrders.length,
      customersWithNoContact: customersWithNoRecentContact.length,
      highRiskCustomers: highRiskCustomers.length,
      tasksCreated,
      notificationsSent
    }

  } catch (error) {
    console.error('Error in inactive client alerts check:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Export for cron job usage
export default checkInactiveClients
