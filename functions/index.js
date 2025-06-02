// functions/src/index.ts (NO CHANGE - Admin SDK syntax is standard)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// Cache for FCM tokens
const tokenCache = new Map();

// Listen for new moves and send push notifications
functions.database.ref('/moves')
  .onChildAdded(async (change, context) => {
    const move = change.after.val();
    console.log('New move:', move);

    if (!move.friend) {
      console.log('No friend specified, skipping notification.');
      return null;
    }

    // Check cache first
    let recipientToken = tokenCache.get(move.friend);
    
    // If not in cache, fetch from database
    if (!recipientToken) {
      const recipientTokenSnapshot = await db.ref(`/users/${move.friend}/fcmToken`).once('value');
      recipientToken = recipientTokenSnapshot.val();
      
      if (recipientToken) {
        // Cache the token
        tokenCache.set(move.friend, recipientToken);
      }
    }

    if (!recipientToken) {
      console.log(`No FCM token found for user ${move.friend}.`);
      return null;
    }

    const payload = {
      notification: {
        title: `It's your turn!`,
        body: move.move,
      },
      data: {
        player: move.player,
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(recipientToken, payload);
      console.log('Successfully sent message:', response);

      if (response.results && response.results[0] && response.results[0].error) {
         console.error('Failure sending notification to', recipientToken, ':', response.results[0].error);
         // If token is invalid, remove from cache
         if (response.results[0].error.code === 'messaging/invalid-registration-token') {
           tokenCache.delete(move.friend);
         }
      }

      return null;

    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  });
