# Backgammon AI Move Prompt

Use this prompt template to ask an AI model for a valid backgammon move suggestion given a board state and dice roll.

---

## Prompt Template

```
We are playing backgammon. You are playing as {{color}} ({{color}} moves in the {{direction}} direction, from point {{start}} toward point {{end}} and then bearing off).

### Board Configuration

The board has 24 points numbered 1–24. Positive values represent {{positiveColor}} pieces; negative values represent {{negativeColor}} pieces. Zero means the point is empty.

Board (point 1 to 24):
{{board}}

Pieces in prison (hit and waiting to re-enter):
- White: {{prison.white}}
- Black: {{prison.black}}

Pieces already borne off (home):
- White: {{home.white}}
- Black: {{home.black}}

### Dice

You rolled: {{dice[0]}} and {{dice[1]}}
{{#doubles}}(Doubles! You have four moves of {{dice[0]}} to use.){{/doubles}}

### Your Task

List every legal move you can make this turn using the dice above. For each move, specify:
- The source point (or "prison" if re-entering from the bar)
- The destination point (or "off" if bearing off)
- Which die value is consumed

If no legal moves are available, say "No moves possible – pass turn."

### Rules to Enforce

1. A player **must** use both dice if legally possible; if only one can be used, they must use the higher-value die if possible.
2. A piece in **prison** must re-enter before any other move can be made. Re-entry is onto the opponent's home board (points {{entryRange}}) using the exact die value.
3. A point occupied by **2 or more** opponent pieces is blocked – you cannot land on or pass through it.
4. A point with exactly **1 opponent piece** (a blot) can be hit – the opponent's piece goes to prison.
5. **Bearing off**: You may only bear off when all your pieces are in your home board (points {{homeRange}}). Use a die equal to the exact point, or the highest available die if no piece sits on that exact point, provided no pieces remain on higher points.
6. Doubles give **4 moves** (not 2) of the shown value.

Respond with a numbered list of moves, e.g.:
1. Move from point 6 to point 2 (die: 4)
2. Move from point 8 to point 6 (die: 2)
```

---

## Field Reference

| Placeholder | Source in `Game` type | Description |
|---|---|---|
| `{{color}}` | `game.color` | Current player's color (`white` or `black`) |
| `{{board}}` | `game.board` (24-element array) | Piece counts per point; positive = white, negative = black |
| `{{prison.white}}` | `game.prison.white` | White pieces on the bar |
| `{{prison.black}}` | `game.prison.black` | Black pieces on the bar |
| `{{home.white}}` | `game.home.white` | White pieces borne off |
| `{{home.black}}` | `game.home.black` | Black pieces borne off |
| `{{dice[0]}}`, `{{dice[1]}}` | `game.dice` | The two dice values rolled |

### Direction by Color

| Color | Moves toward | Entry range | Home board |
|---|---|---|---|
| White | Point 24 → 1, then off | Points 19–24 | Points 1–6 |
| Black | Point 1 → 24, then off | Points 1–6 | Points 19–24 |
