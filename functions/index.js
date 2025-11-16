const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

exports.sendMoveNotification = onValueCreated('/moves/{moveId}', async event => {
  const move = event.data.val();

  if (!move.friend) {
    console.log('No friend specified, skipping notification.');
    return null;
  }

  const friendSnapshot = await db.ref(`/users/${move.friend}`).once('value');
  const friendData = friendSnapshot.val();
  
  if (!friendData) {
    console.log(`User ${move.friend} not found.`);
    return null;
  }

  let recipientTokens = [];
  
  if (friendData.fcmTokens && typeof friendData.fcmTokens === 'object') {
    recipientTokens = Object.keys(friendData.fcmTokens);
  }
  
  if (friendData.fcmToken && typeof friendData.fcmToken === 'string') {
    recipientTokens.push(friendData.fcmToken);
  }

  if (recipientTokens.length === 0) {
    console.log(`No FCM token found for user ${move.friend}.`);
    return null;
  }

  // Query the player's name and avatar from the database
  let playerName = move.player;
  let avatarUrl = null;
  if (move.player) {
    const playerSnapshot = await db.ref(`/users/${move.player}`).once('value');
    if (playerSnapshot.exists()) {
      const playerData = playerSnapshot.val();
      if (playerData.name) {
        playerName = playerData.name;
      }
      avatarUrl = playerData.photoURL || null;
    }
    // Fallback to pravatar if photoURL is null or doesn't exist
    if (!avatarUrl) {
      avatarUrl = `https://i.pravatar.cc/100?u=${move.player}`;
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
        tag: move.player,
        renotify: true,
        image: avatarUrl
      }
    },
    tokens: recipientTokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    response.responses.forEach((resp, idx) => {
      if (!resp.success && 
          (resp.error.code === 'messaging/invalid-registration-token' ||
           resp.error.code === 'messaging/registration-token-not-registered')) {
        const invalidToken = recipientTokens[idx];
        if (friendData.fcmTokens && friendData.fcmTokens[invalidToken]) {
          db.ref(`/users/${move.friend}/fcmTokens/${invalidToken}`).remove();
        } else if (friendData.fcmToken === invalidToken) {
          db.ref(`/users/${move.friend}/fcmToken`).remove();
        }
      } else if (!resp.success) {
        console.log('Error sending notification:', resp.error)
      }
    });
    
    return null;
  } catch (error) {
    console.error('Error sending multicast message:', error);
    return null;
  }
});
