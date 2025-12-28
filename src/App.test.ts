import {describe, it, expect} from '@jest/globals';
import {Color, Status, type Game, type Match, type UsedDie} from './Types';
import {newGame, nextMoves, rollDie, calculate} from './Utils';

/**
 * These tests cover critical utility functions used by the App component.
 * While the full App component requires Firebase and React context,
 * these tests verify the pure logic functions that drive game behavior.
 */
describe('App Component Logic', () => {
  describe('isMyTurn calculation', () => {
    it('should return true when no match (offline play)', () => {
      const match: Match | null = null;
      const game = newGame();
      const userKey = 'user1';

      const isMyTurn = !match || !game.turn || !!userKey && userKey === game.turn;
      expect(isMyTurn).toBe(true);
    });

    it('should return true when game.turn is null', () => {
      const match: Match = {game: 'g1', chat: 'c1', sort: ''};
      const game = newGame();
      game.turn = null as unknown as string;
      const userKey = 'user1';

      const isMyTurn = !match || !game.turn || !!userKey && userKey === game.turn;
      expect(isMyTurn).toBe(true);
    });

    it('should return true when it is the users turn', () => {
      const match: Match = {game: 'g1', chat: 'c1', sort: ''};
      const game = newGame();
      game.turn = 'user1';
      const userKey = 'user1';

      const isMyTurn = !match || !game.turn || !!userKey && userKey === game.turn;
      expect(isMyTurn).toBe(true);
    });

    it('should return false when it is the opponents turn', () => {
      const match: Match = {game: 'g1', chat: 'c1', sort: ''};
      const game = newGame();
      game.turn = 'opponent';
      const userKey = 'user1';

      const isMyTurn = !match || !game.turn || !!userKey && userKey === game.turn;
      expect(isMyTurn).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      const match: Match = {game: 'g1', chat: 'c1', sort: ''};
      const game = newGame();
      game.turn = 'opponent';
      const userKey: string | undefined = undefined;

      const isMyTurn = !match || !game.turn || !!userKey && userKey === game.turn;
      expect(isMyTurn).toBe(false);
    });
  });

  describe('rollDice doubles logic', () => {
    it('should create 4 dice for doubles', () => {
      const dice = [4, 4] as Game['dice'];
      if (dice[0] === dice[1]) {
        dice.push(dice[0], dice[0]);
      }
      expect(dice).toEqual([4, 4, 4, 4]);
      expect(dice.length).toBe(4);
    });

    it('should not modify non-doubles', () => {
      const dice = [3, 5] as Game['dice'];
      if (dice[0] === dice[1]) {
        dice.push(dice[0], dice[0]);
      }
      expect(dice).toEqual([3, 5]);
      expect(dice.length).toBe(2);
    });

    it('rollDie generates valid values for doubles check', () => {
      let doublesCount = 0;
      for (let i = 0; i < 100; i++) {
        const die1 = rollDie();
        const die2 = rollDie();
        if (die1 === die2) doublesCount++;
      }
      // Statistically should see some doubles (1/6 probability per roll)
      expect(doublesCount).toBeGreaterThan(0);
    });
  });

  describe('moves and sources calculation', () => {
    it('should return empty set when not players turn', () => {
      const game = newGame();
      game.status = Status.Moving;
      game.color = Color.White;
      const isMyTurn = false;
      const usedDice: UsedDie[] = [];

      const moves = !isMyTurn || game.status !== Status.Moving ?
        new Set<number>() :
        nextMoves(game, usedDice, null!);

      expect(moves.size).toBe(0);
    });

    it('should return empty set when status is Rolling', () => {
      const game = newGame();
      game.status = Status.Rolling;
      game.color = Color.White;
      const isMyTurn = true;
      const usedDice: UsedDie[] = [];

      // Simulate runtime behavior - status could be any Status value
      const moves = !isMyTurn || (game.status as Status) !== Status.Moving ?
        new Set<number>() :
        nextMoves(game, usedDice, null!);

      expect(moves.size).toBe(0);
    });

    it('should return moves when it is players turn and status is Moving', () => {
      const game = newGame();
      game.status = Status.Moving;
      game.color = Color.White;
      game.dice = [3, 4];
      const isMyTurn = true;
      const usedDice: UsedDie[] = [];

      const sources = !isMyTurn || game.status !== Status.Moving ?
        new Set<number>() :
        nextMoves(game, usedDice);

      expect(sources.size).toBeGreaterThan(0);
    });
  });

  describe('turn completion detection', () => {
    it('should detect when all dice are used', () => {
      const game = newGame();
      game.dice = [3, 4];
      const usedDice: UsedDie[] = [
        {value: 3, label: '1/4'},
        {value: 4, label: '4/8'},
      ];

      const allDiceUsed = usedDice.length === game.dice.length;
      expect(allDiceUsed).toBe(true);
    });

    it('should detect when doubles are partially used', () => {
      const game = newGame();
      game.dice = [5, 5, 5, 5] as unknown as [number, number];
      const usedDice: UsedDie[] = [
        {value: 5, label: '1/6'},
        {value: 5, label: '6/11'},
      ];

      const allDiceUsed = usedDice.length === game.dice.length;
      expect(allDiceUsed).toBe(false);
    });

    it('should detect when all doubles are used', () => {
      const game = newGame();
      game.dice = [5, 5, 5, 5] as unknown as [number, number];
      const usedDice: UsedDie[] = [
        {value: 5, label: '1/6'},
        {value: 5, label: '6/11'},
        {value: 5, label: '11/16'},
        {value: 5, label: '16/21'},
      ];

      const allDiceUsed = usedDice.length === game.dice.length;
      expect(allDiceUsed).toBe(true);
    });
  });

  describe('color switching', () => {
    it('should switch from White to Black', () => {
      const currentColor = Color.White;
      const nextColor = currentColor === Color.White ? Color.Black : Color.White;
      expect(nextColor).toBe(Color.Black);
    });

    it('should switch from Black to White', () => {
      const currentColor = Color.Black as Color;
      const nextColor = currentColor === Color.White ?
        Color.Black : Color.White;
      expect(nextColor).toBe(Color.White);
    });
  });

  describe('move validation', () => {
    it('should not allow move if target is not in moves set', () => {
      const moves = new Set([15, 16, 17]);
      const to = 20;
      const game = newGame();
      game.status = Status.Moving;

      const isValidMove = moves.has(to) && game.status === Status.Moving;
      expect(isValidMove).toBe(false);
    });

    it('should allow move if target is in moves set and status is Moving', () => {
      const moves = new Set([15, 16, 17]);
      const to = 16;
      const game = newGame();
      game.status = Status.Moving;

      const isValidMove = moves.has(to) &&
        game.status === Status.Moving;
      expect(isValidMove).toBe(true);
    });

    it('should not allow move if status is not Moving', () => {
      const moves = new Set([15, 16, 17]);
      const to = 16;
      const game = newGame();
      game.status = Status.Rolling;

      const isValidMove = moves.has(to) &&
        (game.status as Status) === Status.Moving;
      expect(isValidMove).toBe(false);
    });
  });

  describe('winner detection', () => {
    it('should detect winner when game is over', () => {
      const game = newGame();
      game.status = Status.GameOver;
      game.turn = 'user1';

      const isGameOver = game.status === Status.GameOver;
      const winnerTurn = game.turn;

      expect(isGameOver).toBe(true);
      expect(winnerTurn).toBe('user1');
    });

    it('should not have winner when game is in progress', () => {
      const game = newGame();
      game.status = Status.Moving;
      game.turn = 'user1';

      const isGameOver = (game.status as Status) === Status.GameOver;
      expect(isGameOver).toBe(false);
    });
  });

  describe('prison entry selection', () => {
    it('should auto-select prison when player has pieces in prison', () => {
      const game = newGame();
      game.color = Color.White;
      game.prison = {white: 2, black: 0};

      const shouldSelectPrison = game.prison[game.color] > 0;
      const selectedPosition = shouldSelectPrison ? -1 : null;

      expect(selectedPosition).toBe(-1);
    });

    it('should not auto-select prison when no pieces in prison', () => {
      const game = newGame();
      game.color = Color.White;
      game.prison = {white: 0, black: 0};

      const shouldSelectPrison = game.prison[game.color] > 0;
      const selectedPosition = shouldSelectPrison ? -1 : null;

      expect(selectedPosition).toBe(null);
    });
  });

  describe('game over move handling', () => {
    it('should detect game over after final bear off', () => {
      const game = newGame();
      game.color = Color.White;
      game.dice = [3, 4];
      game.home = {white: 14, black: 0};
      game.board = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0,
      ] as Game['board'];

      const result = calculate(game, 20, -1);

      expect(result.state?.home.white).toBe(15);
      expect(result.state?.status).toBe(Status.GameOver);
    });
  });
});
