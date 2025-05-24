import { GameType } from '../Types';

export const isValidMove = (
  game: GameType,
  from: number | 'white' | 'black',
  to: number | 'off',
  diceValue: number
): boolean => {
  const board = game.board;
  let playerColor: 'white' | 'black' | null = game.color;
  let opponentColorSign: number;
  let playerColorSign: number;

  if (playerColor === 'white') {
    playerColorSign = 1;
    opponentColorSign = -1;
  } else if (playerColor === 'black') {
    playerColorSign = -1;
    opponentColorSign = 1;
  } else {
    return false; // Invalid game state
  }

  // 1. Re-entering logic (handles cases where player has pieces in prison)
  if (playerColor === 'white' && game.prison.white > 0) {
    if (from !== 'white' || typeof to !== 'number') return false;
    const entryPointWhite = diceValue - 1;
    if (to !== entryPointWhite) return false;
    if (to < 0 || to > 5) return false; // Should be redundant if diceValue is 1-6
    const toPointPieces = board[to];
    if (Math.sign(toPointPieces) === opponentColorSign && Math.abs(toPointPieces) > 1) return false;
    return true;
  }

  if (playerColor === 'black' && game.prison.black > 0) {
    if (from !== 'black' || typeof to !== 'number') return false;
    const entryPointBlack = 24 - diceValue;
    if (to !== entryPointBlack) return false;
    if (to < 18 || to > 23) return false; // Should be redundant if diceValue is 1-6
    const toPointPieces = board[to];
    if (Math.sign(toPointPieces) === opponentColorSign && Math.abs(toPointPieces) > 1) return false;
    return true;
  }

  // If execution reaches here, player has no pieces on the bar.
  // Now, handle bearing off OR standard board moves.

  if (to === 'off') {
    // --- BEARING OFF LOGIC ---
    if (typeof from !== 'number') {
      return false; // Cannot bear off from the bar (e.g. if from === 'white' but prison.white is 0)
    }

    // Check if all player's pieces are in their home board
    let allPiecesInHomeBoard = true;
    if (playerColor === 'white') {
      if (game.prison.white > 0) { // Double check, though covered above
        allPiecesInHomeBoard = false;
      } else {
        for (let i = 6; i <= 23; i++) { // Points 7 to 24
          if (board[i] !== 0 && Math.sign(board[i]) === playerColorSign) {
            allPiecesInHomeBoard = false;
            break;
          }
        }
      }
    } else { // playerColor === 'black'
      if (game.prison.black > 0) { // Double check
        allPiecesInHomeBoard = false;
      } else {
        for (let i = 0; i <= 17; i++) { // Points 1 to 18
          if (board[i] !== 0 && Math.sign(board[i]) === playerColorSign) {
            allPiecesInHomeBoard = false;
            break;
          }
        }
      }
    }

    if (!allPiecesInHomeBoard) {
      return false;
    }

    // Validate Bearing Off from the `from` Point
    if (Math.sign(board[from]) !== playerColorSign) {
        return false; // Not player's piece at 'from'
    }

    if (playerColor === 'white') {
      if (from < 0 || from > 5) return false; // `from` must be in White's home board (0-5)

      const targetPointForExactBearOff = diceValue - 1; // 0-indexed
      if (from === targetPointForExactBearOff) {
        return true; // Direct bear off
      }
      if (targetPointForExactBearOff > from) { // Rolled higher than the point
        // Check if all points between targetPointForExactBearOff and 'from' are clear
        for (let p = targetPointForExactBearOff; p > from; p--) {
           // Check points from (diceValue-1) down to (from + 1)
           // The problem states "iterate from p = diceValue - 1 down to from + 1"
           // My loop is p > from, so it covers from+1 up to diceValue-1.
           // Example: from=0 (point 1), dice=3 (target=2). Loop p=2 down to 1. board[p] (board[2], board[1])
           // This seems to check points *higher* than 'from' correctly.
           if (p >=0 && p <=5 && board[p] !== 0 && Math.sign(board[p]) === playerColorSign) {
             return false; // Must move piece from a higher point first
           }
        }
        return true; // Can bear off with higher die roll
      }
      return false; // Invalid bear-off (e.g. diceValue - 1 < from)
    } else { // playerColor === 'black'
      if (from < 18 || from > 23) return false; // `from` must be in Black's home board (18-23)
      
      const targetPointForExactBearOff = 24 - diceValue; // 0-indexed
      if (from === targetPointForExactBearOff) {
        return true; // Direct bear off
      }
      if (targetPointForExactBearOff < from) { // Rolled higher than the point (target is lower index for black)
        // Check if all points between targetPointForExactBearOff and 'from' are clear
        for (let p = targetPointForExactBearOff; p < from; p++) {
            // Check points from (24-diceValue) up to (from -1)
            // Example: from=23 (point 24), dice=3 (target=21). Loop p=21 up to 22. board[p] (board[21], board[22])
            if (p >= 18 && p <= 23 && board[p] !== 0 && Math.sign(board[p]) === playerColorSign) {
              return false; // Must move piece from a higher point first (closer to 24 for black)
            }
        }
        return true; // Can bear off with higher die roll
      }
      return false; // Invalid bear-off (e.g. 24 - diceValue > from)
    }

  } else {
    // --- STANDARD POINT-TO-POINT MOVE LOGIC ---
    // Ensure 'from' and 'to' are numbers for standard moves.
    if (typeof from !== 'number' || typeof to !== 'number') {
      // If from is 'white'/'black', it implies moving from an empty bar (already handled if prison > 0).
      // If to is 'off', it's handled above.
      return false;
    }

    // Preliminary check for 'from' and 'to' point validity (0-23 range)
    if (from < 0 || from > 23 || to < 0 || to > 23) {
      return false;
    }

    // Check Piece at `from` Point
    const fromPointPieces = board[from];
    if (Math.sign(fromPointPieces) !== playerColorSign) {
      return false;
    }

    // Direction of Movement & Target Point Calculation
    if (playerColorSign === 1) { // White
      if (to !== from - diceValue) return false;
      if (to >= from) return false;
    } else { // Black (playerColorSign === -1)
      if (to !== from + diceValue) return false;
      if (to <= from) return false;
    }
    
    // Check Destination Point (`to`)
    const toPointPiecesOnBoard = board[to];
    if (Math.sign(toPointPiecesOnBoard) === opponentColorSign && Math.abs(toPointPiecesOnBoard) > 1) {
      return false;
    }

    return true;
  }
};
