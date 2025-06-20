import { useCallback, useRef, useState, type DragEventHandler } from "react";
import Piece from './Piece'
import { Color } from "../Types";

type PointProps = {
    pieces: number,
    move: (from: number | Color, to: number) => void,
    position: number,
    selected: number | null,
    onSelect: (position: number | null) => void,
    enabled: boolean
}

export default function Point({ pieces, move, position, onSelect, selected, enabled }: PointProps) {
    const [dragging, setDragging] = useState(false);
    const pieceRef = useRef<HTMLImageElement>(null);
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        navigator.vibrate?.(10);
        event.preventDefault();
        onSelect(null)
        let from = event.dataTransfer?.getData("text")!
        return move(from, position)
    }, [move])

    const color = pieces > 0 ? Color.White : Color.Black;

    const onDragStart: DragEventHandler = useCallback((event) => {
        // if (pieces === 0) return;

        onSelect(null)
        setDragging(true)

        if (pieces)
            event.dataTransfer?.setDragImage(pieceRef.current, 50, 50);

        // Set drag data
        if (position !== undefined || pieces !== 0)
            event.dataTransfer?.setData('text/plain', position?.toString());
    }, [position, pieces, pieceRef, onSelect]);

    const onDragEnd = useCallback(() => {
        setDragging(false);
    }, []);

    const onPointerUp = useCallback(() => {
        if (dragging) return;
        if (pieces !== 0 || selected !== null && enabled)
            onSelect(position)
    }, [pieces, position, onSelect, dragging, enabled])

    return <div className={`point ${selected === position ? 'selected' : ''}`} 
        draggable={enabled}
        onPointerUp={onPointerUp} 
        onDragOver={onDragOver} 
        onDrop={onDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
    >
        {Array.from({ length: Math.abs(pieces) }, (_, index) => <Piece ref={index == 0 ? pieceRef : null} key={index} color={color} position={position} onSelect={onSelect} />)}
    </div>
}