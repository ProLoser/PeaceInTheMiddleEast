import React from 'react';
import { Player } from './types';
import { PLAYER_COLORS } from './constants';

interface CheckerPieceProps {
    player: Player;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void; // Mouse
    onTouchStartDraggable?: (event: React.TouchEvent<HTMLDivElement>) => void; // Touch, primarily for Bar
    isDraggable?: boolean;
    small?: boolean;
}

const CheckerPiece: React.FC<CheckerPieceProps> = ({
    player,
    onDragStart,
    onTouchStartDraggable,
    isDraggable,
    small
}) => {
    const sizeClasses = small ? "w-4 h-4 md:w-5 md:h-5" : "w-8 h-8 md:w-10 md:h-10";
    const innerSizeClasses = small ? "w-2 h-2 md:w-2.5 md:h-2.5" : "w-4 h-4 md:w-5 md:h-5";

    return (
        <div
            draggable={isDraggable}
            onDragStart={onDragStart}
            onTouchStart={onTouchStartDraggable} // Added for bar checkers
            className={`${sizeClasses} checker-piece-visual rounded-full checker-shadow flex items-center justify-center ${isDraggable ? 'cursor-grab' : 'cursor-default'} ${PLAYER_COLORS[player].base} ${PLAYER_COLORS[player].border} border-2`}
            style={{ transition: 'transform 0.2s ease-out' }}
            aria-label={`${player} checker`}
            onMouseDown={(e) => { if (isDraggable) e.stopPropagation(); }} // For mouse
        >
            <div className={`${innerSizeClasses} rounded-full ${player === Player.Player1 ? 'bg-slate-300' : 'bg-red-900'}`}></div>
        </div>
    );
};

export default CheckerPiece;
