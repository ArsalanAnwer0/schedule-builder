import dbConnect from '../db/connect';
import Notification from '../db/models/Notification';

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to receive the notification
 * @param {string} type - Notification type (availability_request, availability_submitted, schedule_published, etc.)
 * @param {string} message - The notification message
 * @param {string} actionUrl - Optional URL to navigate to when clicked
 * @returns {Promise<Object>} The created notification
 */
export async function createNotification(userId, type, message, actionUrl = null) {
  try {
    await dbConnect();

    const notification = await Notification.create({
      userId,
      type,
      message,
      actionUrl,
      read: false,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs to receive the notification
 * @param {string} type - Notification type
 * @param {string} message - The notification message
 * @param {string} actionUrl - Optional URL to navigate to when clicked
 * @returns {Promise<Array>} Array of created notifications
 */
export async function createBulkNotifications(userIds, type, message, actionUrl = null) {
  try {
    await dbConnect();

    const notifications = userIds.map(userId => ({
      userId,
      type,
      message,
      actionUrl,
      read: false,
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    throw error;
  }
}
