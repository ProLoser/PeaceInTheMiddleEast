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

  // Try to get tokens from cache first
  let recipientTokens = tokenCache.get(move.friend);

  if (!recipientTokens) {
    // Get fcmTokens structure (token is the key, value is {ts, ua})
    const fcmTokensSnapshot = await db.ref(`/users/${move.friend}/fcmTokens`).once('value');
    const fcmTokensObject = fcmTokensSnapshot.val();
    
    if (fcmTokensObject && typeof fcmTokensObject === 'object') {
      // Tokens are the keys of the object
      recipientTokens = Object.keys(fcmTokensObject);
    } else {
      // Fall back to legacy fcmToken (single device)
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

  // Send notification to all devices using multicast
  const message = {
    notification: {
      title: `${playerName} made a move`,
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
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount}/${recipientTokens.length} notifications`);
    
    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(recipientTokens[idx]);
          }
        }
      });
      
      if (tokensToRemove.length > 0) {
        console.log(`Removing ${tokensToRemove.length} invalid token(s) for user ${move.friend}`);
        tokenCache.delete(move.friend);
        // Remove invalid tokens from database
        await Promise.all(
          tokensToRemove.map(token => 
            db.ref(`/users/${move.friend}/fcmTokens/${token}`).remove()
          )
        );
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error sending multicast message:', error);
    return null;
  }
});
