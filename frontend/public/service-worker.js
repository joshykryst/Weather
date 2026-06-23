/* eslint-disable no-restricted-globals */

// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Weather Alert',
    body: 'You have a new weather notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { url: '/', alertLevel: 'GREEN' },
    vibrate: [200, 100, 200]
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  // Get alert level from notification data
  const alertLevel = notificationData.data?.alertLevel || notificationData.data?.alertInfo?.alertLevel;
  
  // Define vibration patterns based on alert level (matches backend patterns)
  const vibrationPatterns = {
    'GREEN': null,  // No vibration for green
    'YELLOW': [200, 100, 200],
    'ORANGE': [300, 100, 300, 100, 300],
    'RED': [500, 200, 500, 200, 500, 200, 500, 200, 500]
  };

  // Use alert-level specific vibration if available, otherwise use payload vibration
  const vibratePattern = vibrationPatterns[alertLevel] || notificationData.vibrate || [200, 100, 200];

  // Play alarm sound for high-priority alerts
  if (alertLevel === 'YELLOW' || alertLevel === 'ORANGE' || alertLevel === 'RED') {
    // Send message to all clients to play alarm
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PLAY_ALARM',
              alertLevel: alertLevel
            });
          });
        })
    );
  }

  console.log(`📳 Vibration pattern for ${alertLevel}:`, vibratePattern);

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon || '/logo192.png',
      badge: notificationData.badge || '/logo192.png',
      vibrate: vibratePattern,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction || false,
      tag: `alert-${alertLevel || 'default'}`,
      renotify: true,
      actions: [
        {
          action: 'open',
          title: 'View Dashboard'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the ACSci Alert Dashboard when notification is clicked
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync (optional, for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
});
