// TODO: Identify how to create service worker with VITE properly
// --- IMPORTANT: Service Worker for Background Messages ---
// Create a `firebase-messaging-sw.js` file in your public directory.
// This file handles messages when your web app is not in the foreground.
// It needs to import and initialize Firebase Messaging itself, using compat!

// public/firebase-messaging-sw.js (using compat)
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// Your Firebase configuration
const firebaseConfig = {
  // ... your config (should be same as client config)
};

// Initialize Firebase using the compat API
const firebaseApp = firebase.initializeApp(firebaseConfig); // Use firebase.initializeApp

// Retrieve firebase messaging instance using the compat API
const messaging = firebaseApp.messaging(); // Use firebaseApp.messaging()

// Handle incoming messages in the background (using compat messaging)
messaging.onBackgroundMessage((payload) => { // Use messaging.onBackgroundMessage
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Or your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});