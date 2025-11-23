import { Color, Status, UsedDie, type Game } from "./Types";

export const PLAYER_SIGN = {
    white: 1,
    black: -1
};

export const DEFAULT_BOARD: Game['board'] = [
    // index:           6             11
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    // index:         18              23
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
];

const HOME_INDEXES = {
    white: [18, 23],
    black: [6, 11]
}

export function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

export const Vibrations = {
    Dice: [50, 100, 60, 60, 90, 40, 110, 20, 150],
    Up: 2,
    Down: 10
}

export function classes(...args: any[]) {
  let result = '';

  for (const arg of args) {
    if (!arg) continue;

    const type = typeof arg;

    if (type === 'string' || type === 'number') {
      result += ' ' + arg;
    } else if (Array.isArray(arg)) {
      result += ' ' + classes(...arg);
    } else if (type === 'object') {
      for (const key in arg) {
        if (arg[key]) result += ' ' + key;
      }
    }
  }

  return result;
}

export const newGame = (oldGame?: Game) => ({
    board: [...(oldGame?.board || DEFAULT_BOARD)],
    dice: oldGame?.dice || [6, 6],
    color: oldGame?.color || null,
    turn: oldGame?.turn || null,
    prison: oldGame?.prison || {
        black: 0,
        white: 0,
    },
    home: oldGame?.home || {
        black: 0,
        white: 0,
    },
    status: oldGame?.status || Status.Rolling
} as Game);


export const indexToPoint = (color: Color, index: number) => 
    color === Color.White ?
        index > 11 ?
            index + 1 : 12 - index
        : // black
            index < 12 ?
                index + 13 : 24 - index

export const populated = (player: Color, pieces: number) => PLAYER_SIGN[player] * pieces > 0
export const unprotected = (player: Color, pieces: number) => PLAYER_SIGN[player] * pieces >= -1;
export const allHome = (player: Color, state: Game) => 
    15 === state.board
        .slice(HOME_INDEXES[player][0], HOME_INDEXES[player][1] + 1)
        .reduce(
            (total, value) => total + (populated(player, value) ? Math.abs(value) : 0), 
            state.home[player]
        )

export const farthestHome = (player: Color, state: Game) => {
    for (let point = HOME_INDEXES[player][0]; point <= HOME_INDEXES[player][1]; point++) {
        if (populated(player, state.board[point])) {
            return point
        }
    }
    return 0;
}

export const destination = (player: Color, point: number, die: number) => {
    let newPoint;
    if (player === Color.White) {
        if (point > 11) { // bottom
            newPoint = point + die // right
            if (newPoint > HOME_INDEXES[player][1]) // off
                return HOME_INDEXES[player][1] - newPoint;
            return newPoint;
        } else { // top
            let newPoint = point - die; // left
            if (newPoint < 0) // wrap 
                return 11 + (-1 * newPoint)
            return newPoint
        }
    } else { // black
        if (point < 12) { // top
            newPoint = point + die; // right
            if (newPoint > HOME_INDEXES[player][1]) // off
                return HOME_INDEXES[player][1] - newPoint;
            return newPoint;
        } else { // bottom
            let newPoint = point - die; // left
            if (newPoint < 12) // wrap 
                return Math.abs(newPoint - 11)
            return newPoint
        }
    }
}

export function nextMoves(state: Game, usedDice: UsedDie[] = [], from?: number) {
    const availableMoves = new Set<number>();
    if (!state.color) return availableMoves;
    const player = state.color;
    const [, homeEnd] = HOME_INDEXES[player]
    const availableDice = [...state.dice]
    // Filter used 
    usedDice.forEach(die => {
        const index = availableDice.indexOf(die.value)  
        if (~index) availableDice.splice(index,1)
    })
    
    if (from === undefined || from === null) { // calculate starting points
        if (state.prison[player]) { // pieces are on bar
            if (availableDice.find(die => {
                const point = HOME_INDEXES[player==Color.White ? Color.Black : Color.White][1] - die + 1
                return unprotected(player, state.board[point])
            }))
                availableMoves.add(-1)
        } else { 
            // normal moves
            state.board.forEach((value, point) => {
                if (
                    populated(player, value)
                    && availableDice.find(die => {
                        const dest = destination(player, point, die)
                        return dest !== undefined && dest > -1 && unprotected(player, state.board[dest])
                    })
                )
                    availableMoves.add(point)
            })

            if (allHome(player, state)) { // bear off moves
                const farthestPoint = farthestHome(player, state)
                availableDice.forEach(die => {
                    const point = homeEnd - die + 1
                    if ( populated(player, state.board[point]) ) { // exact
                        availableMoves.add(point)
                    } else if (die > homeEnd - farthestPoint) { // within
                        availableMoves.add(farthestPoint)
                    }
                })
            }
        }
    } else { // calculate destinations, assume only valid from points are provided
        if (from === -1) {
            availableDice.forEach(die => {
                const point = HOME_INDEXES[player==Color.White ? Color.Black : Color.White][1] - die + 1
                if (unprotected(player, state.board[point]))
                    availableMoves.add(point)
            })
        } else if (!state.prison[player]) {
            const canBearOff = allHome(player, state);
            const farthestPoint = canBearOff ? farthestHome(player, state) : undefined;
            availableDice.forEach(die => {
                const point = destination(player, from, die)
                if (point !== undefined && point > -1 && unprotected(player, state.board[point])) {
                    availableMoves.add(point);
                } else if (canBearOff) {
                    if (point === -1) { // exact bear off
                        availableMoves.add(-1);
                    } else if (point < -1 && from === farthestPoint) { // bear off from a point further away
                        availableMoves.add(-1);
                    }
                }
            })
        }
    }
    
    return availableMoves
}

/**
 * 
 * @param state 
 * @param from 
 * @param to 
 * @returns moveLabel is not returned if the move is blocked
 */
export function calculate(state: Game, from: number | Color | undefined | null, to: number, usedDice: UsedDie[] = []) {
    // If from is unspecified and there are pieces on the bar, treat the bar as the from point
    if ((from === undefined || from === null) && state.color) {
        if (state.prison[state.color] > 0) {
            from = state.color;
        }
    }
    if (from === to) return { state }; // no move
    const nextGame: Game = newGame(state);
    let moveLabel: string; // @see https://en.wikipedia.org/wiki/Backgammon_notation
    let usedDie: number | undefined;
    if (from === Color.White) { // white re-enter
        usedDie = HOME_INDEXES.black[1] - to + 1;
        if (nextGame.board[to] === -1) { // hit
            moveLabel = `bar/${indexToPoint(Color.White, to)}*`;
            nextGame.prison.black++;
            nextGame.prison.white--;
            nextGame.board[to] = 1;
        } else if (nextGame.board[to] >= -1) { // move
            moveLabel = `bar/${indexToPoint(Color.White, to)}`;
            nextGame.prison.white--;
            nextGame.board[to]++;
        } else { // blocked
            return { state };
        }
    } else if (from === Color.Black) { // black re-enter
        usedDie = HOME_INDEXES.white[1] - to + 1;
        if (nextGame.board[to] === 1) { // hit
            moveLabel = `bar/${indexToPoint(Color.Black, to)}*`;
            nextGame.prison.white++;
            nextGame.prison.black--;
            nextGame.board[to] = -1;
        } else if (nextGame.board[to] <= 1) { // move
            moveLabel = `bar/${indexToPoint(Color.Black, to)}`;
            nextGame.prison.black--;
            nextGame.board[to]--;
        } else { // blocked
            return { state };
        }
    } else {
        if (from === undefined || from === null) 
            return { state };
        if (typeof from === 'string') {
            const parsed = parseInt(from);
            if (isNaN(parsed)) return { state };
            from = parsed;
        }
        // After checks above: from is not Color.White, Color.Black, undefined, null, or invalid string
        // Therefore, from must be a valid number
        const fromIndex = from as number;
        const offense = nextGame.board[fromIndex];
        const defense = nextGame.board[to];
        const player = Math.sign(offense) === 1 ? Color.White : Color.Black;
        let dice = [...state.dice].sort((a, b) => a - b);
        usedDice.forEach(die => dice.splice(dice.indexOf(die.value), 1))
        
        if (defense === undefined) { // bear off        
            usedDie = dice.find(die => destination(player, fromIndex, die) <= -1);    
            moveLabel = `${indexToPoint(player, fromIndex)}/off`;
            if (offense > 0) // White
                nextGame.home.white++;
            else // Black
                nextGame.home.black++;
        } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
            usedDie = dice.find(die => destination(player, fromIndex, die) === to);
            moveLabel = `${indexToPoint(player, fromIndex)}/${indexToPoint(player, to)}`;
            nextGame.board[to] += Math.sign(offense);
        } else if (Math.abs(defense) === 1) { // hit
            usedDie = dice.find(die => destination(player, fromIndex, die) === to);
            moveLabel = `${indexToPoint(player, fromIndex)}/${indexToPoint(player, to)}*`;
            nextGame.board[to] = -Math.sign(defense);
            if (offense > 0) nextGame.prison.black++;
            else nextGame.prison.white++;
        } else { // blocked
            return { state };
        }
        // remove from previous position
        nextGame.board[fromIndex] -= Math.sign(nextGame.board[fromIndex]);
        if (nextGame.home.white === 15 || nextGame.home.black === 15)
            nextGame.status = Status.GameOver;
    }
    return { state: nextGame, moveLabel, usedDie };
}

const audioCache: { [key: string]: HTMLAudioElement } = {};

const checkerSounds = [
  'capture.mp3',
  'castle.mp3',
  'move-check.mp3',
  'move-self.mp3',
  'notify.mp3',
  'promote.mp3',
];

checkerSounds.forEach(file => {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = file;
  audioCache[file] = audio;
});

export const playAudio = (audio: HTMLAudioElement) => {
  audio.currentTime = 0;
  (async () => {
    try {
      await audio.play();
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        // User has not interacted with the page yet
      } else {
        console.error(e);
      }
    }
  })();
};

export const playCheckerSound = () => {
  const randomIndex = Math.floor(Math.random() * checkerSounds.length);
  const randomMp3 = checkerSounds[randomIndex];
  const audio = audioCache[randomMp3];
  playAudio(audio);
};

/**
 * Parse move notation to extract ghost piece positions
 * Example move: "6-6: 24/18 8/2*" means pieces moved from 24 to 18, and from 8 to 2 with a hit
 * @param moveNotation The move notation string (e.g., "6-6: 24/18 8/2*")
 * @param currentPlayer The current player color whose turn it is to roll
 * @returns An array of 24 elements where each element is { white: number, black: number } representing ghost counts at each position
 */
const GAME_OVER_MARKER = '(game over)';

export function parseGhostPositions(moveNotation: string, currentPlayer: Color) {
    const ghosts: Array<{ white: number, black: number }> = Array.from({ length: 24 }, () => ({ white: 0, black: 0 }));
    
    if (!moveNotation) return ghosts;
    
    // The opponent is the one who made the last move
    const opponent = currentPlayer === Color.White ? Color.Black : Color.White;
    
    // Extract the moves part after the colon (e.g., "24/18 8/2*")
    const colonIndex = moveNotation.indexOf(':');
    if (colonIndex === -1) return ghosts;
    
    const movesString = moveNotation.substring(colonIndex + 1).trim();
    const moves = movesString.split(' ');
    
    for (const move of moves) {
        if (!move) continue;
        
        const isHit = move.endsWith('*');
        const cleanMove = move.replace('*', '').replace(GAME_OVER_MARKER, '').trim();
        
        if (!cleanMove) continue;
        
        const parts = cleanMove.split('/');
        if (parts.length !== 2) continue;
        
        const fromStr = parts[0];
        const toStr = parts[1];
        
        // Handle special cases
        if (fromStr === 'bar') {
            // Piece entered from bar - no ghost needed at bar
            continue;
        }
        
        if (toStr === 'off') {
            // Piece bore off - add ghost at source
            const pointNum = parseInt(fromStr);
            if (!isNaN(pointNum) && pointNum >= 1 && pointNum <= 24) {
                const index = pointToIndex(opponent, pointNum);
                if (index >= 0 && index < 24) {
                    if (opponent === Color.White) {
                        ghosts[index].white++;
                    } else {
                        ghosts[index].black++;
                    }
                }
            }
            continue;
        }
        
        // Normal move or hit
        const fromPoint = parseInt(fromStr);
        const toPoint = parseInt(toStr);
        
        if (!isNaN(fromPoint) && fromPoint >= 1 && fromPoint <= 24) {
            const fromIndex = pointToIndex(opponent, fromPoint);
            if (fromIndex >= 0 && fromIndex < 24) {
                if (opponent === Color.White) {
                    ghosts[fromIndex].white++;
                } else {
                    ghosts[fromIndex].black++;
                }
            }
        }
        
        // If hit, add ghost for the current player at the hit location
        if (isHit && !isNaN(toPoint) && toPoint >= 1 && toPoint <= 24) {
            const toIndex = pointToIndex(currentPlayer, toPoint);
            if (toIndex >= 0 && toIndex < 24) {
                if (currentPlayer === Color.White) {
                    ghosts[toIndex].white++;
                } else {
                    ghosts[toIndex].black++;
                }
            }
        }
    }
    
    return ghosts;
}

/**
 * Convert a point number (1-24) to a board index (0-23) based on player perspective
 * @param color The player color
 * @param point The point number (1-24)
 * @returns The board index (0-23), or -1 if invalid
 */
export function pointToIndex(color: Color, point: number): number {
    // Validate input
    if (!Number.isInteger(point) || point < 1 || point > 24) {
        console.warn(`Invalid point number: ${point}. Expected integer between 1 and 24.`);
        return -1;
    }
    
    if (color === Color.White) {
        if (point <= 12) {
            return 12 - point;
        } else {
            return point - 1;
        }
    } else { // Black
        if (point <= 12) {
            return point + 11;
        } else {
            return 24 - point;
        }
    }
}
