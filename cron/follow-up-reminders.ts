import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import Activity from '@/lib/models/Activity'
import User from '@/lib/models/User'
import { NotificationService } from '@/lib/services/notification-service'

/**
 * Follow-up Reminders Cron Job
 * 
 * This job runs every hour to:
 * 1. Send reminders for tasks with upcoming reminderDate
 * 2. Create follow-up tasks for activities marked "Follow-up Required"
 * 3. Mark overdue tasks as "Overdue"
 * 4. Send email notifications for task assignments
 */

export async function checkFollowUpReminders() {
  try {
    console.log('Starting follow-up reminders check...')
    await connectDB()

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 1. Send reminders for tasks with upcoming reminderDate
    const tasksNeedingReminders = await Task.find({
      reminderDate: { $lte: oneHourFromNow },
      reminderSent: false,
      status: { $in: ['Pending', 'In Progress'] }
    }).populate('assignedTo', 'name email')
      .populate('companyId', 'name')

    console.log(`Found ${tasksNeedingReminders.length} tasks needing reminders`)

    for (const task of tasksNeedingReminders) {
      try {
        // Send notification
        await NotificationService.sendNotification({
          userId: task.assignedTo._id,
          title: 'Task Reminder',
          message: `Reminder: ${task.title} is due soon`,
          type: 'task_reminder',
          priority: task.priority === 'Urgent' ? 'Urgent' : 'High',
          data: {
            taskId: task._id,
            dueDate: task.dueDate,
            priority: task.priority
          },
          relatedTaskId: task._id,
          sendEmail: true
        })

        // Mark reminder as sent
        task.reminderSent = true
        await task.save()

        console.log(`Sent reminder for task: ${task.title}`)
      } catch (error) {
        console.error(`Failed to send reminder for task ${task._id}:`, error)
      }
    }

    // 2. Create follow-up tasks for activities marked "Follow-up Required"
    const activitiesNeedingFollowUp = await Activity.find({
      outcome: 'Follow-up Required',
      status: 'Completed',
      nextFollowUpDate: { $lte: oneDayFromNow }
    }).populate('assignedTo', 'name email')
      .populate('companyId', 'name')

    console.log(`Found ${activitiesNeedingFollowUp.length} activities needing follow-up`)

    for (const activity of activitiesNeedingFollowUp) {
      try {
        // Check if follow-up task already exists
        const existingTask = await Task.findOne({
          relatedTo: 'Activity',
          relatedId: activity._id,
          status: { $in: ['Pending', 'In Progress'] }
        })

        if (!existingTask) {
          // Create follow-up task
          const followUpTask = new Task({
            companyId: activity.companyId,
            title: `Follow-up: ${activity.subject}`,
            description: `Follow up on: ${activity.description}`,
            type: 'Follow-up',
            relatedTo: 'Activity',
            relatedId: activity._id,
            assignedTo: activity.assignedTo,
            createdBy: activity.assignedTo,
            dueDate: activity.nextFollowUpDate || new Date(now.getTime() + 24 * 60 * 60 * 1000),
            priority: 'Medium',
            status: 'Pending',
            notes: `Auto-generated follow-up for activity: ${activity.subject}`
          })

          await followUpTask.save()

          // Send notification
          await NotificationService.sendNotification({
            userId: activity.assignedTo._id,
            title: 'Follow-up Task Created',
            message: `A follow-up task has been created for: ${activity.subject}`,
            type: 'task_created',
            data: {
              taskId: followUpTask._id,
              relatedActivityId: activity._id
            }
          })

          console.log(`Created follow-up task for activity: ${activity.subject}`)
        }
      } catch (error) {
        console.error(`Failed to create follow-up task for activity ${activity._id}:`, error)
      }
    }

    // 3. Mark overdue tasks as "Overdue"
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $in: ['Pending', 'In Progress'] }
    })

    console.log(`Found ${overdueTasks.length} overdue tasks`)

    for (const task of overdueTasks) {
      try {
        task.status = 'Overdue'
        await task.save()

        // Send overdue notification
        await NotificationService.sendNotification({
          userId: task.assignedTo,
          title: 'Task Overdue',
          message: `Task "${task.title}" is now overdue`,
          type: 'task_overdue',
          data: {
            taskId: task._id,
            dueDate: task.dueDate
          }
        })

        console.log(`Marked task as overdue: ${task.title}`)
      } catch (error) {
        console.error(`Failed to mark task as overdue ${task._id}:`, error)
      }
    }

    // 4. Send daily digest to managers for overdue tasks
    const managers = await User.find({
      role: { $in: ['admin', 'manager'] },
      companyId: { $exists: true }
    }).populate('companyId', 'name')

    for (const manager of managers) {
      try {
        const overdueCount = await Task.countDocuments({
          companyId: manager.companyId,
          status: 'Overdue'
        })

        if (overdueCount > 0) {
          await NotificationService.sendNotification({
            userId: manager._id,
            title: 'Daily Task Summary',
            message: `You have ${overdueCount} overdue tasks in your company`,
            type: 'daily_digest',
            data: {
              overdueCount,
              companyId: manager.companyId
            }
          })
        }
      } catch (error) {
        console.error(`Failed to send daily digest to manager ${manager._id}:`, error)
      }
    }

    console.log('Follow-up reminders check completed successfully')
    return {
      success: true,
      remindersSent: tasksNeedingReminders.length,
      followUpTasksCreated: activitiesNeedingFollowUp.length,
      overdueTasksMarked: overdueTasks.length
    }

  } catch (error) {
    console.error('Error in follow-up reminders check:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Export for cron job usage
export default checkFollowUpReminders
