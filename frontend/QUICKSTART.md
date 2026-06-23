# Weather Monitor Application - Quick Start Guide

## 🚀 Quick Start

### Prerequisites
You need Node.js installed on your system. If you don't have it:
- **Download**: https://nodejs.org/ (LTS version recommended)
- **Or use Homebrew**: `brew install node`

### Installation

1. **Run the setup script**:
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

2. **Start the backend** (Terminal 1):
\`\`\`bash
cd backend
npm start
\`\`\`

3. **Start the frontend** (Terminal 2):
\`\`\`bash
cd frontend
npm start
\`\`\`

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📋 Features

### ✅ Backend (Express.js)
- User registration and login (`/register`, `/login`)
- Protected route for weather configuration (`/weather-config`)
- In-memory user storage
- Token-based authentication

### ✅ Frontend (React + Tailwind CSS)

#### 🌧️ Rain Monitoring
- Polls OpenWeather API every hour
- Detects rain in 5-day forecast
- Shows rain alerts in a detailed table

#### 🔔 Browser Notifications
The app includes a **clear implementation of the Notification API**:

1. **Permission Button**: Prominent "Enable Notifications" button
2. **Permission Status**: Shows current status (`default`, `granted`, `denied`)
3. **Request Flow**: Click button → Browser prompts → Permission granted/denied
4. **Test Notification**: Sends confirmation when permission granted
5. **Rain Alerts**: Automatic notifications when rain is detected

**Implementation Code** (in WeatherDashboard.js):
\`\`\`javascript
// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      new Notification('🎉 Notifications Enabled!', {
        body: 'You will now receive rain alerts.',
        icon: '☔'
      });
    }
  }
};

// Send rain notification
const sendRainNotification = (rainData) => {
  const notification = new Notification('⛈️ Rain Alert!', {
    body: \`Rain expected on \${rainData.time.toLocaleDateString()} at \${rainData.time.toLocaleTimeString()}. \${rainData.description}\`,
    icon: '☔',
    tag: 'rain-alert',
    requireInteraction: true
  });
};
\`\`\`

#### 🗺️ Interactive Map
- Earth.nullschool.net iframe integration
- Toggle switch for Wind/Rain views
- Real-time global weather visualization

#### 🎨 Glassmorphism UI
- Dark slate background with gradient
- Blur effects and transparency
- Modern, professional design
- Animated rain alerts

---

## 🏗️ Technical Architecture

### Data Flow Diagram

\`\`\`
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Login/Register
       ▼
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │
       │ 2. Request City Config
       ▼
┌─────────────┐      ┌──────────────┐
│   Backend   │◄────►│ User Storage │
│  (Express)  │      │  (in-memory) │
└──────┬──────┘      └──────────────┘
       │
       │ 3. Token Validation
       │
       ▼
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       │ 4. Fetch Weather (every hour)
       ▼
┌──────────────┐
│  OpenWeather │
│     API      │
└──────┬───────┘
       │
       │ 5. Parse Forecast
       ▼
┌─────────────┐
│  Frontend   │
│  (Rain      │
│  Detection) │
└──────┬──────┘
       │
       │ 6. If rain detected & permission granted
       ▼
┌─────────────┐
│  Browser    │
│ Notification│
│     API     │
└─────────────┘
\`\`\`

### Components Architecture

**App.js** (Root)
- Manages authentication state
- Handles login/logout
- Routes between LoginRegister and WeatherDashboard

**LoginRegister.js**
- User authentication forms
- Registration with city selection
- Error handling

**WeatherDashboard.js** (Main Dashboard)
- Fetches weather data hourly
- Manages notification permissions
- Coordinates all child components

**RainAlerts.js**
- Displays rain forecast table
- Shows date, time, description, temperature, probability
- Animated alerts when rain detected

**MapComponent.js**
- Earth.nullschool.net iframe
- Toggle between Wind/Rain views
- Interactive global weather map

---

## 🔑 API Endpoints

### Backend Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Register new user |
| POST | /login | No | Login existing user |
| GET | /weather-config | Yes | Get user's saved city |
| PUT | /weather-config | Yes | Update user's city |

### OpenWeather API Integration

- **Endpoint**: `https://api.openweathermap.org/data/2.5/forecast`
- **API Key**: `a0f27a050036bd633ba6d968889baaab` (already integrated)
- **Polling Interval**: Every 1 hour (3600000 ms)
- **Data Retrieved**: 5-day forecast with 3-hour intervals

---

## 📁 Project Structure

\`\`\`
Reaserch/
├── backend/
│   ├── server.js           # Express API server
│   └── package.json        # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeatherDashboard.js  # Main dashboard with notifications
│   │   │   ├── LoginRegister.js     # Authentication forms
│   │   │   ├── MapComponent.js      # Interactive map with toggle
│   │   │   └── RainAlerts.js        # Rain forecast table
│   │   ├── App.js          # Root component
│   │   ├── App.css         # Glassmorphism styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Tailwind CSS imports
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS config
│
├── setup.sh                # Installation script
├── QUICKSTART.md           # This file
└── README.md               # Detailed documentation
\`\`\`

---

## 🔔 Notification API - Detailed Implementation

### Permission States

1. **default**: User hasn't been asked yet
2. **granted**: User allowed notifications
3. **denied**: User blocked notifications

### Implementation Flow

\`\`\`javascript
// 1. Check if browser supports notifications
if ('Notification' in window) {
  // 2. Display current permission status
  setNotificationPermission(Notification.permission);
  
  // 3. Request permission when user clicks button
  const permission = await Notification.requestPermission();
  
  // 4. Handle the response
  if (permission === 'granted') {
    // 5. Send test notification
    new Notification('Welcome!', {
      body: 'Notifications enabled',
      icon: '☔'
    });
  }
}

// 6. Send rain notifications automatically
if (rainDetected && permission === 'granted') {
  new Notification('Rain Alert!', {
    body: 'Rain expected at 3:00 PM',
    tag: 'rain-alert',
    requireInteraction: true
  });
}
\`\`\`

### UI Components

The app clearly shows:
- ✅ Yellow-bordered notification card when permission not granted
- ✅ "Enable Notifications" button
- ✅ Current permission status display
- ✅ Instructions for the user

---

## 🛠️ Development

### Backend Development
\`\`\`bash
cd backend
npm run dev  # Uses nodemon for auto-reload
\`\`\`

### Frontend Development
\`\`\`bash
cd frontend
npm start    # Hot reload enabled
\`\`\`

---

## 🚨 Important Notes

### Security
- Backend uses simple token authentication (not JWT)
- Passwords are NOT hashed (implement bcrypt for production)
- In-memory storage (data lost on restart)
- Use a database (MongoDB, PostgreSQL) for production

### Browser Compatibility
- Notification API requires HTTPS in production
- Works on localhost without HTTPS
- Not supported in all browsers (check caniuse.com)

### Production Deployment
Before deploying:
1. Implement proper password hashing
2. Use a real database
3. Implement JWT tokens
4. Enable HTTPS
5. Secure API keys in environment variables

---

## 🎨 Styling Details

### Glassmorphism Effect
\`\`\`css
.glass-dark {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
\`\`\`

### Color Scheme
- Background: Gradient from slate-900 via purple-900
- Cards: Semi-transparent slate-900 with blur
- Text: White and gray-300
- Accents: Blue-500 for interactive elements

---

## 🐛 Troubleshooting

### "npm not found"
Install Node.js: https://nodejs.org/

### "Port already in use"
Kill the process using the port:
\`\`\`bash
lsof -ti:5000 | xargs kill  # Backend
lsof -ti:3000 | xargs kill  # Frontend
\`\`\`

### Notifications not working
- Check browser permissions in settings
- Ensure you clicked "Allow" when prompted
- Notifications require HTTPS in production (but work on localhost)

### Weather data not loading
- Check OpenWeather API key is correct
- Verify internet connection
- Check browser console for errors

---

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify both servers are running
3. Check network tab for API requests
4. Ensure Node.js is properly installed

---

Enjoy your weather monitoring experience! 🌦️☔
