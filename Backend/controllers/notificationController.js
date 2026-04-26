const pool = require('../config/db');

// Get all active notifications
const getActiveNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT n.*, u.name as created_by_name 
       FROM Notification n 
       LEFT JOIN Users u ON n.created_by = u.user_id 
       WHERE n.is_active = 1 
       ORDER BY n.datetime_sent DESC`
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all notifications (including inactive)
const getAllNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT n.*, u.name as created_by_name 
       FROM Notification n 
       LEFT JOIN Users u ON n.created_by = u.user_id 
       ORDER BY n.datetime_sent DESC`
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single notification
const getNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const [notifications] = await pool.execute(
      `SELECT n.*, u.name as created_by_name 
       FROM Notification n 
       LEFT JOIN Users u ON n.created_by = u.user_id 
       WHERE n.notification_id = ?`,
      [notificationId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification: notifications[0] });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create notification (Government)
const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    const created_by = req.user.user_id;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Notification (title, message, datetime_sent, is_active, created_by) 
       VALUES (?, ?, NOW(), 1, ?)`,
      [title, message, created_by]
    );

    const [notifications] = await pool.execute(
      'SELECT * FROM Notification WHERE notification_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Notification created successfully',
      notification: notifications[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { title, message, is_active } = req.body;

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (message) {
      updates.push('message = ?');
      values.push(message);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(notificationId);

    await pool.execute(
      `UPDATE Notification SET ${updates.join(', ')} WHERE notification_id = ?`,
      values
    );

    const [notifications] = await pool.execute(
      'SELECT * FROM Notification WHERE notification_id = ?',
      [notificationId]
    );

    res.json({
      message: 'Notification updated successfully',
      notification: notifications[0]
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete notification (soft delete by setting is_active to false)
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await pool.execute(
      'UPDATE Notification SET is_active = 0 WHERE notification_id = ?',
      [notificationId]
    );

    res.json({ message: 'Notification deactivated successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getActiveNotifications,
  getAllNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification
};

