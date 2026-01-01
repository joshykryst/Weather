import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import RainAlerts from './RainAlerts';
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
  const [rainAlerts, setRainAlerts] = useState([]);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Get alert context
  const { alertLevel, getThemeColors, fetchAlertStatus, playSiren } = useAlert();
  const theme = getThemeColors();

  // Test siren function
  const testSiren = () => {
    if (playSiren) {
      playSiren(alertLevel);
    }
    
    // Also test vibration directly
    if ('vibrate' in navigator) {
      const patterns = {
        YELLOW: [200, 100, 200],
        ORANGE: [300, 100, 300, 100, 300],
        RED: [500, 200, 500, 200, 500, 200, 500, 200, 500]
      };
      navigator.vibrate(patterns[alertLevel] || [200, 100, 200]);
      console.log('📳 Vibration triggered for ' + alertLevel);
    } else {
      console.warn('⚠️ Vibration API not supported on this device');
      alert('Vibration not supported on this device/browser');
    }
  };

  // Force refresh alert status
  const forceRefresh = async () => {
    if (fetchAlertStatus) {
      await fetchAlertStatus();
      alert('Alert status refreshed!');
    }
  };

  // Reload service worker (for updates)
  const reloadServiceWorker = async () => {
    if (!navigator.serviceWorker) {
      alert('Service workers not supported on this browser');
      return;
    }

    if (!window.confirm('This will reload the page to update the service worker. Continue?')) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      
      // Force reload immediately
      window.location.reload(true);
    } catch (error) {
      console.error('Error reloading service worker:', error);
      alert('Failed to reload service worker: ' + error.message);
    }
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
    
    setRainAlerts(rainTimes);
    
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
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    // Check if running in standalone mode (installed as PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone === true;
    setIsStandalone(isInStandaloneMode);
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          setServiceWorkerReady(true);
          
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
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-500 ${theme.bg} ${theme.text}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PAGASA Alert Banner */}
        <div className={`${theme.header} text-white rounded-2xl p-4 md:p-6 shadow-2xl border-4 ${
          alertLevel === 'RED' ? 'border-red-900 animate-pulse' : 
          alertLevel === 'ORANGE' ? 'border-orange-700' : 
          alertLevel === 'YELLOW' ? 'border-yellow-600' : 
          'border-green-700'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{theme.emoji}</span>
              <div>
                <h1 className="text-3xl font-bold">
                  ACSci Thunderstorm Alert: {theme.name}
                </h1>
                <p className="text-lg mt-1 opacity-90">
                  {theme.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Current Alert Level</div>
              <div className="text-4xl font-bold">{alertLevel}</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className={`${theme.card} rounded-2xl p-6 mb-6 shadow-lg`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>
                🌦️ Angeles City Weather Monitor
              </h1>
              <p className={theme.text}>Welcome, {user?.username}!</p>
              <p className={`text-sm mt-1 ${theme.text} opacity-75`}>
                📍 Monitoring: Angeles City, Pampanga, Philippines (Lat: {ANGELES_CITY_LAT}, Lon: {ANGELES_CITY_LON})
              </p>
              {lastUpdate && (
                <p className={`text-xs mt-1 ${theme.text} opacity-60`}>
                  🔄 Last updated: {lastUpdate.toLocaleTimeString()} - Data refreshes every 30 minutes
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-end flex-wrap">
              {/* Reload Service Worker Button (for updates) */}
              <button
                onClick={reloadServiceWorker}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold text-sm"
                title="Update service worker for vibration fix"
              >
                🔄 Update SW
              </button>

              {/* Force Refresh Button */}
              <button
                onClick={forceRefresh}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold text-sm"
              >
                🔄 Refresh Alert
              </button>

              {/* Test Siren Button */}
              {['YELLOW', 'ORANGE', 'RED'].includes(alertLevel) && (
                <button
                  onClick={testSiren}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold text-sm"
                >
                  🔊 Test Siren
                </button>
              )}

              {/* Get Current Briefing Button */}
              {isPushSubscribed && (
                <button
                  onClick={getCurrentBriefing}
                  className={`px-6 py-2 ${theme.button} text-white rounded-lg transition-colors font-semibold`}
                >
                  📘 Get Update Now
                </button>
              )}
              
              {/* Push Notification Button */}
              {isPushSubscribed ? (
                <div className="flex gap-2">
                  <div className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <span>Push Alerts Active</span>
                  </div>
                  <button
                    onClick={unsubscribeFromPush}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Disable
                  </button>
                </div>
              ) : (
                <button
                  onClick={subscribeToPush}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!serviceWorkerReady}
                  title={!serviceWorkerReady ? 'Service worker not available (requires HTTPS)' : 'Click to enable push notifications'}
                >
                  🔔 Enable Push Alerts
                </button>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold inline-block"
                >
                  👨‍💼 Admin Panel
                </Link>
              )}
              <button
                onClick={onLogout}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notification Permission */}
        {!isPushSubscribed && (
          <div className="glass-dark rounded-2xl p-6 mb-6 border-2 border-yellow-500">
            {/* iOS Installation Guide */}
            {isIOS && !isStandalone && (
              <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-4 mb-4">
                <h3 className="text-xl font-bold text-blue-300 mb-2">
                  📱 iPhone Setup Required
                </h3>
                <p className="text-blue-200 mb-3">
                  To enable alerts on iPhone, you must first install this app:
                </p>
                <ol className="text-blue-100 text-sm space-y-2 list-decimal list-inside">
                  <li>Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right corner</li>
                  <li>Open the app from your Home Screen (not Safari)</li>
                  <li>Return here and tap <strong>"Enable Rain Alerts"</strong></li>
                </ol>
                <p className="text-blue-200 mt-3 text-sm">
                  ⚠️ Push notifications only work when installed as an app on iPhone
                </p>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  🔔 Global Push Notification System
                </h3>
                <p className="text-gray-300">
                  Enable push alerts to receive notifications even when the app is closed!
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ✅ Server checks weather every hour automatically
                </p>
                <p className="text-sm text-gray-400">
                  ✅ Notifications sent to ALL subscribed users when rain is detected
                </p>
                {isIOS && isStandalone && (
                  <div>
                    <p className="text-sm text-green-400 mt-2">
                      ✅ Running as installed app - Ready for notifications!
                    </p>
                    {window.location.protocol === 'http:' && (
                      <p className="text-sm text-yellow-400 mt-1">
                        ⚠️ Push notifications require HTTPS. Current connection is HTTP - notifications may not work on iOS.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={subscribeToPush}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                disabled={!serviceWorkerReady}
                title={!serviceWorkerReady ? 'Service worker loading...' : 'Click to enable push notifications'}
              >
                🔔 Enable Rain Alerts
              </button>
            </div>
          </div>
        )}

        {/* Current Weather */}
        {loading ? (
          <div className="glass-dark rounded-2xl p-12 mb-6 text-center">
            <div className="text-white text-xl">Loading weather data...</div>
          </div>
        ) : weatherData && (
          <>
            {/* Current Weather Card */}
            <div className={`${theme.card} rounded-2xl p-6 mb-6 shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>Current Weather - Angeles City</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-5 md:p-4">
                  <p className="text-gray-400 text-sm">🌡️ Temperature</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(weatherData.list[0].main.temp)}°C
                  </p>
                  <p className="text-xs text-gray-500">Feels: {Math.round(weatherData.list[0].main.feels_like)}°C</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">💧 Rainfall</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {weatherData.list[0].rain?.['3h'] ? weatherData.list[0].rain['3h'].toFixed(1) : '0.0'} mm
                  </p>
                  <p className="text-xs text-gray-500">Last 3 hours</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-5 md:p-4">
                  <p className="text-gray-400 text-sm">💨 Wind Speed</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {(weatherData.list[0].wind.speed * 3.6).toFixed(1)} km/h
                  </p>
                  <p className="text-xs text-gray-500">{Math.round(weatherData.list[0].wind.speed)} m/s</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-5 md:p-4">
                  <p className="text-gray-400 text-sm">💦 Humidity</p>
                  <p className="text-3xl font-bold text-green-400">
                    {weatherData.list[0].main.humidity}%
                  </p>
                  <p className="text-xs text-gray-500">Relative</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-5 md:p-4">
                  <p className="text-gray-400 text-sm">☁️ Condition</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {weatherData.list[0].weather[0].description}
                  </p>
                  <p className="text-xs text-gray-500">Current</p>
                </div>
              </div>
            </div>

            {/* Full Data Stream - All 40 Forecast Slots */}
            <div className={`${theme.card} rounded-2xl p-6 mb-6 shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>📊 Complete 5-Day Forecast (40 Data Points)</h2>
              <p className={`text-sm mb-4 ${theme.text} opacity-75`}>Horizontal scroll to view all forecast data • Updates every 3 hours • No emojis for clean data view</p>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {weatherData.list.map((item, index) => {
                    const time = new Date(item.dt * 1000);
                    const rainfall = item.rain?.['3h'] || 0;
                    const windSpeedKmh = (item.wind.speed * 3.6).toFixed(1);
                    const isRain = rainfall > 0;
                    return (
                      <div 
                        key={index}
                        className={`bg-slate-700/50 rounded-lg p-5 md:p-4 min-w-[220px] ${isRain ? 'border-2 border-blue-400' : 'border border-slate-600'}`}
                      >
                        <div className="text-center">
                          <p className="text-white font-bold text-sm mb-1">
                            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-gray-300 text-xs mb-3">
                            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className={`text-base font-semibold mb-2 capitalize ${isRain ? 'text-blue-400' : 'text-white'}`}>
                            {item.weather[0].description}
                          </p>
                          <p className="text-white text-2xl font-bold mb-1">
                            {Math.round(item.main.temp)}°C
                          </p>
                          <p className="text-gray-400 text-xs mb-2">
                            Feels: {Math.round(item.main.feels_like)}°C
                          </p>
                          <div className="mt-3 pt-3 border-t border-slate-600 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">Rainfall:</span>
                              <span className={`text-xs font-bold ${rainfall > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                                {rainfall.toFixed(1)} mm
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">Wind:</span>
                              <span className="text-cyan-400 text-xs font-semibold">
                                {windSpeedKmh} km/h
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">Humidity:</span>
                              <span className="text-green-400 text-xs font-semibold">
                                {item.main.humidity}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">Rain Prob:</span>
                              <span className="text-blue-300 text-xs font-semibold">
                                {Math.round(item.pop * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <p className="text-gray-400 text-sm">
                  📋 Showing all 40 forecast points • Scroll horizontally to view complete 5-day forecast • Rain probability highlighted in blue
                </p>
              </div>
            </div>
          </>
        )}

        {/* Map Component */}
        <MapComponent />

        {/* Rain Alerts Table */}
        <RainAlerts alerts={rainAlerts} />
      </div>
    </div>
  );
}

export default WeatherDashboard;
