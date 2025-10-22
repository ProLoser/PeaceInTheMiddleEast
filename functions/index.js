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
    // Try new fcmTokens structure (multiple devices)
    const fcmTokensSnapshot = await db.ref(`/users/${move.friend}/fcmTokens`).once('value');
    const fcmTokensObject = fcmTokensSnapshot.val();
    
    if (fcmTokensObject && typeof fcmTokensObject === 'object') {
      recipientTokens = Object.values(fcmTokensObject);
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

  // Send notification to all devices
  const sendPromises = recipientTokens.map(async (token) => {
    const payload = {
      token: token,
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
      }
    };

    try {
      const response = await admin.messaging().send(payload);
      console.log('Successfully sent message to device:', response);
      return { success: true, token };
    } catch (error) {
      console.error('Error sending message to device:', error);
      // Optionally remove bad token from cache
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        console.log(`Removing invalid token for user ${move.friend}`);
        tokenCache.delete(move.friend);
        // Also remove from database
        const fcmTokensSnapshot = await db.ref(`/users/${move.friend}/fcmTokens`).once('value');
        const fcmTokensObject = fcmTokensSnapshot.val();
        if (fcmTokensObject) {
          for (const [deviceId, deviceToken] of Object.entries(fcmTokensObject)) {
            if (deviceToken === token) {
              await db.ref(`/users/${move.friend}/fcmTokens/${deviceId}`).remove();
              break;
            }
          }
        }
      }
      return { success: false, token, error };
    }
  });

  try {
    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`Sent notifications to ${successCount}/${recipientTokens.length} devices`);
    return null;
  } catch (error) {
    console.error('Error in batch send:', error);
    return null;
  }
});
