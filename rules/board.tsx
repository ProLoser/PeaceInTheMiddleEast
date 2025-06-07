import React from 'react';
import { BoardState, Player, MoveDestination } from './types';
import { PLAYER_COLORS } from './constants';
import Point, { PointDirection, CheckerStackDirection } from './point';
import CheckerPiece from './piece';

interface BoardProps {
    boardState: BoardState;
    currentPlayer: Player;
    selectedSourceIndex: number | 'BAR_P1' | 'BAR_P2' | null;
    highlightedDestinations: MoveDestination[];
    onPointClick: (pointIndex: number) => void;
    onBarClick: (player: Player) => void;
    onBearOffClick: (player: Player) => void;
    onDropOnPoint: (pointIndex: number) => void;
    onDropOnBar?: (player: Player) => void;
    onDropOnBearOff: (player: Player) => void;
    onCheckerDragStart: (player: Player, sourceIndex: number | 'BAR_P1' | 'BAR_P2', checkerId?: string) => void; // Mouse
    onTouchStartDraggable: (player: Player, sourceIndex: number | 'BAR_P1' | 'BAR_P2', checkerId?: string) => void; // Touch
    touchDragHoverTarget: { type: 'point'; id: number } | { type: 'off'; id: Player } | null; // For touch hover highlight
    isLandscape: boolean;
}

const Board: React.FC<BoardProps> = ({
    boardState,
    currentPlayer,
    selectedSourceIndex,
    highlightedDestinations,
    onPointClick,
    onBarClick,
    onBearOffClick,
    onDropOnPoint,
    onDropOnBearOff,
    onCheckerDragStart,
    onTouchStartDraggable,
    touchDragHoverTarget,
    isLandscape,
}) => {
    const generalDragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
        const targetIsBearOffP1 = (e.target as HTMLElement).closest('[data-droptarget-type="off"][data-droptarget-id="Player1"]');
        const targetIsBearOffP2 = (e.target as HTMLElement).closest('[data-droptarget-type="off"][data-droptarget-id="Player2"]');

        if (targetIsBearOffP1 && highlightedDestinations.some(d => d.toIndex === 'OFF' && currentPlayer === Player.Player1)) {
            e.preventDefault();
        } else if (targetIsBearOffP2 && highlightedDestinations.some(d => d.toIndex === 'OFF' && currentPlayer === Player.Player2)) {
            e.preventDefault();
        }
    };

    const renderPointQuadrant = (
        indices: number[],
        quadrantIdentifier: 'P2_OUTER' | 'P1_OUTER' | 'P2_HOME' | 'P1_HOME'
    ) => {
        return (
            <div className={`grid ${isLandscape ? 'grid-cols-6 flex-1' : 'grid-rows-6 flex-1'} gap-px`}>
                {indices.map((pointIndex) => {
                    const pointValue = boardState.points[pointIndex];
                    const pointPlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);

                    let pointDirection: PointDirection;
                    let checkerStackDirection: CheckerStackDirection;

                    if (isLandscape) {
                        pointDirection = (pointIndex <= 11) ? 'down' : 'up';
                        checkerStackDirection = 'vertical-base';
                    } else {
                        pointDirection = (pointIndex <= 11) ? 'right' : 'left';
                        checkerStackDirection = 'horizontal-base';
                    }

                    return (
                        <div
                            key={pointIndex}
                            className="w-full h-full relative"
                            data-droptarget-type="point"
                            data-droptarget-id={pointIndex}
                        >
                            <Point
                                pointValue={pointValue}
                                pointIndex={pointIndex}
                                pointDirection={pointDirection}
                                checkerStackDirection={checkerStackDirection}
                                isLandscape={isLandscape}
                                colorIndex={pointIndex % 2}
                                onClick={() => onPointClick(pointIndex)}
                                onDrop={(e) => { e.stopPropagation(); onDropOnPoint(pointIndex); }}
                                isHighlighted={highlightedDestinations.some(d => d.toIndex === pointIndex)}
                                isSelectedSource={selectedSourceIndex === pointIndex}
                                isTouchDragHovering={touchDragHoverTarget?.type === 'point' && touchDragHoverTarget.id === pointIndex}
                                canDragFrom={
                                    pointPlayer === currentPlayer &&
                                    (currentPlayer === Player.Player1 ? boardState.bar[Player.Player1].length === 0 : boardState.bar[Player.Player2].length === 0)
                                }
                                onCheckerDragStart={(player, srcIdx) => onCheckerDragStart(player, srcIdx)} // Mouse
                                onTouchStartDraggable={(player, srcIdx) => onTouchStartDraggable(player, srcIdx)} // Touch
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    const barP1Selected = selectedSourceIndex === 'BAR_P1';
    const barP2Selected = selectedSourceIndex === 'BAR_P2';

    const p2HomeIndices = [0, 1, 2, 3, 4, 5];
    const p2OuterIndices = [6, 7, 8, 9, 10, 11];
    const p1OuterIndices = [12, 13, 14, 15, 16, 17];
    const p1HomeIndices = [18, 19, 20, 21, 22, 23];

    const portraitP2Outer = [...p2OuterIndices].reverse();
    const portraitP2Home = [...p2HomeIndices].reverse();
    const portraitP1Outer = [...p1OuterIndices];
    const portraitP1Home = [...p1HomeIndices];

    const landscapeP2Outer = [...p2OuterIndices].reverse();
    const landscapeP2Home = [...p2HomeIndices].reverse();
    const landscapeP1Outer = [...p1OuterIndices];
    const landscapeP1Home = [...p1HomeIndices];

    const offAreaSize = isLandscape ? "h-full w-12 md:w-16" : "w-full h-12 md:h-16";
    const p1OffHighlight = highlightedDestinations.some(d => d.toIndex === 'OFF' && currentPlayer === Player.Player1);
    const p2OffHighlight = highlightedDestinations.some(d => d.toIndex === 'OFF' && currentPlayer === Player.Player2);
    const p1OffTouchHover = touchDragHoverTarget?.type === 'off' && touchDragHoverTarget.id === Player.Player1;
    const p2OffTouchHover = touchDragHoverTarget?.type === 'off' && touchDragHoverTarget.id === Player.Player2;


    return (
        <div className={`bg-amber-300 p-1 sm:p-2 rounded-lg shadow-xl w-full h-full select-none`}>
            <div className={`grid h-full w-full gap-1 sm:gap-2 ${isLandscape ? 'grid-rows-[1fr_auto_1fr]' : 'grid-cols-[1fr_auto_1fr]'}`}>

                <div className={`flex ${isLandscape ? 'flex-row space-x-1 sm:space-x-2' : 'flex-col space-y-1 sm:space-y-2'} justify-between`}>
                    {isLandscape ? renderPointQuadrant(landscapeP2Outer, 'P2_OUTER') : renderPointQuadrant(portraitP2Outer, 'P2_OUTER')}
                    {isLandscape ? renderPointQuadrant(landscapeP2Home, 'P2_HOME') : renderPointQuadrant(portraitP2Home, 'P2_HOME')}
                </div>

                <div className={`flex bg-amber-500 rounded items-center justify-around ${isLandscape ? 'flex-row h-auto w-full px-2 py-1' : 'flex-col w-auto h-full py-2 px-1'}`}>
                    <div
                        className={`border-2 rounded flex items-center p-1 overflow-hidden relative ${PLAYER_COLORS[Player.Player2].base} 
                        ${p2OffHighlight ? 'ring-2 ring-blue-500' : ''} 
                        ${p2OffTouchHover && p2OffHighlight ? 'ring-offset-2 ring-purple-600' : ''}
                        ${offAreaSize} ${isLandscape ? 'order-1 flex-col justify-start' : 'order-1 flex-row justify-start'}`}
                        onClick={() => onBearOffClick(Player.Player2)}
                        onDrop={(e) => { e.stopPropagation(); onDropOnBearOff(Player.Player2) }}
                        onDragOver={generalDragOverHandler}
                        aria-label="Player 2 Off Area"
                        data-droptarget-type="off"
                        data-droptarget-id={Player.Player2}
                    >
                        <div className={`flex ${isLandscape ? 'flex-col-reverse items-center space-y-[-10px] md:space-y-[-12px]' : 'flex-row-reverse items-center space-x-[-10px] md:space-x-[-12px]'}`}>
                            {boardState.off[Player.Player2].slice(0, 5).map((checker) => <div key={checker.id}><CheckerPiece player={checker.player} small={true} /></div>)}
                        </div>
                        {boardState.off[Player.Player2].length > 0 && <span className="absolute top-0 right-1 text-[10px] font-bold">{boardState.off[Player.Player2].length}</span>}
                    </div>

                    <div className={`flex items-center justify-center grow ${isLandscape ? 'flex-row space-x-2 mx-2 order-2' : 'flex-col space-y-2 my-2 order-2'}`}>
                        <div
                            className={`border-2 rounded flex items-center justify-center p-1 relative ${PLAYER_COLORS[Player.Player1].base} ${barP1Selected ? 'ring-2 ring-yellow-400' : ''}
                           ${isLandscape ? 'h-full min-h-10 w-1/2' : 'w-full min-w-10 h-1/2'}`}
                            onClick={() => onBarClick(Player.Player1)}
                            aria-label="Player 1 Bar Area"
                            data-droptarget-type="bar" // Bar isn't a drop target in the same way
                            data-droptarget-id={Player.Player1}
                        >
                            <div className={`flex ${isLandscape ? 'flex-row items-center space-x-[-10px]' : 'flex-col items-center space-y-[-10px]'}`}>
                                {boardState.bar[Player.Player1].slice(0, 3).map((checker, idx) => (
                                    <div key={checker.id}>
                                        <CheckerPiece
                                            player={checker.player}
                                            isDraggable={currentPlayer === Player.Player1 && idx === boardState.bar[Player.Player1].length - 1}
                                            onDragStart={(e) => { // Mouse
                                                e.dataTransfer.setData("text/plain", JSON.stringify({ type: 'bar_checker', sourceIndex: 'BAR_P1', checkerId: checker.id }));
                                                onCheckerDragStart(checker.player, 'BAR_P1', checker.id);
                                            }}
                                            onTouchStartDraggable={(e) => { // Touch
                                                e.preventDefault(); // Prevent scrolling
                                                e.stopPropagation();
                                                onTouchStartDraggable(checker.player, 'BAR_P1', checker.id)
                                            }}
                                            small={true}
                                        />
                                    </div>
                                ))}
                            </div>
                            {boardState.bar[Player.Player1].length > 0 && <span className="absolute bottom-0 right-1 text-[10px] font-bold">{boardState.bar[Player.Player1].length}</span>}
                        </div>
                        <div
                            className={`border-2 rounded flex items-center justify-center p-1 relative ${PLAYER_COLORS[Player.Player2].base} ${barP2Selected ? 'ring-2 ring-yellow-400' : ''}
                           ${isLandscape ? 'h-full min-h-10 w-1/2' : 'w-full min-w-10 h-1/2'}`}
                            onClick={() => onBarClick(Player.Player2)}
                            aria-label="Player 2 Bar Area"
                            data-droptarget-type="bar"
                            data-droptarget-id={Player.Player2}
                        >
                            <div className={`flex ${isLandscape ? 'flex-row items-center space-x-[-10px]' : 'flex-col items-center space-y-[-10px]'}`}>
                                {boardState.bar[Player.Player2].slice(0, 3).map((checker, idx) => (
                                    <div key={checker.id}>
                                        <CheckerPiece
                                            player={checker.player}
                                            isDraggable={currentPlayer === Player.Player2 && idx === boardState.bar[Player.Player2].length - 1}
                                            onDragStart={(e) => { // Mouse
                                                e.dataTransfer.setData("text/plain", JSON.stringify({ type: 'bar_checker', sourceIndex: 'BAR_P2', checkerId: checker.id }));
                                                onCheckerDragStart(checker.player, 'BAR_P2', checker.id);
                                            }}
                                            onTouchStartDraggable={(e) => { // Touch
                                                e.preventDefault(); // Prevent scrolling
                                                e.stopPropagation();
                                                onTouchStartDraggable(checker.player, 'BAR_P2', checker.id)
                                            }}
                                            small={true}
                                        />
                                    </div>
                                ))}
                            </div>
                            {boardState.bar[Player.Player2].length > 0 && <span className="absolute bottom-0 right-1 text-[10px] font-bold">{boardState.bar[Player.Player2].length}</span>}
                        </div>
                    </div>

                    <div
                        className={`border-2 rounded flex items-center p-1 overflow-hidden relative ${PLAYER_COLORS[Player.Player1].base} 
                        ${p1OffHighlight ? 'ring-2 ring-blue-500' : ''}
                        ${p1OffTouchHover && p1OffHighlight ? 'ring-offset-2 ring-purple-600' : ''}
                        ${offAreaSize} ${isLandscape ? 'order-3 flex-col justify-start' : 'order-3 flex-row justify-start'}`}
                        onClick={() => onBearOffClick(Player.Player1)}
                        onDrop={(e) => { e.stopPropagation(); onDropOnBearOff(Player.Player1) }}
                        onDragOver={generalDragOverHandler}
                        aria-label="Player 1 Off Area"
                        data-droptarget-type="off"
                        data-droptarget-id={Player.Player1}
                    >
                        <div className={`flex ${isLandscape ? 'flex-col-reverse items-center space-y-[-10px] md:space-y-[-12px]' : 'flex-row-reverse items-center space-x-[-10px] md:space-x-[-12px]'}`}>
                            {boardState.off[Player.Player1].slice(0, 5).map((checker) => <div key={checker.id}><CheckerPiece player={checker.player} small={true} /></div>)}
                        </div>
                        {boardState.off[Player.Player1].length > 0 && <span className="absolute top-0 right-1 text-[10px] font-bold">{boardState.off[Player.Player1].length}</span>}
                    </div>
                </div>

                <div className={`flex ${isLandscape ? 'flex-row space-x-1 sm:space-x-2' : 'flex-col space-y-1 sm:space-y-2'} justify-between`}>
                    {isLandscape ? renderPointQuadrant(landscapeP1Outer, 'P1_OUTER') : renderPointQuadrant(portraitP1Outer, 'P1_OUTER')}
                    {isLandscape ? renderPointQuadrant(landscapeP1Home, 'P1_HOME') : renderPointQuadrant(portraitP1Home, 'P1_HOME')}
                </div>
            </div>
        </div>
    );
};

export default Board;