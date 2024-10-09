import { useCallback, type DragEventHandler } from "react";
import Piece from './Piece'

type PointProps = {
    pieces: number,
    move: (from: number | 'black' | 'white', to: number) => void,
    position: number,
    selected: number | null,
    onSelect: (position: number | null) => void
}

export default function Point({ pieces, move, position, onSelect, selected }: PointProps) {
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        // onSelect(null)
        let from = event.dataTransfer?.getData("text")!
        return move(from, position)
    }, [move])

    const color = pieces > 0 ? 'white' : 'black';

    const onPointerUp = useCallback(() => {
        if (pieces !== 0 || selected !== null)
            onSelect(position)
    }, [pieces, position, onSelect])

    return <div className={`point ${selected === position ? 'selected' : ''}`} onPointerUp={onPointerUp} onDragOver={onDragOver} onDrop={onDrop}>
        {Array.from({ length: Math.abs(pieces) }, (_, index) => <Piece key={index} color={color} position={position} onSelect={onSelect} />)}
    </div>
}