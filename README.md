# 🚨 Disaster Relief & Resource Management Platform

A comprehensive full-stack application for coordinating disaster relief efforts, connecting citizens, rescue workers, NGOs, and government agencies in real-time during emergencies.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React Native](https://img.shields.io/badge/react--native-0.81.5-blue.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange.svg)


## 🎯 Overview

Natural disasters such as floods and earthquakes cause communication breakdowns, leaving citizens stranded and slowing down rescue operations. This platform provides a centralized system for:

- **Citizens** to report emergencies and find shelters
- **Rescue Workers** to coordinate response efforts and manage tasks
- **NGOs** to manage and distribute resources
- **Government Agencies** to oversee operations and send alerts

The system enables real-time coordination, efficient resource distribution, and transparent communication during disaster situations.

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based access control (Citizen, Rescue Worker, NGO, Government)
- Secure JWT-based authentication
- User profile management

### 🆘 Emergency Management
- Real-time emergency reporting with location tracking
- Status tracking (Pending → In Progress → Resolved)
- Disaster type categorization
- Emergency report history

### 🏠 Shelter Management
- Shelter availability tracking
- Capacity and occupancy monitoring
- Real-time occupancy updates
- Shelter location and contact information

### 📦 Resource Management
- Resource inventory tracking
- Resource distribution to shelters
- Availability status monitoring
- Distribution history and analytics

### 📋 Task Coordination
- Rescue task assignment to workers
- Task status tracking
- Emergency report linking
- Task remarks and updates

### 📢 Notifications & Alerts
- Government-issued alerts
- Active notification feed
- Broadcast messaging to all users
- Notification management (Government only)

### 📊 Dashboard & Analytics
- Role-specific dashboards
- Real-time statistics
- Operations snapshot
- Recent activity feeds

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI Library**: NativeBase
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: Formik + Yup
- **Icons**: Expo Vector Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

### Database
- **RDBMS**: MySQL (Oracle MySQL)
- **Connection Pooling**: mysql2

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Expo CLI** (for mobile development)
- **Android Studio** (for Android development) or **Xcode** (for iOS development)
- **Postman** (for API testing) - [Download](https://www.postman.com/downloads/)

## 🚀 Quick Start

### 1. Clone the Repository


### 2. Database Setup

1. Start your MySQL server
2. Open MySQL Workbench or command line
3. Run the SQL script from `Querry for db .txt`:

```bash
mysql -u root -p < "Querry for db .txt"
```

Or copy and paste the contents of `Querry for db .txt` into your MySQL client.

4. Insert default roles:

```sql
INSERT INTO Roles (role_name, role_description) VALUES
('Citizen', 'Regular citizen who can report emergencies'),
('Rescue Worker', 'Rescue worker who can handle emergency reports and tasks'),
('NGO', 'Non-governmental organization that can manage resources'),
('Government', 'Government agency with full access');
```

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=DisasterReliefDB
DB_PORT=3306

# Server Configuration
PORT=3000

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Frontend Setup

Open a new terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` directory:

```env
# Backend API URL
# For local development
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For testing on physical device, use your machine's IP
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

Start the Expo development server:

```bash
npm start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go app.

## 📁 Project Structure

```
disaster-relief-management/
├── Backend/                    # Node.js + Express API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers
│   ├── middleware/            # Auth & validation middleware
│   ├── routes/                # API route definitions
│   ├── scripts/               # Utility scripts (empty - use SQL file)
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   └── NOTIFICATIONS_GUIDE.md # Notification system documentation
│
├── Frontend/                   # React Native + Expo app
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/            # Authentication screens
│   │   └── (tabs)/            # Main app tabs
│   ├── src/
│   │   ├── api/               # API client & services
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── theme/             # Theme configuration
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── assets/                # Images and static files
│   └── package.json           # Frontend dependencies
│
├── Querry for db .txt         # Database schema SQL script
├── Project Requirment .txt    # Project requirements
└── README.md                  # This file
```

## 🗄️ Database Setup

The database schema includes the following tables:

- **Users** - User accounts and profiles
- **Roles** - User roles (Citizen, Rescue Worker, NGO, Government)
- **UserRole** - Many-to-many relationship between users and roles
- **EmergencyReport** - Emergency reports from citizens
- **RescueTask** - Tasks assigned to rescue workers
- **Shelter** - Shelter information and occupancy
- **Resource** - Resource inventory from NGOs
- **ResourceDistribution** - Resource distribution tracking
- **Notification** - Government alerts and notifications

See `Querry for db .txt` for the complete schema.

## 🏃 Running the Application

### Development Mode

**Backend:**
```bash
cd Backend
npm run dev    # Starts with nodemon (auto-restart on changes)
# or
npm start      # Starts without auto-restart
```

**Frontend:**
```bash
cd Frontend
npm start      # Starts Expo development server
npm run android # Launch on Android
npm run ios     # Launch on iOS (macOS only)
npm run web     # Launch in web browser
```

### Production Mode

**Backend:**
```bash
cd Backend
npm start
```

**Frontend:**
Build using Expo Application Services (EAS):
```bash
cd Frontend
expo login
eas build --platform android
eas build --platform ios
```

## 👥 User Roles & Permissions

### 👤 Citizen
- ✅ Register and login
- ✅ Submit emergency reports
- ✅ View own emergency reports
- ✅ View active shelters
- ✅ View available resources
- ✅ View active notifications
- ❌ Cannot manage shelters, resources, or tasks
- ❌ Cannot create notifications

### 🚑 Rescue Worker
- ✅ All Citizen permissions
- ✅ View all emergency reports
- ✅ Update emergency report status
- ✅ View and manage assigned rescue tasks
- ✅ Update task status
- ❌ Cannot manage shelters or resources
- ❌ Cannot create notifications

### 🏢 NGO
- ✅ All Citizen permissions
- ✅ Register and manage resources
- ✅ Create resource distributions
- ✅ View distribution history
- ❌ Cannot manage emergency reports or tasks
- ❌ Cannot create notifications

### 🏛️ Government
- ✅ **Full access** to all features
- ✅ View all emergency reports
- ✅ Manage all rescue tasks
- ✅ Manage shelters (add, update occupancy)
- ✅ Manage resources and distributions
- ✅ Create, update, and delete notifications
- ✅ View analytics and reports

## 🔄 Application Flow

### 1. User Registration & Authentication
```
User → Register/Login → JWT Token → Authenticated Session
```

### 2. Emergency Reporting Flow (Citizen)
```
Citizen → Submit Emergency Report → 
  → Report saved with "Pending" status →
  → Rescue Worker/Government views report →
  → Status updated to "In Progress" →
  → Task assigned to Rescue Worker →
  → Status updated to "Resolved"
```

### 3. Resource Distribution Flow (NGO/Government)
```
NGO → Register Resource → 
  → Resource marked "Available" →
  → Government/NGO assigns to Shelter →
  → Distribution created →
  → Resource quantity updated →
  → Distribution status tracked
```

### 4. Notification Flow (Government)
```
Government → Create Notification →
  → Notification marked "Active" →
  → All users see notification on dashboard →
  → Government can deactivate/delete
```

### 5. Shelter Management Flow
```
Government → Add Shelter →
  → Set capacity and initial occupancy →
  → Update occupancy as needed →
  → Citizens view available shelters
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Emergency Endpoints
- `GET /api/emergencies` - Get all emergencies (Rescue Worker/Government)
- `GET /api/emergencies/my-reports` - Get user's reports (Citizen)
- `POST /api/emergencies` - Create emergency report
- `PATCH /api/emergencies/:id/status` - Update report status

### Shelter Endpoints
- `GET /api/shelters` - Get all shelters
- `GET /api/shelters/available` - Get available shelters
- `POST /api/shelters` - Create shelter (Government)
- `PATCH /api/shelters/:id/occupancy` - Update occupancy

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Register resource (NGO/Government)
- `POST /api/resources/distribute` - Distribute resource
- `GET /api/resources/distributions` - Get distribution history

### Task Endpoints
- `GET /api/tasks` - Get all tasks (Government)
- `GET /api/tasks/my-tasks` - Get user's tasks (Rescue Worker)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/status` - Update task status

### Notification Endpoints
- `GET /api/notifications/active` - Get active notifications
- `GET /api/notifications` - Get all notifications (Government)
- `POST /api/notifications` - Create notification (Government)
- `PATCH /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification

**Note**: All endpoints (except auth) require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🚀 Deployment

### Backend Deployment
1. Set up a cloud MySQL database (AWS RDS, Google Cloud SQL, etc.)
2. Update `.env` with production database credentials
3. Deploy to Heroku, AWS, DigitalOcean, or similar
4. Set environment variables on hosting platform

### Frontend Deployment
1. Update `EXPO_PUBLIC_API_URL` with production backend URL
2. Build using EAS:
   ```bash
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```
3. Submit to app stores:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 🧪 Testing

### Backend API Testing
Use Postman to test endpoints:
1. Import the API collection (create from endpoints above)
2. Set environment variables
3. Test authentication flow first
4. Test protected endpoints with JWT token

### Frontend Testing
- Test on multiple device sizes (responsive design implemented)
- Test all user roles
- Test offline scenarios
- Test form validations

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=DisasterReliefDB
DB_PORT=3306
PORT=3000
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```


## 👨‍💻 Authors
- Maryam Asif


**Made with ❤️ for disaster relief coordination**

