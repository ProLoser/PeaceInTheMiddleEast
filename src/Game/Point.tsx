import { useCallback, type DragEventHandler } from "react";
import Piece from './Piece'

type PointProps = {
    pieces: number,
    move: (from: number, to: number) => void,
    position: number,
    selected: boolean,
    onSelect: (position: number) => void
}

export default function Point({ pieces, move, position, onSelect, selected }: PointProps) {
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = event.dataTransfer?.getData("text")!
        return move(from, position)
    }, [move])

    const color = pieces > 0 ? 'white' : 'black';

    const onClick = useCallback(() => {
        onSelect(position)
    }, [position, onSelect])

    return <div className={`point ${selected&&'selected'}`} onClick={onClick} onDragOver={onDragOver} onDrop={onDrop}>
        {Array.from({ length: Math.abs(pieces) }, (_, index) => <Piece key={index} color={color} position={position} onSelect={onSelect} />)}
    </div>
}