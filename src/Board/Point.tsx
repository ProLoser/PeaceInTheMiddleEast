import { useCallback, useRef, useState, type DragEventHandler } from "react";
import Piece from './Piece'
import { Color } from "../Types";
import { Vibrations, classes } from "../Utils";

type PointProps = {
    pieces: number,
    move: (from: number | Color, to: number) => void,
    position: number,
    selected: number | null,
    onSelect: (position: number | null) => void,
    enabled: boolean,
    valid: boolean,
    previousPieces: number | null,
    showGhosts: boolean
}

export default function Point({ pieces, move, position, onSelect, selected, enabled, valid, previousPieces, showGhosts }: PointProps) {
    const [dragging, setDragging] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const pieceRef = useRef<HTMLImageElement>(null);
    
    const onDragOver: DragEventHandler = useCallback((event) => { 
        event.preventDefault(); 
    }, [])
    
    const onDragEnter: DragEventHandler = useCallback((event) => {
        if (valid && !dragOver) {
            setDragOver(true);
            navigator.vibrate?.(Vibrations.Up);
        }
    }, [valid, dragOver]);
    
    const onDragLeave: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        if (valid && dragOver) {
            setDragOver(false);
        }
    }, [valid, dragOver]);
    
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        setDragOver(false);
        onSelect(null)
        let from = event.dataTransfer?.getData("text")! as number|Color
        return move(from, position)
    }, [move])

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
        setDragOver(false);
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

    return <div className={classes('point', { valid, selected: selected === position, dragOver })} 
        draggable={enabled}
        onPointerUp={onPointerUp} 
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
    >
        {/* Render ghost pieces from previous board state */}
        {showGhosts && previousPieces !== null && previousPieces !== 0 && Array.from({ length: Math.abs(previousPieces) }, (_, index) => {
            const ghostColor = previousPieces > 0 ? Color.White : Color.Black;
            return <Piece 
                key={`ghost-${index}`} 
                color={ghostColor} 
                position={position} 
                enabled={false}
                ghost={true}
            />
        })}
        {/* Render current pieces */}
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