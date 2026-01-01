import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import webpush from 'web-push';
import cron from 'node-cron';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    
    // Create admin account if it doesn't exist
    try {
      let adminExists = await User.findOne({ username: 'admin' });
      if (!adminExists) {
        const adminUser = new User({
          username: 'admin',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          city: 'Angeles City, PH',
          token: `token_admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        await adminUser.save();
        console.log('✅ Admin account created: username=admin, password=admin123');
      } else {
        // Update existing admin password to admin123
        adminExists.password = 'admin123';
        await adminExists.save();
        console.log('✅ Admin account updated: username=admin, password=admin123');
      }
    } catch (error) {
      console.error('❌ Error creating admin account:', error);
    }
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@angelescity-weather.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Weather Monitoring Configuration
const ANGELES_CITY_LAT = 15.15;
const ANGELES_CITY_LON = 120.59;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Global setting for routine briefings
let routineBriefingsEnabled = true;
let lastWeatherUpdate = null;

// PAGASA Alert System
let currentAlertLevel = 'GREEN'; // GREEN, YELLOW, ORANGE, RED
let eventLogs = [];
let manualOverrideMode = false; // Toggle between automatic and manual mode

// Function to fetch weather data for Angeles City
async function fetchAngelesWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${ANGELES_CITY_LAT}&lon=${ANGELES_CITY_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching weather:', error);
    return null;
  }
}

// Function to check IMMEDIATE next forecast (list[0]) with rainfall and wind thresholds
function checkForRainInForecast(weatherData) {
  if (!weatherData || !weatherData.list || weatherData.list.length === 0) return null;

  // Check the MOST IMMEDIATE forecast (list[0]) - the next data point
  const nextForecast = weatherData.list[0];
  const weather = nextForecast.weather[0];
  const description = weather.description.toLowerCase();
  const main = weather.main.toLowerCase();
  
  // Get rainfall (mm in last 3 hours) and wind speed (m/s)
  const rainfall3h = nextForecast.rain?.['3h'] || 0; // Rainfall in mm over 3 hours
  const rainfallPerHour = rainfall3h / 3; // Convert to mm/hr
  const windSpeed = nextForecast.wind.speed; // Wind speed in m/s
  const windSpeedKmh = windSpeed * 3.6; // Convert m/s to km/h
  
  // PAGASA Official Thresholds:
  // Yellow: 7.5-15 mm/hr (heavy rain)
  // Orange: 15-30 mm/hr (intense rain)  
  // Red: >30 mm/hr (torrential rain)
  
  let alertLevel = 'GREEN';
  let alertMessage = 'No immediate weather threat';
  
  // RED: Torrential rain (>30mm/hr) OR Severe winds (>60kph)
  if (rainfallPerHour > 30 || windSpeedKmh > 60) {
    alertLevel = 'RED';
    alertMessage = `SEVERE THREAT: ${rainfallPerHour > 30 ? `Torrential rain ${rainfallPerHour.toFixed(1)}mm/hr` : ''} ${windSpeedKmh > 60 ? `Strong winds ${windSpeedKmh.toFixed(1)}km/h` : ''}`;
  }
  // ORANGE: Intense rain (15-30mm/hr) OR Moderate-strong winds (40-60kph)
  else if (rainfallPerHour >= 15 || (windSpeedKmh >= 40 && windSpeedKmh <= 60)) {
    alertLevel = 'ORANGE';
    alertMessage = `WARNING: ${rainfallPerHour >= 15 ? `Intense rain ${rainfallPerHour.toFixed(1)}mm/hr` : ''} ${windSpeedKmh >= 40 ? `Moderate winds ${windSpeedKmh.toFixed(1)}km/h` : ''}`;
  }
  // YELLOW: Heavy rain (7.5-15mm/hr) OR Light rain with description mention
  else if (rainfallPerHour >= 7.5 || (rainfallPerHour >= 5 && (description.includes('rain') || main.includes('rain')))) {
    alertLevel = 'YELLOW';
    alertMessage = `ADVISORY: Heavy rain ${rainfallPerHour.toFixed(1)}mm/hr detected in Angeles City`;
  }
  // GREEN: No significant rain or only light drizzle (<5mm/hr)
  else {
    alertLevel = 'GREEN';
    if (rainfallPerHour > 0 && rainfallPerHour < 5) {
      alertMessage = `Light rain ${rainfallPerHour.toFixed(1)}mm/hr - ${weather.description} (${windSpeedKmh.toFixed(1)}km/h wind)`;
    } else {
      alertMessage = `All clear: ${weather.description} (${windSpeedKmh.toFixed(1)}km/h wind)`;
    }
  }

  const hasRain = rainfall3h > 0 || main.includes('rain');
  
  const rainTime = new Date(nextForecast.dt * 1000);
  const formattedTime = rainTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return {
    hasRain,
    alertLevel,
    alertMessage,
    nextRainTime: formattedTime,
    description: weather.description,
    temperature: nextForecast.main.temp,
    timestamp: nextForecast.dt,
    windSpeed: nextForecast.wind.speed,
    windSpeedKmh: windSpeedKmh.toFixed(1),
    humidity: nextForecast.main.humidity,
    rainfall: rainfallPerHour.toFixed(1),
    rainfall3h: rainfall3h.toFixed(1)
  };
}

// Function to send daily briefing (blue style - routine update)
async function broadcastDailyBriefing(weatherInfo) {
  try {
    const users = await User.find({ pushSubscription: { $ne: null } });
    
    console.log(`📘 Broadcasting routine briefing to ${users.length} users...`);

    const payload = JSON.stringify({
      title: '📘 Weather Briefing - Angeles City',
      body: `Currently ${weatherInfo.temperature}°C, ${weatherInfo.description}. Wind: ${weatherInfo.windSpeed} m/s. Next update in 30 minutes.`,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'daily-briefing',
      data: {
        url: '/',
        weatherInfo: weatherInfo,
        timestamp: Date.now(),
        type: 'briefing'
      }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send briefing to ${user.username}:`, error.message);
        failCount++;
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
          console.log(`Removed invalid subscription for ${user.username}`);
        }
      }
    }

    console.log(`✅ Briefing sent: ${successCount}, ❌ Failed: ${failCount}`);
    return { successCount, failCount };
  } catch (error) {
    console.error('❌ Briefing broadcast error:', error);
    return { successCount: 0, failCount: 0 };
  }
}

// Function to send alert level notifications with PAGASA styling
async function broadcastAlertLevel(alertInfo) {
  try {
    const users = await User.find({ pushSubscription: { $ne: null } });
    
    console.log(`🚨 Broadcasting ${alertInfo.alertLevel} ALERT to ${users.length} users...`);

    // Alert level specific configuration
    const alertConfig = {
      'GREEN': {
        emoji: '🟢',
        title: 'Weather Status: NORMAL',
        vibrate: null
      },
      'YELLOW': {
        emoji: '🟡',
        title: 'THUNDERSTORM ALERT: BE ALERT',
        safety: 'Prepare umbrella. Avoid open areas. Monitor weather updates.',
        vibrate: [200, 100, 200]
      },
      'ORANGE': {
        emoji: '🟠',
        title: 'THUNDERSTORM ALERT: BE PREPARED',
        safety: 'Stay indoors. Unplug electronics. Avoid travel if possible.',
        vibrate: [300, 100, 300, 100, 300]
      },
      'RED': {
        emoji: '🔴',
        title: 'SEVERE THUNDERSTORM: TAKE ACTION',
        safety: 'AVOID ALL TRAVEL. Seek shelter immediately. Stay away from windows. Seek higher ground if flooding.',
        vibrate: [500, 200, 500, 200, 500, 200, 500]
      }
    };

    const config = alertConfig[alertInfo.alertLevel] || alertConfig['GREEN'];
    
    const payload = JSON.stringify({
      title: `${config.emoji} ${config.title}`,
      body: config.safety || alertInfo.alertMessage,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `alert-${alertInfo.alertLevel}`,
      requireInteraction: alertInfo.alertLevel !== 'GREEN',
      vibrate: config.vibrate,
      data: {
        url: '/',
        alertLevel: alertInfo.alertLevel,
        alertInfo: alertInfo,
        timestamp: Date.now(),
        playSound: alertInfo.alertLevel !== 'GREEN'
      }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.username}:`, error.message);
        failCount++;
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
          console.log(`Removed invalid subscription for ${user.username}`);
        }
      }
    }

    console.log(`✅ Alert sent: ${successCount}, ❌ Failed: ${failCount}`);
    return { successCount, failCount };
  } catch (error) {
    console.error('❌ Alert broadcast error:', error);
    return { successCount: 0, failCount: 0 };
  }
}

// Function to log alert events
function logAlertEvent(alertLevel, message, triggeredBy = 'System') {
  const event = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    alertLevel,
    message,
    triggeredBy
  };
  eventLogs.unshift(event);
  // Keep only last 100 events
  if (eventLogs.length > 100) {
    eventLogs = eventLogs.slice(0, 100);
  }
  return event;
}

// Function to send push notification to all subscribed users
async function broadcastRainAlert(rainInfo) {
  try {
    const users = await User.find({ pushSubscription: { $ne: null } });
    
    console.log(`📢 Broadcasting to ${users.length} subscribed users...`);

    const payload = JSON.stringify({
      title: '🌧️ IMMEDIATE Rain Alert - Angeles City!',
      body: `${rainInfo.description} expected at ${rainInfo.nextRainTime}! Temperature: ${rainInfo.temperature}°C`,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'rain-immediate',
      requireInteraction: true,
      data: {
        url: '/',
        rainInfo: rainInfo,
        timestamp: rainInfo.timestamp
      }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.username}:`, error.message);
        failCount++;
        
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
          console.log(`Removed invalid subscription for ${user.username}`);
        }
      }
    }

    console.log(`✅ Sent: ${successCount}, ❌ Failed: ${failCount}`);
    return { successCount, failCount };
  } catch (error) {
    console.error('❌ Broadcast error:', error);
    return { successCount: 0, failCount: 0 };
  }
}

// Server-side weather monitoring with 30-minute precision
async function monitorWeather() {
  const timestamp = new Date().toLocaleString();
  console.log(`🔍 [${timestamp}] ACSci Thunderstorm Alert Check (30-min precision)...`);
  
  // Skip automatic checks if in manual override mode
  if (manualOverrideMode) {
    console.log('⚠️ Manual Override Mode active - skipping automatic check');
    return null;
  }
  
  const weatherData = await fetchAngelesWeather();
  if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
    console.error('❌ No weather data received');
    return null;
  }

  // Update last weather timestamp
  lastWeatherUpdate = new Date();

  const forecast = checkForRainInForecast(weatherData);
  const newAlertLevel = forecast.alertLevel;
  
  // Check if alert level changed
  if (newAlertLevel !== currentAlertLevel) {
    console.log(`🚨 Alert level changed: ${currentAlertLevel} → ${newAlertLevel}`);
    currentAlertLevel = newAlertLevel;
    
    // Log the event
    logAlertEvent(newAlertLevel, forecast.alertMessage, 'Automatic Weather Check');
    
    // Broadcast alert to all users
    await broadcastAlertLevel({
      alertLevel: newAlertLevel,
      alertMessage: forecast.alertMessage,
      temperature: forecast.temperature,
      windSpeed: forecast.windSpeed,
      humidity: forecast.humidity,
      rainfall: forecast.rainfall,
      windSpeedKmh: forecast.windSpeedKmh,
      nextTime: forecast.nextRainTime
    });
  } else {
    console.log(`✅ Alert level unchanged: ${currentAlertLevel}`);
    console.log(`   Current: ${forecast.temperature}°C, ${forecast.description}`);
    
    // Send routine briefing if enabled and level is GREEN
    if (routineBriefingsEnabled && currentAlertLevel === 'GREEN') {
      await broadcastDailyBriefing({
        temperature: forecast.temperature,
        description: forecast.description,
        windSpeed: forecast.windSpeed,
        humidity: forecast.humidity
      });
    }
  }

  return { 
    forecast, 
    currentAlertLevel, 
    lastUpdate: lastWeatherUpdate,
    eventLogs: eventLogs.slice(0, 10)
  };
}

// Schedule weather check every 30 minutes (*/30)
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ 30-minute scheduled check triggered');
  monitorWeather();
});

// Also run check on server start
setTimeout(() => {
  console.log('🚀 Initial weather check on server start');
  monitorWeather();
}, 5000); // Wait 5 seconds after server starts

// Utility function to find user by username
const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

// Utility function to find user by token
const findUserByToken = async (token) => {
  return await User.findOne({ token });
};

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, middleInitial, lastName, gradeLevel, section, lrn, sex, phoneNumber } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user with student profile (in production, hash the password!)
    const newUser = new User({
      username,
      password, // In production, use bcrypt to hash this!
      firstName: firstName || '',
      middleInitial: middleInitial || '',
      lastName: lastName || '',
      gradeLevel: gradeLevel || '',
      section: section || '',
      lrn: lrn || '',
      sex: sex || 'Male',
      phoneNumber: phoneNumber || '',
      city: 'Angeles City, PH',
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      firstName: newUser.firstName,
      middleInitial: newUser.middleInitial,
      lastName: newUser.lastName,
      gradeLevel: newUser.gradeLevel,
      section: newUser.section,
      lrn: newUser.lrn,
      sex: newUser.sex,
      phoneNumber: newUser.phoneNumber,
      city: newUser.city,
      role: newUser.role || 'student'
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token: newUser.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/LRN and password are required' });
    }

    // Find user by username or LRN
    let user = await findUserByUsername(username);
    if (!user) {
      // Try to find by LRN if username not found
      user = await User.findOne({ lrn: username });
    }
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      middleInitial: user.middleInitial,
      lastName: user.lastName,
      gradeLevel: user.gradeLevel,
      section: user.section,
      lrn: user.lrn,
      sex: user.sex,
      city: user.city,
      role: user.role || 'student'
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token: user.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Protected weather-config route
app.get('/weather-config', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      city: user.city,
      username: user.username
    });
  } catch (error) {
    console.error('Weather config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update weather-config route
app.put('/weather-config', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { city } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    user.city = city;
    await user.save();

    res.json({
      message: 'City updated successfully',
      city: user.city
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin route: Get all students
app.get('/api/admin/students', requireAdmin, async (req, res) => {
  try {
    // Return all users without passwords
    const users = await User.find({}).select('-password -token');
    
    const studentsWithoutPasswords = users.map(user => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      middleInitial: user.middleInitial,
      lastName: user.lastName,
      gradeLevel: user.gradeLevel,
      section: user.section,
      lrn: user.lrn,
      sex: user.sex,
      city: user.city,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      count: studentsWithoutPasswords.length,
      students: studentsWithoutPasswords
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route: Delete a student by ID
app.delete('/api/admin/students/:id', requireAdmin, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Prevent admin from deleting themselves
    if (student.username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(studentId);

    res.json({
      success: true,
      message: `Student ${student.firstName} ${student.lastName} deleted successfully`,
      deletedStudent: {
        id: student._id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName
      }
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get VAPID public key (for frontend)
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Subscribe to push notifications
app.post('/api/push-subscribe', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { subscription } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Save subscription to user
    user.pushSubscription = subscription;
    await user.save();

    console.log(`✅ ${user.username} subscribed to push notifications`);

    res.json({
      success: true,
      message: 'Successfully subscribed to rain alerts'
    });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe from push notifications
app.post('/api/push-unsubscribe', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    user.pushSubscription = null;
    await user.save();

    console.log(`🔕 ${user.username} unsubscribed from push notifications`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from rain alerts'
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Manual broadcast to all students
app.post('/api/admin/notify-all', requireAdmin, async (req, res) => {
  try {
    const { message, title } = req.body;

    const users = await User.find({ pushSubscription: { $ne: null } });

    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users subscribed to notifications',
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title: title || '📢 School Alert - Angeles City Weather',
      body: message || 'Heavy rain expected in Angeles City. Stay safe!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: '/' }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.username}:`, error.message);
        failCount++;

        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
        }
      }
    }

    console.log(`📢 Manual broadcast: ${successCount} sent, ${failCount} failed`);

    res.json({
      success: true,
      message: 'Notifications sent',
      sent: successCount,
      failed: failCount,
      total: users.length
    });
  } catch (error) {
    console.error('Manual broadcast error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Test global push (sends to everyone)
app.post('/api/admin/test-push', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ pushSubscription: { $ne: null } });

    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users subscribed to test',
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title: '🧪 Test Notification',
      body: 'This is a test notification from the Admin Panel. If you see this, push notifications are working!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: '/', test: true }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Test failed for ${user.username}:`, error.message);
        failCount++;

        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
        }
      }
    }

    console.log(`🧪 Test push: ${successCount} sent, ${failCount} failed`);

    res.json({
      success: true,
      message: 'Test notifications sent',
      sent: successCount,
      failed: failCount,
      total: users.length
    });
  } catch (error) {
    console.error('Test push error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get notification statistics
app.get('/api/admin/notification-stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const subscribedUsers = await User.countDocuments({ pushSubscription: { $ne: null } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        subscribedUsers,
        unsubscribedUsers: totalUsers - subscribedUsers,
        subscriptionRate: totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Force weather check and notify all (Manual trigger)
app.post('/api/admin/force-weather-check', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Admin triggered manual weather check...');
    const result = await monitorWeather();

    res.json({
      success: true,
      message: 'Weather check completed',
      result: result
    });
  } catch (error) {
    console.error('Force weather check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Toggle routine briefings
app.post('/api/admin/toggle-briefings', requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    routineBriefingsEnabled = enabled;
    
    console.log(`📘 Routine briefings ${enabled ? 'ENABLED' : 'DISABLED'}`);

    res.json({
      success: true,
      message: `Routine briefings ${enabled ? 'enabled' : 'disabled'}`,
      routineBriefingsEnabled
    });
  } catch (error) {
    console.error('Toggle briefings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get briefing settings
app.get('/api/admin/briefing-settings', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      routineBriefingsEnabled,
      lastWeatherUpdate,
      currentAlertLevel,
      eventLogs: eventLogs.slice(0, 20)
    });
  } catch (error) {
    console.error('Get briefing settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Manual alert level override
app.post('/api/admin/set-alert-level', requireAdmin, async (req, res) => {
  try {
    const { alertLevel, message } = req.body;
    const validLevels = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];
    
    if (!validLevels.includes(alertLevel)) {
      return res.status(400).json({ error: 'Invalid alert level' });
    }

    const previousLevel = currentAlertLevel;
    currentAlertLevel = alertLevel;
    
    console.log(`🔧 Admin manually set alert level: ${previousLevel} → ${alertLevel}`);
    
    // Log the manual override
    const event = logAlertEvent(
      alertLevel, 
      message || `Alert level manually changed to ${alertLevel}`,
      'Admin Override'
    );
    
    // Broadcast the new alert level
    await broadcastAlertLevel({
      alertLevel,
      alertMessage: message || `Alert level manually changed to ${alertLevel}`,
      temperature: null,
      windSpeed: null,
      humidity: null
    });

    res.json({
      success: true,
      message: `Alert level set to ${alertLevel}`,
      currentAlertLevel,
      event
    });
  } catch (error) {
    console.error('Set alert level error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get event logs
app.get('/api/admin/event-logs', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      logs: eventLogs,
      currentAlertLevel
    });
  } catch (error) {
    console.error('Get event logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current alert level (public endpoint)
app.get('/api/alert-status', async (req, res) => {
  try {
    res.json({
      success: true,
      currentAlertLevel,
      lastUpdate: lastWeatherUpdate,
      recentEvents: eventLogs.slice(0, 5),
      manualOverrideMode
    });
  } catch (error) {
    console.error('Get alert status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Toggle Manual Override Mode
app.post('/api/admin/toggle-override-mode', requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    manualOverrideMode = enabled;
    
    console.log(`🔧 Manual Override Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Log the mode change
    logAlertEvent(
      currentAlertLevel,
      `Manual Override Mode ${enabled ? 'activated' : 'deactivated'}`,
      'Admin Control'
    );

    res.json({
      success: true,
      message: `Manual override ${enabled ? 'enabled' : 'disabled'}`,
      manualOverrideMode
    });
  } catch (error) {
    console.error('Toggle override mode error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Export event logs to CSV
app.get('/api/admin/export-logs-csv', requireAdmin, async (req, res) => {
  try {
    // Create CSV header
    let csv = 'Alert Level,Date,Time,Description,Triggered By\\n';
    
    // Add each log entry
    eventLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('en-US');
      const timeStr = date.toLocaleTimeString('en-US');
      const description = log.message.replace(/,/g, ';'); // Replace commas to avoid CSV issues
      
      csv += `${log.alertLevel},${dateStr},${timeStr},\"${description}\",${log.triggeredBy}\\n`;
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alert-history-' + Date.now() + '.csv');
    
    res.send(csv);
    console.log('📊 CSV export completed');
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete individual log entry
app.delete('/api/admin/event-logs/:logId', requireAdmin, async (req, res) => {
  try {
    const { logId } = req.params;
    const logIndex = eventLogs.findIndex(log => log.id === parseInt(logId));
    
    if (logIndex === -1) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    
    const deletedLog = eventLogs.splice(logIndex, 1)[0];
    
    console.log(`🗑️ Admin deleted log entry: ${deletedLog.alertLevel} - ${deletedLog.message}`);
    
    res.json({
      success: true,
      message: 'Log entry deleted',
      deletedLog
    });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reset all event logs
app.post('/api/admin/reset-logs', requireAdmin, async (req, res) => {
  try {
    const logCount = eventLogs.length;
    eventLogs = [];
    
    console.log(`🗑️ Admin reset all event logs (${logCount} entries cleared)`);
    
    // Log the reset action
    logAlertEvent(
      currentAlertLevel,
      `All event history cleared (${logCount} entries)`,
      'Admin Reset'
    );
    
    res.json({
      success: true,
      message: `Cleared ${logCount} log entries`,
      logsCleared: logCount
    });
  } catch (error) {
    console.error('Reset logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User: Get current weather briefing (manual button)
app.post('/api/get-current-briefing', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log(`📘 ${user.username} requested current briefing`);

    // Fetch latest weather
    const weatherData = await fetchAngelesWeather();
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
      return res.status(500).json({ error: 'Unable to fetch weather data' });
    }

    const currentWeather = weatherData.list[0];
    const weatherInfo = {
      temperature: currentWeather.main.temp,
      description: currentWeather.weather[0].description,
      windSpeed: currentWeather.wind.speed,
      humidity: currentWeather.main.humidity,
      timestamp: currentWeather.dt
    };

    // Send push notification to this specific user
    if (user.pushSubscription) {
      const payload = JSON.stringify({
        title: '📘 Current Weather Briefing',
        body: `Currently ${weatherInfo.temperature}°C and ${weatherInfo.description} in Angeles City. Wind: ${weatherInfo.windSpeed} m/s.`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'current-briefing',
        data: {
          url: '/',
          weatherInfo: weatherInfo,
          timestamp: Date.now(),
          type: 'current-briefing'
        }
      });

      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        console.log(`✅ Briefing sent to ${user.username}`);
      } catch (error) {
        console.error(`Failed to send briefing to ${user.username}:`, error.message);
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
        }
      }
    }

    res.json({
      success: true,
      weatherInfo,
      lastUpdate: lastWeatherUpdate
    });
  } catch (error) {
    console.error('Get current briefing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Settings: Change Password
app.post('/api/settings/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password (in production, hash this!)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Settings: Update Phone Number
app.post('/api/settings/update-phone', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock verification (in production, verify against sent SMS code)
    if (verificationCode.length !== 6) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update phone number
    user.phoneNumber = phoneNumber;
    await user.save();

    res.json({ message: 'Phone number updated successfully' });
  } catch (error) {
    console.error('Update phone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Promote user to admin (temporary endpoint for testing)
app.post('/api/promote-to-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Promote to admin
    user.role = 'admin';
    await user.save();
    
    res.json({ 
      message: 'User promoted to admin successfully',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ 
      status: 'ok', 
      users: userCount,
      database: 'MongoDB Connected'
    });
  } catch (error) {
    res.json({ 
      status: 'error', 
      database: 'MongoDB Disconnected'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('✅ API Routes: /api/login, /api/register available');
  console.log('🔥 Backend ready for requests');
});
