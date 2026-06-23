import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../contexts/AlertContext';
import { Link } from 'react-router-dom';

const OPENWEATHER_API_KEY = 'a0f27a050036bd633ba6d968889baaab';
const ANGELES_CITY_LAT = 15.15;
const ANGELES_CITY_LON = 120.59;
const API_URL = process.env.REACT_APP_API_URL || 'https://sample-cat.up.railway.app';

function WeatherDashboard({ user, token, onLogout }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Get alert context
  const { alertLevel } = useAlert();

  // Calculate Heat Index from temperature and humidity
  const calculateHeatIndex = (tempC, humidity) => {
    if (tempC < 20) return tempC; // Heat index formula only accurate above 20°C
    
    // Convert Celsius to Fahrenheit
    const tempF = (tempC * 9/5) + 32;
    
    // Coefficients for heat index calculation (US formula - requires Fahrenheit)
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;
    
    const T = tempF;
    const RH = humidity;
    
    const HI_F = c1 + (c2 * T) + (c3 * RH) + (c4 * T * RH) + 
                 (c5 * T * T) + (c6 * RH * RH) + (c7 * T * T * RH) + 
                 (c8 * T * RH * RH) + (c9 * T * T * RH * RH);
    
    // Convert result back to Celsius
    const HI_C = (HI_F - 32) * 5/9;
    
    return Math.round(HI_C * 10) / 10; // Round to 1 decimal place
  };

  // Get heat index severity color
  const getHeatIndexColor = (heatIndex) => {
    if (heatIndex >= 40) return 'text-red-600'; // Extreme heat
    if (heatIndex >= 32) return 'text-orange-500'; // Very hot
    if (heatIndex >= 26) return 'text-yellow-500'; // Hot
    if (heatIndex >= 21) return 'text-blue-400'; // Warm
    return 'text-cyan-400'; // Cool
  };

  // Fetch weather data for Angeles City
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${ANGELES_CITY_LAT}&lon=${ANGELES_CITY_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      setWeatherData(response.data);
      setLastUpdate(new Date());
      checkForRain(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  // Get current weather briefing (manual button)
  const getCurrentBriefing = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/get-current-briefing`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const info = response.data.weatherInfo;
        alert(`Current Weather Briefing:\n\n` +
              `Temperature: ${info.temperature}°C\n` +
              `Condition: ${info.description}\n` +
              `Wind Speed: ${info.windSpeed} m/s\n` +
              `Humidity: ${info.humidity}%\n\n` +
              `A push notification has been sent!`);
      }
    } catch (error) {
      console.error('Error getting current briefing:', error);
      alert('Failed to get weather briefing. Please try again.');
    }
  };

  // Check for rain - scans all 40 data points in forecast
  const checkForRain = (data) => {
    let rainFound = false;
    const rainTimes = [];
    
    console.log('🔍 [Rain Monitor] Scanning forecast data...');
    
    // Scan ALL 40 data points in the 5-day forecast
    data.list.forEach((item, index) => {
      const weather = item.weather[0];
      if (weather.main.toLowerCase().includes('rain') || 
          weather.description.toLowerCase().includes('rain')) {
        rainFound = true;
        rainTimes.push({
          time: new Date(item.dt * 1000),
          description: weather.description,
          temp: item.main.temp,
          pop: item.pop * 100
        });
      }
    });
    
    console.log(`🌧️ [Rain Monitor] Found ${rainTimes.length} rain forecasts out of 40 data points`);
    
    // Send notification immediately if rain found anywhere in forecast
    if (rainFound && notificationPermission === 'granted') {
      console.log('📢 [Notification] Sending rain alert notification...');
      const notification = new Notification('🌧️ Upcoming Rain Detected in Angeles City!', {
        body: 'Check the dashboard for details.',
        icon: '☔',
        tag: 'rain-alert',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else if (rainFound && notificationPermission !== 'granted') {
      console.warn('⚠️ [Notification] Rain detected but notification permission not granted');
    } else {
      console.log('☀️ [Rain Monitor] No rain detected in forecast');
    }
  };

  // Initialize service worker and check iOS compatibility
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Check if already subscribed
          registration.pushManager.getSubscription()
            .then((subscription) => {
              setIsPushSubscribed(!!subscription);
            });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
      
      // Listen for alarm messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PLAY_ALARM') {
          playAlarmSound(event.data.alertLevel);
          // Trigger vibration if available
          if ('vibrate' in navigator) {
            const vibrationPatterns = {
              YELLOW: [200, 100, 200],
              ORANGE: [300, 100, 300, 100, 300],
              RED: [500, 200, 500, 200, 500, 200, 500]
            };
            navigator.vibrate(vibrationPatterns[event.data.alertLevel] || [200, 100, 200]);
          }
        }
      });
    }
  }, []);

  // Play alarm sound
  const playAlarmSound = async (alertLevel) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const patterns = {
        YELLOW: { duration: 1.5, oscillations: 3, startFreq: 800, endFreq: 1200 },
        ORANGE: { duration: 2.0, oscillations: 4, startFreq: 700, endFreq: 1400 },
        RED: { duration: 3.0, oscillations: 6, startFreq: 600, endFreq: 1600 }
      };
      
      const pattern = patterns[alertLevel] || patterns.YELLOW;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(pattern.startFreq, audioContext.currentTime);
      
      const oscillationDuration = pattern.duration / pattern.oscillations;
      for (let i = 0; i < pattern.oscillations; i++) {
        const time = audioContext.currentTime + (i * oscillationDuration);
        oscillator.frequency.linearRampToValueAtTime(
          i % 2 === 0 ? pattern.endFreq : pattern.startFreq,
          time + oscillationDuration / 2
        );
      }
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + pattern.duration - 0.2);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + pattern.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + pattern.duration);
      
      console.log(`🔊 Playing ${alertLevel} alarm sound`);
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    try {
      // Check if Notification API is available
      if (typeof Notification === 'undefined') {
        alert('Push notifications are not supported on this device/browser.');
        return;
      }

      // First request notification permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        alert('Please allow notifications to enable push alerts!');
        return;
      }

      // Get VAPID public key from backend
      const vapidResponse = await axios.get(`${API_URL}/api/vapid-public-key`);
      const publicKey = vapidResponse.data.publicKey;

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to backend
      await axios.post(
        `${API_URL}/api/push-subscribe`,
        { subscription },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setIsPushSubscribed(true);
      
      // Show success notification
      if (typeof Notification !== 'undefined') {
        new Notification('🎉 Push Notifications Enabled!', {
          body: 'You will receive rain alerts even when the app is closed!',
          icon: '/logo192.png'
        });
      }

      console.log('✅ Subscribed to push notifications');
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
      alert('Failed to enable push notifications. Please try again.');
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from backend
      await axios.post(
        `${API_URL}/api/push-unsubscribe`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setIsPushSubscribed(false);
      console.log('🔕 Unsubscribed from push notifications');
      alert('Push notifications disabled');
    } catch (error) {
      console.error('❌ Error unsubscribing from push:', error);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Fetch weather on component mount (removed polling since backend handles it now)
  useEffect(() => {
    fetchWeatherData();
    console.log('🌦️ [Weather Monitor] Frontend displaying Angeles City weather');
    console.log('📡 [Server Monitor] Backend checks weather every hour and sends push notifications');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Alert Banner - Simplified */}
        <div className={`rounded-2xl p-6 text-white font-semibold text-lg flex items-center justify-between ${
          alertLevel === 'RED' ? 'bg-red-500' : 
          alertLevel === 'ORANGE' ? 'bg-orange-500' : 
          alertLevel === 'YELLOW' ? 'bg-amber-500' : 
          'bg-green-500'
        }`} style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
          <span>Alert Level: <strong>{alertLevel}</strong></span>
          <span className="text-2xl">{alertLevel === 'RED' ? '🔴' : alertLevel === 'ORANGE' ? '🟠' : alertLevel === 'YELLOW' ? '🟡' : '🟢'}</span>
        </div>

        {/* Header - Simplified */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                Weather in Angeles City
              </h1>
              <p className="text-gray-600 dark:text-slate-400">📍 Pampanga, Philippines • Last updated: {lastUpdate?.toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">Welcome back!</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user?.firstName}</p>
            </div>
          </div>
        </div>

        {/* Current Weather - Simplified */}
        {loading ? (
          <div className="rounded-2xl p-12 text-center bg-white shadow-md">
            <p className="text-gray-600 text-lg">Loading weather data...</p>
          </div>
        ) : weatherData && (
          <>
            {/* Main Weather Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Card */}
              <div className="rounded-2xl p-8 bg-blue-50 dark:bg-slate-700 shadow-md border-2 border-blue-200 dark:border-blue-900">
                <p className="text-gray-600 dark:text-slate-300 font-medium mb-2">Temperature</p>
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{Math.round(weatherData.list[0].main.temp)}°C</p>
                <p className="text-gray-600 dark:text-slate-400">Feels like {Math.round(weatherData.list[0].main.feels_like)}°C</p>
              </div>

              {/* Heat Index Card */}
              <div className="rounded-2xl p-8 bg-orange-50 dark:bg-slate-700 shadow-md border-2 border-orange-200 dark:border-orange-900">
                <p className="text-gray-600 dark:text-slate-300 font-medium mb-2">Heat Index</p>
                <p className={`text-5xl font-bold mb-2 ${getHeatIndexColor(calculateHeatIndex(weatherData.list[0].main.temp, weatherData.list[0].main.humidity))}`}>
                  {calculateHeatIndex(weatherData.list[0].main.temp, weatherData.list[0].main.humidity)}°C
                </p>
                <p className="text-gray-600 dark:text-slate-400">Perceived temperature</p>
              </div>

              {/* Humidity & Wind Card */}
              <div className="rounded-2xl p-8 bg-green-50 dark:bg-slate-700 shadow-md border-2 border-green-200 dark:border-green-900">
                <p className="text-gray-600 dark:text-slate-300 font-medium mb-4">Conditions</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400">💧 Humidity</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{weatherData.list[0].main.humidity}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400">💨 Wind</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{(weatherData.list[0].wind.speed * 3.6).toFixed(1)} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons - Simplified */}
            <div className="flex flex-wrap gap-3 justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
              {isPushSubscribed ? (
                <>
                  <button onClick={getCurrentBriefing} className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold">
                    📘 Get Update
                  </button>
                  <button onClick={unsubscribeFromPush} className="px-6 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 font-semibold">
                    Disable Alerts
                  </button>
                </>
              ) : (
                <button onClick={subscribeToPush} className="px-6 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 font-semibold">
                  🔔 Enable Notifications
                </button>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 font-semibold">
                  ⚙️ Admin Panel
                </Link>
              )}
              <button onClick={onLogout} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">
                🚪 Logout
              </button>
            </div>

            {/* 5-Day Forecast - Simplified */}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">5-Day Forecast</h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {weatherData.list.slice(0, 20).map((item, index) => {
                    if (index % 2 !== 0) return null; // Show every other item for cleaner view
                    const time = new Date(item.dt * 1000);
                    const rainfall = item.rain?.['3h'] || 0;
                    const heatIdx = calculateHeatIndex(item.main.temp, item.main.humidity);
                    
                    return (
                      <div key={index} className="flex-shrink-0 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 min-w-[180px]">
                        <p className="font-semibold text-gray-800 dark:text-slate-100">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">{Math.round(item.main.temp)}°C</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">Heat: {heatIdx}°C</p>
                        {rainfall > 0 && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">🌧️ {rainfall.toFixed(1)}mm</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Current Weather - Light Theme */}
        {loading ? (
          <div className="bg-blue-100 dark:bg-slate-700 rounded-2xl p-12 mb-6 text-center">
            <div className="text-blue-600 dark:text-blue-400 text-xl font-semibold">Loading weather data...</div>
          </div>
        ) : weatherData && (
          <>
            {/* Current Weather Card - Light Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">Current Weather - Angeles City</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-slate-700 rounded-lg p-5">
                  <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">🌡️ Temperature</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {Math.round(weatherData.list[0].main.temp)}°C
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Feels: {Math.round(weatherData.list[0].main.feels_like)}°C</p>
                </div>
                <div className="bg-orange-50 dark:bg-slate-700 rounded-lg p-5">
                  <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">🔥 Heat Index</p>
                  <p className={`text-3xl font-bold mt-1 ${getHeatIndexColor(calculateHeatIndex(weatherData.list[0].main.temp, weatherData.list[0].main.humidity))}`}>
                    {calculateHeatIndex(weatherData.list[0].main.temp, weatherData.list[0].main.humidity)}°C
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Perceived Temp</p>
                </div>
                <div className="bg-green-50 dark:bg-slate-700 rounded-lg p-5">
                  <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">☁️ Conditions</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400 mt-1 capitalize">
                    {weatherData.list[0].weather[0].description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Current</p>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast - Light Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">5-Day Forecast</h2>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max">
                  {weatherData.list.slice(0, 20).map((item, index) => {
                    if (index % 2 !== 0) return null;
                    const time = new Date(item.dt * 1000);
                    const rainfall = item.rain?.['3h'] || 0;
                    return (
                      <div key={index} className={`flex-shrink-0 p-4 rounded-lg border-2 min-w-[150px] ${rainfall > 0 ? 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-slate-700' : 'border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-700'}`}>
                        <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">{Math.round(item.main.temp)}°C</p>
                        {rainfall > 0 && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">🌧️ {rainfall.toFixed(1)}mm</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
          <p className="text-gray-600 dark:text-slate-400 text-sm">Weather monitoring for Angeles City, Pampanga • v2.0</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherDashboard;
