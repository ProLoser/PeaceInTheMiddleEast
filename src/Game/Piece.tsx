import { useCallback, type DragEventHandler } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'

const IMAGES = { black, white }

type PieceProps = {
    color: 'black' | 'white',
    position?: number,
    onSelect?: (position: number|null) => void,
}

export default function Piece({ color, position, onSelect }: PieceProps) {
    const onDragStart: DragEventHandler = useCallback((event) => {
        if (onSelect) onSelect(null)
        switch (position) {
            case undefined:
                event.preventDefault()
                break;
            case -1:
                event.dataTransfer?.setData('text', color)
                break;
            default:
                event.dataTransfer?.setData('text', position.toString())
        }
    }, [position, color, onSelect]);

    return <div className={`piece ${color}`} onDragStart={onDragStart} draggable={position !== undefined}>
        <img src={IMAGES[color]} />
    </div>
}