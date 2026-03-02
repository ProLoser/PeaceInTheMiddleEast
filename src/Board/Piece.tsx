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
    selected?: number | null
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect, enabled = false, ghost = false, moved = false, selected = null }, ref) => {
    const onDragStart: DragEventHandler = useCallback(event => {
        if (enabled && position === -1) { // bar
            navigator.vibrate?.(Vibrations.Up)
            event.dataTransfer?.setData('text', color)
            onSelect!(-1)
        }
    }, [position, color, onSelect, enabled]);
    
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
    
    return <div className={classes('piece', color, { ghost, moved })} onDragStart={onDragStart} onPointerUp={onPointerUp} draggable={enabled}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={enabled} />
    </div>
})

export default Piece