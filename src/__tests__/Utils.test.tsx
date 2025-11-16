import { newGame } from '../Utils';
import { Color, Status } from '../Types';

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
});
