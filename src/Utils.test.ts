import {describe, it, expect, beforeEach} from '@jest/globals';
import {
  rollDie,
  classes,
  newGame,
  indexToPoint,
  populated,
  unprotected,
  allHome,
  farthestHome,
  destination,
  nextMoves,
  calculate,
  PLAYER_SIGN,
  DEFAULT_BOARD,
} from './Utils';
import {Color, Status, type Game} from './Types';

describe('Utils', () => {
  describe('rollDie', () => {
    it('should return a number between 1 and 6', () => {
      const rolls = new Set<number>();
      for (let i = 0; i < 100; i++) {
        const roll = rollDie();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
        expect(Number.isInteger(roll)).toBe(true);
        rolls.add(roll);
      }
      // With 100 rolls, we should see multiple different values
      expect(rolls.size).toBeGreaterThan(1);
    });
  });

  describe('classes', () => {
    it('should handle single string argument', () => {
      expect(classes('foo')).toBe(' foo');
    });

    it('should handle multiple string arguments', () => {
      expect(classes('foo', 'bar', 'baz')).toBe(' foo bar baz');
    });

    it('should handle number arguments', () => {
      expect(classes('foo', 123, 'bar')).toBe(' foo 123 bar');
    });

    it('should ignore falsy values', () => {
      expect(classes('foo', false, null, undefined, 0, '', 'bar')).toBe(' foo bar');
    });

    it('should handle array arguments', () => {
      expect(classes(['foo', 'bar'])).toBe('  foo bar');
      expect(classes('baz', ['foo', 'bar']))
          .toBe(' baz  foo bar');
    });

    it('should handle nested arrays', () => {
      expect(classes(['foo', ['bar', 'baz']]))
          .toBe('  foo  bar baz');
    });

    it('should handle object arguments with truthy values', () => {
      expect(classes({foo: true, bar: false, baz: true}))
          .toBe(' foo baz');
    });

    it('should handle mixed arguments', () => {
      expect(classes('foo', {bar: true, baz: false}, ['qux', 'quux'], 42))
          .toBe(' foo bar  qux quux 42');
    });

    it('should return empty string for no arguments', () => {
      expect(classes()).toBe('');
    });

    it('should handle all falsy arguments', () => {
      expect(classes(false, null, undefined, 0, '')).toBe('');
    });
  });

  describe('newGame', () => {
    it('should create a new game with default values', () => {
      const game = newGame();
      expect(game.board).toEqual(DEFAULT_BOARD);
      expect(game.dice).toEqual([6, 6]);
      expect(game.color).toBeNull();
      expect(game.turn).toBeNull();
      expect(game.prison).toEqual({black: 0, white: 0});
      expect(game.home).toEqual({black: 0, white: 0});
      expect(game.status).toBe(Status.Rolling);
    });

    it('should preserve old game values when provided', () => {
      const oldGame: Game = {
        board: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] as Game['board'],
        dice: [3, 4] as [number, number],
        color: Color.White,
        turn: 'player1',
        prison: {black: 2, white: 1},
        home: {black: 3, white: 4},
        status: Status.Moving,
      };
      const game = newGame(oldGame);
      expect(game.board).toEqual(oldGame.board);
      expect(game.dice).toEqual(oldGame.dice);
      expect(game.color).toBe(oldGame.color);
      expect(game.turn).toBe(oldGame.turn);
      expect(game.prison).toEqual(oldGame.prison);
      expect(game.home).toEqual(oldGame.home);
      expect(game.status).toBe(oldGame.status);
    });

    it('should create a copy of the board array', () => {
      const oldGame = newGame();
      const game = newGame(oldGame);
      expect(game.board).not.toBe(oldGame.board);
      expect(game.board).toEqual(oldGame.board);
    });
  });

  describe('indexToPoint', () => {
    it.each([
      [0, 13, 12],
      [6, 19, 6],
      [11, 24, 1],
      [12, 12, 13],
      [18, 6, 19],
      [23, 1, 24],
    ])('should convert indices correctly', (index, white, black) => {
      expect(indexToPoint(Color.White, index)).toBe(white);
      expect(indexToPoint(Color.Black, index)).toBe(black);
    });
  });

  describe('populated', () => {
    it('should return true for white pieces on positive values', () => {
      expect(populated(Color.White, 1)).toBe(true);
      expect(populated(Color.White, 5)).toBe(true);
    });

    it('should return false for white pieces on negative values', () => {
      expect(populated(Color.White, -1)).toBe(false);
      expect(populated(Color.White, -5)).toBe(false);
    });

    it('should return false for white pieces on zero', () => {
      expect(populated(Color.White, 0)).toBe(false);
    });

    it('should return true for black pieces on negative values', () => {
      expect(populated(Color.Black, -1)).toBe(true);
      expect(populated(Color.Black, -5)).toBe(true);
    });

    it('should return false for black pieces on positive values', () => {
      expect(populated(Color.Black, 1)).toBe(false);
      expect(populated(Color.Black, 5)).toBe(false);
    });

    it('should return false for black pieces on zero', () => {
      expect(populated(Color.Black, 0)).toBe(false);
    });
  });

  describe('unprotected', () => {
    it('should return true for white on empty point', () => {
      expect(unprotected(Color.White, 0)).toBe(true);
    });

    it('should return true for white on point with white pieces', () => {
      expect(unprotected(Color.White, 1)).toBe(true);
      expect(unprotected(Color.White, 5)).toBe(true);
    });

    it('should return true for white on point with single black piece', () => {
      expect(unprotected(Color.White, -1)).toBe(true);
    });

    it('should return false for white on point with multiple black pieces', () => {
      expect(unprotected(Color.White, -2)).toBe(false);
      expect(unprotected(Color.White, -5)).toBe(false);
    });

    it('should return true for black on empty point', () => {
      expect(unprotected(Color.Black, 0)).toBe(true);
    });

    it('should return true for black on point with black pieces', () => {
      expect(unprotected(Color.Black, -1)).toBe(true);
      expect(unprotected(Color.Black, -5)).toBe(true);
    });

    it('should return true for black on point with single white piece', () => {
      expect(unprotected(Color.Black, 1)).toBe(true);
    });

    it('should return false for black on point with multiple white pieces', () => {
      expect(unprotected(Color.Black, 2)).toBe(false);
      expect(unprotected(Color.Black, 5)).toBe(false);
    });
  });

  describe('allHome', () => {
    it('should return true when all white pieces are in home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 3, 2, 0, 0] as Game['board'];
      game.home = {white: 0, black: 0};
      expect(allHome(Color.White, game)).toBe(true);
    });

    it('should return false when white pieces are outside home board', () => {
      const game = newGame();
      game.board = DEFAULT_BOARD;
      game.home = {white: 0, black: 0};
      expect(allHome(Color.White, game)).toBe(false);
    });

    it('should include pieces borne off in white home count', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0] as Game['board'];
      game.home = {white: 5, black: 0};
      expect(allHome(Color.White, game)).toBe(true);
    });

    it('should return true when all black pieces are in home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, -5, -5, -3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      game.home = {white: 0, black: 0};
      expect(allHome(Color.Black, game)).toBe(true);
    });

    it('should return false when black pieces are outside home board', () => {
      const game = newGame();
      game.board = DEFAULT_BOARD;
      game.home = {white: 0, black: 0};
      expect(allHome(Color.Black, game)).toBe(false);
    });

    it('should include pieces borne off in black home count', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      game.home = {white: 0, black: 5};
      expect(allHome(Color.Black, game)).toBe(true);
    });
  });

  describe('farthestHome', () => {
    it('should return farthest white piece in home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 2] as Game['board'];
      expect(farthestHome(Color.White, game)).toBe(18);
    });

    it('should return farthest black piece in home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      expect(farthestHome(Color.Black, game)).toBe(6);
    });

    it('should return 0 if no pieces in white home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      expect(farthestHome(Color.White, game)).toBe(0);
    });

    it('should return 0 if no pieces in black home board', () => {
      const game = newGame();
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      expect(farthestHome(Color.Black, game)).toBe(0);
    });
  });

  describe('destination', () => {
    describe('white player', () => {
      it('should move right on bottom board', () => {
        expect(destination(Color.White, 12, 3)).toBe(15);
        expect(destination(Color.White, 18, 2)).toBe(20);
      });

      it('should return negative value for bearing off from bottom board', () => {
        expect(destination(Color.White, 22, 3)).toBe(-2);
        expect(destination(Color.White, 20, 5)).toBe(-2);
        expect(destination(Color.White, 22, 3)).toBeLessThan(0);
      });

      it('should move left on top board', () => {
        expect(destination(Color.White, 5, 3)).toBe(2);
        expect(destination(Color.White, 8, 4)).toBe(4);
      });

      it('should wrap from top board to bottom board', () => {
        expect(destination(Color.White, 2, 3)).toBe(12);
        expect(destination(Color.White, 1, 5)).toBe(15);
      });
    });

    describe('black player', () => {
      it('should move right on top board', () => {
        expect(destination(Color.Black, 0, 3)).toBe(3);
        expect(destination(Color.Black, 6, 2)).toBe(8);
      });

      it('should return negative value for bearing off from top board', () => {
        expect(destination(Color.Black, 10, 3)).toBe(-2);
        expect(destination(Color.Black, 8, 5)).toBe(-2);
        expect(destination(Color.Black, 10, 3)).toBeLessThan(0);
      });

      it('should move left on bottom board', () => {
        expect(destination(Color.Black, 18, 3)).toBe(15);
        expect(destination(Color.Black, 15, 4)).toBe(0);
      });

      it('should wrap from bottom board to top board', () => {
        expect(destination(Color.Black, 13, 2)).toBe(0);
        expect(destination(Color.Black, 14, 5)).toBe(2);
      });
    });
  });

  describe('nextMoves', () => {
    let game: Game;

    beforeEach(() => {
      game = newGame();
      game.color = Color.White;
      game.dice = [3, 4];
    });

    it('should return empty set if no color is set', () => {
      game.color = null as any;
      const moves = nextMoves(game);
      expect(moves.size).toBe(0);
    });

    it('should return starting points with available moves', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game);
      expect(moves.has(12)).toBe(true);
    });

    it('should return prison entry if pieces are in prison', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game);
      expect(moves.has(-1)).toBe(true);
    });

    it('should not include prison entry if all entry points are blocked', () => {
      game.prison = {white: 1, black: 0};
      // Block all possible entry points for white from bar (points 21, 22 for dice 3,4)
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, -2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game);
      expect(moves.has(-1)).toBe(false);
    });

    it('should return bear-off moves when all pieces are home', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 3, 2, 0, 0] as Game['board'];
      game.dice = [3, 4];
      const moves = nextMoves(game);
      expect(moves.has(20)).toBe(true);
      expect(moves.has(19)).toBe(true);
    });

    it('should return destinations when from point is specified', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game, [], 12);
      expect(moves.has(15)).toBe(true);
      expect(moves.has(16)).toBe(true);
    });

    it('should exclude used dice from calculations', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const usedDice = [{value: 3, label: '12/15'}];
      const moves = nextMoves(game, usedDice, 12);
      expect(moves.has(15)).toBe(false);
      expect(moves.has(16)).toBe(true);
    });

    it('should allow moving to points occupied by teammates', () => {
      // Position 12 has 5 white pieces, position 15 has 2 white pieces
      // White should be able to move from 12 to 15 (stacking on teammates)
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game, [], 12);
      expect(moves.has(15)).toBe(true);
    });

    it('should include sources with teammates at destination', () => {
      // Both position 12 and 15 have white pieces
      // Position 12 should be in the sources since it can move to position 15
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const sources = nextMoves(game, []);
      expect(sources.has(12)).toBe(true);
    });

    it('should return destinations for prison entry when from is -1', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game, [], -1);
      expect(moves.has(8)).toBe(true);
      expect(moves.has(9)).toBe(true);
    });

    it('should handle bear-off with exact die roll', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0] as Game['board'];
      game.dice = [2, 3];
      // nextMoves returns starting points, not -1 for bear-off destination
      const moves = nextMoves(game);
      expect(moves.has(21)).toBe(true); // can bear off from point 21 with die 3
    });

    it('should handle bear-off from farthest point with higher die', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0] as Game['board'];
      game.dice = [6, 5];
      // When die > needed distance, can bear off from farthest point
      const moves = nextMoves(game);
      expect(moves.has(18)).toBe(true);
    });

    it('should not allow bear-off from non-farthest point with higher die', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0] as Game['board'];
      game.dice = [6, 5];
      const moves = nextMoves(game, [], 20);
      // Point 20 is not farthest (18 is), so can't bear off with die > needed
      expect(moves.has(-1)).toBe(false);
    });

    it('should not return moves when pieces are in prison', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const moves = nextMoves(game, [], 12);
      // When pieces are in prison, from destinations should not be calculated
      expect(moves.size).toBe(0);
    });
  });

  describe('calculate', () => {
    let game: Game;

    beforeEach(() => {
      game = newGame();
      game.color = Color.White;
      game.dice = [3, 4];
    });

    it('should return unchanged state for no move', () => {
      const result = calculate(game, 12, 12);
      expect(result.state).toEqual(game);
      expect(result.moveLabel).toBeUndefined();
    });

    it('should handle normal white move', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 12, 15);
      expect(result.state?.board[12]).toBe(4);
      expect(result.state?.board[15]).toBe(1);
      expect(result.moveLabel).toBe('12/9');
    });

    it('should handle white hitting black piece', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 12, 15);
      expect(result.state?.board[12]).toBe(4);
      expect(result.state?.board[15]).toBe(1);
      expect(result.state?.prison.black).toBe(1);
      expect(result.moveLabel).toBe('12/9*');
    });

    it('should handle white bearing off', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0] as Game['board'];
      const result = calculate(game, 20, -1);
      expect(result.state?.board[20]).toBe(4);
      expect(result.state?.home.white).toBe(1);
      expect(result.moveLabel).toBe('4/off');
    });

    it('should handle white re-entering from bar', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, Color.White, 8);
      expect(result.state?.prison.white).toBe(0);
      expect(result.state?.board[8]).toBe(1);
      expect(result.moveLabel).toBe('bar/21');
    });

    it('should handle white re-entering from bar and hitting', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, Color.White, 8);
      expect(result.state?.prison.white).toBe(0);
      expect(result.state?.prison.black).toBe(1);
      expect(result.state?.board[8]).toBe(1);
      expect(result.moveLabel).toBe('bar/21*');
    });

    it('should block move to protected point', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 12, 15);
      expect(result.state).toEqual(game);
      expect(result.moveLabel).toBeUndefined();
    });

    it('should handle black normal move', () => {
      game.color = Color.Black;
      game.board = [0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 6, 9);
      expect(result.state?.board[6]).toBe(-4);
      expect(result.state?.board[9]).toBe(-1);
      expect(result.moveLabel).toBe('6/3');
    });

    it('should handle black hitting white piece', () => {
      game.color = Color.Black;
      game.board = [0, 0, 0, 0, 0, 0, -5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 6, 9);
      expect(result.state?.board[6]).toBe(-4);
      expect(result.state?.board[9]).toBe(-1);
      expect(result.state?.prison.white).toBe(1);
      expect(result.moveLabel).toBe('6/3*');
    });

    it('should handle black bearing off', () => {
      game.color = Color.Black;
      game.board = [0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, 6, -1);
      expect(result.state?.board[6]).toBe(-4);
      expect(result.state?.home.black).toBe(1);
      expect(result.moveLabel).toBe('6/off');
    });

    it('should set game status to GameOver when player bears off all pieces', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] as Game['board'];
      game.home = {white: 14, black: 0};
      const result = calculate(game, 20, -1);
      expect(result.state?.home.white).toBe(15);
      expect(result.state?.status).toBe(Status.GameOver);
    });

    it('should handle string from parameter', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, '12' as any, 15);
      expect(result.state?.board[12]).toBe(4);
      expect(result.state?.board[15]).toBe(1);
    });

    it('should return unchanged state for invalid string from parameter', () => {
      const result = calculate(game, 'invalid' as any, 15);
      expect(result.state).toEqual(game);
      expect(result.moveLabel).toBeUndefined();
    });

    it('should automatically use prison as from when pieces are in prison', () => {
      game.prison = {white: 1, black: 0};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, null, 8);
      expect(result.state?.prison.white).toBe(0);
      expect(result.state?.board[8]).toBe(1);
      expect(result.moveLabel).toBe('bar/21');
    });

    it('should respect used dice when calculating moves', () => {
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const usedDice = [{value: 3, label: '12/15'}];
      const result = calculate(game, 12, 16, usedDice);
      expect(result.state?.board[12]).toBe(4);
      expect(result.state?.board[16]).toBe(1);
      expect(result.usedDie).toBe(4);
    });

    it('should handle black re-entering from bar', () => {
      game.color = Color.Black;
      game.prison = {white: 0, black: 1};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as Game['board'];
      const result = calculate(game, Color.Black, 21);
      expect(result.state?.prison.black).toBe(0);
      expect(result.state?.board[21]).toBe(-1);
      expect(result.moveLabel).toBe('bar/22');
    });

    it('should handle black re-entering from bar and hitting', () => {
      game.color = Color.Black;
      game.prison = {white: 0, black: 1};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0] as Game['board'];
      const result = calculate(game, Color.Black, 21);
      expect(result.state?.prison.black).toBe(0);
      expect(result.state?.prison.white).toBe(1);
      expect(result.state?.board[21]).toBe(-1);
      expect(result.moveLabel).toBe('bar/22*');
    });

    it('should block black re-entering from bar to protected point', () => {
      game.color = Color.Black;
      game.prison = {white: 0, black: 1};
      game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0] as Game['board'];
      const result = calculate(game, Color.Black, 21);
      expect(result.state).toEqual(game);
      expect(result.moveLabel).toBeUndefined();
    });
  });

  describe('PLAYER_SIGN', () => {
    it('should have correct sign values', () => {
      expect(PLAYER_SIGN.white).toBe(1);
      expect(PLAYER_SIGN.black).toBe(-1);
    });
  });

  describe('DEFAULT_BOARD', () => {
    it('should have 24 positions', () => {
      expect(DEFAULT_BOARD.length).toBe(24);
    });

    it('should have correct starting positions', () => {
      expect(DEFAULT_BOARD[0]).toBe(5);
      expect(DEFAULT_BOARD[4]).toBe(-3);
      expect(DEFAULT_BOARD[6]).toBe(-5);
      expect(DEFAULT_BOARD[11]).toBe(2);
      expect(DEFAULT_BOARD[12]).toBe(-5);
      expect(DEFAULT_BOARD[16]).toBe(3);
      expect(DEFAULT_BOARD[18]).toBe(5);
      expect(DEFAULT_BOARD[23]).toBe(-2);
    });

    it('should have 15 white pieces total', () => {
      const whiteCount = DEFAULT_BOARD.reduce((sum, val) => sum + (val > 0 ? val : 0), 0);
      expect(whiteCount).toBe(15);
    });

    it('should have 15 black pieces total', () => {
      const blackCount = DEFAULT_BOARD.reduce((sum, val) => sum + (val < 0 ? Math.abs(val) : 0), 0);
      expect(blackCount).toBe(15);
    });
  });
});
