import { calculateNewMove, newGame, DEFAULT_BOARD } from './Utils';
import { type GameType } from './Types';
// No need to import isValidMove directly for these tests, as we test calculateNewMove's behavior

// Helper function to create game states
const createGameState = (
  options: {
    board?: number[];
    dice: [number, number] | [number, number, number, number]; // Allow for doubles
    color: 'white' | 'black';
    whitePrison?: number;
    blackPrison?: number;
    whiteHome?: number;
    blackHome?: number;
  }
): GameType => {
  const game = newGame(); // Start with a base new game
  game.board = options.board ? [...options.board] : [...DEFAULT_BOARD];
  game.dice = [...options.dice];
  game.color = options.color;
  game.turn = 'player1'; // Dummy turn ID, not used by calculateNewMove directly
  game.prison = { white: options.whitePrison || 0, black: options.blackPrison || 0 };
  game.home = { white: options.whiteHome || 0, black: options.blackHome || 0 };
  game.status = 'rolled'; // Assume dice have been rolled
  return game;
};

describe('calculateNewMove', () => {
  describe('Valid Moves & State Changes', () => {
    it('White standard move: piece from point 12 to 6 with die 6', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[11] = 1; // White piece on point 12 (0-indexed)
      const game = createGameState({
        board: initialBoard,
        dice: [6, 2],
        color: 'white',
      });

      const result = calculateNewMove(game, 11, 5, 6); // from point 12 to 6 (0-indexed)

      expect(result.moveLabel).toBe('12/6');
      expect(result.state.board[11]).toBe(0);
      expect(result.state.board[5]).toBe(1);
      expect(result.state.dice).toEqual(expect.arrayContaining([0, 2])); // 6 used, 2 remains
      expect(result.state.status).toBe('moved');
    });

    it('Black standard move hitting a White blot: point 1 to 5 with die 4', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[0] = -1; // Black piece on point 1 (0-indexed)
      initialBoard[4] = 1;  // White blot on point 5 (0-indexed)
      const game = createGameState({
        board: initialBoard,
        dice: [4, 3],
        color: 'black',
      });

      const result = calculateNewMove(game, 0, 4, 4);

      expect(result.moveLabel).toBe('1/5*');
      expect(result.state.board[0]).toBe(0);
      expect(result.state.board[4]).toBe(-1); // Black captured point 5
      expect(result.state.prison.white).toBe(game.prison.white + 1);
      expect(result.state.dice).toEqual(expect.arrayContaining([0, 3]));
      expect(result.state.status).toBe('moved');
    });

    it('White re-entry from bar to point 3 with die 3', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[2] = 0; // Ensure point 3 (0-indexed: 2) is open
      const game = createGameState({
        board: initialBoard,
        dice: [3, 5],
        color: 'white',
        whitePrison: 1,
      });

      const result = calculateNewMove(game, 'white', 2, 3);

      expect(result.moveLabel).toBe('bar/3');
      expect(result.state.prison.white).toBe(0);
      expect(result.state.board[2]).toBe(1);
      expect(result.state.dice).toEqual(expect.arrayContaining([0, 5]));
      expect(result.state.status).toBe('moved');
    });

    it('Black bearing off from point 22 (idx 21) with die 3', () => {
      const board = Array(24).fill(0);
      board[18] = -2; board[19] = -2; board[20] = -2; 
      board[21] = -1; // Piece to bear off (point 22)
      board[22] = -2; board[23] = -5; 
      const game = createGameState({
        board,
        dice: [3, 1],
        color: 'black',
      });
      // Ensure all black pieces are in home board for bearing off to be valid
      // For this test, we assume isValidMove allows it based on this setup

      const result = calculateNewMove(game, 21, 'off', 3); // Die 3 -> target 24-3 = 21

      expect(result.moveLabel).toBe('22/off');
      expect(result.state.board[21]).toBe(0);
      expect(result.state.home.black).toBe(game.home.black + 1);
      expect(result.state.dice).toEqual(expect.arrayContaining([0, 1]));
      expect(result.state.status).toBe('moved');
    });

    it('Using one die from a pair: [5, 2], use 5', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[11] = 1; // White piece on point 12
      const game = createGameState({
        board: initialBoard,
        dice: [5, 2],
        color: 'white',
      });

      const result = calculateNewMove(game, 11, 6, 5); // point 12 to 7 with die 5

      expect(result.moveLabel).toBe('12/7');
      expect(result.state.dice.filter(d => d === 0).length).toBe(1);
      expect(result.state.dice.includes(5)).toBe(false);
      expect(result.state.dice.includes(2)).toBe(true);
    });
    
    it('Using one die from doubles: [4, 4], use one 4', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[11] = 1; // White piece on point 12
      const game = createGameState({
        board: initialBoard,
        dice: [4, 4], // Standard dice representation for doubles
        color: 'white',
      });

      const result = calculateNewMove(game, 11, 7, 4); // point 12 to 8 with die 4

      expect(result.moveLabel).toBe('12/8');
      // Check that one 4 is used (becomes 0) and one 4 remains
      const diceAfterMove = result.state.dice.slice().sort((a,b) => a-b);
      expect(diceAfterMove).toEqual([0, 4]);
    });
  });

  describe('Invalid Moves', () => {
    it('Attempting a move that isValidMove would reject (e.g., White to blocked Black point)', () => {
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[11] = 1;  // White piece on point 12
      initialBoard[8] = -2; // Black's blocked point at 9 (0-indexed: 8)
      const game = createGameState({
        board: initialBoard,
        dice: [3, 1],
        color: 'white',
      });

      // Attempt to move from 11 to 8 with die 3 (12 to 9)
      const result = calculateNewMove(game, 11, 8, 3);

      expect(result.moveLabel).toBeUndefined();
      // Check relevant fields to ensure state is unchanged
      expect(result.state.board).toEqual(game.board);
      expect(result.state.dice).toEqual(game.dice); // Dice should not be consumed
      expect(result.state.prison).toEqual(game.prison);
      expect(result.state.home).toEqual(game.home);
      // Status should not change from 'rolled' if move is invalid
      expect(result.state.status).toBe('rolled'); 
    });

    it('Attempting to use a die that is already 0 (should be rejected by isValidMove)', () => {
      // This scenario assumes isValidMove handles dieValueUsed > 0.
      // calculateNewMove itself does not explicitly check dieValueUsed > 0, it trusts isValidMove.
      // If isValidMove allows dieValueUsed = 0, this test might show different behavior.
      // For this test, we expect isValidMove to make this scenario invalid.
      const initialBoard = [...DEFAULT_BOARD];
      initialBoard[11] = 1; 
      const game = createGameState({
        board: initialBoard,
        dice: [0, 5], // A die is already used
        color: 'white',
      });

      // Attempt to move with the used die (0)
      // isValidMove should return false because a 0-value die cannot make a valid move (target point calculation etc.)
      const result = calculateNewMove(game, 11, 11 - 0, 0); // Hypothetical, isValidMove should prevent

      expect(result.moveLabel).toBeUndefined();
      expect(result.state.board).toEqual(game.board);
      expect(result.state.dice).toEqual(game.dice);
      expect(result.state.status).toBe('rolled');
    });
  });
});
