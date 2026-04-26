const EntityFactory = require('../patterns/EntityFactory');
const { ResourceAllocator, AvailabilityStrategy, PriorityStrategy } = require('../patterns/AllocationStrategy');
const pool = require('../config/db');

// Get all resources
// const getAllResources = async (req, res) => {
//   try {
//     const [resources] = await pool.execute(
//       `SELECT r.*, u.name as ngo_name 
//        FROM Resource r 
//        LEFT JOIN Users u ON r.ngo_id = u.user_id 
//        ORDER BY r.last_updated DESC`
//     );

//     res.json({ resources });
//   } catch (error) {
//     console.error('Get resources error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
const getAllResources = async (req, res) => {
  try {
    const [resources] = await pool.execute(
      `SELECT r.*, u.name as ngo_name 
       FROM Resource r 
       LEFT JOIN Users u ON r.ngo_id = u.user_id 
       ORDER BY r.last_updated DESC`
    );

    // PATTERN: Strategy - switch allocation strategy based on request
    const strategyType = req.query.strategy || 'availability';
    
    const allocator = strategyType === 'priority'
      ? new ResourceAllocator(new PriorityStrategy())
      : new ResourceAllocator(new AvailabilityStrategy());

    const allocatedResources = allocator.allocate(resources);

    res.json({ resources: allocatedResources, strategy_used: strategyType });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available resources
const getAvailableResources = async (req, res) => {
  try {
    const [resources] = await pool.execute(
      `SELECT r.*, u.name as ngo_name 
       FROM Resource r 
       LEFT JOIN Users u ON r.ngo_id = u.user_id 
       WHERE r.resource_availability_status = 'Available' 
       ORDER BY r.last_updated DESC`
    );

    res.json({ resources });
  } catch (error) {
    console.error('Get available resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create resource (NGO)
const createResource = async (req, res) => {
  try {
    const {
      resource_type,
      resource_quantity,
      resource_desc,
      resource_expiry_date,
      distribution_location_address
    } = req.body;
    const ngo_id = req.user.user_id;

    if (!resource_type || !resource_quantity) {
      return res.status(400).json({ error: 'Resource type and quantity are required' });
    }

    // PATTERN: Factory - builds entity with default values
    const resourceEntity = EntityFactory.create('resource', { ngo_user_id: ngo_id, resource_name: resource_type, quantity: resource_quantity });

    const [result] = await pool.execute(
      `INSERT INTO Resource (resource_type, resource_quantity, resource_desc, resource_expiry_date, resource_availability_status, distribution_location_address, ngo_id, last_updated) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [resourceEntity.resource_name, resourceEntity.quantity, resource_desc || null, resource_expiry_date || null, resourceEntity.status, distribution_location_address || null, resourceEntity.ngo_user_id]
    );

    const [resources] = await pool.execute(
      'SELECT * FROM Resource WHERE resource_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Resource created successfully',
      resource: resources[0]
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const {
      resource_type,
      resource_quantity,
      resource_desc,
      resource_availability_status
    } = req.body;

    const updates = [];
    const values = [];

    if (resource_type) {
      updates.push('resource_type = ?');
      values.push(resource_type);
    }
    if (resource_quantity !== undefined) {
      updates.push('resource_quantity = ?');
      values.push(resource_quantity);
    }
    if (resource_desc !== undefined) {
      updates.push('resource_desc = ?');
      values.push(resource_desc);
    }
    if (resource_availability_status) {
      updates.push('resource_availability_status = ?');
      values.push(resource_availability_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('last_updated = NOW()');
    values.push(resourceId);

    await pool.execute(
      `UPDATE Resource SET ${updates.join(', ')} WHERE resource_id = ?`,
      values
    );

    const [resources] = await pool.execute(
      'SELECT * FROM Resource WHERE resource_id = ?',
      [resourceId]
    );

    res.json({
      message: 'Resource updated successfully',
      resource: resources[0]
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get resource distributions
const getResourceDistributions = async (req, res) => {
  try {
    const [distributions] = await pool.execute(
      `SELECT rd.*, r.resource_type, r.resource_desc, s.shelter_name, u.name as assigned_to_name 
       FROM ResourceDistribution rd 
       JOIN Resource r ON rd.resource_id = r.resource_id 
       JOIN Shelter s ON rd.shelter_id = s.shelter_id 
       LEFT JOIN Users u ON rd.assigned_to = u.user_id 
       ORDER BY rd.date_distributed DESC`
    );

    res.json({ distributions });
  } catch (error) {
    console.error('Get distributions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create resource distribution
const createResourceDistribution = async (req, res) => {
  try {
    const {
      resource_id,
      shelter_id,
      quantity_distributed,
      assigned_to,
      remarks
    } = req.body;

    if (!resource_id || !shelter_id || !quantity_distributed) {
      return res.status(400).json({ error: 'Resource ID, shelter ID, and quantity are required' });
    }

    // Check resource availability
    const [resources] = await pool.execute(
      'SELECT resource_quantity, resource_availability_status FROM Resource WHERE resource_id = ?',
      [resource_id]
    );

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resources[0].resource_availability_status !== 'Available') {
      return res.status(400).json({ error: 'Resource is not available' });
    }

    if (quantity_distributed > resources[0].resource_quantity) {
      return res.status(400).json({ error: 'Insufficient resource quantity' });
    }

    // Create distribution
    const [result] = await pool.execute(
      `INSERT INTO ResourceDistribution (resource_id, shelter_id, quantity_distributed, date_distributed, requested_at, status, assigned_to, remarks) 
       VALUES (?, ?, ?, NOW(), NOW(), 'Requested', ?, ?)`,
      [resource_id, shelter_id, quantity_distributed, assigned_to || null, remarks || null]
    );

    // Update resource quantity
    const newQuantity = resources[0].resource_quantity - quantity_distributed;
    const newStatus = newQuantity === 0 ? 'Distributed' : 'Available';
    
    await pool.execute(
      'UPDATE Resource SET resource_quantity = ?, resource_availability_status = ?, last_updated = NOW() WHERE resource_id = ?',
      [newQuantity, newStatus, resource_id]
    );

    const [distributions] = await pool.execute(
      'SELECT * FROM ResourceDistribution WHERE distribution_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Resource distribution created successfully',
      distribution: distributions[0]
    });
  } catch (error) {
    console.error('Create distribution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update distribution status
const updateDistributionStatus = async (req, res) => {
  try {
    const { distributionId } = req.params;
    const { status, dispatched_at, delivered_at } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates = ['status = ?'];
    const values = [status];

    if (dispatched_at) {
      updates.push('dispatched_at = ?');
      values.push(dispatched_at);
    }
    if (delivered_at) {
      updates.push('delivered_at = ?');
      values.push(delivered_at);
    }

    values.push(distributionId);

    await pool.execute(
      `UPDATE ResourceDistribution SET ${updates.join(', ')} WHERE distribution_id = ?`,
      values
    );

    const [distributions] = await pool.execute(
      'SELECT * FROM ResourceDistribution WHERE distribution_id = ?',
      [distributionId]
    );

    res.json({
      message: 'Distribution status updated successfully',
      distribution: distributions[0]
    });
  } catch (error) {
    console.error('Update distribution status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllResources,
  getAvailableResources,
  createResource,
  updateResource,
  getResourceDistributions,
  createResourceDistribution,
  updateDistributionStatus
};

