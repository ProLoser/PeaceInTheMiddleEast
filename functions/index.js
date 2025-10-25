const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();
const tokenCache = new Map();

// Translation strings for "moveNotification"
const translations = {
  en: '{{name}} made a move',
  es: '{{name}} hizo un movimiento',
  fr: '{{name}} a fait un mouvement',
  de: '{{name}} hat einen Zug gemacht',
  ja: '{{name}} さんが動きました',
  ar: '{{name}} قام بحركة',
  he: '{{name}} ביצע מהלך',
  id: '{{name}} membuat gerakan',
  nl: '{{name}} heeft een zet gedaan',
  it: '{{name}} ha fatto una mossa',
  zh: '{{name}} 移动了',
  fi: '{{name}} teki siirron',
  el: '{{name}} έκανε μια κίνηση',
  tr: '{{name}} bir hamle yaptı'
};

function getTranslatedTitle(language, playerName) {
  // Extract language code (first 2 characters)
  const langCode = language ? language.substring(0, 2) : 'en';
  // Get translation template, fallback to English
  const template = translations[langCode] || translations['en'];
  // Replace {{name}} with the actual player name
  return template.replace('{{name}}', playerName);
}

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

  // Query the recipient's language preference from the database
  let recipientLanguage = 'en';
  const recipientLanguageSnapshot = await db.ref(`/users/${move.friend}/language`).once('value');
  if (recipientLanguageSnapshot.exists()) {
    recipientLanguage = recipientLanguageSnapshot.val();
  }

  const message = {
    notification: {
      title: getTranslatedTitle(recipientLanguage, playerName),
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
