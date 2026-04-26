const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getAvailableResources,
  createResource,
  updateResource,
  getResourceDistributions,
  createResourceDistribution,
  updateDistributionStatus
} = require('../controllers/resourceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Everyone can view resources
router.get('/', getAllResources);
router.get('/available', getAvailableResources);
router.get('/distributions', getResourceDistributions);

// NGO can create and update resources
router.post('/', authorizeRoles('NGO', 'Government'), createResource);
router.patch('/:resourceId', authorizeRoles('NGO', 'Government'), updateResource);

// Government/NGO can manage distributions
router.post('/distribute', authorizeRoles('Government', 'NGO'), createResourceDistribution);
router.patch('/distributions/:distributionId', authorizeRoles('Government', 'NGO'), updateDistributionStatus);

module.exports = router;

