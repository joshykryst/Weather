# ACSci Thunderstorm Alert System 🌩️

A real-time weather monitoring and alert system for Angeles City, Philippines, featuring push notifications, admin controls, and PAGASA-style alert levels.

## 🌟 Features

### For Students
- **Real-time Weather Monitoring** - Live updates from OpenWeather API for Angeles City
- **Push Notifications** - Receive instant alerts on desktop and mobile devices (iOS 16.4+ & Android)
- **PAGASA Alert Levels** - Color-coded warning system:
  - 🟢 **GREEN** - Normal conditions
  - 🟡 **YELLOW** - Be Alert
  - 🟠 **ORANGE** - Be Prepared
  - 🔴 **RED** - Take Action
- **Audio Siren Alerts** - Different siren patterns based on alert level
- **Vibration Alerts** - Device vibration for critical alerts (Android only)
- **PWA Support** - Install as standalone app on iPhone/iPad and Android
- **Profile Management** - Manage personal information and notification settings

### For Administrators
- **Alert Level Control** - Manually set alert levels with override mode
- **Student Management** - View registered students and their notification status
- **Broadcast System** - Send push notifications to all users
- **Event Logs** - Track all alert changes and system activities
- **Weather Monitoring Dashboard** - Real-time weather data and forecasts
- **Routine Briefings** - Automated daily weather summaries

## 📋 Prerequisites

- Node.js v14+ and npm
- MongoDB (local installation or MongoDB Atlas account)
- OpenWeather API key ([Get one free here](https://openweathermap.org/api))
- Web Push VAPID keys (auto-generated on setup)

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd Reaserch
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, OPENWEATHER_API_KEY
\`\`\`

#### Generate VAPID Keys

Run this command to generate Web Push VAPID keys:

\`\`\`bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
\`\`\`

Copy the output and paste into your \`.env\` file.

#### Configure Backend .env

Edit \`backend/.env\`:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/acsci-weather
PORT=5001
VAPID_PUBLIC_KEY=<your_generated_public_key>
VAPID_PRIVATE_KEY=<your_generated_private_key>
VAPID_EMAIL=mailto:admin@angelescity-weather.com
OPENWEATHER_API_KEY=<your_openweather_api_key>
\`\`\`

#### Start Backend Server

\`\`\`bash
npm start
\`\`\`

Backend will run on http://localhost:5001

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with backend URL
\`\`\`

#### Configure Frontend .env

Edit \`frontend/.env\`:

\`\`\`env
# For local development
REACT_APP_API_URL=http://localhost:5001

# For production (update with your deployed backend URL)
# REACT_APP_API_URL=https://your-backend.railway.app
\`\`\`

#### Start Frontend Server

\`\`\`bash
npm start
\`\`\`

Frontend will run on http://localhost:3000

## 👤 Default Admin Account

First user registered becomes admin. To promote existing user to admin:

\`\`\`bash
curl -X POST http://localhost:5001/api/promote-to-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username"}'
\`\`\`

## 📱 Mobile Setup (iOS/Android)

### iOS (16.4+)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Notifications require HTTPS (use ngrok or deploy to production)

### Android
1. Open the app in Chrome
2. Tap "Install App" prompt or menu → "Install App"
3. Allow notifications when prompted

## 🔔 Push Notifications

### Enable Notifications
1. Login to the app
2. Click "Enable Notifications" on dashboard
3. Allow browser notification permission
4. Test with "Test Siren" button

### Known Limitations
- **iOS Safari**: Vibration API not supported for web push (native app only)
- **HTTPS Required**: Push notifications only work on HTTPS (localhost exempt)

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- web-push (Web Push Protocol)
- node-cron (scheduled tasks)
- OpenWeather API

### Frontend
- React.js (create-react-app)
- React Router v6
- Tailwind CSS
- Axios
- Service Workers
- Web Audio API

## 📁 Project Structure

\`\`\`
Reaserch/
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.js
│   │   │   ├── LoginRegister.js
│   │   │   ├── MapComponent.js
│   │   │   ├── RainAlerts.js
│   │   │   ├── Settings.js
│   │   │   ├── Sidebar.js
│   │   │   └── WeatherDashboard.js
│   │   ├── contexts/
│   │   │   ├── AlertContext.js
│   │   │   └── ThemeContext.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
\`\`\`

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions including:
- Frontend deployment to Vercel/Netlify
- Backend deployment to Railway/Render
- MongoDB Atlas setup
- Environment variable configuration
- HTTPS setup for push notifications

## 🐛 Troubleshooting

### Servers Keep Crashing
Use process managers like PM2:
\`\`\`bash
npm install -g pm2
pm2 start backend/server.js --name "acsci-backend"
pm2 start "npm start" --name "acsci-frontend" --cwd frontend
\`\`\`

### Push Notifications Not Working
- Ensure HTTPS (or localhost)
- Check browser notification permissions
- Verify VAPID keys in backend .env
- Check service worker registration in browser DevTools

### MongoDB Connection Failed
- Verify MongoDB is running: \`brew services start mongodb-community\` (macOS)
- Check MONGODB_URI in .env
- For Atlas: Whitelist your IP address

### iOS App Won't Install
- Must be accessed via HTTPS (not HTTP)
- Check manifest.json configuration
- Try Safari only (Chrome iOS doesn't support PWA install)

## 📄 License

MIT License - feel free to use for educational purposes

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or issues, open a GitHub issue or contact the development team.

---

**Built for Angeles City Science High School** 🎓
