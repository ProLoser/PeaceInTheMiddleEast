import { useCallback, forwardRef, type DragEventHandler } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'

const IMAGES = { black, white }

type PieceProps = {
    color: 'black' | 'white',
    position?: number,
    onSelect?: (position: number|null) => void,
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, position, onSelect }, ref) => {
    const onDragStart: DragEventHandler = useCallback((event) => {
        if (onSelect) onSelect(null)
        switch (position) {
            case undefined: // Home
                event.preventDefault()
                break;
            case -1: // Bar
                event.dataTransfer?.setData('text', color)
                event.stopPropagation()
                break;
            default: // Board
                event.dataTransfer?.setData('text', position.toString())
                event.stopPropagation()
        }
    }, [position, color, onSelect]);
    
    return <div className={`piece ${color}`} onDragStart={onDragStart} draggable={position !== undefined}>
        <img ref={ref} src={IMAGES[color]} />
    </div>
})

export default Piece