import connectDB from '@/lib/mongodb'
import Quote from '@/lib/models/Quote'
import SalesOrder from '@/lib/models/SalesOrder'
import Activity from '@/lib/models/Activity'
import Task from '@/lib/models/Task'
import Customer from '@/lib/models/Customer'
import { NotificationService } from './notification-service'

/**
 * Workflow Automation Service
 * 
 * Handles automated workflow transitions and status updates:
 * - Auto-update order status based on delivery confirmations
 * - Auto-expire quotes past validUntil date
 * - Auto-convert accepted quotes to sales orders
 * - Auto-complete activities when related orders are delivered
 * - Trigger notifications on status changes
 */

export class WorkflowAutomationService {
  /**
   * Auto-expire quotes that are past their validUntil date
   */
  static async expireQuotes() {
    try {
      await connectDB()
      
      const now = new Date()
      const expiredQuotes = await Quote.find({
        status: { $in: ['draft', 'sent'] },
        validUntil: { $lt: now }
      }).populate('companyId', 'name')

      console.log(`Found ${expiredQuotes.length} expired quotes`)

      for (const quote of expiredQuotes) {
        try {
          quote.status = 'expired'
          await quote.save()

          // Create activity log
          await Activity.create({
            companyId: quote.companyId,
            type: 'Note',
            subject: 'Quote Expired',
            description: `Quote ${quote.quoteNumber} has expired automatically`,
            assignedTo: quote.createdBy,
            status: 'Completed',
            completedDate: now
          })

          console.log(`Expired quote: ${quote.quoteNumber}`)
        } catch (error) {
          console.error(`Failed to expire quote ${quote._id}:`, error)
        }
      }

      return {
        success: true,
        expiredCount: expiredQuotes.length
      }
    } catch (error) {
      console.error('Error expiring quotes:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Auto-convert accepted quotes to sales orders
   */
  static async convertAcceptedQuotes() {
    try {
      await connectDB()
      
      const acceptedQuotes = await Quote.find({
        status: 'accepted'
      }).populate('companyId', 'name')
        .populate('createdBy', 'name email')

      console.log(`Found ${acceptedQuotes.length} accepted quotes to convert`)

      let convertedCount = 0

      for (const quote of acceptedQuotes) {
        try {
          // Check if sales order already exists for this quote
          const existingOrder = await SalesOrder.findOne({
            quoteId: quote._id
          })

          if (!existingOrder) {
            // Generate order number
            const orderCount = await SalesOrder.countDocuments({ companyId: quote.companyId })
            const orderNumber = `SO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

            // Create sales order
            const salesOrder = new SalesOrder({
              companyId: quote.companyId,
              orderNumber,
              quoteId: quote._id,
              customerName: quote.customerName,
              customerEmail: quote.customerEmail,
              customerPhone: quote.customerPhone,
              customerAddress: quote.customerAddress,
              items: quote.items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                total: item.total
              })),
              subtotal: quote.subtotal,
              tax: quote.tax,
              taxRate: quote.taxRate,
              discount: quote.discount,
              total: quote.total,
              orderDate: new Date(),
              paymentTerms: 'Net 30',
              notes: `Auto-converted from quote ${quote.quoteNumber}`,
              createdBy: quote.createdBy._id,
              status: 'Pending'
            })

            await salesOrder.save()
            convertedCount++

            // Create activity log
            await Activity.create({
              companyId: quote.companyId,
              type: 'Note',
              subject: 'Quote Converted to Order',
              description: `Quote ${quote.quoteNumber} was automatically converted to sales order ${orderNumber}`,
              assignedTo: quote.createdBy._id,
              status: 'Completed',
              completedDate: new Date(),
              relatedQuoteId: quote._id,
              relatedOrderId: salesOrder._id
            })

            // Send notification
            await NotificationService.sendNotification({
              userId: quote.createdBy._id,
              title: 'Quote Converted to Order',
              message: `Quote ${quote.quoteNumber} has been automatically converted to sales order ${orderNumber}`,
              type: 'quote_converted',
              data: {
                quoteId: quote._id,
                orderId: salesOrder._id,
                orderNumber: orderNumber
              }
            })

            console.log(`Converted quote ${quote.quoteNumber} to order ${orderNumber}`)
          }
        } catch (error) {
          console.error(`Failed to convert quote ${quote._id}:`, error)
        }
      }

      return {
        success: true,
        convertedCount
      }
    } catch (error) {
      console.error('Error converting accepted quotes:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Auto-update order status based on delivery confirmations
   */
  static async updateOrderStatus() {
    try {
      await connectDB()
      
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Find orders that were dispatched more than 1 day ago but not yet delivered
      const ordersToCheck = await SalesOrder.find({
        status: 'Dispatched',
        dispatchedAt: { $lt: oneDayAgo }
      }).populate('companyId', 'name')
        .populate('createdBy', 'name email')

      console.log(`Found ${ordersToCheck.length} orders to check for delivery`)

      let deliveredCount = 0

      for (const order of ordersToCheck) {
        try {
          // Auto-mark as delivered if dispatched more than 1 day ago
          order.status = 'Delivered'
          order.deliveredAt = now
          await order.save()
          deliveredCount++

          // Create activity log
          await Activity.create({
            companyId: order.companyId,
            type: 'Note',
            subject: 'Order Delivered',
            description: `Order ${order.orderNumber} has been automatically marked as delivered`,
            assignedTo: order.createdBy._id,
            status: 'Completed',
            completedDate: now,
            relatedOrderId: order._id
          })

          // Send notification
          await NotificationService.sendNotification({
            userId: order.createdBy._id,
            title: 'Order Delivered',
            message: `Order ${order.orderNumber} has been automatically marked as delivered`,
            type: 'order_delivered',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber
            }
          })

          console.log(`Auto-delivered order: ${order.orderNumber}`)
        } catch (error) {
          console.error(`Failed to update order ${order._id}:`, error)
        }
      }

      return {
        success: true,
        deliveredCount
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Auto-complete activities when related orders are delivered
   */
  static async completeRelatedActivities() {
    try {
      await connectDB()
      
      const deliveredOrders = await SalesOrder.find({
        status: 'Delivered',
        deliveredAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Delivered in last 24 hours
      }).populate('companyId', 'name')

      console.log(`Found ${deliveredOrders.length} recently delivered orders`)

      let completedActivities = 0

      for (const order of deliveredOrders) {
        try {
          // Find related activities that are still pending
          const relatedActivities = await Activity.find({
            relatedOrderId: order._id,
            status: { $in: ['Scheduled', 'In Progress'] }
          })

          for (const activity of relatedActivities) {
            activity.status = 'Completed'
            activity.completedDate = new Date()
            await activity.save()
            completedActivities++

            console.log(`Completed activity: ${activity.subject}`)
          }
        } catch (error) {
          console.error(`Failed to complete activities for order ${order._id}:`, error)
        }
      }

      return {
        success: true,
        completedActivities
      }
    } catch (error) {
      console.error('Error completing related activities:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update customer statistics when orders are completed
   */
  static async updateCustomerStats() {
    try {
      await connectDB()
      
      const deliveredOrders = await SalesOrder.find({
        status: 'Delivered',
        deliveredAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Delivered in last 24 hours
      }).populate('customerId')

      console.log(`Found ${deliveredOrders.length} recently delivered orders to update customer stats`)

      let updatedCustomers = 0

      for (const order of deliveredOrders) {
        try {
          if (order.customerId) {
            const customer = await Customer.findById(order.customerId)
            if (customer) {
              // Update customer statistics
              customer.totalOrders = (customer.totalOrders || 0) + 1
              customer.totalValue = (customer.totalValue || 0) + order.total
              customer.averageOrderValue = customer.totalValue / customer.totalOrders
              customer.lastOrderDate = order.deliveredAt
              customer.lastActivityDate = new Date()

              await customer.save()
              updatedCustomers++

              console.log(`Updated stats for customer: ${customer.companyName}`)
            }
          }
        } catch (error) {
          console.error(`Failed to update customer stats for order ${order._id}:`, error)
        }
      }

      return {
        success: true,
        updatedCustomers
      }
    } catch (error) {
      console.error('Error updating customer stats:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Run all workflow automations
   */
  static async runAllAutomations() {
    try {
      console.log('Starting workflow automation...')
      
      const results = {
        expireQuotes: await this.expireQuotes(),
        convertAcceptedQuotes: await this.convertAcceptedQuotes(),
        updateOrderStatus: await this.updateOrderStatus(),
        completeRelatedActivities: await this.completeRelatedActivities(),
        updateCustomerStats: await this.updateCustomerStats()
      }

      console.log('Workflow automation completed:', results)
      return {
        success: true,
        results
      }
    } catch (error) {
      console.error('Error in workflow automation:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export for cron job usage
export default WorkflowAutomationService
