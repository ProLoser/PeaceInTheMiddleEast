import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import Toolbar from '../Toolbar'
import { useCallback, useContext, useState, type DragEventHandler } from 'react';
import { MatchContext } from '../Online/Contexts';
import useGameState from './useGameState';

export default function Game() {
    const [selected, setSelected] = useState<number | null>(null);
    const match = useContext(MatchContext);
    const { state: game, rollDice, move } = useGameState(match?.game);

    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, -1,)
    }, [move])

    const onSelect = useCallback((position: number | null) => {
        if (position === null || selected === position) {
            setSelected(null);
        } else if (selected === null) {
            setSelected(position);
        } else {
            move(selected, position);
            setSelected(null);
        }
    }, [selected, move])

    return <div id="board">
        <Toolbar />
        <Dice onClick={rollDice} values={game.dice} />

        <div className="bar">
            {Array.from({ length: game.prison.white }, (_, index) =>
                <Piece key={index} position={-1} color="white" />
            )}
        </div>
        <div className="bar">
            {Array.from({ length: game.prison.black }, (_, index) =>
                <Piece key={index} position={-1} color="black" />
            )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: game.home.black }, (_, index) =>
                <Piece key={index} color="black" />
            )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: game.home.white }, (_, index) =>
                <Piece key={index} color="white" />
            )}
        </div>
        {game.board.map((pieces: number, index: number) =>
            <Point key={index} pieces={pieces} move={move} position={index} selected={selected === index} onSelect={onSelect} />
        )}
    </div >;
}
