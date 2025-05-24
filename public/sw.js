// public/firebase-messaging-sw.js

// 1. Remove FCM Dependencies (Implicit by not importing messaging-compat.js)

// 2. Import Firebase App and Database
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-database-compat.js');

// 3. Initialize Firebase
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

const firebaseApp = firebase.initializeApp(firebaseConfig);
const database = firebaseApp.database();

// 4. User ID Management
let currentUserId = null;
// dbListener in the subtask is simplified. We need the path ref and the specific callback.
let dbPathRef = null; 
let dbListenerCallback = null; 
let processedMoveIds = new Set(); // Added processedMoveIds

console.log('Service Worker: Loaded and Firebase initialized.');

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_USER_ID') {
    if (currentUserId !== event.data.userId) { // Check if userId actually changed
        console.log('Service Worker: userId changing from', currentUserId, 'to', event.data.userId);
        currentUserId = event.data.userId;
        setupDatabaseListener();
    } else {
        console.log('Service Worker: userId already set to', currentUserId, '. Re-checking listener status.');
        // If for some reason the listener isn't active (e.g. SW restart without persisted UID), set it up.
        if (!dbListenerCallback && currentUserId) {
            setupDatabaseListener();
        }
    }
  } else if (event.data && event.data.type === 'CLEAR_USER_ID') {
    console.log('Service Worker: userId cleared. Old userId was:', currentUserId);
    currentUserId = null;
    if (dbPathRef && dbListenerCallback) {
      dbPathRef.off('child_added', dbListenerCallback); // Detach the specific listener
      dbPathRef = null;
      dbListenerCallback = null;
      console.log('Service Worker: DB listener detached.');
    }
  }
});

// 5. Database Listener Setup
function setupDatabaseListener() {
  // Remove any existing listener
  if (dbPathRef && dbListenerCallback) {
    dbPathRef.off('child_added', dbListenerCallback);
    dbPathRef = null;
    dbListenerCallback = null;
    console.log('Service Worker: Old listener removed before setting up new one.');
  }

  if (!currentUserId) {
    console.log('Service Worker: No user ID, not setting up listener for global /moves path.');
    return;
  }

  const path = '/moves'; 
  console.log('Service Worker: Setting up listener on', path);
  dbPathRef = database.ref(path); 

  const errorCallback = error => {
    console.error('Service Worker: Error in DB listener on path', path, ':', error);
    if (dbPathRef && dbListenerCallback) { 
        dbPathRef.off('child_added', dbListenerCallback);
    }
    dbPathRef = null;
    dbListenerCallback = null;
  };

  dbListenerCallback = snapshot => {
    const moveId = snapshot.key;
    if (processedMoveIds.has(moveId)) {
      return; 
    }

    const moveData = snapshot.val();
    if (moveData && moveData.recipientId === currentUserId && moveData.player !== currentUserId) {
      console.log('Service Worker: Received new move for notification', moveId, moveData);
      
      const title = 'New move in your game!';
      const body = moveData.move || 'Your opponent made a move.';

      const options = {
        body: body,
        icon: '/favicon.ico', 
        data: {
          gameId: moveData.gameId,
          // moveId: moveId, // Not explicitly needed for click action now but can be kept for debugging
          friendId: moveData.player // actorPlayerId is the friend for URL navigation
        },
        tag: `game-${moveData.gameId || moveId}` 
      };
      self.registration.showNotification(title, options);
      processedMoveIds.add(moveId); 
      // No snapshot.ref.remove() as we are listening to a global path
      
    } else {
      // For any other move (self-move, no recipient, not for current user, etc.)
      // console.log('Service Worker: Move seen but not notified:', moveId, moveData);
      processedMoveIds.add(moveId); // Add to processed set to avoid re-evaluating
    }
  };
  
  // Listen to the last 5 moves ordered by timestamp
  dbPathRef.orderByChild('timestamp').limitToLast(5).on('child_added', dbListenerCallback, errorCallback);
  console.log('Service Worker: Listener setup complete for path:', path, 'with limitToLast(5)');
}
    if (dbPathRef && dbListenerCallback) { // Clean up on error
        dbPathRef.off('child_added', dbListenerCallback);
    }
    dbPathRef = null;
    dbListenerCallback = null;
    // Consider re-trying setup after a delay for transient errors.
  });
  console.log('Service Worker: Listener setup complete for path:', path);
}

// 6. Handle Notification Click
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked.', event.notification);
  event.notification.close();
  
  const friendId = event.notification.data.friendId; // This is opponent's UID, used for URL path
  // const gameId = event.notification.data.gameId; // Game's unique key, if needed for other logic
  // const moveId = event.notification.data.moveId; // Move was removed when notification was shown

  if (friendId) {
    // App URL structure is /:friendId (e.g., /user123)
    const targetUrl = `${self.location.origin}/${friendId}`; 
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // Check if a window/tab with this game (friendId) is already open.
          if ((client.url === targetUrl || client.url === `${targetUrl}/`) && 'focus' in client) {
            console.log('Service Worker: Focusing existing window for friend:', friendId);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          console.log('Service Worker: Opening new window for friend:', friendId);
          return clients.openWindow(targetUrl);
        }
      })
    );
  } else {
    console.log('Service Worker: No friendId in notification data, opening main page.');
    if (clients.openWindow) { // Fallback to open the main page
        return clients.openWindow('/');
    }
  }
});

// 7. Service Worker Lifecycle
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Ensures the new service worker activates immediately
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
