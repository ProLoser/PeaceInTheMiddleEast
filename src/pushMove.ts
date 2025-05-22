// client/src/game.ts (using compat)

// Import the compat versions
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

// Get database and auth instances using compat
const db = firebase.database();
const auth = firebase.auth();

/**
 * @example pushMove('some-game-id', { from: 'A1', to: 'B2' }, 'next-player-user-id');
 */
export async function pushMove(gameId: string, moveDetails: any) {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('Cannot make move, user not logged in.');
    return;
  }

  // Get a database reference using compat syntax
  // const gameRef = db.ref(`/games/${gameId}`);
  //// TODO ////

  const moveData = {
    ...moveDetails, // Your specific move data
    currentPlayerId: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP // Get server timestamp using compat syntax
  };

  try {
    // Update the 'lastMove' path using compat syntax
    // await gameRef.update({ lastMove: moveData });
    //// TODO ////
    console.log(`Move recorded for game ${gameId}`);
  } catch (error) {
    console.error('Error making move:', error);
  }
}
