const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, address, phone_number, role_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO Users (name, email, password, address, phone_number) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, phone_number || null]
    );

    const userId = result.insertId;

    // Assign role (default to Citizen if not provided)
    let finalRoleId = role_id;
    
    // Check if Roles table is empty and auto-initialize if needed
    const [roleCount] = await pool.execute('SELECT COUNT(*) as count FROM Roles');
    if (roleCount[0].count === 0) {
      // Auto-initialize default roles
      await pool.execute(`
        INSERT INTO Roles (role_name, role_description) VALUES
        ('Citizen', 'Regular citizen who can report emergencies'),
        ('Rescue Worker', 'Rescue worker who can handle emergency reports and tasks'),
        ('NGO', 'Non-governmental organization that can manage resources'),
        ('Government', 'Government agency with full access')
      `);
      console.log('✅ Auto-initialized default roles');
    }
    
    if (!finalRoleId) {
      // Look up Citizen role by name
      const [citizenRole] = await pool.execute(
        'SELECT role_id FROM Roles WHERE role_name = ?',
        ['Citizen']
      );
      
      if (citizenRole.length === 0) {
        // If Citizen role doesn't exist, try to get the first role
        const [firstRole] = await pool.execute(
          'SELECT role_id FROM Roles ORDER BY role_id LIMIT 1'
        );
        
        if (firstRole.length === 0) {
          return res.status(500).json({ error: 'No roles found in database. Please initialize roles first.' });
        }
        
        finalRoleId = firstRole[0].role_id;
      } else {
        finalRoleId = citizenRole[0].role_id;
      }
    } else {
      // Verify the provided role_id exists
      const [roleCheck] = await pool.execute(
        'SELECT role_id FROM Roles WHERE role_id = ?',
        [finalRoleId]
      );
      
      if (roleCheck.length === 0) {
        return res.status(400).json({ error: `Role with ID ${finalRoleId} does not exist` });
      }
    }
    
    await pool.execute(
      'INSERT INTO UserRole (user_id, role_id) VALUES (?, ?)',
      [userId, finalRoleId]
    );

    // Get user with roles
    const [users] = await pool.execute(
      'SELECT u.*, GROUP_CONCAT(r.role_name) as roles FROM Users u LEFT JOIN UserRole ur ON u.user_id = ur.user_id LEFT JOIN Roles r ON ur.role_id = r.role_id WHERE u.user_id = ? GROUP BY u.user_id',
      [userId]
    );

    const user = users[0];
    user.roles = user.roles ? user.roles.split(',') : [];

    // Generate token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone_number: user.phone_number,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user roles
    const [roles] = await pool.execute(
      'SELECT r.role_name FROM UserRole ur JOIN Roles r ON ur.role_id = r.role_id WHERE ur.user_id = ?',
      [user.user_id]
    );

    const userRoles = roles.map(r => r.role_name);

    // Generate token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone_number: user.phone_number,
        roles: userRoles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT u.*, GROUP_CONCAT(r.role_name) as roles FROM Users u LEFT JOIN UserRole ur ON u.user_id = ur.user_id LEFT JOIN Roles r ON ur.role_id = r.role_id WHERE u.user_id = ? GROUP BY u.user_id',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    user.roles = user.roles ? user.roles.split(',') : [];
    delete user.password;

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getProfile };

