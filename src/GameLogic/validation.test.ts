import { isValidMove } from './validation';
import { type GameType } from '../Types';
import { DEFAULT_BOARD, newGame } from '../Utils'; // Assuming newGame and DEFAULT_BOARD are exported from Utils

// Helper function to create game states
const createGameState = (
  boardSetup: number[] | null,
  dice: [number, number],
  color: 'white' | 'black',
  whitePrison: number = 0,
  blackPrison: number = 0,
  whiteHome: number = 0,
  blackHome: number = 0
): GameType => {
  const game = newGame();
  if (boardSetup) {
    game.board = [...boardSetup];
  } else {
    game.board = [...DEFAULT_BOARD];
  }
  game.dice = dice;
  game.color = color;
  game.turn = 'player1'; // Dummy turn ID
  game.prison = { white: whitePrison, black: blackPrison };
  game.home = { white: whiteHome, black: blackHome };
  game.status = 'rolled'; // Assume dice have been rolled
  return game;
};

describe('isValidMove - Standard Moves', () => {
  it('should allow White to move to an empty point with correct die', () => {
    const board = [...DEFAULT_BOARD];
    board[11] = 1; // White piece on point 12 (0-indexed: 11)
    board[5] = 0;  // Point 6 (0-indexed: 5) is empty
    const game = createGameState(board, [6, 1], 'white');
    expect(isValidMove(game, 11, 5, 6)).toBe(true);
  });

  it('should allow Black to move to their own piece with correct die', () => {
    const board = [...DEFAULT_BOARD];
    board[12] = -1; // Black piece on point 13 (0-indexed: 12)
    board[17] = -1; // Black piece on point 18 (0-indexed: 17)
    const game = createGameState(board, [5, 2], 'black');
    expect(isValidMove(game, 12, 17, 5)).toBe(true);
  });

  it('should allow White to hit a Black blot', () => {
    const board = [...DEFAULT_BOARD];
    board[20] = 1;  // White piece on point 21 (0-indexed: 20)
    board[17] = -1; // Black blot on point 18 (0-indexed: 17)
    const game = createGameState(board, [3, 4], 'white');
    expect(isValidMove(game, 20, 17, 3)).toBe(true);
  });

  it('should not allow Black to land on White\'s blocked point', () => {
    const board = [...DEFAULT_BOARD];
    board[5] = -1; // Black piece on point 6 (0-indexed: 5)
    board[8] = 2;  // White blocked point at 9 (0-indexed: 8)
    const game = createGameState(board, [3, 1], 'black');
    expect(isValidMove(game, 5, 8, 3)).toBe(false);
  });

  it('should not allow White to move in the wrong direction', () => {
    const board = [...DEFAULT_BOARD];
    board[5] = 1; // White piece on point 6 (0-indexed: 5)
    const game = createGameState(board, [3, 1], 'white');
    expect(isValidMove(game, 5, 8, 3)).toBe(false); // Attempting to move 5 to 8 (black's direction)
  });

  it('should not allow Black to move if distance does not match die', () => {
    const board = [...DEFAULT_BOARD];
    board[12] = -1;
    const game = createGameState(board, [5, 2], 'black');
    expect(isValidMove(game, 12, 18, 5)).toBe(false); // Should be 12 to 17 for die 5
  });

  it('should not allow moving opponent\'s piece', () => {
    const board = [...DEFAULT_BOARD];
    board[11] = -1; // Black piece on point 12
    const game = createGameState(board, [6, 1], 'white'); // White's turn
    expect(isValidMove(game, 11, 5, 6)).toBe(false);
  });

  it('should not allow moving from an empty point', () => {
    const board = [...DEFAULT_BOARD];
    board[11] = 0; // Point 12 is empty
    const game = createGameState(board, [6, 1], 'white');
    expect(isValidMove(game, 11, 5, 6)).toBe(false);
  });
});

describe('isValidMove - Re-entry from Bar', () => {
  it('should allow White to re-enter from bar to an empty point with die 3', () => {
    // Point 3 (0-indexed: 2)
    const game = createGameState([...DEFAULT_BOARD], [3, 1], 'white', 1);
    game.board[2] = 0; // Ensure point 3 is empty
    expect(isValidMove(game, 'white', 2, 3)).toBe(true);
  });

  it('should allow Black to re-enter from bar and hit a White blot with die 5', () => {
    // Target point 20 (0-indexed: 19, since 24 - 5 = 19)
    const board = [...DEFAULT_BOARD];
    board[19] = 1; // White blot on point 20
    const game = createGameState(board, [5, 2], 'black', 0, 1);
    expect(isValidMove(game, 'black', 19, 5)).toBe(true);
  });

  it('should not allow White to re-enter if target point is blocked by Black', () => {
    const board = [...DEFAULT_BOARD];
    board[3] = -2; // Black blocks point 4 (0-indexed: 3)
    const game = createGameState(board, [4, 1], 'white', 1);
    expect(isValidMove(game, 'white', 3, 4)).toBe(false);
  });

  it('should not allow Black to re-enter if "from" is a board point', () => {
    const game = createGameState([...DEFAULT_BOARD], [5, 2], 'black', 0, 1);
    expect(isValidMove(game, 0, 19, 5)).toBe(false); // from is 0, not 'black'
  });
  
  it('should not allow White to re-enter if "to" point does not match die', () => {
    const game = createGameState([...DEFAULT_BOARD], [3, 1], 'white', 1);
    expect(isValidMove(game, 'white', 1, 3)).toBe(false); // Die 3, target should be 2, not 1
  });

  it('should not allow re-entry attempt if no pieces are on the bar', () => {
    const game = createGameState([...DEFAULT_BOARD], [3, 1], 'white', 0); // No pieces on bar
    expect(isValidMove(game, 'white', 2, 3)).toBe(false);
  });

   it('should not allow a board move if player has pieces on the bar', () => {
    const game = createGameState([...DEFAULT_BOARD], [3,1], 'white', 1); // White has piece on bar
    game.board[11] = 1; // White piece on board
    expect(isValidMove(game, 11, 8, 3)).toBe(false); // Attempting board move
  });
});

describe('isValidMove - Bearing Off', () => {
  const allWhiteHomeBoard = () => {
    const board = Array(24).fill(0);
    board[0] = 2; board[1] = 2; board[2] = 2; board[3] = 2; board[4] = 2; board[5] = 5; // 15 pieces
    return board;
  };
  const allBlackHomeBoard = () => {
    const board = Array(24).fill(0);
    board[18] = -2; board[19] = -2; board[20] = -2; board[21] = -2; board[22] = -2; board[23] = -5; // 15 pieces
    return board;
  };

  it('should allow White to bear off with exact die when all pieces are home', () => {
    const game = createGameState(allWhiteHomeBoard(), [3, 1], 'white');
    // Bearing off from point 3 (0-indexed: 2) with die 3
    expect(isValidMove(game, 2, 'off', 3)).toBe(true);
  });

  it('should allow Black to bear off with exact die when all pieces are home', () => {
    const game = createGameState(allBlackHomeBoard(), [4, 2], 'black');
    // Bearing off from point 21 (0-indexed: 20) with die 4 (24-4 = 20)
    expect(isValidMove(game, 20, 'off', 4)).toBe(true);
  });

  it('should allow White to bear off with higher die when all pieces are home and it\'s the furthest piece', () => {
    const board = allWhiteHomeBoard();
    board[5] = 1; // Furthest piece is on point 6 (0-indexed: 5)
    board[4] = 0; board[3] = 0; // Clear higher points for this test
    const game = createGameState(board, [6, 1], 'white');
    // Try to bear off piece from point 6 (idx 5) with die 6 (exact) - This is the setup
    // Now, if piece was at idx 2 (point 3), die 5 should take it off if 5,4 are empty
    board[5]=0; board[4]=0; board[3]=0; board[2]=1; // piece at point 3 (idx 2)
    const game2 = createGameState(board, [5,1], 'white');
    expect(isValidMove(game2, 2, 'off', 5)).toBe(true);
  });

  it('should allow Black to bear off with higher die when all pieces are home and it\'s the furthest piece', () => {
    const board = allBlackHomeBoard();
    board[18] = -1; // Furthest piece is on point 19 (0-indexed: 18)
    board[19] = 0; board[20] = 0; // Clear higher points
    const game = createGameState(board, [6, 1], 'black');
     // Try to bear off piece from point 19 (idx 18) with die 6 (exact)
    // Now, if piece was at idx 21 (point 22), die 5 (target 24-5=19) should take it off if 19,20 are empty
    board[18]=0; board[19]=0; board[20]=0; board[21]=-1; // piece at point 22 (idx 21)
    const game2 = createGameState(board, [5,1], 'black');
    expect(isValidMove(game2, 21, 'off', 5)).toBe(true);
  });
  
  it('should NOT allow White to bear off with higher die if there is a piece on a higher point', () => {
    const board = allWhiteHomeBoard();
    board[2] = 1; // Piece on point 3 (idx 2)
    board[4] = 1; // Piece on point 5 (idx 4) - this should be moved first
    const game = createGameState(board, [5,1], 'white'); // Die 5
    expect(isValidMove(game, 2, 'off', 5)).toBe(false); // Cannot bear off from point 3 if point 5 has a piece
  });


  it('should not allow White to bear off if pieces are outside home board', () => {
    const board = allWhiteHomeBoard();
    board[6] = 1; // Piece on point 7 (outside home)
    const game = createGameState(board, [3, 1], 'white');
    expect(isValidMove(game, 2, 'off', 3)).toBe(false);
  });

  it('should not allow Black to bear off if piece is on the bar', () => {
    const game = createGameState(allBlackHomeBoard(), [4, 2], 'black', 0, 1); // Black piece on bar
    expect(isValidMove(game, 20, 'off', 4)).toBe(false);
  });

  it('should not allow White to bear off if die does not match point and not covered by higher die rule', () => {
    const game = createGameState(allWhiteHomeBoard(), [3, 1], 'white');
    // Attempt to bear off from point 5 (0-indexed: 4) with die 3. Point 3 (idx 2) is not empty.
    expect(isValidMove(game, 4, 'off', 3)).toBe(false);
  });
  
  it('should not allow White to bear off from a point not in the home board (e.g. point 7)', () => {
    const game = createGameState(allWhiteHomeBoard(), [1,1], 'white');
    // Technically, all pieces are home, but 'from' is invalid.
    // isValidMove should catch from < 0 || from > 5 for white bearoff.
    // This specific test is slightly redundant with the "pieces outside home" one if that one is general,
    // but good for explicitness on `from` point.
    // Let's ensure a piece is actually at point 7 for this test to be meaningful beyond just "all home"
    const board = allWhiteHomeBoard(); // All home
    board[6] = 1; // Add a white piece at point 7 (idx 6)
    // Now, the "all pieces home" check in isValidMove should fail.
    // If we manually bypass that and just test the from point:
    // The `isValidMove` check `if (from < 0 || from > 5) return false;` for white bearoff should catch this.
    // This test might be better framed as "cannot select 'from' outside home board for bearing off"
    // But isValidMove's internal logic for bearoff (is all home? then is 'from' valid?) covers this.
    // The existing "pieces outside home" test is more robust.
    // For this test, let's make sure "all pieces are home" but from is wrong.
    const gameAllHome = createGameState(allWhiteHomeBoard(), [1,1], 'white');
    expect(isValidMove(gameAllHome, 6, 'off', 1)).toBe(false); // from=6 is point 7
  });
});
