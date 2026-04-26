const EntityFactory = require('../patterns/EntityFactory');
const pool = require('../config/db');

// Get all rescue tasks
const getAllTasks = async (req, res) => {
  try {
    const [tasks] = await pool.execute(
      `SELECT rt.*, er.disaster_type, er.location_desc, er.status as report_status, 
       u1.name as assigned_worker_name, u2.name as reporter_name 
       FROM RescueTask rt 
       JOIN EmergencyReport er ON rt.report_id = er.report_id 
       LEFT JOIN Users u1 ON rt.assigned_worker_id = u1.user_id 
       JOIN Users u2 ON er.user_id = u2.user_id 
       ORDER BY rt.assigned_date DESC`
    );

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get tasks assigned to a specific worker
const getWorkerTasks = async (req, res) => {
  try {
    const worker_id = req.user.user_id;
    const [tasks] = await pool.execute(
      `SELECT rt.*, er.disaster_type, er.location_desc, er.status as report_status, 
       u.name as reporter_name 
       FROM RescueTask rt 
       JOIN EmergencyReport er ON rt.report_id = er.report_id 
       JOIN Users u ON er.user_id = u.user_id 
       WHERE rt.assigned_worker_id = ? 
       ORDER BY rt.assigned_date DESC`,
      [worker_id]
    );

    res.json({ tasks });
  } catch (error) {
    console.error('Get worker tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const [tasks] = await pool.execute(
      `SELECT rt.*, er.disaster_type, er.location_desc, er.latitude, er.longitude, 
       er.status as report_status, u1.name as assigned_worker_name, 
       u2.name as reporter_name, u2.phone_number as reporter_phone 
       FROM RescueTask rt 
       JOIN EmergencyReport er ON rt.report_id = er.report_id 
       LEFT JOIN Users u1 ON rt.assigned_worker_id = u1.user_id 
       JOIN Users u2 ON er.user_id = u2.user_id 
       WHERE rt.task_id = ?`,
      [taskId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task: tasks[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create rescue task
const createTask = async (req, res) => {
  try {
    const { report_id, task_description, assigned_worker_id, remarks } = req.body;

    if (!report_id || !task_description) {
      return res.status(400).json({ error: 'Report ID and task description are required' });
    }

    // Check if report exists
    const [reports] = await pool.execute(
      'SELECT * FROM EmergencyReport WHERE report_id = ?',
      [report_id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ error: 'Emergency report not found' });
    }

    // PATTERN: Factory - builds entity with default values
    const taskEntity = EntityFactory.create('task', { report_id, assigned_to: assigned_worker_id, description: task_description });

    const [result] = await pool.execute(
      `INSERT INTO RescueTask (report_id, task_description, assigned_worker_id, task_status, assigned_date, last_updated, remarks) 
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?)`,
      [taskEntity.report_id, taskEntity.description, taskEntity.assigned_to || null, taskEntity.status, remarks || null]
    );

    // Update report status to "In Progress" if task is assigned
    if (assigned_worker_id) {
      await pool.execute(
        'UPDATE EmergencyReport SET status = ? WHERE report_id = ?',
        ['In Progress', report_id]
      );
    }

    const [tasks] = await pool.execute(
      'SELECT * FROM RescueTask WHERE task_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Rescue task created successfully',
      task: tasks[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { task_status, remarks } = req.body;

    if (!task_status) {
      return res.status(400).json({ error: 'Task status is required' });
    }

    const validStatuses = ['Assigned', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(task_status)) {
      return res.status(400).json({ error: 'Invalid task status' });
    }

    await pool.execute(
      'UPDATE RescueTask SET task_status = ?, remarks = ?, last_updated = NOW() WHERE task_id = ?',
      [task_status, remarks || null, taskId]
    );

    // If task is completed, update report status
    if (task_status === 'Completed') {
      const [tasks] = await pool.execute(
        'SELECT report_id FROM RescueTask WHERE task_id = ?',
        [taskId]
      );
      if (tasks.length > 0) {
        await pool.execute(
          'UPDATE EmergencyReport SET status = ? WHERE report_id = ?',
          ['Resolved', tasks[0].report_id]
        );
      }
    }

    const [updatedTasks] = await pool.execute(
      'SELECT * FROM RescueTask WHERE task_id = ?',
      [taskId]
    );

    res.json({
      message: 'Task status updated successfully',
      task: updatedTasks[0]
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Assign task to worker
const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigned_worker_id } = req.body;

    if (!assigned_worker_id) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    await pool.execute(
      'UPDATE RescueTask SET assigned_worker_id = ?, task_status = ?, assigned_date = NOW(), last_updated = NOW() WHERE task_id = ?',
      [assigned_worker_id, 'Assigned', taskId]
    );

    // Get report_id and update report status
    const [tasks] = await pool.execute(
      'SELECT report_id FROM RescueTask WHERE task_id = ?',
      [taskId]
    );
    if (tasks.length > 0) {
      await pool.execute(
        'UPDATE EmergencyReport SET status = ? WHERE report_id = ?',
        ['In Progress', tasks[0].report_id]
      );
    }

    const [updatedTasks] = await pool.execute(
      'SELECT * FROM RescueTask WHERE task_id = ?',
      [taskId]
    );

    res.json({
      message: 'Task assigned successfully',
      task: updatedTasks[0]
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllTasks,
  getWorkerTasks,
  getTask,
  createTask,
  updateTaskStatus,
  assignTask
};

