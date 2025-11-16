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

  let recipientTokens = tokenCache.get(move.friend);

  if (!recipientTokens) {
    const fcmTokensSnapshot = await db.ref(`/users/${move.friend}/fcmTokens`).once('value');
    const fcmTokensObject = fcmTokensSnapshot.val();
    
    if (fcmTokensObject && typeof fcmTokensObject === 'object') {
      recipientTokens = Object.keys(fcmTokensObject);
    } else {
      const recipientTokenSnapshot = await db.ref(`/users/${move.friend}/fcmToken`).once('value');
      const legacyToken = recipientTokenSnapshot.val();
      if (legacyToken) {
        recipientTokens = [legacyToken];
      }
    }

    if (recipientTokens && recipientTokens.length > 0) {
      tokenCache.set(move.friend, recipientTokens);
    }
  }

  if (!recipientTokens || recipientTokens.length === 0) {
    console.log(`No FCM token found for user ${move.friend}.`);
    return null;
  }

  // Query the player's name from the database
  let playerName = move.player;
  if (move.player) {
    const playerNameSnapshot = await db.ref(`/users/${move.player}/name`).once('value');
    if (playerNameSnapshot.exists()) {
      playerName = playerNameSnapshot.val();
    }
  }

  const message = {
    notification: {
      title: `${playerName} moved`,
      body: move.move
    },
    data: {
      player: move.player
    },
    webpush: {
      notification: {
        tag: move.player
      }
    },
    tokens: recipientTokens
  };

  try {
    console.log('Multicasting move', message)
    const response = await admin.messaging().sendEachForMulticast(message);
    
    response.responses.forEach((resp, idx) => {
      if (!resp.success && 
          (resp.error.code === 'messaging/invalid-registration-token' ||
           resp.error.code === 'messaging/registration-token-not-registered')) {
        tokenCache.delete(move.friend);
        db.ref(`/users/${move.friend}/fcmTokens/${recipientTokens[idx]}`).remove();
      }
    });
    
    return null;
  } catch (error) {
    console.error('Error sending multicast message:', error);
    return null;
  }
});
