import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../contexts/AlertContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function AdminPanel({ token }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(Notification.permission);
  const [systemLogs, setSystemLogs] = useState([]);
  const [notificationStats, setNotificationStats] = useState(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [routineBriefingsEnabled, setRoutineBriefingsEnabled] = useState(true);
  const [eventLogs, setEventLogs] = useState([]);
  const [manualOverrideMode, setManualOverrideMode] = useState(false);
  const [heatIndexAlertLevel, setHeatIndexAlertLevel] = useState('GREEN');
  const [heatIndexManualMode, setHeatIndexManualMode] = useState(false);
  const [alertMode, setAlertMode] = useState('rain'); // 'rain' or 'heat'
  
  // Get alert context
  const { alertLevel, fetchAlertStatus, manualOverrideMode: contextManualMode } = useAlert();

  // Add system log entry
  const addLog = (message) => {
    const timestamp = new Date().toLocaleString();
    setSystemLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/admin/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStudents(response.data.students);
      setLoading(false);
      addLog('Student list refreshed successfully');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.error || 'Failed to fetch students');
      setLoading(false);
      addLog('Error fetching students: ' + err.message);
    }
  };

  // Fetch notification statistics
  const fetchNotificationStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/notification-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotificationStats(response.data.stats);
      addLog(`Stats: ${response.data.stats.subscribedUsers}/${response.data.stats.totalUsers} users subscribed`);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
      addLog('Error fetching notification stats');
    }
  };

  // Fetch briefing settings
  const fetchBriefingSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/briefing-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRoutineBriefingsEnabled(response.data.routineBriefingsEnabled);
    } catch (err) {
      console.error('Error fetching briefing settings:', err);
    }
  };

  // Toggle routine briefings
  const toggleRoutineBriefings = async () => {
    try {
      const newState = !routineBriefingsEnabled;
      await axios.post(
        `${API_BASE_URL}/api/admin/toggle-briefings`,
        { enabled: newState },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setRoutineBriefingsEnabled(newState);
      addLog(`Routine briefings ${newState ? 'ENABLED' : 'DISABLED'}`);
      alert(`Routine 30-minute briefings ${newState ? 'enabled' : 'disabled'}!`);
    } catch (err) {
      console.error('Error toggling briefings:', err);
      addLog('Error toggling briefings: ' + err.message);
      alert('Failed to toggle briefings');
    }
  };

  // Check and update notification permission status
  const checkPermissionStatus = () => {
    const currentStatus = Notification.permission;
    setNotificationStatus(currentStatus);
    addLog(`Notification permission checked: ${currentStatus}`);
    return currentStatus;
  };

  // Test simple notification (browser-based)
  const testSimpleNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Successful!', {
          body: 'Your device is ready for rain alerts.',
          icon: '✅'
        });
        addLog('Simple notification test triggered');
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationStatus(permission);
          if (permission === 'granted') {
            new Notification('Test Successful!', {
              body: 'Your device is ready for rain alerts.',
              icon: '✅'
            });
            addLog('Notification permission granted, test sent');
          }
        });
      } else {
        alert('Notifications are blocked. Please enable them in browser settings.');
        addLog('Notification test failed: Permission denied');
      }
    } else {
      alert('Your browser does not support notifications.');
      addLog('Notification test failed: Browser not supported');
    }
  };

  // Simulate rain alert (browser-based)
  const simulateRainAlert = () => {
    if (Notification.permission === 'granted') {
      new Notification('🌧️ SIMULATED RAIN ALERT for Angeles City!', {
        body: 'This is a test alert. Check the dashboard for details.',
        icon: '☔',
        tag: 'rain-test',
        requireInteraction: true
      });
      addLog('Rain alert simulation triggered');
      alert('Rain alert simulated! Check your notification.');
    } else {
      alert('Please enable notifications first using the Test Simple Notification button.');
      addLog('Rain simulation failed: No notification permission');
    }
  };

  // Test global push to all users
  const testGlobalPush = async () => {
    if (!window.confirm('Send a test notification to ALL subscribed users?')) {
      return;
    }

    try {
      addLog('Sending test push to all users...');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/test-push`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      addLog(`Test push sent to ${response.data.sent} users (${response.data.failed} failed)`);
      alert(`Test notification sent to ${response.data.sent} users!`);
      fetchNotificationStats(); // Refresh stats
    } catch (err) {
      console.error('Error sending test push:', err);
      addLog('Error sending test push: ' + err.message);
      alert('Failed to send test notifications');
    }
  };

  // Notify all students with custom message
  const notifyAllStudents = async () => {
    if (!broadcastMessage.trim()) {
      alert('Please enter a message to broadcast');
      return;
    }

    if (!window.confirm(`Broadcast this message to ALL students?\n\n"${broadcastMessage}"`)) {
      return;
    }

    try {
      addLog('Broadcasting message to all students...');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/notify-all`,
        {
          title: broadcastTitle || '📢 School Alert - Angeles City Weather',
          message: broadcastMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      addLog(`Broadcast sent to ${response.data.sent} users (${response.data.failed} failed)`);
      alert(`Message sent to ${response.data.sent} students!`);
      setBroadcastMessage('');
      setBroadcastTitle('');
      fetchNotificationStats(); // Refresh stats
    } catch (err) {
      console.error('Error broadcasting message:', err);
      addLog('Error broadcasting: ' + err.message);
      alert('Failed to send broadcast');
    }
  };

  // Force weather check and notify all (30-minute precision check)
  const forceWeatherCheck = async () => {
    if (!window.confirm('Manually trigger weather check and notify all users if rain is detected?')) {
      return;
    }

    try {
      addLog('🔧 Forcing manual weather check (30-min precision)...');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/force-weather-check`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = response.data.result;
      if (result && result.rainCheck && result.rainCheck.hasRain) {
        addLog(`☔ Rain detected! Notified all users about rain at ${result.rainCheck.nextRainTime}`);
        alert(`Rain Alert Sent!\n\nTime: ${result.rainCheck.nextRainTime}\nDescription: ${result.rainCheck.description}`);
      } else {
        addLog('☀️ No immediate rain in next forecast');
        alert('No immediate rain detected in the next data point.');
      }
      fetchAlertStatus(); // Refresh alert status
    } catch (err) {
      console.error('Error forcing weather check:', err);
      addLog('Error forcing check: ' + err.message);
      alert('Failed to force weather check');
    }
  };

  // Manually set alert level
  const setAlertLevel = async (level, message) => {
    if (!window.confirm(`Set alert level to ${level}?\n\nThis will notify all subscribed users.`)) {
      return;
    }

    try {
      addLog(`🚨 Setting alert level to ${level}...`);
      await axios.post(
        `${API_BASE_URL}/api/admin/set-alert-level`,
        {
          alertLevel: level,
          message: message || `Alert level manually changed to ${level}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      addLog(`✅ Alert level set to ${level}`);
      alert(`Alert level changed to ${level}!\nNotification sent to all users.`);
      fetchAlertStatus(); // Refresh alert status
      fetchEventLogs(); // Refresh event logs
    } catch (err) {
      console.error('Error setting alert level:', err);
      addLog('Error setting alert: ' + err.message);
      alert('Failed to set alert level');
    }
  };

  // Manually set heat index alert level
  const updateHeatIndexAlertLevel = async (level, message) => {
    if (!window.confirm(`Set heat index alert level to ${level}?\n\nThis will notify all subscribed users.`)) {
      return;
    }

    try {
      addLog(`🌡️ Setting heat index alert level to ${level}...`);
      await axios.post(
        `${API_BASE_URL}/api/admin/set-heat-index-alert`,
        {
          alertLevel: level,
          message: message || `Heat index alert level manually changed to ${level}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setHeatIndexAlertLevel(level);
      addLog(`✅ Heat index alert level set to ${level}`);
      alert(`Heat index alert level changed to ${level}!\nNotification sent to all users.`);
    } catch (err) {
      console.error('Error setting heat index alert level:', err);
      addLog('Error setting heat index alert: ' + err.message);
      alert('Failed to set heat index alert level');
    }
  };

  // Force heat index check and notify all
  const forceHeatIndexCheck = async () => {
    if (!window.confirm('Manually trigger heat index check and notify all users if threshold exceeded?')) {
      return;
    }

    try {
      addLog('🔧 Forcing manual heat index check...');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/force-heat-index-check`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = response.data.result;
      if (result && result.heatIndexCheck) {
        addLog(`🌡️ Heat Index: ${result.heatIndexCheck.currentHeatIndex}°C. Alert level: ${result.heatIndexCheck.alertLevel}`);
        alert(`Heat Index Check:\n\nCurrent: ${result.heatIndexCheck.currentHeatIndex}°C\nAlert Level: ${result.heatIndexCheck.alertLevel}`);
        setHeatIndexAlertLevel(result.heatIndexCheck.alertLevel);
      }
    } catch (err) {
      console.error('Error forcing heat index check:', err);
      addLog('Error forcing heat index check: ' + err.message);
      alert('Failed to force heat index check');
    }
  };

  // Toggle Heat Index Manual Override Mode
  const toggleHeatIndexOverride = async () => {
    try {
      const newMode = !heatIndexManualMode;
      await axios.post(
        `${API_BASE_URL}/api/admin/toggle-heat-index-override`,
        { enabled: newMode },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setHeatIndexManualMode(newMode);
      addLog(`Heat Index Manual Override Mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
      alert(`Heat Index Manual Override ${newMode ? 'enabled' : 'disabled'}!\n\n${newMode ? 'Automatic heat index checks are now suspended. You have full control.' : 'Automatic heat index monitoring resumed.'}`);
    } catch (err) {
      console.error('Error toggling heat index override:', err);
      addLog('Error toggling heat index override: ' + err.message);
      alert('Failed to toggle heat index override');
    }
  };

  // Fetch event logs
  const fetchEventLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/event-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEventLogs(response.data.logs || []);
    } catch (err) {
      console.error('Error fetching event logs:', err);
    }
  };

  // Toggle Manual Override Mode
  const toggleManualOverride = async () => {
    try {
      const newMode = !manualOverrideMode;
      await axios.post(
        `${API_BASE_URL}/api/admin/toggle-override-mode`,
        { enabled: newMode },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setManualOverrideMode(newMode);
      addLog(`Manual Override Mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
      alert(`Manual Override ${newMode ? 'enabled' : 'disabled'}!\n\n${newMode ? 'Automatic weather checks are now suspended. You have full control.' : 'Automatic weather monitoring resumed.'}`);
      fetchAlertStatus();
    } catch (err) {
      console.error('Error toggling override mode:', err);
      addLog('Error toggling override mode: ' + err.message);
      alert('Failed to toggle override mode');
    }
  };

  // Export event logs to CSV
  const exportLogsToCSV = async () => {
    try {
      addLog('Exporting event logs to CSV...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/export-logs-csv`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alert-history-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addLog('CSV export completed successfully');
      alert('Alert history exported to CSV successfully!');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      addLog('Error exporting CSV: ' + err.message);
      alert('Failed to export CSV');
    }
  };

  // Delete individual log entry
  const deleteLogEntry = async (logId) => {
    if (!window.confirm('Delete this log entry?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/event-logs/${logId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      addLog(`Deleted log entry #${logId}`);
      fetchEventLogs();
    } catch (err) {
      console.error('Error deleting log entry:', err);
      addLog('Error deleting log: ' + err.message);
      alert('Failed to delete log entry');
    }
  };

  // Reset all event logs
  const resetAllLogs = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL event history!\n\nAre you sure you want to continue?')) {
      return;
    }

    if (!window.confirm('This action cannot be undone. Confirm deletion?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/reset-logs`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      addLog(`All event logs cleared (${response.data.logsCleared} entries)`);
      alert(`Successfully cleared ${response.data.logsCleared} log entries`);
      fetchEventLogs();
    } catch (err) {
      console.error('Error resetting logs:', err);
      addLog('Error resetting logs: ' + err.message);
      alert('Failed to reset logs');
    }
  };

  // Delete a student
  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Refresh the student list
      fetchStudents();
      alert(`${studentName} has been deleted successfully`);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.response?.data?.error || 'Failed to delete student');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchNotificationStats();
    fetchBriefingSettings();
    fetchEventLogs();
    setManualOverrideMode(contextManualMode);
    addLog('Admin panel initialized');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setManualOverrideMode(contextManualMode);
  }, [contextManualMode]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👨‍💼 Admin Dashboard
              </h1>
              <p className="text-gray-300">Student Management - Angeles City Weather Monitor</p>
            </div>
            <Link
              to="/"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-block"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-dark rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-white">{students.length}</p>
          </div>
          <div className="glass-dark rounded-xl p-4">
            <p className="text-gray-400 text-sm">Grade 7-9</p>
            <p className="text-3xl font-bold text-white">
              {students.filter(s => ['Grade 7', 'Grade 8', 'Grade 9'].includes(s.gradeLevel)).length}
            </p>
          </div>
          <div className="glass-dark rounded-xl p-4">
            <p className="text-gray-400 text-sm">Grade 10-12</p>
            <p className="text-3xl font-bold text-white">
              {students.filter(s => ['Grade 10', 'Grade 11', 'Grade 12'].includes(s.gradeLevel)).length}
            </p>
          </div>
          <div className="glass-dark rounded-xl p-4">
            <p className="text-gray-400 text-sm">Active Accounts</p>
            <p className="text-3xl font-bold text-green-400">{students.length}</p>
          </div>
        </div>

        {/* Combined Alert Control Panel */}
        <div className="glass-dark rounded-2xl p-6 mb-6 border-4" style={{ borderColor: alertMode === 'rain' ? '#ef4444' : '#f97316' }}>
          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">
                {alertMode === 'rain' ? '🚨 Weather Alert Control' : '🌡️ Heat Index Alert Control'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setAlertMode('rain')}
                  className={`px-6 py-2 rounded-lg transition-all font-bold text-lg ${
                    alertMode === 'rain'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ☔ Rain Mode
                </button>
                <button
                  onClick={() => setAlertMode('heat')}
                  className={`px-6 py-2 rounded-lg transition-all font-bold text-lg ${
                    alertMode === 'heat'
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🌡️ Heat Mode
                </button>
              </div>
            </div>
          </div>

          {/* Rain Alert Mode */}
          {alertMode === 'rain' && (
            <div>
              {/* Manual Override Toggle */}
              <div className="flex items-center gap-4 mb-6 p-3 bg-slate-700/30 rounded-lg">
                <span className={`text-sm font-semibold flex-1 ${manualOverrideMode || contextManualMode ? 'text-yellow-400' : 'text-green-400'}`}>
                  {manualOverrideMode || contextManualMode ? '🔧 MANUAL OVERRIDE' : '🤖 AUTOMATIC MODE'}
                </span>
                <button
                  onClick={toggleManualOverride}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                    manualOverrideMode || contextManualMode ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                      manualOverrideMode || contextManualMode ? 'translate-x-11' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Rain Alert Level</p>
                    <p className="text-5xl font-bold text-white">{alertLevel}</p>
                  </div>
                  <div className="text-8xl">
                    {alertLevel === 'GREEN' && '🟢'}
                    {alertLevel === 'YELLOW' && '🟡'}
                    {alertLevel === 'ORANGE' && '🟠'}
                    {alertLevel === 'RED' && '🔴'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => setAlertLevel('GREEN', 'No immediate thunderstorm threat. Normal operations.')}
                  className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟢</div>
                  <div>Set GREEN</div>
                  <div className="text-xs opacity-75 mt-1">Normal</div>
                </button>
                <button
                  onClick={() => setAlertLevel('YELLOW', 'Thunderstorm possible. Monitor weather conditions closely.')}
                  className="p-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟡</div>
                  <div>Set YELLOW</div>
                  <div className="text-xs opacity-75 mt-1">Be Alert</div>
                </button>
                <button
                  onClick={() => setAlertLevel('ORANGE', 'Thunderstorm likely. Prepare to take protective action.')}
                  className="p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟠</div>
                  <div>Set ORANGE</div>
                  <div className="text-xs opacity-75 mt-1">Be Prepared</div>
                </button>
                <button
                  onClick={() => setAlertLevel('RED', 'SEVERE thunderstorm threat! Stay indoors immediately!')}
                  className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg animate-pulse"
                >
                  <div className="text-4xl mb-2">🔴</div>
                  <div>Set RED</div>
                  <div className="text-xs opacity-75 mt-1">Take Action</div>
                </button>
              </div>

              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg mb-4">
                <p className="text-red-200 text-sm">
                  ⚠️ <strong>{manualOverrideMode || contextManualMode ? 'Manual Override Active' : 'Auto Detection Mode'}:</strong> {manualOverrideMode || contextManualMode ? 'Automatic weather checks are suspended. You have full control over alert levels.' : 'System automatically detects alert levels based on rainfall and wind speed every 30 minutes. Use buttons above to override when needed.'}
                </p>
              </div>

              {/* Weather Thresholds Info */}
              <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg mb-4">
                <h3 className="text-blue-300 font-bold mb-2">📊 Automatic Detection Thresholds:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-200">
                  <div>
                    <div className="font-semibold">🔴 RED:</div>
                    <div>Heavy rain OR Wind &gt; 60km/h</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟠 ORANGE:</div>
                    <div>Moderate rain OR Wind &gt; 40km/h</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟡 YELLOW:</div>
                    <div>Light-Moderate rain detected</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟢 GREEN:</div>
                    <div>No rain detected</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={forceWeatherCheck}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  🔧 Force Weather Check
                </button>
                <button
                  onClick={() => alert(`PAGASA alerts monitor rainfall and wind speeds. Green = Normal, Yellow = Alert, Orange = Prepare, Red = Severe Danger`)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  ℹ️ Rain Alert Information
                </button>
              </div>
            </div>
          )}

          {/* Heat Index Alert Mode */}
          {alertMode === 'heat' && (
            <div>
              {/* Manual Override Toggle */}
              <div className="flex items-center gap-4 mb-6 p-3 bg-slate-700/30 rounded-lg">
                <span className={`text-sm font-semibold flex-1 ${heatIndexManualMode ? 'text-yellow-400' : 'text-green-400'}`}>
                  {heatIndexManualMode ? '🔧 MANUAL OVERRIDE' : '🤖 AUTOMATIC MODE'}
                </span>
                <button
                  onClick={toggleHeatIndexOverride}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                    heatIndexManualMode ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                      heatIndexManualMode ? 'translate-x-11' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Heat Index Alert Level</p>
                    <p className="text-5xl font-bold text-white">{heatIndexAlertLevel}</p>
                  </div>
                  <div className="text-8xl">
                    {heatIndexAlertLevel === 'GREEN' && '🟢'}
                    {heatIndexAlertLevel === 'YELLOW' && '🟡'}
                    {heatIndexAlertLevel === 'ORANGE' && '🟠'}
                    {heatIndexAlertLevel === 'RED' && '🔴'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => updateHeatIndexAlertLevel('GREEN', 'Heat index conditions normal. No heat stress warning.')}
                  className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟢</div>
                  <div>Set GREEN</div>
                  <div className="text-xs opacity-75 mt-1">&lt; 26°C</div>
                </button>
                <button
                  onClick={() => updateHeatIndexAlertLevel('YELLOW', 'Heat index rising. Stay hydrated and monitor conditions.')}
                  className="p-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟡</div>
                  <div>Set YELLOW</div>
                  <div className="text-xs opacity-75 mt-1">26-32°C</div>
                </button>
                <button
                  onClick={() => updateHeatIndexAlertLevel('ORANGE', 'High heat index. Take precautions and limit outdoor activity.')}
                  className="p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg"
                >
                  <div className="text-4xl mb-2">🟠</div>
                  <div>Set ORANGE</div>
                  <div className="text-xs opacity-75 mt-1">32-40°C</div>
                </button>
                <button
                  onClick={() => updateHeatIndexAlertLevel('RED', 'EXTREME heat index! Avoid outdoor activity. Heat stress risk!')}
                  className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-lg animate-pulse"
                >
                  <div className="text-4xl mb-2">🔴</div>
                  <div>Set RED</div>
                  <div className="text-xs opacity-75 mt-1">&gt; 40°C</div>
                </button>
              </div>

              <div className="p-4 bg-orange-500/20 border border-orange-500 rounded-lg mb-4">
                <p className="text-orange-200 text-sm">
                  ⚠️ <strong>{heatIndexManualMode ? 'Manual Override Active' : 'Auto Detection Mode'}:</strong> {heatIndexManualMode ? 'Automatic heat index checks are suspended. You have full control over alert levels.' : 'System automatically calculates and updates heat index alerts based on temperature and humidity every 30 minutes. Use buttons above to override when needed.'}
                </p>
              </div>

              {/* Heat Index Thresholds Info */}
              <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg mb-4">
                <h3 className="text-blue-300 font-bold mb-2">📊 Heat Index Alert Thresholds:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-200">
                  <div>
                    <div className="font-semibold">🔴 RED:</div>
                    <div>Heat Index &gt; 40°C</div>
                    <div className="text-xs mt-1">Extreme danger</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟠 ORANGE:</div>
                    <div>32-40°C</div>
                    <div className="text-xs mt-1">Very high heat stress</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟡 YELLOW:</div>
                    <div>26-32°C</div>
                    <div className="text-xs mt-1">Moderate heat stress</div>
                  </div>
                  <div>
                    <div className="font-semibold">🟢 GREEN:</div>
                    <div>&lt; 26°C</div>
                    <div className="text-xs mt-1">Normal conditions</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={forceHeatIndexCheck}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  🔧 Force Heat Index Check
                </button>
                <button
                  onClick={() => alert(`Heat Index alerts help protect students from heat-related illnesses. Monitor these conditions closely during hot weather!`)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  ℹ️ Heat Index Information
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Event Logs */}
        <div className="glass-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">📜 Alert Event History</h2>
            
            <div className="flex gap-3">
              <button
                onClick={exportLogsToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <span>📥</span>
                <span>Export to CSV</span>
              </button>
              <button
                onClick={resetAllLogs}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
              >
                🗑️ Reset All History
              </button>
            </div>
          </div>
          
          {eventLogs.length === 0 ? (
            <p className="text-gray-400">No alert events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-gray-400 py-2 px-4">Time</th>
                    <th className="text-left text-gray-400 py-2 px-4">Alert Level</th>
                    <th className="text-left text-gray-400 py-2 px-4">Message</th>
                    <th className="text-left text-gray-400 py-2 px-4">Triggered By</th>
                    <th className="text-left text-gray-400 py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventLogs.slice(0, 20).map((log, index) => (
                    <tr key={index} className="border-b border-slate-800 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                          log.alertLevel === 'GREEN' ? 'bg-green-600' :
                          log.alertLevel === 'YELLOW' ? 'bg-yellow-500' :
                          log.alertLevel === 'ORANGE' ? 'bg-orange-500' :
                          'bg-red-600'
                        }`}>
                          {log.alertLevel === 'GREEN' && '🟢'} 
                          {log.alertLevel === 'YELLOW' && '🟡'} 
                          {log.alertLevel === 'ORANGE' && '🟠'} 
                          {log.alertLevel === 'RED' && '🔴'} 
                          {log.alertLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{log.message}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{log.triggeredBy}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteLogEntry(log.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{log.triggeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Developer Test Tools */}
        <div className="glass-dark rounded-2xl p-6 mb-6 border-2 border-amber-500">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">🔧 Developer Test Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Buttons */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Notification Testing</h3>
                <div className="space-y-3">
                  <button
                    onClick={testSimpleNotification}
                    className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    🔔 Test Simple Notification
                  </button>
                  <button
                    onClick={simulateRainAlert}
                    className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    🌧️ Simulate Rain Alert
                  </button>
                  <button
                    onClick={checkPermissionStatus}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    🔍 Check Permission Status
                  </button>
                </div>
              </div>

              {/* Permission Status */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Current Notification Permission:</p>
                <p className={`text-2xl font-bold ${
                  notificationStatus === 'granted' ? 'text-green-400' : 
                  notificationStatus === 'denied' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {notificationStatus === 'granted' ? '✅ Granted' : 
                   notificationStatus === 'denied' ? '❌ Denied' : '⚠️ Default'}
                </p>
              </div>
            </div>

            {/* System Logs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📋 System Logs (Last 10)</h3>
              <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
                {systemLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Test features will appear here.</p>
                ) : (
                  systemLogs.map((log, index) => (
                    <div key={index} className="text-green-400 mb-2 border-b border-slate-800 pb-2">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500 rounded-lg">
            <p className="text-amber-200 text-sm">
              💡 <strong>Note:</strong> Use these tools to verify notification permissions and simulate rain alerts without waiting for actual weather changes.
            </p>
          </div>
        </div>

        {/* Global Push Notifications Section */}
        <div className="glass-dark rounded-2xl p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">📡 Global Push Notification System</h2>
          
          {/* Routine Briefings Toggle */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-blue-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">📘 30-Minute Routine Briefings</h3>
                <p className="text-gray-300 text-sm">
                  {routineBriefingsEnabled 
                    ? 'Users receive weather updates every 30 minutes regardless of conditions' 
                    : 'Users only receive alerts when rain is detected'}
                </p>
              </div>
              <button
                onClick={toggleRoutineBriefings}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  routineBriefingsEnabled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {routineBriefingsEnabled ? '✅ Enabled' : '❌ Disabled'}
              </button>
            </div>
          </div>

          {/* Statistics */}
          {notificationStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{notificationStats.totalUsers}</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm">Subscribed</p>
                <p className="text-3xl font-bold text-green-400">{notificationStats.subscribedUsers}</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm">Unsubscribed</p>
                <p className="text-3xl font-bold text-orange-400">{notificationStats.unsubscribedUsers}</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm">Subscription Rate</p>
                <p className="text-3xl font-bold text-blue-400">{notificationStats.subscriptionRate}%</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Force Weather Check */}
            <div className="p-5 bg-slate-800/50 rounded-lg border border-green-400">
              <h3 className="text-lg font-semibold text-white mb-3">⚡ Force Weather Check</h3>
              <p className="text-gray-300 text-sm mb-4">
                Manually trigger 30-minute precision check. If rain is detected in the NEXT data point, all users will be notified immediately.
              </p>
              <button
                onClick={forceWeatherCheck}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
              >
                ⚡ Force Update & Notify All
              </button>
            </div>

            {/* Test Global Push */}
            <div className="p-5 bg-slate-800/50 rounded-lg border border-blue-400">
              <h3 className="text-lg font-semibold text-white mb-3">🧪 Test Global Push</h3>
              <p className="text-gray-300 text-sm mb-4">
                Send a test notification to ALL subscribed users to verify the push system is working.
              </p>
              <button
                onClick={testGlobalPush}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
              >
                🧪 Send Test to All Users
              </button>
            </div>

            {/* Manual Broadcast */}
            <div className="p-5 bg-slate-800/50 rounded-lg border border-purple-400">
              <h3 className="text-lg font-semibold text-white mb-3">📢 Custom Broadcast</h3>
              <input
                type="text"
                placeholder="Title (optional)"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2 focus:outline-none focus:border-purple-400"
              />
              <textarea
                placeholder="Enter your message to broadcast to all students..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-3 focus:outline-none focus:border-purple-400 h-24"
              />
              <button
                onClick={notifyAllStudents}
                className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                disabled={!broadcastMessage.trim()}
              >
                📢 Broadcast Message
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>💡 30-Minute Precision System:</strong>
              <br />• Server checks weather every 30 minutes (*/30 cron job)
              <br />• Checks the NEXT immediate forecast (list[0]) for rain
              <br />• When rain detected, ALL subscribed users get instant push notifications
              <br />• Works across Chrome, Arc, Safari, and Mobile
              <br />• Use "Force Update" to manually trigger check and notify all users
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-dark rounded-2xl p-4 mb-6 border-2 border-red-500">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* Students Directory - Organized by Section and Gender */}
        <div className="glass-dark rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">📋 Student Directory</h2>
              <p className="text-gray-400 text-sm mt-1">Organized by Section and Gender</p>
            </div>
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Loading students...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No students registered yet.</p>
            </div>
          ) : (
            (() => {
              // Group students by section
              const studentsBySection = students
                .filter(s => s.username !== 'admin')
                .reduce((acc, student) => {
                  const section = student.section || 'No Section';
                  if (!acc[section]) acc[section] = { Male: [], Female: [] };
                  const gender = student.sex === 'Female' ? 'Female' : 'Male';
                  acc[section][gender].push(student);
                  return acc;
                }, {});

              // Sort sections
              const sortedSections = Object.keys(studentsBySection).sort();

              return (
                <div className="space-y-8">
                  {/* Overall Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                      <p className="text-blue-300 text-sm mb-1">Total Students</p>
                      <p className="text-3xl font-bold text-white">{students.filter(s => s.username !== 'admin').length}</p>
                    </div>
                    <div className="p-4 bg-cyan-500/20 border border-cyan-500 rounded-lg">
                      <p className="text-cyan-300 text-sm mb-1">👨 Male</p>
                      <p className="text-3xl font-bold text-white">
                        {students.filter(s => s.username !== 'admin' && s.sex === 'Male').length}
                      </p>
                    </div>
                    <div className="p-4 bg-pink-500/20 border border-pink-500 rounded-lg">
                      <p className="text-pink-300 text-sm mb-1">👩 Female</p>
                      <p className="text-3xl font-bold text-white">
                        {students.filter(s => s.username !== 'admin' && s.sex === 'Female').length}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
                      <p className="text-purple-300 text-sm mb-1">Sections</p>
                      <p className="text-3xl font-bold text-white">{sortedSections.length}</p>
                    </div>
                  </div>

                  {/* Sections */}
                  {sortedSections.map(section => {
                    const maleStudents = studentsBySection[section].Male;
                    const femaleStudents = studentsBySection[section].Female;
                    const totalInSection = maleStudents.length + femaleStudents.length;

                    return (
                      <div key={section} className="border-2 border-slate-600 rounded-xl p-6 bg-slate-800/30">
                        {/* Section Header */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-600">
                          <div>
                            <h3 className="text-2xl font-bold text-white capitalize">
                              📚 {section}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              Total: {totalInSection} students ({maleStudents.length} Male, {femaleStudents.length} Female)
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Male Students */}
                          <div className="border border-cyan-500/50 rounded-lg p-4 bg-cyan-500/5">
                            <h4 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                              👨 Male Students ({maleStudents.length})
                            </h4>
                            {maleStudents.length === 0 ? (
                              <p className="text-gray-500 text-sm italic">No male students</p>
                            ) : (
                              <div className="space-y-3">
                                {maleStudents.map(student => (
                                  <div key={student.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="text-white font-semibold text-lg">
                                          {student.firstName} {student.middleInitial && `${student.middleInitial}.`} {student.lastName}
                                        </p>
                                        <p className="text-gray-400 text-sm">@{student.username}</p>
                                      </div>
                                      <button
                                        onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-400">Grade:</span>
                                        <span className="text-white ml-1">{student.gradeLevel || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">LRN:</span>
                                        <span className="text-white ml-1 font-mono text-xs">{student.lrn || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Female Students */}
                          <div className="border border-pink-500/50 rounded-lg p-4 bg-pink-500/5">
                            <h4 className="text-xl font-bold text-pink-300 mb-4 flex items-center gap-2">
                              👩 Female Students ({femaleStudents.length})
                            </h4>
                            {femaleStudents.length === 0 ? (
                              <p className="text-gray-500 text-sm italic">No female students</p>
                            ) : (
                              <div className="space-y-3">
                                {femaleStudents.map(student => (
                                  <div key={student.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="text-white font-semibold text-lg">
                                          {student.firstName} {student.middleInitial && `${student.middleInitial}.`} {student.lastName}
                                        </p>
                                        <p className="text-gray-400 text-sm">@{student.username}</p>
                                      </div>
                                      <button
                                        onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-400">Grade:</span>
                                        <span className="text-white ml-1">{student.gradeLevel || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">LRN:</span>
                                        <span className="text-white ml-1 font-mono text-xs">{student.lrn || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Instructions */}
        <div className="glass-dark rounded-2xl p-6 mt-6">
          <h3 className="text-xl font-bold text-white mb-3">ℹ️ Admin Instructions</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• View all registered students and their information</li>
            <li>• Delete student accounts (except admin account)</li>
            <li>• Monitor student demographics by grade level</li>
            <li>• Admin account cannot be deleted for security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
