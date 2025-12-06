import { forwardRef } from "react";
import black from './images/piece-black-2.png';
import white from './images/piece-white-2.png';
import './Piece.css'
import { Color } from "../Types";
import { classes } from "../Utils";

const IMAGES = { black, white }

type PieceProps = {
    color: Color,
    ghost?: boolean,
    moved?: boolean,
}

const Piece = forwardRef<HTMLImageElement, PieceProps>(({ color, ghost = false, moved = false }, ref) => {
    return <div className={classes('piece', color, { ghost, moved })}>
        <img ref={ref} src={IMAGES[color]} onContextMenu={event => event.preventDefault()} draggable={false} />
    </div>
})

export default Piece