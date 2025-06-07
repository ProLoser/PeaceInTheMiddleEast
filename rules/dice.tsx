import React from 'react';
import { Player, GamePhase } from './types';
import { PLAYER_COLORS } from './constants';

interface DiceControlsProps {
    dice: number[] | null;
    availableDice: number[];
    currentPlayer: Player;
    gamePhase: GamePhase;
    onRollDice: () => void;
    showEndTurnButton?: boolean;
    onEndTurnClick?: () => void;
    autoRollEnabled: boolean; // New prop
    onToggleAutoRoll: () => void; // New prop
}

const DieFace: React.FC<{ value: number, used: boolean, playerColorClass: string }> = ({ value, used, playerColorClass }) => {
    const dots = React.useMemo(() => {
        const dotPositions: { [key: number]: string[] } = {
            1: ['center'],
            2: ['top-left', 'bottom-right'],
            3: ['top-left', 'center', 'bottom-right'],
            4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
            6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
        };
        const pipColorClass = playerColorClass.includes('slate-100') ? 'bg-slate-800' : 'bg-red-100';

        const baseClasses = `absolute w-1.5 h-1.5 sm:w-2 sm:h-2 ${pipColorClass} rounded-full`;
        return (dotPositions[value] || []).map(pos => {
            let classes = baseClasses;
            if (pos === 'center') classes += ' top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            if (pos === 'top-left') classes += ' top-1 left-1 sm:top-1.5 sm:left-1.5';
            if (pos === 'top-right') classes += ' top-1 right-1 sm:top-1.5 sm:right-1.5';
            if (pos === 'bottom-left') classes += ' bottom-1 left-1 sm:bottom-1.5 sm:left-1.5';
            if (pos === 'bottom-right') classes += ' bottom-1 right-1 sm:bottom-1.5 sm:right-1.5';
            if (pos === 'mid-left') classes += ' top-1/2 left-1 sm:left-1.5 -translate-y-1/2';
            if (pos === 'mid-right') classes += ' top-1/2 right-1 sm:right-1.5 -translate-y-1/2';
            return <div key={pos} className={classes}></div>;
        });
    }, [value, playerColorClass]);

    return (
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${playerColorClass} border border-gray-300 rounded shadow-md flex items-center justify-center relative ${used ? 'opacity-50' : ''}`}>
            {dots}
        </div>
    );
};

const DiceControls: React.FC<DiceControlsProps> = ({
    dice,
    availableDice,
    currentPlayer,
    gamePhase,
    onRollDice,
    showEndTurnButton,
    onEndTurnClick,
    autoRollEnabled,
    onToggleAutoRoll
}) => {
    const playerColor = PLAYER_COLORS[currentPlayer];

    const availableDiceMap = availableDice.reduce((acc, d) => {
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const diceToDisplay = dice || [];
    const displayedDiceStatus = diceToDisplay.map((dVal, index) => {
        if (availableDiceMap[dVal] && availableDiceMap[dVal] > 0) {
            availableDiceMap[dVal]--;
            return { value: dVal, used: false, id: `die-${index}-${dVal}-avail` };
        }
        return { value: dVal, used: true, id: `die-${index}-${dVal}-used` };
    });


    return (
        <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-gray-900 bg-opacity-80 backdrop-blur-sm z-30 shadow-md flex flex-wrap justify-between items-center text-white gap-2 sm:gap-3">
            <div className="flex items-center space-x-2 shrink-0 order-1">
                <h3 className={`text-sm sm:text-base font-semibold ${playerColor.text}`}>
                    {currentPlayer}'s Turn <span className="hidden sm:inline">({gamePhase})</span>
                </h3>
                <div className="flex items-center space-x-1">
                    <input
                        type="checkbox"
                        id="autoRollToggle"
                        checked={autoRollEnabled}
                        onChange={onToggleAutoRoll}
                        className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-amber-500 bg-gray-700 border-gray-500 rounded focus:ring-amber-400 cursor-pointer"
                    />
                    <label htmlFor="autoRollToggle" className="text-xs sm:text-sm text-gray-300 cursor-pointer">Auto Roll</label>
                </div>
            </div>

            <div className="flex space-x-1 sm:space-x-2 order-3 sm:order-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                {gamePhase === GamePhase.Moving && displayedDiceStatus.length > 0 &&
                    displayedDiceStatus.map(d => <DieFace key={d.id} value={d.value} used={d.used} playerColorClass={playerColor.base} />)
                }
                {gamePhase !== GamePhase.Moving && dice === null && <p className="text-xs sm:text-sm text-gray-400">Roll the dice</p>}
            </div>

            <div className="flex items-center space-x-2 order-2 sm:order-3">
                {gamePhase === GamePhase.Rolling && (
                    <button
                        onClick={onRollDice}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded font-semibold shadow hover:opacity-90 transition-opacity ${playerColor.base} ${playerColor.text} border ${playerColor.border}`}
                        aria-label="Roll Dice"
                        disabled={autoRollEnabled} // Disable if auto-roll will handle it
                    >
                        Roll Dice
                    </button>
                )}
                {showEndTurnButton && onEndTurnClick && (
                    <button
                        onClick={onEndTurnClick}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded font-semibold shadow hover:opacity-90 transition-opacity bg-gray-500 text-white border border-gray-400`}
                        aria-label="Pass turn, no moves available"
                    >
                        Pass Turn
                    </button>
                )}
            </div>
        </div>
    );
};

export default DiceControls;