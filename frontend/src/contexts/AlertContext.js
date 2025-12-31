import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AlertContext = createContext();

// Export AlertContext for direct import
export { AlertContext };

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertLevel, setAlertLevel] = useState('GREEN');
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [manualOverrideMode, setManualOverrideMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);

  // Play siren sound for dangerous alert levels
  const playSiren = (level) => {
    if (!audioEnabled) return;
    
    try {
      // Create audio context on first use
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = audioContext || new AudioContext();
      if (!audioContext) setAudioContext(ctx);

      // Different siren patterns for different levels
      const patterns = {
        YELLOW: { duration: 1, frequencies: [800, 1000], repeat: 2, vibrate: [200, 100, 200] },
        ORANGE: { duration: 1.5, frequencies: [800, 1200], repeat: 3, vibrate: [300, 100, 300, 100, 300] },
        RED: { duration: 2, frequencies: [600, 1400], repeat: 5, vibrate: [500, 200, 500, 200, 500, 200, 500, 200, 500] }
      };

      const pattern = patterns[level];
      if (!pattern) return;

      // Vibrate device if supported
      if (navigator.vibrate) {
        navigator.vibrate(pattern.vibrate);
        console.log(`📳 Device vibrating for ${level} alert`);
      }

      let currentRepeat = 0;
      const playTone = () => {
        if (currentRepeat >= pattern.repeat) return;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = pattern.frequencies[0];
        
        // Ramp between frequencies for siren effect
        const now = ctx.currentTime;
        oscillator.frequency.setValueAtTime(pattern.frequencies[0], now);
        oscillator.frequency.linearRampToValueAtTime(pattern.frequencies[1], now + pattern.duration / 2);
        oscillator.frequency.linearRampToValueAtTime(pattern.frequencies[0], now + pattern.duration);
        
        // Fade in/out
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + pattern.duration);
        
        oscillator.start(now);
        oscillator.stop(now + pattern.duration);
        
        currentRepeat++;
        if (currentRepeat < pattern.repeat) {
          setTimeout(playTone, pattern.duration * 1000 + 200);
        }
      };
      
      playTone();
      console.log(`🚨 ${level} alert siren activated with vibration`);
    } catch (error) {
      console.error('Error playing siren:', error);
    }
  };

  const fetchAlertStatus = useCallback(async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${API_BASE_URL}/api/alert-status`);
      if (response.data.success) {
        const newLevel = response.data.currentAlertLevel;
        const oldLevel = alertLevel;
        
        setAlertLevel(newLevel);
        setRecentEvents(response.data.recentEvents || []);
        setLastUpdate(response.data.lastUpdate);
        setManualOverrideMode(response.data.manualOverrideMode || false);
        
        // Play siren and vibrate when alert level changes to warning/danger
        if (oldLevel !== newLevel && ['YELLOW', 'ORANGE', 'RED'].includes(newLevel)) {
          console.log(`⚠️ Alert changed from ${oldLevel} to ${newLevel} - Playing siren`);
          playSiren(newLevel);
          
          // Also vibrate directly (in addition to playSiren vibration)
          if ('vibrate' in navigator) {
            const patterns = {
              YELLOW: [200, 100, 200],
              ORANGE: [300, 100, 300, 100, 300],
              RED: [500, 200, 500, 200, 500, 200, 500, 200, 500]
            };
            navigator.vibrate(patterns[newLevel]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching alert status:', error);
    }
  }, [alertLevel, playSiren]);

  useEffect(() => {
    fetchAlertStatus();
    const interval = setInterval(fetchAlertStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAlertStatus]);

  const getThemeColors = () => {
    const themes = {
      GREEN: {
        bg: 'bg-slate-900',
        text: 'text-gray-100',
        header: 'bg-green-600',
        card: 'bg-slate-800',
        button: 'bg-green-600 hover:bg-green-700',
        emoji: '🟢',
        name: 'NORMAL',
        description: 'No immediate thunderstorm threat'
      },
      YELLOW: {
        bg: 'bg-yellow-50',
        text: 'text-gray-900',
        header: 'bg-yellow-500',
        card: 'bg-yellow-100',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        emoji: '🟡',
        name: 'BE ALERT',
        description: 'Thunderstorm possible - Monitor conditions'
      },
      ORANGE: {
        bg: 'bg-orange-50',
        text: 'text-gray-900',
        header: 'bg-orange-500',
        card: 'bg-orange-100',
        button: 'bg-orange-600 hover:bg-orange-700',
        emoji: '🟠',
        name: 'BE PREPARED',
        description: 'Thunderstorm likely - Prepare to take action'
      },
      RED: {
        bg: 'bg-red-50',
        text: 'text-gray-900',
        header: 'bg-red-600',
        card: 'bg-red-100',
        button: 'bg-red-600 hover:bg-red-700',
        emoji: '🔴',
        name: 'TAKE ACTION',
        description: 'Severe thunderstorm threat - Stay indoors'
      }
    };
    return themes[alertLevel] || themes.GREEN;
  };

  return (
    <AlertContext.Provider value={{
      alertLevel,
      recentEvents,
      lastUpdate,
      manualOverrideMode,
      getThemeColors,
      fetchAlertStatus,
      audioEnabled,
      setAudioEnabled,
      playSiren
    }}>
      {children}
    </AlertContext.Provider>
  );
};
