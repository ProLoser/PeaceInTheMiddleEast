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

Choose the best legal play for this turn and respond **only** in standard backgammon notation. If no legal moves are available, respond with: `no move`
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
