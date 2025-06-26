import { useCallback, forwardRef, type DragEventHandler } from "react";
import { playCheckerSound } from '../Utils';
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'
import { Color } from "../Types";

const IMAGES = { black, white }

type PieceProps = {
    color: Color,
    position?: number,
    onSelect?: (position: number|null) => void,
    enabled?: boolean
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect, enabled = false }, ref) => {
    const onDragStart: DragEventHandler = useCallback(event => {
        if (position === -1) { // bar
            navigator.vibrate?.(5);
            event.dataTransfer?.setData('text', color)
            onSelect?.(-1)
        }
    }, [position, color, onSelect]);
    
    return <div className={`piece ${color}`} onDragStart={onDragStart} draggable={enabled}>
        <img ref={ref} src={IMAGES[color]} />
    </div>
})

export default Piece