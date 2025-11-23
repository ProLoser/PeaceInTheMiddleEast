import { useCallback, forwardRef, type DragEventHandler } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'
import { Color } from "../Types";
import { Vibrations } from "../Utils";

const IMAGES = { black, white }

type PieceProps = {
    color: Color,
    position?: number,
    onSelect?: (position: number|null) => void,
    enabled?: boolean,
    isGhost?: boolean,
    isHit?: boolean
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect, enabled = false, isGhost = false, isHit = false }, ref) => {
    const onDragStart: DragEventHandler = useCallback(event => {
        if (isGhost) {
            event.preventDefault();
            return;
        }
        if (position === -1) { // bar
            navigator.vibrate?.(Vibrations.Up)
            event.dataTransfer?.setData('text', color)
            onSelect!(-1)
        }
    }, [position, color, onSelect, isGhost]);
    
    const className = isGhost ? `piece ${color} ghost${isHit ? ' hit' : ''}` : `piece ${color}`;
    const isDraggable = enabled && !isGhost;
    
    return <div className={className} onDragStart={onDragStart} draggable={isDraggable}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={isDraggable} />
    </div>
})

export default Piece