# Admin Testing Guide - ACSci Thunderstorm Alert System

## Quick Access

**Dashboard**: http://localhost:3000  
**Admin Username**: `admin`  
**Admin Password**: [your admin password]

---

## 1. Testing Manual Override Mode

### Steps:
1. Login as admin
2. Click "👨‍💼 Admin Panel"
3. Locate the PAGASA Alert Control Panel (red border)
4. Find the toggle switch at top-right (shows "🤖 AUTOMATIC MODE")

### Test Automatic → Manual:
1. Click the green toggle switch
2. Should turn yellow and show "🔧 MANUAL MODE"
3. Check backend terminal - should see: "🔧 Manual Override Mode ENABLED"
4. Wait 30 minutes - cron job should log: "⚠️ Manual Override Mode active - skipping automatic check"

### Test Manual Control:
1. While in Manual Mode, click "Set RED" button
2. Confirm the dialog
3. All users receive notification immediately
4. Dashboard theme changes to red (check by going back)
5. Weather conditions don't matter - level stays RED until you change it

### Test Manual → Automatic:
1. Click yellow toggle (turn it off)
2. Should turn green and show "🤖 AUTOMATIC MODE"
3. Check backend terminal - should see: "🔧 Manual Override Mode DISABLED"
4. Next cron cycle will resume automatic checks

**Use Case**: Test user responses during emergency drills without waiting for actual bad weather

---

## 2. Testing CSV Export

### Steps:
1. In Admin Panel, scroll to "📜 Alert Event History"
2. Click "📥 Export to CSV" button
3. Browser downloads file: `alert-history-[timestamp].csv`

### Verify CSV Contents:
```csv
Alert Level,Date,Time,Description,Triggered By
GREEN,12/24/2025,12:00:00 AM,"All clear: few clouds",Automatic Weather Check
YELLOW,12/24/2025,12:30:00 AM,"Light rain detected",Admin Override
```

### Check Data:
- ✅ All columns present
- ✅ Dates formatted correctly
- ✅ Times in 12-hour format
- ✅ Descriptions readable (commas replaced with semicolons)
- ✅ Triggered By shows "Automatic Weather Check" or "Admin Override"

**Use Case**: Generate monthly reports for school administration

---

## 3. Testing Log Deletion

### Delete Individual Entry:
1. In Event History table, find a log entry
2. Click "🗑️ Delete" button in Actions column
3. Confirm the dialog
4. Entry disappears from table
5. Check: Deleted entry not in next CSV export

### Reset All History:
1. Click "🗑️ Reset All History" button (top-right)
2. **First confirmation**: "⚠️ WARNING: This will permanently delete ALL event history!"
3. **Second confirmation**: "This action cannot be undone. Confirm deletion?"
4. All entries cleared
5. Table shows "No alert events recorded yet"
6. New log entry created: "All event history cleared (X entries)"

**Use Case**: Clean up test data before production deployment

---

## 4. Testing Alert Level Changes

### Automatic Detection (Green → Yellow):
**Goal**: Trigger YELLOW alert when rain detected

1. Ensure Manual Override is OFF (green switch)
2. Wait for next 30-minute check (12:00, 12:30, 1:00, etc.)
3. If light rain in forecast:
   - Backend logs: "🚨 Alert level changed: GREEN → YELLOW"
   - Push notification sent to all users
   - Dashboard theme turns yellow
   - Event log shows "Automatic Weather Check" trigger

### Manual Override (Yellow → Red):
**Goal**: Force RED alert regardless of weather

1. Toggle Manual Override ON (yellow switch)
2. Click "Set RED" button
3. Type custom message (optional): "Emergency drill - testing RED alert"
4. Confirm
5. All users receive RED notification immediately
6. Dashboard background turns red with pulsing animation
7. Event log shows "Admin Override" trigger

---

## 5. Testing Rainfall & Wind Display

### Check Current Weather Card:
**Location**: Dashboard → Below alert banner

**Verify Fields**:
- 🌡️ **Temperature**: Shows "23°C" (large) and "Feels: 21°C" (small)
- 💧 **Rainfall**: Shows "0.0 mm" or actual value, labeled "Last 3 hours"
- 💨 **Wind Speed**: Shows "19.4 km/h" (large) and "5.4 m/s" (small)
- 💦 **Humidity**: Shows "75%" labeled "Relative"
- ☁️ **Condition**: Shows "few clouds" capitalized

**Color Coding**:
- Rainfall: Blue if > 0 mm
- Wind: Cyan color
- Humidity: Green color

### Check 40-Point Forecast:
**Location**: Below current weather

**Verify Cards**:
- No emojis in descriptions ✅
- Each card shows:
  * Date and time
  * Condition (text only)
  * Temperature (large)
  * Rainfall: "0.5 mm" (formatted)
  * Wind: "19.4 km/h" (formatted)
  * Humidity: "75%" (formatted)
  * Rain Probability: "30%" (formatted)

**Highlighting**:
- Cards with rainfall > 0 have blue border

---

## 6. Testing PAGASA Thresholds

### Simulate Different Scenarios:

**Scenario A: Heavy Rain (RED)**
- When rainfall > 7.5 mm detected
- OR wind > 60 km/h (216 km/h = very rare, use manual override to test)
- Expected: Automatic RED alert
- Message: "SEVERE: Heavy rain (8.1mm) or strong winds detected"

**Scenario B: Moderate Rain (ORANGE)**
- When rainfall 2.5-7.5 mm detected
- OR wind 40-60 km/h
- Expected: Automatic ORANGE alert
- Message: "WARNING: Moderate rain (3.2mm) or moderate winds detected"

**Scenario C: Light Rain (YELLOW)**
- When rainfall > 0.1 mm detected
- Expected: Automatic YELLOW alert
- Message: "ADVISORY: Light rain (0.5mm) detected in Angeles City"

**Scenario D: No Rain (GREEN)**
- When rainfall = 0 mm AND wind < 40 km/h
- Expected: Automatic GREEN alert
- Message: "All clear: few clouds (5.4km/h wind)"

### Testing Methods:

**Method 1: Wait for Real Weather**
- Monitor next 30-minute check
- Observe backend logs for threshold evaluation

**Method 2: Use Manual Override**
- Toggle Manual Mode ON
- Set any level to simulate scenario
- Test user interface response

---

## 7. Testing "Get Current Briefing" Button

### During GREEN Status:
1. Login as student (or stay as admin)
2. Ensure push notifications enabled
3. Click "📘 Get Update Now" button
4. Should receive push notification immediately
5. Notification shows: Temperature, Condition, Wind, Humidity
6. Alert popup confirms: "A push notification has been sent!"

**Important**: Works during ALL alert levels (GREEN, YELLOW, ORANGE, RED)

---

## 8. Testing Student Registration

### Register New Student:
1. Logout from admin account
2. Click "Register" tab
3. Fill all 9 fields:
   - Username: `student4`
   - Password: `test123`
   - First Name: `Juan`
   - Middle Initial: `D`
   - Last Name: `Cruz`
   - Grade Level: `Grade 7` (dropdown)
   - Section: `Carabao` (dropdown updates based on grade)
   - LRN: `123456789012` (exactly 12 digits)
   - Sex: Select `Male` or `Female` (radio button)
4. Click "Register"
5. Should auto-login and see dashboard

### Verify in Admin Panel:
1. Login as admin
2. Go to Admin Panel
3. Scroll to "Student List"
4. Find newly registered student
5. Verify all fields captured correctly

---

## 9. Backend Terminal Monitoring

### What to Watch:

**Every 30 Minutes** (when automatic mode active):
```
🔍 [12/24/2025, 12:30:00 AM] ACSci Thunderstorm Alert Check (30-min precision)...
✅ Alert level unchanged: GREEN
   Current: 23.26°C, few clouds
```

**When Alert Level Changes**:
```
🚨 Alert level changed: GREEN → YELLOW
📘 Broadcasting routine briefing to 3 users...
✅ Briefing sent: 3, ❌ Failed: 0
```

**When Manual Override Active**:
```
⚠️ Manual Override Mode active - skipping automatic check
```

**When Admin Sets Alert Manually**:
```
🔧 Admin manually set alert level: GREEN → RED
✅ Alert level set to RED
```

---

## 10. Notification Testing

### Enable Push Notifications:
1. Login as student
2. Click "🔔 Enable Push Alerts"
3. Browser prompts: "Allow notifications?" → Click **Allow**
4. Shows: "🔔 Push Alerts Active"

### Trigger Notification:
1. Go to Admin Panel
2. Set alert level (any level)
3. Check phone/computer for notification
4. Notification should:
   - Show emoji (🟢🟡🟠🔴)
   - Include safety message
   - Play alarm sound (YELLOW/ORANGE/RED)
   - Vibrate device (if supported)

### Test on Multiple Devices:
- Desktop Chrome
- Mobile Chrome/Safari
- Arc browser
- Edge browser

---

## Common Issues & Solutions

### Issue 1: Toggle Switch Not Responding
**Solution**: 
- Refresh page
- Check AlertContext is polling (every 10 seconds)
- Verify backend is running

### Issue 2: CSV Export Empty
**Solution**:
- Check if event logs exist (Admin Panel → Event History)
- Try manual alert change first
- Check browser console for errors

### Issue 3: Cron Job Not Running
**Solution**:
- Check backend terminal for cron messages
- Verify server time is correct
- Check if manual override mode is active

### Issue 4: Notifications Not Appearing
**Solution**:
- Check browser notification permissions
- Verify "Push Alerts Active" shows
- Test with "Get Update Now" button
- Check service worker registration

### Issue 5: Theme Not Changing
**Solution**:
- Wait 10 seconds (polling interval)
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check AlertContext in browser console

---

## Emergency Testing Protocol

### Simulate Emergency Scenario:
1. **Enable Manual Override Mode**
2. **Set RED Alert** with message: "EMERGENCY DRILL - Severe weather detected"
3. **Verify All Users Notified**:
   - Check notification delivery
   - Confirm alarm sounds
   - Verify theme change
4. **Monitor Response Time**:
   - Backend logs show notification count
   - Event logs record timestamp
5. **Downgrade Alert**:
   - Set to ORANGE after 5 minutes
   - Set to YELLOW after 10 minutes
   - Set to GREEN when drill complete
6. **Disable Manual Override**
7. **Export CSV Report** of drill timeline

---

## Success Criteria

After testing, you should have:
- ✅ Manual override mode working
- ✅ CSV export with data
- ✅ Log deletion functional
- ✅ Alert levels changing automatically
- ✅ Rainfall/wind data displayed
- ✅ PAGASA thresholds applied correctly
- ✅ "Get Current Briefing" working during GREEN
- ✅ Student registration with 9 fields
- ✅ Push notifications delivering
- ✅ Theme syncing across users

---

**Testing Complete**: System ready for production deployment! 🎉
