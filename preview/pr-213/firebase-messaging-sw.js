// --- IMPORTANT: Service Worker for Background Messages ---
// Handles Firebase background messages and notification click navigation

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

/**
 * @typedef {{
 *   notification?: {
 *     title?: string,
 *     body?: string,
 *     image?: string
 *   },
 *   data?: Record<string, string | undefined>
 * }} FirebaseBackgroundMessagePayload
 */

/**
 * @typedef {{
 *   initializeApp(config: Record<string, string>): void,
 *   messaging(): {
 *     onBackgroundMessage(callback: (payload: FirebaseBackgroundMessagePayload) => void | Promise<void>): void
 *   }
 * }} FirebaseCompatApp
 */

const firebaseConfig = {
  apiKey: "AIzaSyAJ-hHh7fs0aOMR6Zqe0Wu_z_y1j9Ivgos",
  authDomain: "peaceinthemiddleeast.firebaseapp.com",
  databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
  projectId: "peaceinthemiddleeast",
  storageBucket: "peaceinthemiddleeast.firebasestorage.app",
  messagingSenderId: "529824094542",
  appId: "1:529824094542:web:eadc5cf0dc140a2b0de61f",
  measurementId: "G-NKGPNTLDF1"
};

const serviceWorker = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
  /** @type {unknown} */ (self)
);
const firebase = (/** @type {{ firebase: FirebaseCompatApp }} */ (
  /** @type {unknown} */ (serviceWorker)
)).firebase;

firebase.initializeApp(firebaseConfig);

console.log('Service Worker: Firebase initialized.');

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async payload => {
  console.log('Received background message', payload);

  const data = payload.data || {};
  const { title, body, image } = payload.notification || {};
  const { player } = data;
  if (!title) {
    console.log('Notification title missing, skipping notification.');
    return;
  }
  const tag = player || 'new_message';

  const notificationOptions = {
    body,
    icon: '/android-chrome-512x512.png',
    tag,
    renotify: true,
    data: {
      ...data,
      url: `${serviceWorker.location.origin}/${player || ''}`
    },
    ...(image ? { image } : {})
  };

  if ('Notification' in serviceWorker && 'showNotification' in serviceWorker.registration) {
    const existingNotifications = await serviceWorker.registration.getNotifications({ tag });
    existingNotifications.forEach(notification => notification.close());
    await serviceWorker.registration.showNotification(title, notificationOptions);
  } else {
    console.log('Notifications are not supported in this browser.');
  }
});

serviceWorker.addEventListener('notificationclick', /** @param {NotificationEvent} event */ event => {
  if (!event.notification) {
    console.log('Notification object not found in event.');
    return;
  }
  console.log('Notification clicked:', event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || serviceWorker.location.origin;

  event.waitUntil(
    serviceWorker.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ((client.url === targetUrl || client.url === `${targetUrl}/`) && 'focus' in client) {
          console.log('Focusing existing window:', client.url);
          return client.focus();
        }
      }
      if (serviceWorker.clients.openWindow) {
        console.log('Opening new window to:', targetUrl);
        return serviceWorker.clients.openWindow(targetUrl);
      }
    })
  );
});

serviceWorker.addEventListener('activate', /** @param {ExtendableEvent} event */ event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    serviceWorker.clients.claim().then(() => {
      console.log('Service Worker: Claimed clients.');
    })
  );
});
