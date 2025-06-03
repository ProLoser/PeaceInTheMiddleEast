const {onValueCreated} = require("firebase-functions/v2/database");
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();
const tokenCache = new Map();

exports.sendMoveNotification = onValueCreated('/moves/{moveId}', async event => {
    const move = event.data.val();

    if (!move.friend) {
      console.log('No friend specified, skipping notification.');
      return null;
    }

    let recipientToken = tokenCache.get(move.friend);
    
    if (!recipientToken) {
      const recipientTokenSnapshot = await db.ref(`/users/${move.friend}/fcmToken`).once('value');
      recipientToken = recipientTokenSnapshot.val();
      
      if (recipientToken) {
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
      token: recipientToken,
      data: {
        player: move.player,
      }
  };

    try {
      const response = await admin.messaging().send(payload);
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
