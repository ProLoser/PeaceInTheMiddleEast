import { Component } from "react";
import Point from './Point';

export default class Game extends Component {
    constructor(props) {
        super(props);

        // TODO: don't call setState() in constructor
        this.reset();
    }
    state = {
        home: [0, 0],
        board: [],
        dice: [],

    }

    reset() {
        // TODO: skip confirmation if game is over?
        if (!confirm('Are you sure you want to restart the game?')) { return; }
        let board = [
            5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
            -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
        ];
        this.setState({ board, home: [0, 0] });
    }

    move(from, to) {
        const fromPieces = this.state.board[from];
        if (!fromPieces) return;

        const board = this.state.board;
        if (board[to] > 0 && fromPieces > 0) {
            board[to]++;
            board[from]--;
        } else if (board[to] < 0 && fromPieces < 0) {
            board[to]--;
            board[from]++;
        } else if (board[to] == 1) {
            board[to] = -1;

        } else if (board[to] == -1) {
            board[to] = 1;
        } else {
            return
        }
        this.setState({ board })
    }

    roll() {
        let first = Math.floor(Math.random() * 6);
        let second = Math.floor(Math.random() * 6);
        this.setState({ dice: [first, second] });
    }

    onDrop(position, event) {
        this.move(event.dataTransfer.getData("text"), position);
    }

    render() {
        return <>{this.state.board.map((pieces, position) => <Point onDrop={this.onDrop.bind(this, position)} pieces={pieces} position={position} />)}</>;
    }
}