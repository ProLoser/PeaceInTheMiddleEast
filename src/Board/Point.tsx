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
    ghostWhiteCount: number,
    ghostBlackCount: number,
    movedCount: number
}

export default function Point({ pieces, move, position, onSelect, selected, enabled, valid, ghostWhiteCount, ghostBlackCount, movedCount }: PointProps) {
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
        const fromStr = event.dataTransfer?.getData("text")!;
        // Parse the from position - could be a number string or a Color
        const from = isNaN(parseInt(fromStr)) ? fromStr as Color : parseInt(fromStr);
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
        {/* Render current pieces */}
        {Array.from({ length: Math.abs(pieces) }, (_, index) => {
            // Only mark the last 'movedCount' pieces as moved
            const totalPieces = Math.abs(pieces);
            const isMovedPiece = movedCount > 0 && index >= (totalPieces - movedCount);
            return <Piece 
                ref={index == 0 ? pieceRef : null} 
                key={index} 
                color={color} 
                position={position} 
                onSelect={onSelect} 
                enabled={enabled}
                moved={isMovedPiece}
            />
        })}
        {/* Render white ghost pieces at the end (last pieces on the point) */}
        {ghostWhiteCount > 0 && Array.from({ length: ghostWhiteCount }, (_, index) => {
            return <Piece 
                key={`ghost-white-${index}`} 
                color={Color.White} 
                position={position} 
                enabled={false}
                ghost={true}
            />
        })}
        {/* Render black ghost pieces at the end (last pieces on the point) */}
        {ghostBlackCount > 0 && Array.from({ length: ghostBlackCount }, (_, index) => {
            return <Piece 
                key={`ghost-black-${index}`} 
                color={Color.Black} 
                position={position} 
                enabled={false}
                ghost={true}
            />
        })}
    </div>
}