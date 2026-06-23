// Generate alert sound using Web Audio API
// This creates an emergency siren-style alert sound

function generateAlertSound(alertLevel) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Different sound patterns for different alert levels
  const patterns = {
    YELLOW: { duration: 1.5, oscillations: 3, startFreq: 800, endFreq: 1200 },
    ORANGE: { duration: 2.0, oscillations: 4, startFreq: 700, endFreq: 1400 },
    RED: { duration: 3.0, oscillations: 6, startFreq: 600, endFreq: 1600 }
  };
  
  const pattern = patterns[alertLevel] || patterns.YELLOW;
  
  return new Promise((resolve) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create siren effect by modulating frequency
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
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + pattern.duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + pattern.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + pattern.duration);
    
    oscillator.onended = () => {
      resolve();
    };
  });
}

// Export for use in service worker
if (typeof self !== 'undefined' && self.registration) {
  self.generateAlertSound = generateAlertSound;
}
