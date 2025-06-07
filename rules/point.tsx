import React, { useState } from 'react';
import { Player } from './types';
import CheckerPiece from './piece';

export type PointDirection = 'up' | 'down' | 'left' | 'right';
export type CheckerStackDirection = 'vertical-base' | 'vertical-tip' | 'horizontal-base' | 'horizontal-tip';

interface PointProps {
    pointValue: number;
    pointIndex: number;
    pointDirection: PointDirection;
    checkerStackDirection: CheckerStackDirection;
    isLandscape: boolean;
    colorIndex: number;
    onClick: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    isHighlighted: boolean; // Is this point a possible destination?
    isSelectedSource: boolean; // Is this point the selected source?
    isTouchDragHovering?: boolean; // Is this the current touch hover target?
    canDragFrom: boolean;
    onCheckerDragStart: (player: Player, sourceIndex: number) => void; // Mouse drag
    onTouchStartDraggable: (player: Player, sourceIndex: number) => void; // Touch drag
}

const Point: React.FC<PointProps> = ({
    pointValue,
    pointIndex,
    pointDirection,
    checkerStackDirection,
    isLandscape,
    colorIndex,
    onClick,
    onDrop,
    isHighlighted,
    isSelectedSource,
    isTouchDragHovering,
    canDragFrom,
    onCheckerDragStart,
    onTouchStartDraggable
}) => {
    const [isMouseDragHovering, setIsMouseDragHovering] = useState(false);

    const numCheckers = Math.abs(pointValue);
    const playerOnPoint: Player | null = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);

    const checkersToRenderCount = numCheckers;

    let pointContainerClasses = 'point-container ';

    if (isLandscape) {
        pointContainerClasses += pointDirection === 'up' ? 'point-shape-up ' : 'point-shape-down ';
    } else {
        pointContainerClasses += pointDirection === 'left' ? 'point-shape-left ' : 'point-shape-right ';
    }

    const showDragOverHighlight = (isMouseDragHovering || isTouchDragHovering) && isHighlighted;

    if (showDragOverHighlight) {
        pointContainerClasses += 'point-color-highlight-hover ';
    } else if (isSelectedSource) {
        pointContainerClasses += 'point-color-selected-source ';
    } else if (isHighlighted) {
        pointContainerClasses += 'point-color-highlight-move ';
    } else {
        pointContainerClasses += colorIndex % 2 === 0 ? 'point-color-default-0 ' : 'point-color-default-1 ';
    }

    let checkerLayoutClasses = 'absolute flex z-10 overflow-hidden';
    const checkerSpacing = 'space-x-0.5 md:space-x-1';
    const verticalCheckerSpacing = 'space-y-0.5 md:space-y-1';

    if (isLandscape) {
        checkerLayoutClasses += ` w-full h-[85%] items-center ${verticalCheckerSpacing}`;
        if (pointDirection === 'up') {
            checkerLayoutClasses += ' bottom-[5%] flex-col-reverse justify-start';
        } else {
            checkerLayoutClasses += ' top-[5%] flex-col justify-start';
        }
        checkerLayoutClasses += ' left-1/2 -translate-x-1/2';
    } else {
        checkerLayoutClasses += ` h-full w-[85%] items-center ${checkerSpacing}`;
        if (pointDirection === 'left') {
            checkerLayoutClasses += ' right-[5%] flex-row-reverse justify-start';
        } else {
            checkerLayoutClasses += ' left-[5%] flex-row justify-start';
        }
        checkerLayoutClasses += ' top-1/2 -translate-y-1/2';
    }

    const handleMouseDragStartPoint = (e: React.DragEvent<HTMLDivElement>) => {
        if (canDragFrom && playerOnPoint) {
            onCheckerDragStart(playerOnPoint, pointIndex);
            e.dataTransfer.setData("text/plain", JSON.stringify({ type: 'point_checker', sourceIndex: pointIndex, player: playerOnPoint }));
            e.dataTransfer.effectAllowed = "move";

            const checkerVisualEl = e.currentTarget.querySelector('.checker-piece-visual') as HTMLElement;
            if (checkerVisualEl) {
                const xOffset = checkerVisualEl.offsetWidth / 2;
                const yOffset = checkerVisualEl.offsetHeight / 2;
                e.dataTransfer.setDragImage(checkerVisualEl, xOffset, yOffset);
            }
        } else {
            e.preventDefault();
        }
    };

    const handleTouchStartPoint = (e: React.TouchEvent<HTMLDivElement>) => {
        if (canDragFrom && playerOnPoint) {
            e.preventDefault(); // Prevent mouse event emulation, scrolling, and other default gestures.
            onTouchStartDraggable(playerOnPoint, pointIndex);
        }
    };


    const getCheckerKey = (idx: number) => `checker-${pointIndex}-${idx}`;

    const handleDragOverPoint = (e: React.DragEvent<HTMLDivElement>) => {
        if (isHighlighted) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDragEnterPoint = (e: React.DragEvent<HTMLDivElement>) => {
        if (isHighlighted) {
            setIsMouseDragHovering(true);
            e.preventDefault();
        }
    };

    const handleDragLeavePoint = (e: React.DragEvent<HTMLDivElement>) => {
        setIsMouseDragHovering(false);
    };

    return (
        <div
            className={`${pointContainerClasses.trim()} cursor-pointer`}
            onClick={onClick}
            onDrop={(e) => { e.stopPropagation(); onDrop(e); setIsMouseDragHovering(false); }}
            onDragOver={handleDragOverPoint}
            onDragEnter={handleDragEnterPoint}
            onDragLeave={handleDragLeavePoint}
            draggable={canDragFrom && playerOnPoint != null} // For mouse drag
            onDragStart={handleMouseDragStartPoint} // For mouse drag
            onTouchStart={handleTouchStartPoint} // For touch drag
            aria-label={`Point ${pointIndex + 1}, Checkers: ${numCheckers}, Player: ${playerOnPoint || 'None'}`}
        >
            {playerOnPoint && (
                <div className={checkerLayoutClasses}>
                    {Array.from({ length: checkersToRenderCount }).map((_, idx) => (
                        <div
                            key={getCheckerKey(idx)}
                            className="flex-shrink-0"
                        >
                            <CheckerPiece
                                player={playerOnPoint}
                                small={numCheckers > 1}
                            // No direct touch handlers on checker piece within point, point handles it.
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Point;