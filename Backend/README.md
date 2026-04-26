# Backend API - Disaster Relief Management

Node.js + Express REST API for the Disaster Relief & Resource Management Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v8.0+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=DisasterReliefDB
DB_PORT=3306

# Server Configuration
PORT=3000

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Database Setup

**IMPORTANT**: The database setup is done manually using SQL queries.

1. Run the SQL script from the root directory `Querry for db .txt` in your MySQL client
2. Insert default roles:

```sql
INSERT INTO Roles (role_name, role_description) VALUES
('Citizen', 'Regular citizen who can report emergencies'),
('Rescue Worker', 'Rescue worker who can handle emergency reports and tasks'),
('NGO', 'Non-governmental organization that can manage resources'),
('Government', 'Government agency with full access');
```

### Running the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## 📁 Project Structure

```
Backend/
├── config/
│   └── db.js                 # MySQL connection pool
├── controllers/              # Business logic
│   ├── authController.js
│   ├── emergencyController.js
│   ├── notificationController.js
│   ├── resourceController.js
│   ├── shelterController.js
│   └── taskController.js
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── emergencyRoutes.js
│   ├── notificationRoutes.js
│   ├── resourceRoutes.js
│   ├── shelterRoutes.js
│   └── taskRoutes.js
├── server.js                # Express app entry point
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Emergencies
- `GET /api/emergencies` - Get all emergencies
- `GET /api/emergencies/my-reports` - Get user's reports
- `POST /api/emergencies` - Create emergency report
- `PATCH /api/emergencies/:id/status` - Update status

### Shelters
- `GET /api/shelters` - Get all shelters
- `GET /api/shelters/available` - Get available shelters
- `POST /api/shelters` - Create shelter (Government)
- `PATCH /api/shelters/:id/occupancy` - Update occupancy

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Register resource
- `POST /api/resources/distribute` - Distribute resource
- `GET /api/resources/distributions` - Get distributions

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/my-tasks` - Get user's tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/status` - Update task status

### Notifications
- `GET /api/notifications/active` - Get active notifications
- `GET /api/notifications` - Get all (Government)
- `POST /api/notifications` - Create notification (Government)
- `PATCH /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📦 Dependencies

- `express` - Web framework
- `mysql2` - MySQL client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `body-parser` - Request body parsing

## 🛠 Development

```bash
# Install dependencies
npm install

# Run with auto-restart (nodemon)
npm run dev

# Run production
npm start
```

## 📝 Notes

- Database setup scripts have been removed - use the SQL file in root directory
- All passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours (configurable)
- CORS is enabled for all origins (configure for production)

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists
- Check firewall settings

### Port Already in Use
- Change PORT in `.env`
- Or kill process using port 3000

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format is correct

