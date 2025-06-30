import { useCallback, useRef, useState, type DragEventHandler } from "react";
import Piece from './Piece'
import { Color } from "../Types";
import { Vibrations } from "../Utils";

type PointProps = {
    pieces: number,
    move: (from: number | Color, to: number) => void,
    position: number,
    selected: number | null,
    onSelect: (position: number | null) => void,
    enabled: boolean,
    valid: boolean
}

export default function Point({ pieces, move, position, onSelect, selected, enabled, valid }: PointProps) {
    const [dragging, setDragging] = useState(false);
    const pieceRef = useRef<HTMLImageElement>(null);
    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        onSelect(null)
        let from = event.dataTransfer?.getData("text")! as number|Color
        return move(from, position)
    }, [move, enabled])

    const color = pieces > 0 ? Color.White : Color.Black;

    const onDragStart: DragEventHandler = useCallback((event) => {
        onSelect(position)
        setDragging(true)
        navigator.vibrate?.(Vibrations.Up)
        if (event.target === event.currentTarget)
            event.dataTransfer?.setDragImage(pieceRef.current!, 50, 50);
        event.dataTransfer?.setData('text', position?.toString());
    }, [position, pieceRef, onSelect]);

    const onDragEnd = useCallback(() => {
        setDragging(false);
        onSelect(null);
    }, []);

    const onPointerUp = useCallback(() => {
        if (dragging) return;
        if (selected !== null) {
            onSelect(null)
            move(selected, position)
        } else if (enabled) {
            navigator.vibrate?.(Vibrations.Up)
            onSelect(position)
        }
    }, [position, onSelect, dragging, enabled])

    return <div className={`point ${selected === position ? 'selected' : ''} ${valid ? 'valid' : ''}`} 
        draggable={enabled}
        onPointerUp={onPointerUp} 
        onDragOver={onDragOver} 
        onDrop={onDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
    >
        {Array.from({ length: Math.abs(pieces) }, (_, index) => 
            <Piece 
                ref={index == 0 ? pieceRef : null} 
                key={index} 
                color={color} 
                position={position} 
                onSelect={onSelect} 
                enabled={enabled}
            />
        )}
    </div>
}