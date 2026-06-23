# ACSci Thunderstorm Alert System - Quick Start Guide

## 🚀 Starting the System

### Backend Server (Terminal 1)
```bash
cd /Users/macbook/Desktop/Reaserch/backend
node server.js
```
✅ Server runs on http://localhost:5001  
✅ MongoDB connects automatically  
✅ Weather monitoring starts (30-min intervals)

### Frontend App (Terminal 2)
```bash
cd /Users/macbook/Desktop/Reaserch/frontend
npm start
```
✅ App runs on http://localhost:3000  
✅ Opens in browser automatically

---

## 👤 User Access

### Student Account
1. Register with:
   - First Name, Middle Initial, Last Name
   - Grade Level (7-12)
   - Section (varies by grade)
   - LRN (12-digit Learner Reference Number)
   - Sex (Male/Female)
   - Username & Password

2. After login:
   - See current weather dashboard
   - View alert level banner at top
   - Enable push notifications (🔔 Enable Push Alerts)
   - Click "📘 Get Update Now" for manual briefing
   - Dashboard theme changes with alert level

### Admin Account
**Username**: `admin`  
**Password**: (your admin password)

Admin Panel Features:
- **PAGASA Alert Control**: 4 buttons to manually set GREEN/YELLOW/ORANGE/RED
- **Event Logs**: View history of all alert changes
- **Student Management**: View/delete student accounts
- **Notification Stats**: See subscription counts
- **Test Tools**: Simulate notifications
- **Force Weather Check**: Manually trigger weather analysis
- **Toggle Routine Briefings**: Enable/disable 30-min updates

---

## 🚨 Alert Level Meanings

### 🟢 GREEN - All Clear
- No thunderstorm threat
- Normal operations
- Dark theme (comfortable viewing)

### 🟡 YELLOW - Be Alert  
- Thunderstorm possible
- Carry umbrella
- Yellow theme
- **Alarm**: 3-tone siren (1.5 seconds)
- **Vibration**: Short pattern

### 🟠 ORANGE - Be Prepared
- Thunderstorm likely (moderate intensity)
- Stay indoors if possible
- Orange theme  
- **Alarm**: 4-tone siren (2 seconds)
- **Vibration**: Medium pattern

### 🔴 RED - Take Action
- SEVERE thunderstorm (heavy/extreme)
- **STAY INDOORS IMMEDIATELY**
- Red theme with pulsing animation
- **Alarm**: 6-tone urgent siren (3 seconds)
- **Vibration**: Long intense pattern
- Notification requires interaction (can't auto-dismiss)

---

## 🔔 Push Notifications

### Enabling Push Notifications
1. Login to your account
2. Click "🔔 Enable Push Alerts"
3. Browser will ask: "Allow notifications?" → Click **Allow**
4. Green checkmark appears: "🔔 Push Alerts Active"
5. Test with "📘 Get Update Now" button

### Notification Features
- Works even when browser is closed
- Shows emoji (🟢🟡🟠🔴) for alert level
- Includes safety instructions
- Vibrates on mobile devices
- Plays alarm sound for YELLOW/ORANGE/RED
- Click "View Dashboard" to open app
- Click "Dismiss" to close

### Troubleshooting
- **Not receiving notifications?**
  - Check browser permissions (Settings → Site Settings → Notifications)
  - Make sure Push Alerts shows as "Active"
  - Try disabling and re-enabling

- **No alarm sound?**
  - Unmute device
  - Check browser audio permissions
  - Sound plays automatically for YELLOW/ORANGE/RED levels

---

## 👨‍💼 Admin Tasks

### Manual Alert Override
1. Login as admin
2. Click "👨‍💼 Admin Panel"
3. Scroll to "PAGASA Alert Level Control"
4. Click desired level button (GREEN/YELLOW/ORANGE/RED)
5. Confirm in dialog
6. **All users instantly notified!**

### View Alert History
- Scroll to "📜 Alert Event History" in Admin Panel
- Table shows: Time, Alert Level, Message, Triggered By
- See both automatic detections and admin overrides

### Manage Students
- View all registered students in table
- See details: Name, Grade, Section, LRN, Sex
- Delete accounts if needed
- Check notification subscription status

### Force Weather Check
- Click "🌤️ Force Weather Check (30-min)" button
- Manually triggers weather analysis
- Shows if rain/thunderstorm detected
- Updates alert level if needed

### Test Notifications
- **Test Simple Notification**: Basic browser notification
- **Simulate Rain Alert**: Test rain detection system
- **Check Permission Status**: Verify notification access

---

## 📊 How Automatic Alerts Work

### Every 30 Minutes
1. Backend server checks weather API
2. Analyzes next 3-hour forecast (list[0])
3. Searches for "thunderstorm" keyword
4. Determines severity:
   - "heavy thunderstorm" or "extreme thunderstorm" → **RED**
   - "moderate thunderstorm" → **ORANGE**
   - Any "thunderstorm" → **YELLOW**
   - No thunderstorm → **GREEN**
5. If alert level changes:
   - Logs event ("Automatic" trigger)
   - Broadcasts push notification to ALL users
   - Updates dashboard theme for everyone

### What Happens When Alert Changes
**User Experience:**
1. Phone/computer receives push notification
2. Alarm sound plays (YELLOW/ORANGE/RED)
3. Device vibrates (pattern matches severity)
4. Notification shows emoji + safety message
5. If dashboard is open, theme changes instantly
6. Banner updates with new alert level

**Backend Logging:**
- Event recorded in database
- Timestamp, alert level, message, trigger source
- Viewable in Admin Panel event logs

---

## 🎨 Theme Changes by Alert Level

| Alert | Background | Banner | Button | Text |
|-------|------------|--------|--------|------|
| 🟢 GREEN | Dark Slate | Green | Green | Light |
| 🟡 YELLOW | Light Yellow | Yellow | Yellow | Dark |
| 🟠 ORANGE | Light Orange | Orange | Orange | Dark |
| 🔴 RED | Light Red | Red (Pulsing) | Red | Dark |

Themes change automatically when alert level updates. No page refresh needed!

---

## 📱 Mobile Usage

### iOS (iPhone/iPad)
- Works in Safari and Chrome
- Push notifications: Add to Home Screen first
- Vibration supported
- Alarm sound plays

### Android
- Full support in Chrome, Firefox, Edge, Samsung Internet
- Push notifications work normally
- Vibration fully supported  
- Alarm sound plays

### Desktop
- Chrome/Arc: Full features
- Firefox: Full features
- Edge: Full features
- Safari: Limited push support

---

## 🔧 Troubleshooting

### "Push Alerts" button greyed out
- Service worker still loading, wait 3-5 seconds
- Refresh page
- Check browser console for errors

### Theme not changing
- AlertContext polls every 10 seconds
- Wait briefly after alert level changes
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Notifications not appearing
1. Check browser notification permissions
2. Ensure "Push Alerts Active" shows
3. Test with "Get Update Now" button
4. Admin can test with "Test Simple Notification"

### Backend not connecting
- Check if MongoDB Atlas IP whitelist includes your IP
- Verify .env file has correct credentials
- Check terminal for error messages
- Restart backend server

### Frontend build errors
- Run `npm install` in frontend directory
- Check Node.js version (should be 14+)
- Clear node_modules and reinstall

---

## 📞 System Status Indicators

### Backend Terminal
```
✅ MongoDB Connected Successfully
🚀 Initial weather check on server start
🔍 [timestamp] ACSci Thunderstorm Alert Check (30-min precision)...
✅ Alert level unchanged: GREEN
   Current: 23.26°C, few clouds
📘 Broadcasting routine briefing to 3 users...
✅ Briefing sent: 3, ❌ Failed: 0
```

### Frontend Browser
- Alert banner at top shows current level
- "🔔 Push Alerts Active" = notifications working
- Last updated time in header
- Theme matches current alert level

### Admin Panel Logs
- Real-time system logs in Developer Test Tools
- Event history table shows all changes
- Notification stats show subscription count

---

## ⚡ Quick Actions

### For Students
- 🔔 **Enable notifications**: Click "Enable Push Alerts"
- 📘 **Get update now**: Click blue "Get Update Now" button
- 👁️ **View alert**: Look at banner (top of page)
- 🌍 **See map**: Scroll to Earth Nullschool wind/rain map

### For Admins
- 🚨 **Set alert manually**: Admin Panel → Click alert level button
- 📜 **View history**: Scroll to Event History table
- 🌤️ **Force check**: Click "Force Weather Check"
- 🔧 **Test system**: Use Developer Test Tools
- 👥 **Manage students**: View/delete in student table
- 🔄 **Toggle briefings**: Switch on/off routine updates

---

## 🛡️ Safety Protocol

### When RED Alert 🔴
1. **Do NOT go outside**
2. Stay away from windows
3. Secure loose items
4. Cancel outdoor activities
5. Follow school lockdown procedures
6. Wait for alert to downgrade before resuming

### When ORANGE Alert 🟠
1. Move indoors if possible
2. Postpone outdoor activities
3. Prepare emergency supplies
4. Monitor updates continuously

### When YELLOW Alert 🟡
1. Carry umbrella/raincoat
2. Be ready to move indoors
3. Check weather frequently
4. Avoid prolonged outdoor activities

### When GREEN Alert 🟢
1. Normal operations
2. Standard precautions
3. Monitor for updates

---

## 📅 Monitoring Schedule

- **Automatic checks**: Every 30 minutes (0:00, 0:30, 1:00, 1:30...)
- **Manual checks**: Anytime via Admin Panel
- **Frontend polling**: Every 10 seconds
- **Weather data**: Real-time from OpenWeatherMap
- **Location**: Angeles City (15.15°N, 120.59°E)
- **Coverage**: 5-day forecast (40 data points)

---

## 🎓 For School Administration

### Daily Operations
1. Admin logs in each morning
2. Checks current alert level
3. Reviews event history
4. Verifies notification stats
5. Confirms system is operational

### Emergency Procedures
1. Severe weather detected → RED alert sent automatically
2. Admin can also manually set RED if needed
3. All students/staff notified immediately
4. School follows established safety protocols
5. Alert downgraded when safe

### System Maintenance
- Backend runs 24/7 (deploy on cloud server recommended)
- Frontend accessible from any device
- MongoDB stores all data securely
- Event logs for accountability
- No manual intervention required

---

## ✅ Pre-Use Checklist

Before relying on the system:
- [ ] Backend server running (localhost:5001)
- [ ] Frontend app running (localhost:3000)
- [ ] MongoDB connected successfully
- [ ] Weather check logs appearing every 30 min
- [ ] Test notification works
- [ ] Admin can manually set alert levels
- [ ] Student accounts can enable push notifications
- [ ] Theme changes when alert level changes
- [ ] Alarm sound plays on test
- [ ] Event logs recording properly

---

**System Status**: ✅ Fully Operational  
**Last Updated**: December 24, 2024  
**Support**: Check documentation in ACSCI_ALERT_SYSTEM_DOCUMENTATION.md
