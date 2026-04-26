const EntityFactory = require('../patterns/EntityFactory');
const { emergencySubject } = require('../patterns/NotificationObserver');
const pool = require('../config/db');

// Create emergency report
const createReport = async (req, res) => {
  try {
    const { disaster_type, location_desc, latitude, longitude } = req.body;
    const user_id = req.user.user_id;

    if (!disaster_type || !location_desc) {
      return res.status(400).json({ error: 'Disaster type and location description are required' });
    }

    // PATTERN: Factory - creates DisasterReport entity
    const reportEntity = EntityFactory.create('disaster', { user_id, disaster_type, location: location_desc });    
    
    const [result] = await pool.execute(
    'INSERT INTO EmergencyReport (user_id, disaster_type, status, date_time, location_desc, latitude, longitude) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
    [reportEntity.user_id, reportEntity.disaster_type, reportEntity.status, reportEntity.location || null, latitude || null, longitude || null]
    );

    // PATTERN: Observer - notify all subscribers about new emergency
    emergencySubject.notify({ disaster_type, location_desc, status: reportEntity.status });

    const [reports] = await pool.execute(
      'SELECT * FROM EmergencyReport WHERE report_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Emergency report created successfully',
      report: reports[0]
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all emergency reports
const getAllReports = async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT er.*, u.name as reporter_name, u.email as reporter_email 
       FROM EmergencyReport er 
       JOIN Users u ON er.user_id = u.user_id 
       ORDER BY er.date_time DESC`
    );

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's own reports
const getUserReports = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [reports] = await pool.execute(
      'SELECT * FROM EmergencyReport WHERE user_id = ? ORDER BY date_time DESC',
      [user_id]
    );

    res.json({ reports });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const [reports] = await pool.execute(
      `SELECT er.*, u.name as reporter_name, u.email as reporter_email 
       FROM EmergencyReport er 
       JOIN Users u ON er.user_id = u.user_id 
       WHERE er.report_id = ?`,
      [reportId]
    );

    if (reports.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: reports[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update report status (for rescue workers)
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE EmergencyReport SET status = ? WHERE report_id = ?',
      [status, reportId]
    );

    const [reports] = await pool.execute(
      'SELECT * FROM EmergencyReport WHERE report_id = ?',
      [reportId]
    );

    res.json({
      message: 'Report status updated successfully',
      report: reports[0]
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get reports by disaster type (analytics)
const getReportsByType = async (req, res) => {
  try {
    const [results] = await pool.execute(
      `SELECT disaster_type, COUNT(*) as count, 
       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
       SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
       FROM EmergencyReport 
       GROUP BY disaster_type`
    );

    res.json({ analytics: results });
  } catch (error) {
    console.error('Get reports by type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getUserReports,
  getReport,
  updateReportStatus,
  getReportsByType
};

