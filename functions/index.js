// functions/src/index.ts (NO CHANGE - Admin SDK syntax is standard)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// Listen for new moves in games
// Assuming moves are stored like /games/{gameId}/moves/{moveId}
// Or simpler for this example, let's say the 'lastMove' is updated at /games/{gameId}/lastMove
export const sendMoveNotification = functions.database.ref('/games/{gameId}/lastMove')
  .onUpdate(async (change, context) => {
    const afterData = change.after.val();
    const gameId = context.params.gameId;

    console.log(`Move updated in game ${gameId}:`, afterData);

    // --- Your game logic here ---
    const nextPlayerId = afterData.nextPlayerId;
    const moveMessage = afterData.message || "A move was made!";
    const currentPlayerId = afterData.currentPlayerId;

    if (!nextPlayerId || nextPlayerId === currentPlayerId) {
      console.log('No next player specified or same player, skipping notification.');
      return null;
    }

    const recipientTokenSnapshot = await db.ref(`/users/${nextPlayerId}/fcmToken`).once('value');
    const recipientToken = recipientTokenSnapshot.val();

    if (!recipientToken) {
      console.log(`No FCM token found for user ${nextPlayerId}.`);
      return null;
    }

    // --- Construct and Send the FCM Message ---
    const payload = {
      notification: {
        title: `It's your turn in Game ${gameId}!`,
        body: moveMessage,
      },
      data: {
        gameId: gameId,
        type: 'new_move',
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(recipientToken, payload);
      console.log('Successfully sent message:', response);

      if (response.results && response.results[0] && response.results[0].error) {
         console.error('Failure sending notification to', recipientToken, ':', response.results[0].error);
      }

      return null;

    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  });
