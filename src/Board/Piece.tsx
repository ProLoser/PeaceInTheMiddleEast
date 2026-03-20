import { useCallback, forwardRef, type DragEventHandler } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'
import { Color } from "../Types";
import { Vibrations, classes } from "../Utils";

const IMAGES = { black, white }

type PieceProps = {
    color: Color,
    position?: number,
    onSelect?: (position: number|null) => void,
    enabled?: boolean,
    ghost?: boolean,
    moved?: boolean,
    selected?: number | null,
    dragging?: boolean
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect, enabled = false, ghost = false, moved = false, selected = null, dragging = false }, ref) => {
    const onDragStart: DragEventHandler = useCallback(event => {
        if (enabled && position === -1) { // bar
            navigator.vibrate?.(Vibrations.Up)
            event.dataTransfer?.setData('text', color)
            const imgEl = (event.currentTarget as HTMLElement).querySelector('img');
            if (imgEl) event.dataTransfer?.setDragImage(imgEl, 50, 50);
            onSelect!(-1)
        }
    }, [position, color, onSelect, enabled]);

    const onDragEnd: DragEventHandler = useCallback(() => {
        if (position === -1) { // bar
            onSelect!(null)
        }
    }, [position, onSelect]);
    
    const onPointerUp = useCallback(() => {
        if (enabled && position === -1) { // bar
            if (selected === -1) {
                onSelect!(null)
            } else {
                navigator.vibrate?.(Vibrations.Up)
                onSelect!(-1)
            }
        }
    }, [position, onSelect, enabled, selected]);
    
    return <div className={classes('piece', color, { ghost, moved, dragging })} onDragStart={onDragStart} onDragEnd={onDragEnd} onPointerUp={onPointerUp} draggable={enabled}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={false} />
    </div>
})

export default Piece