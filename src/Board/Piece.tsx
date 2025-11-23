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
    ghost?: boolean
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect, enabled = false, ghost = false }, ref) => {
    const onDragStart: DragEventHandler = useCallback(event => {
        if (position === -1) { // bar
            navigator.vibrate?.(Vibrations.Up)
            event.dataTransfer?.setData('text', color)
            onSelect!(-1)
        }
    }, [position, color, onSelect]);
    
    return <div className={classes('piece', color, { ghost })} onDragStart={onDragStart} draggable={enabled && !ghost}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={enabled && !ghost} />
    </div>
})

export default Piece