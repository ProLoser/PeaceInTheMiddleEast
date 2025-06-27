// --- IMPORTANT: Service Worker for Background Messages ---
// Handles Firebase background messages and notification click navigation

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDSTc5VVNNT32jRE4m8qr7hVbI8ahaIsRc",
  authDomain: "peaceinthemiddleeast.firebaseapp.com",
  databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
  projectId: "peaceinthemiddleeast",
  storageBucket: "peaceinthemiddleeast.appspot.com",
  messagingSenderId: "529824094542",
  appId: "1:529824094542:web:eadc5cf0dc140a2b0de61f",
  measurementId: "G-NKGPNTLDF1"
};

firebase.initializeApp(firebaseConfig);

console.log('Service Worker: Firebase initialized.');

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('Received background message', payload);

  const { title, body } = payload.notification;
  const { player } = payload.data;

  const notificationOptions = {
    body: body,
    icon: '/android-chrome-512x512.png',
    tag: player || 'new_message',
    data: {
      ...payload.data,
      url: `${self.location.origin}/${player || ''}`
    }
  };

  if ('Notification' in self && 'showNotification' in self.registration) {
    self.registration.showNotification(title, notificationOptions);
  } else {
    console.log('Notifications are not supported in this browser.');
  }
});

self.addEventListener('notificationclick', event => {
  if (!event.notification) {
    console.log('Notification object not found in event.');
    return;
  }
  console.log('Notification clicked:', event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ((client.url === targetUrl || client.url === `${targetUrl}/`) && 'focus' in client) {
          console.log('Focusing existing window:', client.url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        console.log('Opening new window to:', targetUrl);
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker: Claimed clients.');
    })
  );
});
