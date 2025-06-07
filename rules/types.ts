
export enum Player {
  Player1 = 'Player1', // White/Cream - represented by positive numbers on points
  Player2 = 'Player2', // Black/Red - represented by negative numbers on points
}

export interface Checker {
  id: string;
  player: Player;
}

// PointState is now represented by a number:
// > 0: Player1's checkers (value is count)
// < 0: Player2's checkers (abs(value) is count)
// 0: Empty point
// No separate PointState interface needed.

export interface BoardState {
  points: number[]; // Each number represents the state of a point
  bar: { [key in Player]: Checker[] }; // Checkers on the bar
  off: { [key in Player]: Checker[] };  // Checkers borne off
}

export enum GamePhase {
  Rolling = 'ROLLING',
  Moving = 'MOVING',
  GameOver = 'GAME_OVER',
}

export interface MoveDestination {
  toIndex: number | 'OFF'; // Point index or 'OFF' for bearing off
  diceValuesUsed: number[]; // The dice values that make up this move from source
}

// For internal calculation of full moves (remains conceptually useful)
export interface PotentialMove {
  from: number | 'BAR_P1' | 'BAR_P2';
  to: number | 'OFF';
  die: number; // Single die value for this segment of a move
  isHit?: boolean; // If this move results in a hit (may need re-evaluation based on new state)
}
