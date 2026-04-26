const pool = require('../config/db');

// Get all shelters
const getAllShelters = async (req, res) => {
  try {
    const [shelters] = await pool.execute(
      'SELECT * FROM Shelter WHERE is_active = 1 ORDER BY shelter_name'
    );

    res.json({ shelters });
  } catch (error) {
    console.error('Get shelters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single shelter
const getShelter = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const [shelters] = await pool.execute(
      'SELECT * FROM Shelter WHERE shelter_id = ?',
      [shelterId]
    );

    if (shelters.length === 0) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    res.json({ shelter: shelters[0] });
  } catch (error) {
    console.error('Get shelter error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create shelter (Government/NGO)
const createShelter = async (req, res) => {
  try {
    const {
      shelter_name,
      managed_by,
      capacity,
      street_no,
      street_name,
      shelter_contact
    } = req.body;

    if (!shelter_name || !capacity) {
      return res.status(400).json({ error: 'Shelter name and capacity are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Shelter (shelter_name, managed_by, capacity, current_occupancy, is_active, last_updated, street_no, street_name, shelter_contact) 
       VALUES (?, ?, ?, 0, 1, NOW(), ?, ?, ?)`,
      [shelter_name, managed_by || null, capacity, street_no || null, street_name || null, shelter_contact || null]
    );

    const [shelters] = await pool.execute(
      'SELECT * FROM Shelter WHERE shelter_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Shelter created successfully',
      shelter: shelters[0]
    });
  } catch (error) {
    console.error('Create shelter error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update shelter occupancy
const updateShelterOccupancy = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const { current_occupancy } = req.body;

    if (current_occupancy === undefined) {
      return res.status(400).json({ error: 'Current occupancy is required' });
    }

    // Get current capacity
    const [shelters] = await pool.execute(
      'SELECT capacity FROM Shelter WHERE shelter_id = ?',
      [shelterId]
    );

    if (shelters.length === 0) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    if (current_occupancy > shelters[0].capacity) {
      return res.status(400).json({ error: 'Occupancy cannot exceed capacity' });
    }

    await pool.execute(
      'UPDATE Shelter SET current_occupancy = ?, last_updated = NOW() WHERE shelter_id = ?',
      [current_occupancy, shelterId]
    );

    const [updatedShelters] = await pool.execute(
      'SELECT * FROM Shelter WHERE shelter_id = ?',
      [shelterId]
    );

    res.json({
      message: 'Shelter occupancy updated successfully',
      shelter: updatedShelters[0]
    });
  } catch (error) {
    console.error('Update shelter occupancy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available shelters (with space)
const getAvailableShelters = async (req, res) => {
  try {
    const [shelters] = await pool.execute(
      'SELECT * FROM Shelter WHERE is_active = 1 AND current_occupancy < capacity ORDER BY (capacity - current_occupancy) DESC'
    );

    res.json({ shelters });
  } catch (error) {
    console.error('Get available shelters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get shelters with highest occupancy (analytics)
const getSheltersByOccupancy = async (req, res) => {
  try {
    const [shelters] = await pool.execute(
      `SELECT *, 
       (current_occupancy / capacity * 100) as occupancy_percentage 
       FROM Shelter 
       WHERE is_active = 1 
       ORDER BY occupancy_percentage DESC 
       LIMIT 10`
    );

    res.json({ shelters });
  } catch (error) {
    console.error('Get shelters by occupancy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllShelters,
  getShelter,
  createShelter,
  updateShelterOccupancy,
  getAvailableShelters,
  getSheltersByOccupancy
};

