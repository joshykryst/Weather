# 🚀 Quick Start Guide - Advanced Features

## Getting Started with the New ACSci Alert System

### 🔐 First Time Setup

1. **Access the System**
   - Open browser to: http://localhost:3000
   - You'll see the Login/Register page

2. **Create New Account (Students)**
   - Click "Sign Up" tab
   - Fill in ALL required fields:
     - Username (unique)
     - Password (min 6 characters)
     - First Name, M.I., Last Name
     - Grade Level (dropdown)
     - Section (auto-populated based on grade)
     - LRN (12 digits)
     - Sex (Male/Female/Other)
     - **📱 Phone Number** (OPTIONAL - can add later)
       - Format: `09123456789` or `+639123456789`
       - For emergency SMS alerts
   - Click "Sign Up"

3. **Login**
   - Enter your username (or LRN)
   - Enter your password
   - Click "Login"

---

## 🧭 Navigation Guide

### **Sidebar Menu** (Left Side)
The sidebar is your main navigation hub:

1. **📊 Dashboard** - Main weather monitoring page
2. **🗺️ Weather Map** - Interactive global weather visualization
3. **👨‍💼 Admin Panel** - (Admin users only) System management
4. **⚙️ Settings** - Account & security settings

**Sidebar Features**:
- Shows your profile picture (initials)
- Displays current alert level with animated pulse
- Theme toggle at bottom (Light/Dark mode)
- Logout button

**Mobile Users**:
- Tap hamburger menu (☰) to open sidebar
- Tap outside sidebar to close

---

## 🌓 Using Dark/Light Mode

### **Toggle Theme**
1. Look at the bottom of the sidebar
2. You'll see: `☀️ Light Mode` or `🌙 Dark Mode`
3. Click the toggle switch to change
4. Theme saves automatically!

**Dark Mode Benefits**:
- Easier on eyes at night
- Professional appearance
- All pages support dark mode

**Light Mode Benefits**:
- Better for bright environments
- Higher contrast for readability

---

## 🗺️ Using the Weather Map

### **Access**
1. Click **🗺️ Weather Map** in sidebar
2. Full-screen map loads automatically

### **Layer Controls**
Two buttons at top of map:

1. **💨 Wind Mode**
   - Shows wind patterns and directions
   - Arrows indicate wind flow
   - Colors show wind intensity
   - Default view

2. **🌧️ Rain Mode**
   - Shows precipitation overlay
   - Blue/green areas = rainfall
   - 2-hour forecast data
   - Combined with wind patterns

### **Map Features**
- Automatically centered on Angeles City
- Zoom with mouse wheel or pinch
- Drag to pan around
- Powered by Earth Nullschool (real-time data)

**Legend**:
- Check bottom sections for explanation of what each mode shows

---

## ⚙️ Settings Page

### **Access**
1. Click **⚙️ Settings** in sidebar
2. Your account information appears at top

### **Reset Password**
1. Enter your **Current Password**
2. Enter your **New Password** (min 6 characters)
3. **Confirm New Password**
4. Click "Change Password"
5. Success message appears!

### **Update Phone Number**

#### **If You Skipped It During Signup**:
1. Scroll to "Update Phone Number" section
2. Enter phone number:
   - Format: `09XXXXXXXXX` or `+639XXXXXXXXX`
   - Must be Philippine mobile number
3. Click "Send Verification Code"
4. Check console (F12 → Console) for mock code
5. Enter the 6-digit code
6. Click "Verify & Update"
7. Success! Phone number saved

**Why Add Phone?**
- Emergency SMS alerts during severe weather
- Account recovery option
- Enhanced security

---

## 📊 Dashboard Features

### **Current Weather Card** (Top)
5 columns of data:
1. 🌡️ **Temperature** - Current temp + feels like
2. 💧 **Rainfall** - Last 3 hours in mm (blue when raining)
3. 💨 **Wind Speed** - km/h + m/s
4. 💦 **Humidity** - Relative humidity %
5. ☁️ **Condition** - Weather description

### **40-Point Forecast Stream** (Scroll)
- Horizontal scrolling cards
- Each card shows 3-hour forecast
- Data includes:
  - Date & Time
  - Temperature
  - Rainfall (mm)
  - Wind speed (km/h)
  - Humidity (%)
  - Rain probability (%)
- **Blue border** = rainfall expected

### **Push Notifications**
1. Click "🔔 Enable Push Alerts"
2. Browser asks permission → Click "Allow"
3. You'll receive automatic alerts when weather changes!

---

## 👨‍💼 Admin Features (Admin Users Only)

### **Access Admin Panel**
- Click **👨‍💼 Admin Panel** in sidebar
- Full dashboard appears

### **Manual Override Mode**
**Toggle Switch** at top-right:
- **🤖 Green** = Automatic Mode (default)
  - System checks weather every 30 minutes
  - Alert levels change automatically
- **🔧 Yellow** = Manual Mode
  - Suspends automatic checks
  - Admin controls alert level manually
  - Perfect for testing user responses

### **Set Alert Level Manually**
1. Click one of the 4 alert buttons:
   - 🟢 GREEN - Normal
   - 🟡 YELLOW - Advisory
   - 🟠 ORANGE - Warning
   - 🔴 RED - Severe
2. Alert broadcasts to all users immediately!

### **Export Data to CSV**
1. Click **📥 Export to CSV** button
2. File downloads: `alert-history-[timestamp].csv`
3. Open in Excel/Google Sheets for analysis
4. Contains:
   - Alert Level
   - Date & Time
   - Description
   - Triggered By (Auto/Manual/Admin)

### **Manage Event Logs**
- **Delete Individual Entry**: Click 🗑️ next to log
- **Reset All History**: Click red "Reset All History" button
  - Double confirmation required!
  - Clears ALL logs permanently

### **Student Management**
- View all registered students
- See their grades, sections, LRN
- Check push notification status
- Filter and search capabilities

---

## 🔔 Understanding Alert Levels

### **Alert System (PAGASA-Based)**

#### 🟢 **GREEN - Normal**
- No immediate weather threat
- Light winds, no significant rain
- Safe to conduct outdoor activities
- Routine weather briefings only

#### 🟡 **YELLOW - Advisory**
- Light to moderate rain detected (>0.1mm)
- Wind: Normal
- Be aware of weather conditions
- Have umbrella ready
- Monitor for updates

#### 🟠 **ORANGE - Warning**
- Moderate to heavy rain (2.5-7.5mm) OR
- Wind speeds 40-60 km/h
- Outdoor activities may be affected
- Prepare for possible class suspension
- Stay alert for further warnings

#### 🔴 **RED - Severe**
- Heavy rain (>7.5mm) OR
- Wind speeds >60 km/h
- High risk of thunderstorms
- Stay indoors immediately
- Classes likely suspended
- Emergency protocols activated

### **What Happens During Alert Level Change**
1. **Background Color** changes (entire app)
2. **Push Notification** sent to all users
3. **Siren Sound** plays (Yellow/Orange/Red)
4. **Vibration** on mobile devices
5. **Modal Pop-up** with instructions
6. **Event Log** created for records

---

## 📱 Mobile Usage Tips

### **Responsive Design**
- All features work on mobile!
- Sidebar becomes overlay menu
- Cards stack vertically on small screens
- Touch-friendly buttons and controls

### **Best Practices**
1. **Enable Push Notifications** for instant alerts
2. **Add to Home Screen** for quick access
3. **Use Dark Mode** to save battery
4. **Check Map** for regional weather patterns

---

## 🔧 Troubleshooting

### **"I can't see the sidebar"**
- On mobile: Tap the hamburger menu (☰) at top-left
- On desktop: Sidebar should be visible on left side

### **"Dark mode isn't working"**
- Click the toggle switch in sidebar footer
- Wait 1 second for theme to apply
- Refresh page if needed

### **"Phone verification code not working"**
- Current version uses mock SMS (for testing)
- Check browser console (F12 → Console tab) for code
- Production version will send real SMS

### **"Weather Map not loading"**
- Check internet connection
- Earth Nullschool requires external access
- Try refreshing the page
- Switch between Wind/Rain modes

### **"Settings page blank"**
- Make sure you're logged in
- Check that token is valid
- Try logging out and back in

### **"Push notifications not working"**
- Click "Enable Push Alerts" button
- Allow permission when browser asks
- Check browser notification settings
- Ensure service worker is registered

---

## 🎯 Pro Tips

### **For Students**
1. **Enable push alerts** immediately after login
2. **Add phone number** in Settings for SMS backup
3. **Check dashboard** before leaving campus
4. **Use dark mode** during evening study
5. **Bookmark the app** for quick access

### **For Administrators**
1. **Test manual override** before rainy season
2. **Export logs weekly** for analysis
3. **Monitor student engagement** via notification stats
4. **Use manual mode** for emergency drills
5. **Keep event logs** for research data

### **For Researchers**
1. **Download CSV data** regularly
2. **Compare automatic vs manual** alert effectiveness
3. **Track student response times**
4. **Analyze alert accuracy** against actual weather
5. **Use data** for improving thresholds

---

## 📊 Feature Comparison

### **Old System → New System**

| Feature | Old | New |
|---------|-----|-----|
| Navigation | Single page | Multi-page with sidebar |
| Theme | Light only | Light + Dark mode |
| Phone | ❌ Not supported | ✅ With SMS verification |
| Settings | ❌ None | ✅ Full settings page |
| Weather Map | Basic embed | Interactive Nullschool |
| Mobile Menu | ❌ Not responsive | ✅ Collapsible sidebar |
| User Profile | Text only | Avatar + full details |
| Theme Toggle | ❌ None | ✅ Persistent toggle |
| Password Reset | ❌ Not available | ✅ In-app reset |

---

## 🌐 Browser Compatibility

**Fully Tested**:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (Desktop & Mobile)
- ✅ Mobile browsers (iOS/Android)

**Requirements**:
- JavaScript enabled
- Cookies/LocalStorage enabled
- Modern browser (2020+)
- Internet connection

---

## 🆘 Need Help?

### **Technical Issues**
- Check `/ADVANCED_FEATURES_COMPLETE.md` for full documentation
- Review `/ADMIN_TESTING_GUIDE.md` for admin features
- Consult `/FINAL_SYSTEM_FEATURES.md` for technical details

### **Feature Requests**
- Contact system administrator
- Submit feedback through admin panel

### **Emergency**
- Use Settings → Update Phone for SMS alerts
- Monitor dashboard for real-time updates
- Follow school emergency protocols

---

## ✅ Quick Checklist

**First Time Users**:
- [ ] Create account with all details
- [ ] Login successfully
- [ ] Enable push notifications
- [ ] Add phone number (Settings)
- [ ] Test dark mode toggle
- [ ] Explore weather map
- [ ] Check 40-point forecast

**Daily Usage**:
- [ ] Check current alert level
- [ ] Review today's forecast
- [ ] Monitor rainfall predictions
- [ ] Enable push if disabled
- [ ] Report any issues to admin

**Admin Users**:
- [ ] Review manual override status
- [ ] Export logs for analysis
- [ ] Monitor student registrations
- [ ] Test push notification system
- [ ] Verify automatic weather checks

---

## 🎉 Enjoy Your Enhanced Weather Alert System!

**Version**: 3.0.0  
**Last Updated**: December 24, 2025  
**Status**: Production Ready ✅

**Key New Features**:
- 🧭 Sidebar Navigation
- 🌓 Dark/Light Mode
- 📱 Phone Verification
- ⚙️ Settings Page
- 🗺️ Interactive Weather Map

**Questions?** Check the comprehensive documentation or contact your system administrator.

**Stay Safe, Stay Informed!** 🌦️
