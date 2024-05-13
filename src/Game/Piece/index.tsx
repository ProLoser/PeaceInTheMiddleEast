import { useCallback, type DragEventHandler } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'

const IMAGES = { black, white }

type PointProps = {
    pieces: number,
    move: (from: number, to: number) => void,
    position: number
}

export default function Point({ pieces, move, position }: PointProps) {

    const onDragStart: DragEventHandler = useCallback((event) => event.dataTransfer?.setData('text', position.toString()), [])
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDropListener: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, position)
    }, [move])

    const Pieces = Array.from({ length: Math.abs(pieces) });
    const color = pieces > 0 ? 'white' : 'black';

    return <div className="point" onDragOver={onDragOver} onDragStart={onDragStart} onDrop={onDropListener}>
        {Pieces.map((value, index) => <div className={`piece ${color}`} key={index}>
            <img src={IMAGES[color]} />
        </div>)}
    </div>
}