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
    ghosts?: number,
    ghostHit?: number,
    destination?: number
}

export default function Point({ pieces, move, position, onSelect, selected, enabled, valid, ghosts, ghostHit, destination }: PointProps) {
    const [dragging, setDragging] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const pieceRef = useRef<HTMLImageElement>(null);
    
    const onDragOver: DragEventHandler = useCallback((event) => { 
        event.preventDefault(); 
    }, [])
    
    const onDragEnter: DragEventHandler = useCallback(() => {
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
        let from = event.dataTransfer?.getData("text")! as number|Color
        return move(from, position)
    }, [move, onSelect, position])

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
    }, [onSelect]);

    const onPointerUp = useCallback(() => {
        if (dragging) return;
        if (selected !== null) {
            move(selected, position)
        } else if (enabled) {
            navigator.vibrate?.(Vibrations.Up)
            onSelect(position)
        }
    }, [position, onSelect, dragging, enabled, selected, move])

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
        {Array.from({ length: Math.abs(pieces) }, (_, index) => {
            // Glow the top N pieces where N is the absolute value of destination
            // The destination pieces are at the top of the stack (highest indices)
            const glowCount = destination ? Math.abs(destination) : 0;
            const shouldGlow = glowCount > 0 && index >= Math.abs(pieces) - glowCount;
            return (
                <Piece 
                    ref={index == 0 ? pieceRef : null} 
                    key={index} 
                    color={color} 
                    position={position} 
                    onSelect={onSelect} 
                    enabled={enabled}
                    glow={shouldGlow}
                />
            );
        })}
        {ghosts && ghosts !== 0 && Array.from({ length: Math.abs(ghosts) }, (_, index) => (
            <Piece 
                key={`ghost-${index}`} 
                color={ghosts > 0 ? Color.White : Color.Black} 
                position={position} 
                ghost={true}
            />
        ))}
        {ghostHit && ghostHit !== 0 && (
            <Piece 
                key="ghost-hit" 
                color={ghostHit > 0 ? Color.White : Color.Black} 
                position={position} 
                ghost={true}
            />
        )}
    </div>
}