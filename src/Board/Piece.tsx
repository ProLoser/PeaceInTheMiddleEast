import { useCallback, forwardRef } from "react";
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
    const onPointerUp = useCallback(() => {
        if (dragging) return;
        if (enabled && position === -1) { // bar
            if (selected === -1) {
                onSelect!(null)
            } else {
                navigator.vibrate?.(Vibrations.Up)
                onSelect!(-1)
            }
        }
    }, [position, onSelect, enabled, selected, dragging]);
    
    return <div className={classes('piece', color, { ghost, moved })} onPointerUp={onPointerUp}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={false} />
    </div>
})

export default Piece