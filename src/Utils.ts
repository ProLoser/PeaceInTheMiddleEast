import { Color, Status, type GameType } from "./Types";

export const PLAYER_SIGN = {
    white: 1,
    black: -1
};

export const DEFAULT_BOARD: GameType['board'] = [
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

export function vibrate() {
    navigator.vibrate?.([50, 100, 60, 60, 90, 40, 110, 20, 150]);
}

export const newGame = (oldGame?: GameType) => ({
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
    status: oldGame?.status || 'rolling'
} as GameType);


    
export const populated = (player: Color, pieces: number) => PLAYER_SIGN[player] * pieces > 0
export const unprotected = (player: Color, pieces: number) => PLAYER_SIGN[player] * pieces >= -1;
export const allHome = (player: Color, state: GameType) => 
    15 === state.board
        .slice(HOME_INDEXES[player][0], HOME_INDEXES[player][1])
        .reduce(
            (total, value) => total + Math.abs(value), 
            state.home[player]
        )

export const farthestHome = (player: Color, state: GameType) => {
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
            if (newPoint > HOME_INDEXES[player][1]) return -1; // off
            return newPoint;
        } else { // top
            let newPoint = point - die; // left
            if (newPoint < 0) return 11 + -1 * newPoint // wrap 
            return newPoint
        }
    } else { // black
        if (point < 12) { // top
            newPoint = point + die; // right
            if (newPoint > HOME_INDEXES[player][1]) return -1; // off
            return newPoint;
        } else { // bottom
            let newPoint = point - die; // left
            if (newPoint < 12) return Math.abs(newPoint - 12) // wrap 
            return newPoint
        }
    }
}

export function nextMove(state: GameType, usedDice: number[] = [], from?: number) {
    const availableMoves = new Set<number>();
    if (!state.color) return availableMoves;
    const player = state.color;
    const [, homeEnd] = HOME_INDEXES[player]
    const availableDice = [...state.dice]
    // Check for Doubles
    if (availableDice[0] === availableDice[1]) availableDice.push(availableDice[0], availableDice[0])
        // Filter used 
    usedDice.forEach(die => {
        const index = availableDice.indexOf(die)  
        if (~index) availableDice.splice(index,1)
    })
    
    if (from === undefined || from === null) { // calculate starting points
        if (state.prison[player]) { // pieces are on bar
            availableMoves.add(-1)
        } else { 
            // normal moves
            state.board.forEach((value, point) => {
                if (
                    populated(player, value)
                    && availableDice.find(die => {
                        const dest = destination(player, point, die)
                        return dest !== undefined && dest !== -1 && unprotected(player, state.board[dest])
                    })
                )
                    availableMoves.add(point)
            })

            if (allHome(player, state)) { // bear off moves
                const farthestPoint = farthestHome(player, state)
                availableDice.forEach(die => {
                    const point = homeEnd - die + 1
                    if (
                        populated(player, state.board[point]) // exact
                        || die > homeEnd - farthestPoint // within
                    ) {
                        availableMoves.add(point)
                    }
                })
            }
        }
    } else { // calculate destinations, assume only valid from points are provided
        if (state.prison[player]) {
            availableDice.forEach(die => {
                const point = player == Color.White ? 12 - die : 24 - die
                if (unprotected(player, state.board[point]))
                    availableMoves.add(point)
            })
        } else {
            availableDice.forEach(die => {
                const point = destination(player, from, die)
                if (point !== undefined && (point === -1 || unprotected(player, state.board[point])))
                    availableMoves.add(point)
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
export function calculate(state: GameType, from: number | Color, to: number) {
    if (from === to) return { state }; // no move
    const nextGame: GameType = newGame(state);
    let moveLabel: string; // @see https://en.wikipedia.org/wiki/Backgammon_notation
    if (from === Color.White) {
        // white re-enter
        if (nextGame.board[to] === -1) {
            // hit
            moveLabel = `bar/${to}*`;
            nextGame.prison.black++;
            nextGame.prison.white--;
            nextGame.board[to] = 1;
        } else if (nextGame.board[to] >= -1) {
            // move
            moveLabel = `bar/${to}`;
            nextGame.prison.white--;
            nextGame.board[to]++;
        } else {
            // blocked
            return { state };
        }
    } else if (from === Color.Black) {
        // black re-enter
        if (nextGame.board[to] === 1) {
            // hit
            moveLabel = `bar/${to}*`;
            nextGame.prison.white++;
            nextGame.prison.black--;
            nextGame.board[to] = -1;
        } else if (nextGame.board[to] <= 1) {
            // move
            moveLabel = `bar/${to}`;
            nextGame.prison.black--;
            nextGame.board[to]--;
        } else {
            // blocked
            return { state };
        }
    } else {
        const offense = nextGame.board[from];
        const defense = nextGame.board[to];

        if (defense === undefined) {
            // bear off
            moveLabel = `${from}/off`;
            if (offense > 0) {
                nextGame.home.white++;
            } else {
                nextGame.home.black++;
            }
        } else if (!defense || Math.sign(defense) === Math.sign(offense)) {
            // move
            moveLabel = `${from}/${to}`;
            nextGame.board[to] += Math.sign(offense);
        } else if (Math.abs(defense) === 1) {
            // hit
            moveLabel = `${from}/${to}*`;
            nextGame.board[to] = -Math.sign(defense);
            if (offense > 0) nextGame.prison.black++;
            else nextGame.prison.white++;
        } else {
            // blocked
            return { state };
        }

        // remove from previous position
        nextGame.board[from] -= Math.sign(nextGame.board[from]);

        nextGame.status = nextGame.home.white === 15 || nextGame.home.black === 15 ?
            Status.GameOver : Status.Rolling;
    }
    return { state: nextGame, moveLabel };
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

export const playCheckerSound = () => {
  const randomIndex = Math.floor(Math.random() * checkerSounds.length);
  const randomMp3 = checkerSounds[randomIndex];
  
  const audio = audioCache[randomMp3];
  audio.currentTime = 0;
  audio.play();
};
