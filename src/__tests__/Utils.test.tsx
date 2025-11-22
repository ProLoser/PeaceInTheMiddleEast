import { 
  newGame, 
  rollDie, 
  classes, 
  indexToPoint, 
  populated, 
  unprotected, 
  allHome,
  farthestHome,
  destination,
  PLAYER_SIGN,
  DEFAULT_BOARD
} from '../Utils';
import { Color, Status, type Game } from '../Types';

describe('Utils - Game Logic', () => {
  describe('newGame', () => {
    test('creates a new game with initial state', () => {
      const game = newGame();
      
      expect(game.status).toBe(Status.Rolling);
      expect(game.dice).toEqual([6, 6]); // Default dice
      expect(game.color).toBeNull();
      expect(game.turn).toBeNull();
    });

    test('creates a game with correct board setup', () => {
      const game = newGame();
      
      // Board should have 24 positions
      expect(game.board).toHaveLength(24);
      
      // Check initial piece positions (standard backgammon setup)
      expect(game.board[0]).toBe(5);   // 5 white pieces on point 1
      expect(game.board[23]).toBe(-2); // 2 black pieces on point 24
      expect(game.board[11]).toBe(2);  // 2 white pieces on point 12
      expect(game.board[12]).toBe(-5); // 5 black pieces on point 13
    });

    test('creates a game with empty prison and home', () => {
      const game = newGame();
      
      expect(game.prison).toEqual({
        [Color.White]: 0,
        [Color.Black]: 0,
      });
      
      expect(game.home).toEqual({
        [Color.White]: 0,
        [Color.Black]: 0,
      });
    });

    test('each call creates a new independent game', () => {
      const game1 = newGame();
      const game2 = newGame();
      
      // Should be equal but not the same reference
      expect(game1).toEqual(game2);
      expect(game1).not.toBe(game2);
      
      // Modifying one shouldn't affect the other
      game1.dice = [1, 2];
      expect(game2.dice).toEqual([6, 6]); // game2 should still have default dice
      expect(game1.board).not.toBe(game2.board); // Different array references
    });

    test('can create game from existing game state', () => {
      const existingGame = newGame();
      existingGame.dice = [3, 4];
      existingGame.color = Color.White;
      existingGame.status = Status.Moving;
      
      const newGameFromExisting = newGame(existingGame);
      
      expect(newGameFromExisting.dice).toEqual([3, 4]);
      expect(newGameFromExisting.color).toBe(Color.White);
      expect(newGameFromExisting.status).toBe(Status.Moving);
    });
  });

  describe('rollDie', () => {
    test('returns a number between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('returns different values over multiple rolls', () => {
      const results = new Set();
      for (let i = 0; i < 50; i++) {
        results.add(rollDie());
      }
      // Very unlikely to get same value 50 times
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('classes', () => {
    test('combines string arguments', () => {
      expect(classes('foo', 'bar', 'baz')).toBe(' foo bar baz');
    });

    test('filters out falsy values', () => {
      expect(classes('foo', null, 'bar', undefined, false, 'baz')).toBe(' foo bar baz');
    });

    test('handles object with truthy values', () => {
      expect(classes({ foo: true, bar: false, baz: true })).toBe(' foo baz');
    });

    test('handles arrays recursively', () => {
      expect(classes(['foo', 'bar'], 'baz')).toBe('  foo bar baz');
    });

    test('handles mixed arguments', () => {
      expect(classes('foo', { bar: true, qux: false }, ['baz'])).toBe(' foo bar  baz');
    });

    test('handles empty input', () => {
      expect(classes()).toBe('');
    });

    test('handles numbers', () => {
      expect(classes(1, 2, 3)).toBe(' 1 2 3');
    });

    test('handles nested arrays', () => {
      expect(classes(['foo', ['bar', 'baz']])).toBe('  foo  bar baz');
    });
  });

  describe('indexToPoint', () => {
    test('converts white index to point number correctly', () => {
      expect(indexToPoint(Color.White, 0)).toBe(12);
      expect(indexToPoint(Color.White, 11)).toBe(1);
      expect(indexToPoint(Color.White, 12)).toBe(13);
      expect(indexToPoint(Color.White, 23)).toBe(24);
    });

    test('converts black index to point number correctly', () => {
      expect(indexToPoint(Color.Black, 0)).toBe(13);
      expect(indexToPoint(Color.Black, 11)).toBe(24);
      expect(indexToPoint(Color.Black, 12)).toBe(12);
      expect(indexToPoint(Color.Black, 23)).toBe(1);
    });
  });

  describe('populated', () => {
    test('returns true when point has white pieces', () => {
      expect(populated(Color.White, 5)).toBe(true);
      expect(populated(Color.White, 1)).toBe(true);
    });

    test('returns false when point has black pieces', () => {
      expect(populated(Color.White, -5)).toBe(false);
      expect(populated(Color.White, -1)).toBe(false);
    });

    test('returns true when point has black pieces', () => {
      expect(populated(Color.Black, -5)).toBe(true);
      expect(populated(Color.Black, -1)).toBe(true);
    });

    test('returns false when point has white pieces', () => {
      expect(populated(Color.Black, 5)).toBe(false);
      expect(populated(Color.Black, 1)).toBe(false);
    });

    test('returns false for empty point', () => {
      expect(populated(Color.White, 0)).toBe(false);
      expect(populated(Color.Black, 0)).toBe(false);
    });
  });

  describe('unprotected', () => {
    test('returns true for empty point', () => {
      expect(unprotected(Color.White, 0)).toBe(true);
      expect(unprotected(Color.Black, 0)).toBe(true);
    });

    test('returns true for single opponent piece (blot)', () => {
      expect(unprotected(Color.White, -1)).toBe(true);
      expect(unprotected(Color.Black, 1)).toBe(true);
    });

    test('returns false for multiple opponent pieces', () => {
      expect(unprotected(Color.White, -2)).toBe(false);
      expect(unprotected(Color.Black, 2)).toBe(false);
    });

    test('returns true for own pieces', () => {
      expect(unprotected(Color.White, 5)).toBe(true);
      expect(unprotected(Color.Black, -5)).toBe(true);
    });
  });

  describe('allHome', () => {
    test('returns false when no pieces are home', () => {
      const game = newGame();
      expect(allHome(Color.White, game)).toBe(false);
      expect(allHome(Color.Black, game)).toBe(false);
    });

    test('returns true when all 15 pieces are in home board', () => {
      const game = newGame();
      // Clear board
      game.board = new Array(24).fill(0);
      // Put all white pieces in home (points 18-23)
      game.board[18] = 5;
      game.board[19] = 5;
      game.board[20] = 5;
      game.home.white = 0;
      
      expect(allHome(Color.White, game)).toBe(true);
    });

    test('counts pieces already in home', () => {
      const game = newGame();
      game.board = new Array(24).fill(0);
      game.board[18] = 5;
      game.board[19] = 5;
      game.home.white = 5; // 5 already home
      
      expect(allHome(Color.White, game)).toBe(true);
    });
  });

  describe('farthestHome', () => {
    test('finds farthest white piece in home board', () => {
      const game = newGame();
      game.board = new Array(24).fill(0);
      game.board[18] = 2; // Farthest point for white
      game.board[22] = 3;
      
      expect(farthestHome(Color.White, game)).toBe(18);
    });

    test('finds farthest black piece in home board', () => {
      const game = newGame();
      game.board = new Array(24).fill(0);
      game.board[6] = -2; // Farthest point for black
      game.board[10] = -3;
      
      expect(farthestHome(Color.Black, game)).toBe(6);
    });

    test('returns 0 when no pieces in home board', () => {
      const game = newGame();
      game.board = new Array(24).fill(0);
      
      expect(farthestHome(Color.White, game)).toBe(0);
      expect(farthestHome(Color.Black, game)).toBe(0);
    });
  });

  describe('destination', () => {
    test('calculates white piece movement from bottom', () => {
      // White moving right on bottom (index 12-23)
      expect(destination(Color.White, 18, 3)).toBe(21);
      expect(destination(Color.White, 20, 2)).toBe(22);
    });

    test('calculates white piece movement from top', () => {
      // White moving left on top (index 0-11)
      expect(destination(Color.White, 5, 3)).toBe(2);
      expect(destination(Color.White, 2, 2)).toBe(0);
    });

    test('calculates black piece movement from top', () => {
      // Black moving right on top (index 0-11)
      expect(destination(Color.Black, 6, 3)).toBe(9);
      expect(destination(Color.Black, 8, 2)).toBe(10);
    });

    test('calculates black piece movement from bottom', () => {
      // Black moving left on bottom (index 12-23)
      expect(destination(Color.Black, 18, 3)).toBe(15);
      expect(destination(Color.Black, 15, 2)).toBe(13);
    });

    test('handles bearing off for white', () => {
      // When movement goes past home end, returns negative for bearing off
      const result = destination(Color.White, 22, 5);
      expect(result).toBeLessThan(0);
    });

    test('handles bearing off for black', () => {
      // When movement goes past home end, returns negative for bearing off
      const result = destination(Color.Black, 7, 5);
      expect(result).toBeLessThan(0);
    });

    test('handles wrapping from top to bottom for white', () => {
      const result = destination(Color.White, 1, 5);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    test('handles wrapping from bottom to top for black', () => {
      const result = destination(Color.Black, 13, 5);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('PLAYER_SIGN constant', () => {
    test('has correct sign for white player', () => {
      expect(PLAYER_SIGN.white).toBe(1);
    });

    test('has correct sign for black player', () => {
      expect(PLAYER_SIGN.black).toBe(-1);
    });
  });

  describe('DEFAULT_BOARD constant', () => {
    test('has 24 positions', () => {
      expect(DEFAULT_BOARD).toHaveLength(24);
    });

    test('has correct total of white pieces', () => {
      const whitePieces = DEFAULT_BOARD.reduce((sum, val) => sum + (val > 0 ? val : 0), 0);
      expect(whitePieces).toBe(15);
    });

    test('has correct total of black pieces', () => {
      const blackPieces = DEFAULT_BOARD.reduce((sum, val) => sum + (val < 0 ? Math.abs(val) : 0), 0);
      expect(blackPieces).toBe(15);
    });
  });
});
