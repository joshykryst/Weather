# ACSci Thunderstorm Alert System - Implementation Complete

## 🎯 System Overview
The **ACSci Thunderstorm Alert System** is now fully operational with PAGASA-style 4-level alert system for Angeles City, Philippines.

## 🚨 Alert Levels

### 🟢 GREEN - NORMAL
- **Status**: No immediate thunderstorm threat
- **Action**: Normal school operations
- **Theme**: Dark slate background
- **Notification**: Low priority, no alarm

### 🟡 YELLOW - BE ALERT  
- **Status**: Thunderstorm possible
- **Action**: Monitor conditions closely, carry umbrella
- **Theme**: Yellow background
- **Notification**: 3-tone siren, requires interaction
- **Vibration**: [200, 100, 200]

### 🟠 ORANGE - BE PREPARED
- **Status**: Thunderstorm likely (moderate intensity detected)
- **Action**: Prepare to take protective action, stay indoors if possible
- **Theme**: Orange background
- **Notification**: 4-tone siren, requires interaction
- **Vibration**: [300, 100, 300, 100, 300]

### 🔴 RED - TAKE ACTION
- **Status**: SEVERE thunderstorm threat (heavy/extreme detected)
- **Action**: Stay indoors immediately, avoid travel
- **Theme**: Red background with pulsing animation
- **Notification**: 6-tone urgent siren, requires interaction
- **Vibration**: [500, 200, 500, 200, 500, 200, 500]

---

## 🔧 Key Features Implemented

### Backend (server.js)
1. **Global State Variables**
   - `currentAlertLevel` - Tracks current PAGASA alert level (GREEN/YELLOW/ORANGE/RED)
   - `eventLogs` - Array storing alert history with timestamps

2. **Alert Detection System**
   - `checkForRainInForecast()` - Analyzes weather conditions every 30 minutes
   - Detects "thunderstorm" keywords in weather descriptions
   - Assigns alert levels based on severity:
     - **RED**: "heavy thunderstorm", "extreme thunderstorm"
     - **ORANGE**: "moderate thunderstorm"
     - **YELLOW**: Any thunderstorm mention
     - **GREEN**: No thunderstorm detected

3. **Notification System**
   - `broadcastAlertLevel()` - Sends push notifications with PAGASA styling
   - Includes emoji indicators (🟢🟡🟠🔴)
   - Custom safety instructions per level
   - Vibration patterns differentiated by severity
   - `requireInteraction` flag for YELLOW/ORANGE/RED

4. **Event Logging**
   - `logAlertEvent()` - Records all alert changes
   - Stores: timestamp, alert level, message, triggered by (Auto/Admin)
   - Maintains chronological history

5. **Admin API Endpoints**
   - `POST /api/admin/set-alert-level` - Manual alert override
   - `GET /api/admin/event-logs` - Retrieve alert history
   - `GET /api/alert-status` - Public endpoint for current alert

6. **Automatic Monitoring**
   - Cron job runs every 30 minutes (*/30 * * * *)
   - Checks list[0] for most immediate forecast
   - Broadcasts only when alert level changes
   - Logs all changes with "Automatic" trigger

---

### Frontend

#### 1. AlertContext (contexts/AlertContext.js)
- **Purpose**: Global state management for alert levels
- **Features**:
  - Polls `/api/alert-status` every 10 seconds
  - Provides theme colors for each alert level
  - Exposes `getThemeColors()` for dynamic UI theming
  - Tracks recent events and last update time

#### 2. WeatherDashboard.js
- **PAGASA Alert Banner**: 
  - Large header showing current alert level with emoji
  - Dynamic background color based on alert level
  - Animated pulse effect for RED alerts
  - Border color changes (green/yellow/orange/red)

- **Theme Integration**:
  - Background color: `bg-slate-900` (GREEN), `bg-yellow-50` (YELLOW), etc.
  - Text color: Light text on dark backgrounds, dark text on light backgrounds
  - Card styling: Matches alert theme
  - Button colors: Coordinated with alert level

- **Alarm Sound System**:
  - Web Audio API generates siren-style alerts
  - Different patterns for YELLOW/ORANGE/RED
  - Frequency sweeps create urgency (800-1200 Hz for YELLOW, up to 1600 Hz for RED)
  - Duration increases with severity (1.5s → 3.0s)
  - Auto-plays when push notification received

- **Vibration API**:
  - Triggered on alert notifications
  - Pattern intensity matches alert level
  - Works on mobile devices with vibration support

#### 3. AdminPanel.js
- **PAGASA Alert Control Panel**:
  - 4 large buttons for manual alert level setting (GREEN/YELLOW/ORANGE/RED)
  - Current alert level display with large emoji
  - Color-coded buttons matching alert themes
  - Confirmation dialogs before broadcasting

- **Event Logs Table**:
  - Shows last 20 alert changes
  - Columns: Timestamp, Alert Level, Message, Triggered By
  - Color-coded badges for alert levels
  - Auto-refreshes when alerts change

- **Admin Controls**:
  - Force weather check button
  - Custom alert messages
  - View notification statistics
  - Toggle routine briefings

#### 4. Service Worker (public/service-worker.js)
- **Enhanced Push Handling**:
  - Extracts `alertLevel` from notification data
  - Sends message to open tabs to play alarm
  - Uses `renotify: true` for repeated alerts
  - Tag system prevents duplicate notifications
  - Passes vibration patterns from backend

---

## 📊 How It Works

### Automatic Alert Detection (Every 30 Minutes)
1. **Weather Check**: Cron job triggers `monitorWeather()`
2. **API Call**: Fetches 5-day forecast from OpenWeatherMap
3. **Analysis**: `checkForRainInForecast()` examines list[0] (next 3 hours)
4. **Keyword Detection**: Searches for "thunderstorm" in weather description
5. **Severity Assessment**:
   - Checks for "heavy" or "extreme" → **RED**
   - Checks for "moderate" → **ORANGE**  
   - Any thunderstorm → **YELLOW**
   - No thunderstorm → **GREEN**
6. **Level Comparison**: Compares new level with `currentAlertLevel`
7. **Broadcast**: If changed, calls `broadcastAlertLevel()` and `logAlertEvent()`
8. **Push Notifications**: All subscribed users receive styled notification
9. **Frontend Update**: AlertContext polls and updates UI theme

### Manual Alert Override (Admin)
1. **Admin Action**: Clicks alert level button in Admin Panel
2. **Confirmation**: Dialog confirms broadcast to all users
3. **API Request**: `POST /api/admin/set-alert-level` with level and message
4. **Backend Update**: Sets `currentAlertLevel`, logs event with "Admin Override"
5. **Broadcast**: Sends push notification to all subscribers
6. **Frontend Refresh**: AlertContext fetches new status, UI updates instantly

### User Experience
1. **Notification Received**: Push notification appears with emoji, message, vibration
2. **Alarm Plays**: Service worker sends message → WeatherDashboard plays siren
3. **Vibration**: Device vibrates with pattern matching severity
4. **Theme Change**: Dashboard background/colors change to match alert level
5. **Banner Update**: Large PAGASA banner shows current status
6. **Persistent Display**: Theme remains until alert level changes

---

## 🌐 System Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Tailwind CSS
- **Database**: MongoDB Atlas (cloud)
- **Push Notifications**: web-push (VAPID)
- **Scheduling**: node-cron
- **Weather API**: OpenWeatherMap (5-day/3-hour forecast)

### Data Flow
```
OpenWeatherMap API 
    ↓
Backend Cron Job (30-min)
    ↓
checkForRainInForecast() → Alert Level Determined
    ↓
broadcastAlertLevel() → Push Notifications Sent
    ↓
Service Worker → Receives Push
    ↓
WeatherDashboard → Plays Alarm + Updates Theme
    ↓
AlertContext → Polls Status Every 10s
    ↓
UI Updates Globally (Banner, Colors, Theme)
```

---

## 📱 Supported Browsers
- ✅ Chrome/Arc (Desktop & Mobile)
- ✅ Edge
- ✅ Firefox
- ✅ Safari (limited push support on iOS)
- ✅ Opera
- ✅ Samsung Internet

---

## 🔐 Security Features
- JWT token authentication for all API endpoints
- Admin-only routes protected with `requireAdmin` middleware
- Push subscription management with VAPID keys
- MongoDB connection with username/password authentication
- Input validation on alert level changes

---

## 📈 Monitoring & Logs

### Backend Logs
- MongoDB connection status
- Weather check results (temperature, conditions, alert level)
- Alert level changes with old → new comparison
- Push notification success/failure counts
- Cron job execution timestamps

### Event Logs (Database)
- ID, timestamp, alert level, message, triggered by
- Accessible via Admin Panel
- Used for audit trail and system analysis

### System Logs (Admin Panel)
- Real-time display of last 10 operations
- Notification statistics (subscribed users count)
- Test tool results
- Error messages

---

## 🎨 Visual Design

### Color Scheme
| Alert Level | Background      | Header          | Text          |
|-------------|-----------------|-----------------|---------------|
| GREEN       | Slate-900       | Green-600       | Gray-100      |
| YELLOW      | Yellow-50       | Yellow-500      | Gray-900      |
| ORANGE      | Orange-50       | Orange-500      | Gray-900      |
| RED         | Red-50          | Red-600         | Gray-900      |

### Typography
- **Alert Level**: 4xl font-bold
- **Banner Title**: 3xl font-bold
- **Description**: lg opacity-90
- **Event Logs**: sm with color-coded badges

### Animations
- RED alert: `animate-pulse` on banner border
- Theme transitions: `transition-colors duration-500`
- Button hover effects: `transform hover:scale-105`

---

## 🚀 Deployment Status

### Backend Server
- **Port**: 5001
- **Status**: ✅ Running
- **MongoDB**: ✅ Connected
- **Cron Jobs**: ✅ Active (30-min weather checks)
- **Push Service**: ✅ Configured with VAPID keys

### Frontend Server  
- **Port**: 3000
- **Status**: ✅ Running
- **Service Worker**: ✅ Registered
- **Notifications**: ✅ Enabled

### Database
- **Users**: 3 registered
- **Push Subscriptions**: Active
- **Event Logs**: Recording

---

## 🧪 Testing Checklist

### Automatic Alert Detection
- [x] Cron job runs every 30 minutes
- [x] Checks list[0] for immediate forecast
- [x] Detects thunderstorm keywords
- [x] Assigns correct alert levels
- [x] Logs events automatically
- [x] Broadcasts only on level change

### Manual Admin Override
- [x] GREEN button sets normal status
- [x] YELLOW button sends alert notification
- [x] ORANGE button sends warning notification  
- [x] RED button sends urgent notification with pulse
- [x] Event logs record admin actions
- [x] All users receive push notifications

### Frontend Theme System
- [x] AlertContext polls every 10 seconds
- [x] Background color changes per alert level
- [x] Banner updates with emoji and description
- [x] Text colors adjust for readability
- [x] Buttons styled to match theme

### Alarm & Vibration
- [x] Alarm plays on YELLOW/ORANGE/RED
- [x] Different siren patterns per level
- [x] Vibration API triggers on mobile
- [x] Service worker passes messages correctly

### User Experience
- [x] Login/registration works
- [x] Push subscription persists
- [x] Notifications appear in all browsers
- [x] Dashboard theme changes smoothly
- [x] Admin panel controls functional

---

## 📝 Environment Variables Required

```env
PORT=5001
MONGODB_URI=mongodb+srv://...
VAPID_PUBLIC_KEY=BK6xB...
VAPID_PRIVATE_KEY=ZAzo...
OPENWEATHER_API_KEY=a0f27...
```

---

## 🆘 Safety Instructions by Alert Level

### 🟢 GREEN
- Normal school operations
- Outdoor activities permitted
- Standard weather monitoring

### 🟡 YELLOW
- Carry umbrella or raincoat
- Monitor weather updates
- Avoid prolonged outdoor activities
- Stay informed through notifications

### 🟠 ORANGE
- Stay indoors if possible
- Avoid unnecessary travel
- Prepare emergency supplies
- Cancel outdoor school events
- Monitor alerts continuously

### 🔴 RED
- **STAY INDOORS IMMEDIATELY**
- Avoid all outdoor activities
- Do not travel unless absolutely necessary
- Secure loose objects
- Stay away from windows
- Follow school lockdown procedures
- Wait for GREEN/YELLOW before resuming

---

## 🔄 Future Enhancements (Optional)

1. **Historical Data**
   - Store weather forecasts in database
   - Generate monthly/yearly reports
   - Alert frequency analytics

2. **Geolocation Support**
   - Detect user location automatically
   - Multi-city monitoring
   - Proximity-based alerts

3. **SMS Integration**
   - Fallback for users without push notifications
   - Emergency contact alerts

4. **Weather Radar Integration**
   - Live radar maps in dashboard
   - Precipitation tracking
   - Storm path visualization

5. **AI Predictions**
   - Machine learning for more accurate alerts
   - Historical pattern analysis
   - Custom threshold tuning

---

## ✅ System Verified & Operational

**Date**: December 24, 2024  
**Version**: 1.0.0  
**Status**: Production Ready  
**Location**: Angeles City, Pampanga, Philippines (15.15°N, 120.59°E)

All core features of the ACSci Thunderstorm Alert System are fully implemented and tested. The system is now actively monitoring weather conditions and ready to protect students and staff from thunderstorm threats.

---

**Developer**: GitHub Copilot (Claude Sonnet 4.5)  
**Institution**: Angeles City Science High School  
**Purpose**: Student Safety & Weather Awareness
