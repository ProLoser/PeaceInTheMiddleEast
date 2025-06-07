import firebase from './firebase.config';

// Initialize Firebase (using the compat app import)
// const firebase = firebase.initializeApp(firebaseConfig);
// Access services directly from the app instance or the global firebase object
const messaging = firebase.messaging(); // Or firebase.messaging() if using script tags
const db = firebase.database();       // Or firebase.database()
const auth = firebase.auth();         // Or firebase.auth()


// Get the FCM registration token and save it to the database
export async function saveMessagingDeviceToken() {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.log('User not logged in, cannot save token.');
    return;
  }

  try {
    // Request permission (using the compat messaging instance)  
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Get token (using the compat messaging instance)
      // VAPID key is required for web push (generate in Firebase Console -> Project settings -> Cloud Messaging)
      // Note: getToken is part of the v9 web API, which compat wraps
      const currentToken = await messaging.getToken({ vapidKey: 'BM1H9qfv1e_XcIB31ZeLCn8IpGOdMIwMShRej6wld8QAMkV4YqJ-eMQa1rSnwhkmVmAFw3tvUdlP2JzZmgTq4Fk' });

      if (currentToken) {
        console.log('FCM registration token:', currentToken);
        // Save the token to your database (using compat database syntax)
        await db.ref(`/users/${userId}/fcmToken`).set(currentToken);
        console.log('FCM token saved to database.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get notification permission.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token or setting it up.', error);
  }
}

// Listen for incoming messages while the app is in the foreground (using compat messaging)
// Note: onMessage is part of the v9 web API, which compat wraps
messaging.onMessage((payload) => {
  console.log('Message received in foreground.', payload);
  // Display the notification to the user in the app UI
  // if (payload.notification) {
  //     alert(`New move in game: ${payload.notification.body}`); // Simple example
  // }
});

// see public/firebase-messaging-sw.js
