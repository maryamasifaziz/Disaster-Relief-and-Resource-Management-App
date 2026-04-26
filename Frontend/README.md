# Frontend - Disaster Relief Management Mobile App

React Native mobile application built with Expo for the Disaster Relief & Resource Management Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
```

### Environment Variables

Create a `.env` file in the Frontend directory:

```env
# Backend API URL
# For local development (emulator/simulator)
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For physical device testing, use your computer's IP
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**Important**: When testing on a physical device:
1. Find your computer's IP address
2. Update `EXPO_PUBLIC_API_URL` with the IP
3. Ensure backend allows connections from your network
4. Restart Expo server after changing .env

### Running the App

```bash
# Start Expo development server
npm start

# Or use specific platform commands
npm run android  # Launch on Android
npm run ios      # Launch on iOS (macOS only)
npm run web      # Launch in web browser
```

Press `a` for Android, `i` for iOS, or scan QR code with Expo Go app.

## 📱 Features

### User Interface
- **Bright, modern theme** - Light mode with clean design
- **Responsive layout** - Adapts to different screen sizes
- **Role-based navigation** - Different tabs based on user role
- **Real-time updates** - Live data from backend API

### Screens
- **Authentication** - Login and Registration
- **Dashboard** - Overview with statistics and recent activity
- **Emergencies** - Report and manage emergencies
- **Shelters** - View and manage shelter availability
- **Resources** - Manage resource inventory and distribution
- **Tasks** - Rescue task coordination (Rescue Workers/Government)
- **Notifications** - View and manage alerts (Government)
- **Profile** - User profile and settings

## 📁 Project Structure

```
Frontend/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication flow
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── emergencies.tsx
│   │   ├── shelters.tsx
│   │   ├── resources.tsx
│   │   ├── tasks.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   └── _layout.tsx          # Root layout
├── src/
│   ├── api/                 # API client and services
│   │   ├── client.ts        # Axios configuration
│   │   └── services.ts     # API service methods
│   ├── components/ui/       # Reusable UI components
│   │   ├── Screen.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SectionHeading.tsx
│   │   └── Feedback.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state
│   ├── hooks/
│   │   └── useAuth.ts       # Auth hook
│   ├── theme/
│   │   └── index.ts         # NativeBase theme
│   ├── types/
│   │   └── api.ts           # TypeScript types
│   └── utils/
│       └── roles.ts          # Role utilities
└── package.json
```

## 🎨 Theme & Styling

The app uses a **bright, light theme** with:
- White backgrounds and cards
- Gray text colors for readability
- Primary blue accent color
- Responsive padding and font sizes
- Shadow effects for depth

Theme is configured in `src/theme/index.ts` using NativeBase.

## 📱 Responsive Design

The app is responsive and adapts to different screen sizes:
- **Small screens** (< 400px): Single column layouts, reduced padding
- **Large screens** (> 400px): Two column layouts, standard padding
- Dynamic font sizes and spacing
- Flexible components that adjust to width

## 🔌 API Integration

The app communicates with the backend through:
- `src/api/client.ts` - Axios instance with interceptors
- `src/api/services.ts` - Service methods for each endpoint
- Automatic JWT token attachment
- Error handling and response interceptors

## 👥 User Roles

### Citizen
- Submit emergency reports
- View own reports
- View shelters and resources
- View notifications

### Rescue Worker
- All Citizen features
- View all emergencies
- Update emergency status
- Manage assigned tasks

### NGO
- All Citizen features
- Register resources
- Distribute resources
- View distribution history

### Government
- Full access to all features
- Manage all emergencies
- Manage shelters
- Manage resources
- Create notifications
- View all tasks

## 🛠 Development

### Available Scripts

```bash
npm start        # Start Expo dev server
npm run android  # Launch on Android
npm run ios      # Launch on iOS
npm run web      # Launch in browser
npm run lint     # Run ESLint
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
expo login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📦 Dependencies

### Core
- `expo` - Expo SDK
- `react-native` - React Native framework
- `expo-router` - File-based routing
- `native-base` - UI component library

### Navigation & UI
- `@react-navigation/native` - Navigation
- `react-native-safe-area-context` - Safe area handling
- `@expo/vector-icons` - Icon library

### API & State
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

### Forms & Validation
- `formik` - Form handling
- `yup` - Schema validation

### Utilities
- `react-native-toast-message` - Toast notifications

## 🐛 Troubleshooting

### Cannot connect to backend
- Check backend is running
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- For physical device, use IP address not localhost
- Check firewall settings

### Metro bundler issues
```bash
# Clear cache and restart
npm start -- --clear
```

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Expo Go connection issues
- Ensure phone and computer on same network
- Try tunnel mode: `expo start --tunnel`
- Check firewall allows Expo

## 📝 Notes

- Theme is set to light mode by default
- JWT tokens are stored in AsyncStorage
- Auto-logout on token expiration
- Pull-to-refresh on most screens
- Loading states for async operations
