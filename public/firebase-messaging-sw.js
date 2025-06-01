// --- IMPORTANT: Service Worker for Background Messages ---
// This file handles messages when your web app is not in the foreground.
// It needs to import and initialize Firebase Messaging itself, using compat!

// public/firebase-messaging-sw.js (using compat)
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// Your Firebase configuration @see src/firebase.config.ts
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

let currentUserId = null;
let processedMoveIds = new Set();

console.log('Service Worker: Loaded and Firebase initialized.');

firebase.messaging().onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/android-chrome-512x512.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked.', event.notification);
  event.notification.close();

  const friend = event.notification.data.friend; // This is opponent's UID, used for URL path
  // const gameId = event.notification.data.gameId; // Game's unique key, if needed for other logic
  // const moveId = event.notification.data.moveId; // Move was removed when notification was shown

  if (friend) {
    // App URL structure is /:friend (e.g., /user123)
    const targetUrl = `${self.location.origin}/${friend}`;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // Check if a window/tab with this game (friend) is already open.
          if ((client.url === targetUrl || client.url === `${targetUrl}/`) && 'focus' in client) {
            console.log('Service Worker: Focusing existing window for friend:', friend);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          console.log('Service Worker: Opening new window for friend:', friend);
          return clients.openWindow(targetUrl);
        }
      })
    );
  } else {
    console.log('Service Worker: No friend in notification data, opening main page.');
    if (clients.openWindow) { // Fallback to open the main page
      return clients.openWindow('/');
    }
  }
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    self.clients.claim().then(() => { // Take control of all clients immediately
      console.log('Service Worker: Claimed clients.');
      // On activation, client should send 'SET_USER_ID' if user is logged in.
      // If SW persisted userId (e.g. in IndexedDB), it could be read here to setup listener early.
      // Example: restoreUserIdAndSetupListener();
    })
  );
});
