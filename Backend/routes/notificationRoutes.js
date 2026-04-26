const express = require('express');
const router = express.Router();
const {
  getActiveNotifications,
  getAllNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Everyone can view active notifications
router.get('/active', getActiveNotifications);
router.get('/:notificationId', getNotification);

// Government can manage all notifications
router.get('/', authorizeRoles('Government'), getAllNotifications);
router.post('/', authorizeRoles('Government'), createNotification);
router.patch('/:notificationId', authorizeRoles('Government'), updateNotification);
router.delete('/:notificationId', authorizeRoles('Government'), deleteNotification);

module.exports = router;

