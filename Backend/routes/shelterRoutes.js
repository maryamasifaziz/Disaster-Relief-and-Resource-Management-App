const express = require('express');
const router = express.Router();
const {
  getAllShelters,
  getShelter,
  createShelter,
  updateShelterOccupancy,
  getAvailableShelters,
  getSheltersByOccupancy
} = require('../controllers/shelterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Everyone can view shelters
router.get('/', getAllShelters);
router.get('/available', getAvailableShelters);
router.get('/:shelterId', getShelter);

// Analytics for government/NGO
router.get('/analytics/occupancy', authorizeRoles('Government', 'NGO'), getSheltersByOccupancy);

// Government/NGO can create and update shelters
router.post('/', authorizeRoles('Government', 'NGO'), createShelter);
router.patch('/:shelterId/occupancy', authorizeRoles('Government', 'NGO'), updateShelterOccupancy);

module.exports = router;

