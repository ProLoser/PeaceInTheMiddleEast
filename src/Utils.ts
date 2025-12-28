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

export function parseDragData(data: string | undefined): number | Color {
    if (!data) return NaN;
    if (data === Color.White || data === Color.Black) return data;
    return parseInt(data);
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
    lastMove: oldGame?.lastMove || null,
    status: oldGame?.status || Status.Rolling
} as Game);


// White: index 0→point 12, index 11→point 1, index 12→point 13, index 23→point 24
// Black: index 0→point 13, index 11→point 24, index 12→point 12, index 23→point 1
export const indexToPoint = (color: Color, index: number) => 
    color === Color.White ?
        index > 11 ?
            index + 1 : 12 - index
        : // black
            index < 12 ?
                index + 13 : 24 - index

// White: point 12→index 0, point 1→index 11, point 13→index 12, point 24→index 23
// Black: point 13→index 0, point 24→index 11, point 12→index 12, point 1→index 23
export const pointToIndex = (color: Color, point: number): number =>
    color === Color.White ?
        point > 12 ?
            point - 1 : 12 - point
        : // black
            point > 12 ?
                point - 13 : 24 - point

export const invert = (color: Color) => color === Color.White ? Color.Black : Color.White;
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
    if (from === -1 && state.color) {
        from = state.color;
    }
    if (from === to) return { state }; // no move
    const nextGame: Game = newGame(state);
    let moveLabel: string; // @see https://en.wikipedia.org/wiki/Backgammon_notation
    let usedDie: number | undefined;
    if (from === Color.White) { // white re-enter
        usedDie = HOME_INDEXES.black[1] - to + 1;
        const toPoint = indexToPoint(Color.White, to);
        if (nextGame.board[to] === -1) { // hit
            moveLabel = `bar/${toPoint}*`;
            nextGame.prison.black++;
            nextGame.prison.white--;
            nextGame.board[to] = 1;
        } else if (nextGame.board[to] >= -1) { // move
            moveLabel = `bar/${toPoint}`;
            nextGame.prison.white--;
            nextGame.board[to]++;
        } else { // blocked
            return { state };
        }
    } else if (from === Color.Black) { // black re-enter
        usedDie = HOME_INDEXES.white[1] - to + 1;
        const toPoint = indexToPoint(Color.Black, to);
        if (nextGame.board[to] === 1) { // hit
            moveLabel = `bar/${toPoint}*`;
            nextGame.prison.white++;
            nextGame.prison.black--;
            nextGame.board[to] = -1;
        } else if (nextGame.board[to] <= 1) { // move
            moveLabel = `bar/${toPoint}`;
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
        
        const fromPoint = indexToPoint(player, fromIndex);
        const toPoint = indexToPoint(player, to);
        const moveNotation = player === Color.White ? `${toPoint}/${fromPoint}` : `${fromPoint}/${toPoint}`;
        
        if (defense === undefined) { // bear off        
            usedDie = dice.find(die => destination(player, fromIndex, die) <= -1);    
            moveLabel = `${fromPoint}/off`;
            if (offense > 0) // White
                nextGame.home.white++;
            else // Black
                nextGame.home.black++;
        } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
            usedDie = dice.find(die => destination(player, fromIndex, die) === to);
            moveLabel = moveNotation;
            nextGame.board[to] += Math.sign(offense);
        } else if (Math.abs(defense) === 1) { // hit
            usedDie = dice.find(die => destination(player, fromIndex, die) === to);
            moveLabel = `${moveNotation}*`;
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

const parseMoveLabel = (label: string, color: Color, ghosts: { [point: number]: number }, moved: { [point: number]: number }, ghostHit: { [point: number]: number }) => {
    const isHit = label.endsWith('*');
    const cleanLabel = isHit ? label.slice(0, -1) : label;
    const [first, second] = cleanLabel.split('/');
    const sign = PLAYER_SIGN[color];

    if (first === 'bar') {
        const toPoint = parseInt(second);
        if (!isNaN(toPoint)) {
            const toIndex = pointToIndex(color, toPoint);
            ghosts[-1] = (ghosts[-1] || 0) + sign;
            moved[toIndex] = (moved[toIndex] || 0) + sign;
            if (isHit) {
                ghostHit[toIndex] = -sign;
            }
        }
    } else if (second === 'off') {
        const fromPoint = parseInt(first);
        if (!isNaN(fromPoint)) {
            const fromIndex = pointToIndex(color, fromPoint);
            ghosts[fromIndex] = (ghosts[fromIndex] || 0) + sign;
        }
    } else {
        const firstPoint = parseInt(first);
        const secondPoint = parseInt(second);
        if (!isNaN(firstPoint) && !isNaN(secondPoint)) {
            // For White, notation is reversed (toPoint/fromPoint), so we need to swap
            const fromPoint = color === Color.White ? secondPoint : firstPoint;
            const toPoint = color === Color.White ? firstPoint : secondPoint;
            const fromIndex = pointToIndex(color, fromPoint);
            const toIndex = pointToIndex(color, toPoint);
            ghosts[fromIndex] = (ghosts[fromIndex] || 0) + sign;
            moved[toIndex] = (moved[toIndex] || 0) + sign;
            if (isHit) {
                ghostHit[toIndex] = -sign;
            }
        }
    }
};

export const parseUsed = (usedDice: UsedDie[], color: Color | null) => {
    const ghosts: { [point: number]: number } = {};
    const moved: { [point: number]: number } = {};
    const ghostHit: { [point: number]: number } = {};

    if (!color) return { ghosts, moved, ghostHit };

    usedDice.forEach(die => {
        parseMoveLabel(die.label, color, ghosts, moved, ghostHit);
    });

    Object.keys(ghosts).forEach(pointStr => {
        const point = parseInt(pointStr);
        if (moved[point] && ghosts[point]) {
            const sign = Math.sign(moved[point]);
            const cancelAmount = Math.min(Math.abs(moved[point]), Math.abs(ghosts[point]));
            moved[point] -= sign * cancelAmount;
            if (moved[point] === 0) {
                delete moved[point];
            }
        }
    });

    return { ghosts, moved, ghostHit };
};

export const parseMove = (moveString: string | undefined, color: Color | null) => {
    const ghosts: { [point: number]: number } = {};
    const moved: { [point: number]: number } = {};
    const ghostHit: { [point: number]: number } = {};

    if (!color || !moveString) return { ghosts, moved, ghostHit };

    const parts = moveString.split(': ');
    if (parts.length < 2) return { ghosts, moved, ghostHit };

    const movesString = parts[1].replace(' (game over)', '');
    const moveLabels = movesString.split(' ').filter(label => label.length > 0);

    moveLabels.forEach(label => {
        parseMoveLabel(label, color, ghosts, moved, ghostHit);
    });

    Object.keys(ghosts).forEach(pointStr => {
        const point = parseInt(pointStr);
        if (moved[point] && ghosts[point]) {
            const sign = Math.sign(moved[point]);
            const cancelAmount = Math.min(Math.abs(moved[point]), Math.abs(ghosts[point]));
            moved[point] -= sign * cancelAmount;
            if (moved[point] === 0) {
                delete moved[point];
            }
        }
    });

    return { ghosts, moved, ghostHit };
};
