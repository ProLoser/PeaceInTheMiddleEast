import { useCallback, type DragEventHandler } from "react";
import Piece from './Piece'

type PointProps = {
    pieces: number,
    move: (from: number, to: number) => void,
    position: number
}

export default function Point({ pieces, move, position }: PointProps) {
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = event.dataTransfer?.getData("text")!
        return move(from, position)
    }, [move])

    const color = pieces > 0 ? 'white' : 'black';

    return <div className="point" onDragOver={onDragOver} onDrop={onDrop}>
        {Array.from({ length: Math.abs(pieces) }, (_, index) => <Piece key={index} color={color} position={position} />)}
    </div>
}