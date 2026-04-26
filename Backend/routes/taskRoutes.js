const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getWorkerTasks,
  getTask,
  createTask,
  updateTaskStatus,
  assignTask
} = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Rescue workers can view their tasks
router.get('/my-tasks', authorizeRoles('Rescue Worker'), getWorkerTasks);

// Government/Rescue Worker can view all tasks
router.get('/', authorizeRoles('Rescue Worker', 'Government'), getAllTasks);
router.get('/:taskId', authorizeRoles('Rescue Worker', 'Government'), getTask);

// Government can create and assign tasks
router.post('/', authorizeRoles('Government'), createTask);
router.patch('/:taskId/assign', authorizeRoles('Government'), assignTask);

// Rescue workers can update their task status
router.patch('/:taskId/status', authorizeRoles('Rescue Worker', 'Government'), updateTaskStatus);

module.exports = router;

