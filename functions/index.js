const { onValueCreated } = require("firebase-functions/v2/database");
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
    token: recipientToken,
    notification: {
      title: `It's your turn!`,
      body: move.move
    },
    data: {
      player: move.player
    },
    webpush: {
      notification: {
        tag: move.player
      }
    }
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log('Successfully sent message:', response);
    return null;
  } catch (error) {
    console.error('Error sending message:', error);
    // Optionally remove bad token from cache
    if (error.code === 'messaging/invalid-registration-token') {
      tokenCache.delete(move.friend);
    }
    return null;
  }
});
