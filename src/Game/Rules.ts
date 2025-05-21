type Move = {
    label: string;
    dice: [number, number];

}

// White = Positive, Black = Negative
const DEFAULT_BOARD = [
    // black off, white bar
    -0, 0,
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
    0, -0,
    // white off, black bar
]

function rollDie() {
    return Math.floor(Math.random() * 6) + 1
}

class Rules {
    board = DEFAULT_BOARD.slice()
    moves: Move[] = []
    dice = [6, 6]
    turn = true // true: white, false: black
    off = {
        black: 0,
        white: 0
    }
    bar = {
        black: 0,
        white: 0
    }
    roll() {
        this.dice = [rollDie(), rollDie()]
        return this.dice
    }
    addMove(from, to) {

    }
    done() {

    }
    move(from, to) {
    // const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextBoard = [...board];
        let moveLabel = '';
        if (from == "white") { // white re-enter
            moveLabel = `bar/${to}`
            if (board[to] == -1) { // hit
                setBlackBar(bar => bar + 1)
                nextBoard[to] = 0
                moveLabel += '*'
            }
            if (board[to] >= -1) { // move
                setWhiteBar(bar => bar - 1)
                nextBoard[to]++
            } else {
                return; // blocked
            }
        } else if (from == 'black') { // black re-enter
            moveLabel = `bar/${to}`
            if (board[to] == 1) { // hit
                setWhiteBar(bar => bar + 1)
                nextBoard[to] = 0
                moveLabel += '*'
            }
            if (board[to] <= 1) { // move
                setBlackBar(bar => bar - 1)
                nextBoard[to]--
            } else {
                return; // blocked
            }
        } else {
            const offense = board[from];
            const defense = board[to];

            if (defense === undefined) {  // bear off
                moveLabel = `${from}/off`
                if (offense > 0) {
                    setWhiteHome(count => count + 1)
                } else {
                    setBlackHome(count => count + 1)
                }
            } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
                nextBoard[to] += Math.sign(offense)
                moveLabel = `${from}/${to}`
            } else if (Math.abs(defense) === 1) { // hit
                nextBoard[to] = -Math.sign(defense);
                moveLabel = `${from}/${to}*`
                if (offense > 0)
                    setBlackBar(bar => bar + 1)
                else
                    setWhiteBar(bar => bar + 1)
            } else { // stalemate
                return
            }

            nextBoard[from] -= Math.sign(offense)
        }

        return nextBoard;
    }
    point(position: number) {
        if (position === -1) {
            return this.turn ? this.bar.white : this.bar.black
        } else {
            if (this.turn) {
                return position > 12 ? this.board[12 + position] : this.board[12 - position]
            } else {
                return position > 12 ? this.board[position - 12] : this.board[24 - position] 
            }
        }
    }
    available(position: number) {
        const moves = []
        if (position) { // point
            // Do you have pieces there?
            if (this.turn ? this.point(position) > 0 : this.point(position) < 0) {
                // Can you move to die1
                if (this.vulnerable(position - this.dice[0]))
                    moves.push(`${position}/${position - this.dice[0]}`)
                if (this.dice[1] == this.dice[0]) {
                    // Can you move to die * 3
                    if (this.vulnerable(position - this.dice[1] * 3))
                        moves.push(`${position}/${position - this.dice[1]*3}`)
                    // Can you move to die * 4
                    if (this.vulnerable(position - this.dice[1] * 4))
                        moves.push(`${position}/${position - this.dice[1]*4}`)
                } else {
                    // Can you move to die2
                    if (this.vulnerable(position - this.dice[1]))
                        moves.push(`${position}/${position - this.dice[1]}`)
                }
                // Can you move with both die
                if (this.vulnerable(position - this.dice[0] - this.dice[1]))
                    moves.push(`${position}/${position - this.dice[0] - this.dice[1]}`)
            }
        } else {
            if ((this.turn && this.bar.white) || (!this.turn && this.bar.black)) {
                // Can you move to die1
                if (this.vulnerable(this.dice[0]))
                    moves.push(`bar/${this.dice[0]}`)
                // Can you move to die2
                if (this.vulnerable(this.dice[1]))
                    moves.push(`bar/${this.dice[1]}`)
            } else { // board

            }
        }
    }
    vulnerable(position: number) {
        if (position > 24 || position < 1) return true; // always able to bear off
        const destination = this.point(position) 
        return this.turn ? destination > -2 : destination < 2 
    }
}