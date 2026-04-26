const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getUserReports,
  getReport,
  updateReportStatus,
  getReportsByType
} = require('../controllers/emergencyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Citizens can create reports and view their own
router.post('/', createReport);
router.get('/my-reports', getUserReports);

// Rescue workers and admins can view all and update status
router.get('/', authorizeRoles('Rescue Worker', 'Government', 'NGO'), getAllReports);
router.get('/analytics', authorizeRoles('Government', 'NGO'), getReportsByType);
router.get('/:reportId', getReport);
router.patch('/:reportId/status', authorizeRoles('Rescue Worker', 'Government'), updateReportStatus);

module.exports = router;

