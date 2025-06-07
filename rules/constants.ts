
import { Player } from './types';

export const NUM_POINTS = 24;
export const NUM_CHECKERS_PER_PLAYER = 15;

export const BAR_INDEX_P1 = -1; // Conceptual index for Player 1 on bar
export const BAR_INDEX_P2 = 25; // Conceptual index for Player 2 on bar
export const OFF_INDEX_P1 = NUM_POINTS; // Conceptual index for Player 1 bearing off
export const OFF_INDEX_P2 = -1; // Conceptual index for Player 2 bearing off (relative to their movement)


export const PLAYER_COLORS: { [key in Player]: { base: string; border: string; text: string } } = {
  [Player.Player1]: { base: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800' }, // Cream/White
  [Player.Player2]: { base: 'bg-red-700', border: 'border-red-900', text: 'text-red-100' },    // Red
};

export const POINT_COLORS = ['bg-amber-100', 'bg-amber-700']; // Alternating point colors

// getInitialPointState is no longer needed as points are numbers.

export function getInitialBoardSetup(): number[] {
  const points = Array(NUM_POINTS).fill(0);

  // Player 1 (Positive numbers)
  points[0] = 2;
  points[11] = 5;
  points[16] = 3;
  points[18] = 5;
  
  // Player 2 (Negative numbers)
  points[23] = -2;
  points[12] = -5;
  points[7] = -3;
  points[5] = -5;

  return points;
}

// Player 1 moves from 0 towards 23 (low to high index)
// Player 2 moves from 23 towards 0 (high to low index)
// Player 1 Home: 18-23 (points with indices 18 through 23)
// Player 2 Home: 0-5 (points with indices 0 through 5)

// Bar re-entry for P1: onto points 0-5 (opponent's home). Roll 1 -> point 0. Roll 6 -> point 5. Target index = dice - 1.
// Bar re-entry for P2: onto points 18-23 (opponent's home). Roll 1 -> point 23. Roll 6 -> point 18. Target index = NUM_POINTS - dice.
