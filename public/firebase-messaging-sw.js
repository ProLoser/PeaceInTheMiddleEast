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

// Cache for loaded translations
const translationCache = new Map();

// Function to get user's language preference
async function getUserLanguage() {
  try {
    // Try to get language from IndexedDB or localStorage
    const dbRequest = indexedDB.open('firebaseLocalStorageDb');
    
    return new Promise((resolve) => {
      dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains('firebaseLocalStorage')) {
          const transaction = db.transaction(['firebaseLocalStorage'], 'readonly');
          const store = transaction.objectStore('firebaseLocalStorage');
          const request = store.getAll();
          
          request.onsuccess = () => {
            const items = request.result;
            for (const item of items) {
              if (item.value && item.value.language) {
                resolve(item.value.language);
                return;
              }
            }
            // Fallback to browser language
            resolve(navigator.language || 'en');
          };
          
          request.onerror = () => {
            resolve(navigator.language || 'en');
          };
        } else {
          resolve(navigator.language || 'en');
        }
      };
      
      dbRequest.onerror = () => {
        resolve(navigator.language || 'en');
      };
    });
  } catch (error) {
    console.error('Error getting user language:', error);
    return navigator.language || 'en';
  }
}

// Function to load translation
async function loadTranslation(language) {
  const langCode = language ? language.substring(0, 2) : 'en';
  
  if (translationCache.has(langCode)) {
    return translationCache.get(langCode);
  }
  
  try {
    const response = await fetch(`/locales/${langCode}/translation.json`);
    if (response.ok) {
      const translations = await response.json();
      translationCache.set(langCode, translations);
      return translations;
    }
  } catch (error) {
    console.error(`Error loading translation for ${langCode}:`, error);
  }
  
  // Fallback to English
  if (langCode !== 'en') {
    try {
      const response = await fetch('/locales/en/translation.json');
      if (response.ok) {
        const translations = await response.json();
        translationCache.set('en', translations);
        return translations;
      }
    } catch (error) {
      console.error('Error loading English fallback:', error);
    }
  }
  
  return {};
}

// Function to translate notification title
function translateTitle(title, playerName, translation) {
  // Check if this is the move notification (contains "made a move")
  if (title && title.includes('made a move')) {
    if (translation && translation.moveNotification) {
      return translation.moveNotification.replace('{{name}}', playerName);
    }
  }
  return title;
}

messaging.onBackgroundMessage(async payload => {
  console.log('Received background message', payload);

  const { title, body } = payload.notification;
  const { player } = payload.data;

  // Get user's language and translation
  const userLanguage = await getUserLanguage();
  const translation = await loadTranslation(userLanguage);
  
  // Extract player name from the title (assuming format "PlayerName made a move")
  const playerName = title ? title.replace(' made a move', '').trim() : player;
  
  // Translate the title
  const translatedTitle = translateTitle(title, playerName, translation);

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
    self.registration.showNotification(translatedTitle, notificationOptions);
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
