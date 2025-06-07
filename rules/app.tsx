
import React, { useState, useEffect, useCallback } from 'react';
import { Player, GamePhase, BoardState, MoveDestination, Checker } from './types';
import { NUM_POINTS, NUM_CHECKERS_PER_PLAYER, getInitialBoardSetup, PLAYER_COLORS, OFF_INDEX_P1, OFF_INDEX_P2, BAR_INDEX_P1, BAR_INDEX_P2 } from './constants';
import Board from './board';
import DiceControls from './dice';
// import GameOverModal from './gameOverModal';

const playSound = (soundId: string) => {
    const soundElement = document.getElementById(soundId) as HTMLAudioElement;
    if (soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(error => console.warn(`Error playing sound ${soundId}:`, error));
    }
};

interface TouchDragState {
    active: boolean;
    sourceIndex: number | 'BAR_P1' | 'BAR_P2' | null;
    checkerId?: string; // For bar checkers
    currentHoverTarget: { type: 'point'; id: number } | { type: 'off'; id: Player } | null;
}

const initialTouchDragState: TouchDragState = {
    active: false,
    sourceIndex: null,
    checkerId: undefined,
    currentHoverTarget: null,
};

const App: React.FC = () => {
    const [boardState, setBoardState] = useState<BoardState>(initializeBoardState());
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Player1);
    const [dice, setDice] = useState<number[] | null>(null);
    const [availableDice, setAvailableDice] = useState<number[]>([]);
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Rolling);
    const [winner, setWinner] = useState<Player | null>(null);
    const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | 'BAR_P1' | 'BAR_P2' | null>(null);
    const [highlightedDestinations, setHighlightedDestinations] = useState<MoveDestination[]>([]);
    const [draggedItem, setDraggedItem] = useState<{ player: Player, sourceIndex: number | 'BAR_P1' | 'BAR_P2', checkerId?: string } | null>(null);
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    const [autoRollEnabled, setAutoRollEnabled] = useState<boolean>(false);
    const [autoRollTimeoutId, setAutoRollTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const [touchDragState, setTouchDragState] = useState<TouchDragState>(initialTouchDragState);


    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function initializeBoardState(): BoardState {
        return {
            points: getInitialBoardSetup(),
            bar: { [Player.Player1]: [], [Player.Player2]: [] },
            off: { [Player.Player1]: [], [Player.Player2]: [] },
        };
    }

    const isPlayerInHomeBoard = useCallback((player: Player, currentBoardState: BoardState): boolean => {
        if (currentBoardState.bar[player].length > 0) return false;
        for (let i = 0; i < NUM_POINTS; i++) {
            const pointValue = currentBoardState.points[i];
            if (player === Player.Player1 && pointValue > 0 && i < 18) return false; // P1 home is 18-23
            if (player === Player.Player2 && pointValue < 0 && i > 5) return false;  // P2 home is 0-5
        }
        return true;
    }, []);

    const calculatePossibleMovesFromSource = useCallback((
        sourceIdx: number | 'BAR_P1' | 'BAR_P2',
        player: Player,
        currentDice: number[],
        currentBoard: BoardState
    ): MoveDestination[] => {
        const destinations: MoveDestination[] = [];
        if (currentDice.length === 0) return destinations;

        const isBarMove = sourceIdx === 'BAR_P1' || sourceIdx === 'BAR_P2';

        function findPaths(
            currentLocationIndex: number,
            pathDice: number[],
            remainingDiceForPath: number[],
        ) {
            if (pathDice.length > 0) {
                const existingDest = destinations.find(d => d.toIndex === currentLocationIndex);
                if (existingDest) {
                    if (pathDice.length < existingDest.diceValuesUsed.length) {
                        existingDest.diceValuesUsed = [...pathDice];
                    }
                } else {
                    destinations.push({ toIndex: currentLocationIndex, diceValuesUsed: [...pathDice] });
                }
            }

            if (remainingDiceForPath.length === 0) return;

            for (let i = 0; i < remainingDiceForPath.length; i++) {
                const die = remainingDiceForPath[i];
                let nextLocationIndex: number;

                if (isBarMove && pathDice.length === 0) {
                    nextLocationIndex = getBarReEntryTargetIndex(die, player);
                } else {
                    nextLocationIndex = getTargetPointIndex(currentLocationIndex, die, player);
                }

                if (isValidTarget(nextLocationIndex, player, currentBoard)) {
                    const newRemainingDice = [...remainingDiceForPath.slice(0, i), ...remainingDiceForPath.slice(i + 1)];
                    findPaths(nextLocationIndex, [...pathDice, die], newRemainingDice);
                }
            }
        }

        const canBearOffCurrent = isPlayerInHomeBoard(player, currentBoard);

        if (canBearOffCurrent && !isBarMove && typeof sourceIdx === 'number') {
            currentDice.forEach(die => {
                let canUseDieForBearOff = false;
                if (player === Player.Player1) {
                    const target = sourceIdx + die;
                    if (target === OFF_INDEX_P1) canUseDieForBearOff = true;
                    else if (target > OFF_INDEX_P1) {
                        let isHighest = true;
                        for (let k = 18; k < sourceIdx; k++) {
                            if (currentBoard.points[k] > 0) { isHighest = false; break; }
                        }
                        if (isHighest) canUseDieForBearOff = true;
                    }
                } else {
                    const target = sourceIdx - die;
                    if (target === OFF_INDEX_P2) canUseDieForBearOff = true;
                    else if (target < OFF_INDEX_P2) {
                        let isHighest = true;
                        for (let k = 5; k > sourceIdx; k--) {
                            if (currentBoard.points[k] < 0) { isHighest = false; break; }
                        }
                        if (isHighest) canUseDieForBearOff = true;
                    }
                }
                if (canUseDieForBearOff) {
                    const existingBearOffForThisDie = destinations.find(d => d.toIndex === 'OFF' && d.diceValuesUsed.length === 1 && d.diceValuesUsed[0] === die);
                    if (!existingBearOffForThisDie) {
                        destinations.push({ toIndex: 'OFF', diceValuesUsed: [die] });
                    }
                }
            });
        }

        if (isBarMove) {
            currentDice.forEach(die => {
                const entryPointIndex = getBarReEntryTargetIndex(die, player);
                if (isValidTarget(entryPointIndex, player, currentBoard)) {
                    const existingEntry = destinations.find(d => d.toIndex === entryPointIndex && d.diceValuesUsed.length === 1 && d.diceValuesUsed[0] === die);
                    if (!existingEntry) {
                        destinations.push({ toIndex: entryPointIndex, diceValuesUsed: [die] });
                    }
                    // Create a copy of currentDice for the recursive call
                    const diceCopyAfterEntry = [...currentDice];
                    const idxOfDieUsedForEntry = diceCopyAfterEntry.indexOf(die);
                    if (idxOfDieUsedForEntry > -1) diceCopyAfterEntry.splice(idxOfDieUsedForEntry, 1);

                    findPaths(entryPointIndex, [die], diceCopyAfterEntry);
                }
            });
        } else if (typeof sourceIdx === 'number') {
            findPaths(sourceIdx, [], currentDice);
        }

        const uniqueDestinations: MoveDestination[] = [];
        destinations.forEach(dest => {
            const existing = uniqueDestinations.find(ud => ud.toIndex === dest.toIndex);
            if (!existing) {
                uniqueDestinations.push(dest);
            } else {
                if (dest.diceValuesUsed.length < existing.diceValuesUsed.length) {
                    existing.diceValuesUsed = dest.diceValuesUsed;
                }
            }
        });

        return uniqueDestinations;
    }, [isPlayerInHomeBoard]);

    const switchPlayer = useCallback(() => {
        if (autoRollTimeoutId) {
            clearTimeout(autoRollTimeoutId);
            setAutoRollTimeoutId(null);
        }
        setCurrentPlayer(prev => prev === Player.Player1 ? Player.Player2 : Player.Player1);
        setGamePhase(GamePhase.Rolling);
        setDice(null);
        setAvailableDice([]);
        setSelectedSourceIndex(null);
        setHighlightedDestinations([]);
        setTouchDragState(initialTouchDragState);
    }, [autoRollTimeoutId]);

    const resetGame = useCallback(() => {
        if (autoRollTimeoutId) {
            clearTimeout(autoRollTimeoutId);
            setAutoRollTimeoutId(null);
        }
        setBoardState(initializeBoardState());
        setCurrentPlayer(Player.Player1);
        setDice(null);
        setAvailableDice([]);
        setGamePhase(GamePhase.Rolling);
        setWinner(null);
        setSelectedSourceIndex(null);
        setHighlightedDestinations([]);
        setDraggedItem(null);
        setTouchDragState(initialTouchDragState);
    }, [autoRollTimeoutId]);

    const getTargetPointIndex = (sourceIndex: number, die: number, player: Player): number => {
        if (player === Player.Player1) return sourceIndex + die;
        return sourceIndex - die;
    };

    const getBarReEntryTargetIndex = (die: number, player: Player): number => {
        if (player === Player.Player1) return die - 1;
        return NUM_POINTS - die;
    };

    const isValidTarget = (targetIndex: number, player: Player, currentBoardState: BoardState): boolean => {
        if (targetIndex < 0 || targetIndex >= NUM_POINTS) return false;
        const pointValue = currentBoardState.points[targetIndex];
        const numCheckersOnPoint = Math.abs(pointValue);
        const pointOwnerPlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);
        return numCheckersOnPoint <= 1 || pointOwnerPlayer === player;
    };

    const checkAnyMovePossible = useCallback((player: Player, diceToCheck: number[], currentBoard: BoardState): boolean => {
        if (diceToCheck.length === 0) return false;
        if (currentBoard.bar[player].length > 0) {
            const moves = calculatePossibleMovesFromSource(player === Player.Player1 ? 'BAR_P1' : 'BAR_P2', player, diceToCheck, currentBoard);
            return moves.length > 0;
        }
        for (let i = 0; i < NUM_POINTS; i++) {
            const pointValue = currentBoard.points[i];
            const pointPlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);
            if (pointPlayer === player) {
                const moves = calculatePossibleMovesFromSource(i, player, diceToCheck, currentBoard);
                if (moves.length > 0) return true;
            }
        }
        return false;
    }, [calculatePossibleMovesFromSource]);

    const handleRollDice = useCallback(() => {
        if (gamePhase !== GamePhase.Rolling || dice) return;
        playSound('diceRollSound');
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const rolled = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

        setDice(rolled);
        setAvailableDice(rolled);
        setGamePhase(GamePhase.Moving);
        setSelectedSourceIndex(null);
        setHighlightedDestinations([]);
        setTouchDragState(initialTouchDragState);


        if (boardState.bar[currentPlayer].length > 0) {
            const barSource = currentPlayer === Player.Player1 ? 'BAR_P1' : 'BAR_P2';
            setSelectedSourceIndex(barSource);
            const movesFromBar = calculatePossibleMovesFromSource(barSource, currentPlayer, rolled, boardState);
            setHighlightedDestinations(movesFromBar);
        } else if (isPlayerInHomeBoard(currentPlayer, boardState)) {
            let bearOffSourceSelected = false;
            const homeBoardRange = currentPlayer === Player.Player1 ? { start: 18, end: 23 } : { start: 0, end: 5 };

            const pointsToScan = currentPlayer === Player.Player1
                ? Array.from({ length: 6 }, (_, k) => homeBoardRange.end - k)
                : Array.from({ length: 6 }, (_, k) => homeBoardRange.start + k);

            for (const pointIdx of pointsToScan) {
                const pointValue = boardState.points[pointIdx];
                const pointPlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);

                if (pointPlayer === currentPlayer) {
                    const moves = calculatePossibleMovesFromSource(pointIdx, currentPlayer, rolled, boardState);
                    if (moves.some(move => move.toIndex === 'OFF')) {
                        setSelectedSourceIndex(pointIdx);
                        setHighlightedDestinations(moves);
                        bearOffSourceSelected = true;
                        break;
                    }
                }
            }
        }
    }, [gamePhase, dice, currentPlayer, boardState, calculatePossibleMovesFromSource, isPlayerInHomeBoard]);

    const handlePointBarOrBearOffClick = (index: number | 'BAR_P1' | 'BAR_P2' | 'OFF_P1' | 'OFF_P2') => {
        if (gamePhase !== GamePhase.Moving || availableDice.length === 0) return;

        let isPotentiallyNewSource = false;
        let newSourcePlayer: Player | null = null;
        let actualNewSourceIndex: number | 'BAR_P1' | 'BAR_P2' | null = null;


        if (index === 'BAR_P1' || index === 'BAR_P2') {
            actualNewSourceIndex = index;
            newSourcePlayer = index === 'BAR_P1' ? Player.Player1 : Player.Player2;
            if (newSourcePlayer === currentPlayer && boardState.bar[currentPlayer].length > 0) {
                isPotentiallyNewSource = true;
            }
        } else if (typeof index === 'number') {
            actualNewSourceIndex = index;
            const pointValue = boardState.points[index];
            newSourcePlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);
            if (newSourcePlayer === currentPlayer && boardState.bar[currentPlayer].length === 0) {
                isPotentiallyNewSource = true;
            }
        }

        if (selectedSourceIndex !== null) {
            const destInfo = highlightedDestinations.find(d =>
                (typeof index === 'number' && d.toIndex === index) ||
                ((index === 'OFF_P1' && currentPlayer === Player.Player1 && d.toIndex === 'OFF')) ||
                ((index === 'OFF_P2' && currentPlayer === Player.Player2 && d.toIndex === 'OFF'))
            );

            if (destInfo) {
                makeMove(selectedSourceIndex, destInfo.toIndex as (number | 'OFF'), destInfo.diceValuesUsed);
            } else {
                if (isPotentiallyNewSource && actualNewSourceIndex !== null) {
                    if (actualNewSourceIndex === selectedSourceIndex) {
                        setSelectedSourceIndex(null);
                        setHighlightedDestinations([]);
                    } else {
                        playSound('pickupSound');
                        setSelectedSourceIndex(actualNewSourceIndex);
                        const moves = calculatePossibleMovesFromSource(actualNewSourceIndex, currentPlayer, availableDice, boardState);
                        setHighlightedDestinations(moves);
                    }
                } else {
                    setSelectedSourceIndex(null);
                    setHighlightedDestinations([]);
                }
            }
        } else {
            if (isPotentiallyNewSource && actualNewSourceIndex !== null) {
                playSound('pickupSound');
                setSelectedSourceIndex(actualNewSourceIndex);
                const moves = calculatePossibleMovesFromSource(actualNewSourceIndex, currentPlayer, availableDice, boardState);
                setHighlightedDestinations(moves);
            } else {
                setSelectedSourceIndex(null);
                setHighlightedDestinations([]);
            }
        }
        setTouchDragState(initialTouchDragState); // Reset touch state on any click action
    };

    const makeMove = (
        source: number | 'BAR_P1' | 'BAR_P2',
        destination: number | 'OFF',
        diceUsedValues: number[]
    ) => {
        playSound('placeSound');
        const newBoardState = JSON.parse(JSON.stringify(boardState)) as BoardState;
        const opponent = currentPlayer === Player.Player1 ? Player.Player2 : Player.Player1;

        // Update board for the current move
        if (source === 'BAR_P1') newBoardState.bar[Player.Player1].pop();
        else if (source === 'BAR_P2') newBoardState.bar[Player.Player2].pop();
        else {
            if (newBoardState.points[source as number] > 0) newBoardState.points[source as number]--;
            else if (newBoardState.points[source as number] < 0) newBoardState.points[source as number]++;
        }

        if (destination === 'OFF') {
            newBoardState.off[currentPlayer].push({
                id: `off_${currentPlayer}_${newBoardState.off[currentPlayer].length}_${Date.now()}`,
                player: currentPlayer
            });
        } else {
            const destIdx = destination as number;
            const currentValAtDest = newBoardState.points[destIdx];

            if ((currentPlayer === Player.Player1 && currentValAtDest === -1) ||
                (currentPlayer === Player.Player2 && currentValAtDest === 1)) {
                newBoardState.bar[opponent].push({
                    id: `hit_${opponent}_${newBoardState.bar[opponent].length}_${Date.now()}`,
                    player: opponent
                });
                newBoardState.points[destIdx] = (currentPlayer === Player.Player1) ? 1 : -1;
            } else {
                if (currentPlayer === Player.Player1) newBoardState.points[destIdx]++;
                else newBoardState.points[destIdx]--;
            }
        }
        setBoardState(newBoardState);

        // Update available dice
        let tempAvailableDice = [...availableDice];
        diceUsedValues.forEach(dieVal => {
            const indexToRemove = tempAvailableDice.indexOf(dieVal);
            if (indexToRemove > -1) tempAvailableDice.splice(indexToRemove, 1);
        });
        setAvailableDice(tempAvailableDice);

        // Reset interaction states for the completed action
        setDraggedItem(null);
        setTouchDragState(initialTouchDragState);

        // Check for game over
        if (newBoardState.off[currentPlayer].length === NUM_CHECKERS_PER_PLAYER) {
            setWinner(currentPlayer);
            setGamePhase(GamePhase.GameOver);
            setSelectedSourceIndex(null); // Clear selection on game over
            setHighlightedDestinations([]);
            return;
        }

        // Attempt to set up for the next part of the turn
        let nextSourceExplicitlySelected = false;
        if (tempAvailableDice.length > 0) { // Only if dice remain
            if (newBoardState.bar[currentPlayer].length > 0) {
                const barIndex = currentPlayer === Player.Player1 ? 'BAR_P1' : 'BAR_P2';
                const barMovesPossible = calculatePossibleMovesFromSource(barIndex, currentPlayer, tempAvailableDice, newBoardState);
                if (barMovesPossible.length > 0) {
                    setSelectedSourceIndex(barIndex);
                    setHighlightedDestinations(barMovesPossible);
                    nextSourceExplicitlySelected = true;
                }
            } else if (destination === 'OFF' && isPlayerInHomeBoard(currentPlayer, newBoardState)) {
                // Original move was a bear-off, try to find another
                const homeBoardRange = currentPlayer === Player.Player1 ? { start: 18, end: 23 } : { start: 0, end: 5 };
                const pointsToScan = currentPlayer === Player.Player1
                    ? Array.from({ length: 6 }, (_, k) => homeBoardRange.end - k) // P1: 23 down to 18
                    : Array.from({ length: 6 }, (_, k) => homeBoardRange.start + k); // P2: 0 up to 5

                for (const pointIdx of pointsToScan) {
                    const pointValue = newBoardState.points[pointIdx];
                    const pointPlayer = pointValue > 0 ? Player.Player1 : (pointValue < 0 ? Player.Player2 : null);
                    if (pointPlayer === currentPlayer) { // Check if current player has pieces on this point
                        const moves = calculatePossibleMovesFromSource(pointIdx, currentPlayer, tempAvailableDice, newBoardState);
                        if (moves.some(move => move.toIndex === 'OFF')) {
                            setSelectedSourceIndex(pointIdx);
                            setHighlightedDestinations(moves);
                            nextSourceExplicitlySelected = true;
                            break;
                        }
                    }
                }
            }
        }

        // If no next move was auto-selected (e.g., bar is clear, not a bear-off, or no valid follow-up moves found)
        // then clear the selection from the just-completed move.
        if (!nextSourceExplicitlySelected) {
            setSelectedSourceIndex(null);
            setHighlightedDestinations([]);
        }
        // The main useEffect for game phase changes handles actual turn switching if needed.
    };

    // For Mouse Drag & Drop
    const handleDragStart = (player: Player, sourceIdx: number | 'BAR_P1' | 'BAR_P2', checkerId?: string) => {
        if (gamePhase !== GamePhase.Moving || availableDice.length === 0) return;
        if (player !== currentPlayer) return;
        if (boardState.bar[currentPlayer].length > 0 && sourceIdx !== (currentPlayer === Player.Player1 ? 'BAR_P1' : 'BAR_P2')) return;

        playSound('pickupSound');
        setDraggedItem({ player, sourceIndex: sourceIdx, checkerId });
        setSelectedSourceIndex(sourceIdx);
        const moves = calculatePossibleMovesFromSource(sourceIdx, currentPlayer, availableDice, boardState);
        setHighlightedDestinations(moves);
    };

    const handleDropOnPoint = (pointIndex: number) => {
        if (!draggedItem) return;
        const destInfo = highlightedDestinations.find(d => d.toIndex === pointIndex);
        if (destInfo && selectedSourceIndex === draggedItem.sourceIndex) {
            makeMove(draggedItem.sourceIndex, destInfo.toIndex as number, destInfo.diceValuesUsed);
        } else {
            playSound('errorSound');
            // Clear selection if drop was invalid, so player has to reselect
            setSelectedSourceIndex(null);
            setHighlightedDestinations([]);
        }
        setDraggedItem(null); // Always clear dragged item after drop attempt
    };

    const handleDropOnBearOff = (playerDroppingOn: Player) => {
        if (!draggedItem || playerDroppingOn !== currentPlayer) {
            if (draggedItem) playSound('errorSound'); // Play error only if a drag was in progress
            // Clear selection if drop was invalid
            setSelectedSourceIndex(null);
            setHighlightedDestinations([]);
            setDraggedItem(null); // Always clear dragged item
            return;
        }
        const destInfo = highlightedDestinations.find(d => d.toIndex === 'OFF');
        if (destInfo && selectedSourceIndex === draggedItem.sourceIndex) {
            makeMove(draggedItem.sourceIndex, 'OFF', destInfo.diceValuesUsed);
        } else {
            playSound('errorSound');
            // Clear selection if drop was invalid
            setSelectedSourceIndex(null);
            setHighlightedDestinations([]);
        }
        setDraggedItem(null); // Always clear dragged item
    };

    // For Touch Drag & Drop
    const handleTouchStartDraggable = (player: Player, sourceIdx: number | 'BAR_P1' | 'BAR_P2', checkerId?: string) => {
        if (gamePhase !== GamePhase.Moving || availableDice.length === 0 || player !== currentPlayer) return;
        if (boardState.bar[currentPlayer].length > 0 && sourceIdx !== (currentPlayer === Player.Player1 ? 'BAR_P1' : 'BAR_P2')) return;

        playSound('pickupSound');
        setSelectedSourceIndex(sourceIdx);
        const moves = calculatePossibleMovesFromSource(sourceIdx, currentPlayer, availableDice, boardState);
        setHighlightedDestinations(moves);
        setTouchDragState({
            active: true,
            sourceIndex: sourceIdx,
            checkerId: checkerId,
            currentHoverTarget: null,
        });
    };

    const handleGlobalTouchMove = useCallback((event: TouchEvent) => {
        if (!touchDragState.active || event.touches.length === 0) return;
        event.preventDefault(); // Prevent scrolling

        const touch = event.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        let validHoverTarget: TouchDragState['currentHoverTarget'] = null;

        if (targetElement) {
            const pointDiv = targetElement.closest('[data-droptarget-type="point"]');
            const offDivP1 = targetElement.closest('[data-droptarget-type="off"][data-droptarget-id="Player1"]');
            const offDivP2 = targetElement.closest('[data-droptarget-type="off"][data-droptarget-id="Player2"]');

            if (pointDiv) {
                const pointId = parseInt(pointDiv.getAttribute('data-droptarget-id') || '-1', 10);
                if (highlightedDestinations.some(d => d.toIndex === pointId)) {
                    validHoverTarget = { type: 'point', id: pointId };
                }
            } else if (offDivP1 && currentPlayer === Player.Player1) {
                if (highlightedDestinations.some(d => d.toIndex === 'OFF')) {
                    validHoverTarget = { type: 'off', id: Player.Player1 };
                }
            } else if (offDivP2 && currentPlayer === Player.Player2) {
                if (highlightedDestinations.some(d => d.toIndex === 'OFF')) {
                    validHoverTarget = { type: 'off', id: Player.Player2 };
                }
            }
        }
        setTouchDragState(prev => ({ ...prev, currentHoverTarget: validHoverTarget }));
    }, [touchDragState.active, highlightedDestinations, currentPlayer]);

    const handleGlobalTouchEnd = useCallback((event: TouchEvent) => {
        if (!touchDragState.active) return;

        const { sourceIndex, currentHoverTarget } = touchDragState;

        if (sourceIndex !== null && currentHoverTarget) {
            const destInfo = highlightedDestinations.find(d =>
                (currentHoverTarget.type === 'point' && d.toIndex === currentHoverTarget.id) ||
                (currentHoverTarget.type === 'off' && d.toIndex === 'OFF' && currentHoverTarget.id === currentPlayer)
            );
            if (destInfo) {
                makeMove(sourceIndex, destInfo.toIndex as (number | 'OFF'), destInfo.diceValuesUsed);
            } else {
                playSound('errorSound');
                // Clear selection if drop was invalid
                setSelectedSourceIndex(null);
                setHighlightedDestinations([]);
            }
        } else if (sourceIndex !== null) { // Drag started but no valid target, or target was invalid
            playSound('errorSound');
            // Clear selection if drop was invalid
            setSelectedSourceIndex(null);
            setHighlightedDestinations([]);
        }
        // Always reset touch drag state
        setTouchDragState(initialTouchDragState);
    }, [touchDragState, highlightedDestinations, currentPlayer, makeMove]);

    useEffect(() => {
        if (touchDragState.active) {
            document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
            document.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: false });
            return () => {
                document.removeEventListener('touchmove', handleGlobalTouchMove);
                document.removeEventListener('touchend', handleGlobalTouchEnd);
                document.removeEventListener('touchcancel', handleGlobalTouchEnd);
            };
        }
    }, [touchDragState.active, handleGlobalTouchMove, handleGlobalTouchEnd]);

    useEffect(() => {
        if (autoRollEnabled && gamePhase === GamePhase.Rolling && !winner && !dice) {
            const timer = setTimeout(() => {
                // Check conditions again inside timeout in case state changed
                if (autoRollEnabled && gamePhase === GamePhase.Rolling && !winner && !dice) {
                    handleRollDice();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoRollEnabled, gamePhase, winner, dice, handleRollDice]);

    useEffect(() => {
        if (gamePhase !== GamePhase.Moving || winner) {
            if (autoRollTimeoutId) {
                clearTimeout(autoRollTimeoutId);
                setAutoRollTimeoutId(null);
            }
            return;
        }

        const anyMovesForCurrentPlayer = checkAnyMovePossible(currentPlayer, availableDice, boardState);

        if (availableDice.length === 0 || !anyMovesForCurrentPlayer) {
            if (autoRollEnabled) {
                if (!anyMovesForCurrentPlayer && availableDice.length > 0) { // Dice remain but no moves
                    if (autoRollTimeoutId) clearTimeout(autoRollTimeoutId);
                    const newTimeout = setTimeout(() => {
                        setDice(null); // Clear dice before switching player
                        switchPlayer();
                    }, 5000);
                    setAutoRollTimeoutId(newTimeout);
                } else { // Dice exhausted or no moves (and no dice to wait for)
                    if (autoRollTimeoutId) clearTimeout(autoRollTimeoutId); // Clear any pending 5s timeout
                    setDice(null); // Clear dice
                    setTimeout(() => switchPlayer(), 200); // Short delay for UI to settle
                }
            } else { // Auto-roll disabled
                // If dice are exhausted, or if dice remain but no moves, the turn should end or offer "Pass Turn"
                // The "Pass Turn" button visibility is handled by showActualEndTurnButton
                // If dice are exhausted, automatically switch player.
                if (availableDice.length === 0) {
                    setDice(null); // Clear dice
                    switchPlayer();
                }
            }
        } else { // Moves are possible with remaining dice
            if (autoRollTimeoutId) { // Player made a move, cancel any pending 5s auto-pass
                clearTimeout(autoRollTimeoutId);
                setAutoRollTimeoutId(null);
            }
        }
        // Cleanup function for the effect
        return () => {
            if (autoRollTimeoutId) {
                clearTimeout(autoRollTimeoutId);
            }
        };
    }, [
        gamePhase, availableDice, currentPlayer, boardState, winner, autoRollEnabled,
        checkAnyMovePossible, switchPlayer, autoRollTimeoutId
    ]);

    // Effect to clear selection if it becomes invalid (e.g., piece moved, player on bar)
    useEffect(() => {
        if (selectedSourceIndex !== null && gamePhase === GamePhase.Moving) {
            const isBarSource = selectedSourceIndex === 'BAR_P1' || selectedSourceIndex === 'BAR_P2';

            if (isBarSource) {
                const playerForBarSource = selectedSourceIndex === 'BAR_P1' ? Player.Player1 : Player.Player2;
                if (boardState.bar[playerForBarSource].length === 0 || playerForBarSource !== currentPlayer) {
                    setSelectedSourceIndex(null);
                    setHighlightedDestinations([]);
                }
            } else if (typeof selectedSourceIndex === 'number') {
                const pointVal = boardState.points[selectedSourceIndex];
                const pointPlayer = pointVal > 0 ? Player.Player1 : (pointVal < 0 ? Player.Player2 : null);
                // Clear selection if point is empty, belongs to opponent, or current player is on bar (and source isn't bar)
                if (pointPlayer !== currentPlayer || pointVal === 0 || boardState.bar[currentPlayer].length > 0) {
                    setSelectedSourceIndex(null);
                    setHighlightedDestinations([]);
                }
            }
        }
    }, [boardState, currentPlayer, selectedSourceIndex, gamePhase]);

    const handleForceEndTurn = useCallback(() => {
        setDice(null); // Clear dice as the turn is being passed
        switchPlayer();
    }, [switchPlayer]);

    const handleToggleAutoRoll = () => {
        setAutoRollEnabled(prev => {
            const newState = !prev;
            if (!newState && autoRollTimeoutId) { // If disabling auto-roll, clear any pending timeout
                clearTimeout(autoRollTimeoutId);
                setAutoRollTimeoutId(null);
            }
            return newState;
        });
    };

    const passTurnConditionMet = gamePhase === GamePhase.Moving &&
        availableDice.length > 0 &&
        !checkAnyMovePossible(currentPlayer, availableDice, boardState);
    const showActualEndTurnButton = passTurnConditionMet && !autoRollEnabled;


    return (
        <div className="h-full w-full flex flex-col p-2 sm:p-4 text-gray-100 bg-gray-700 overflow-hidden">
            <div className="flex-grow relative overflow-hidden min-h-0">
                <Board
                    boardState={boardState}
                    currentPlayer={currentPlayer}
                    selectedSourceIndex={selectedSourceIndex}
                    highlightedDestinations={highlightedDestinations}
                    onPointClick={(idx) => handlePointBarOrBearOffClick(idx)}
                    onBarClick={(player) => handlePointBarOrBearOffClick(player === Player.Player1 ? 'BAR_P1' : 'BAR_P2')}
                    onBearOffClick={(player) => handlePointBarOrBearOffClick(player === Player.Player1 ? 'OFF_P1' : 'OFF_P2')}
                    onDropOnPoint={handleDropOnPoint}
                    onDropOnBearOff={handleDropOnBearOff}
                    onCheckerDragStart={handleDragStart}
                    onTouchStartDraggable={handleTouchStartDraggable}
                    touchDragHoverTarget={touchDragState.currentHoverTarget}
                    isLandscape={isLandscape}
                />
            </div>

            <DiceControls
                dice={dice}
                availableDice={availableDice}
                currentPlayer={currentPlayer}
                gamePhase={gamePhase}
                onRollDice={handleRollDice}
                showEndTurnButton={showActualEndTurnButton}
                onEndTurnClick={handleForceEndTurn}
                autoRollEnabled={autoRollEnabled}
                onToggleAutoRoll={handleToggleAutoRoll}
            />

            {/* {winner && <GameOverModal winner={winner} onResetGame={resetGame} />} */}

            <div className={`shrink-0 mt-1 text-center text-xs text-gray-400 ${isLandscape ? 'hidden sm:block' : ''}`}>
                Player 1 ({PLAYER_COLORS[Player.Player1].base.match(/bg-(\w+)-(\d+)/)?.[1] || 'White'}): Moves low index to high (0 &rarr; 23), Home: 18-23.
                <br className="sm:hidden" />
                Player 2 ({PLAYER_COLORS[Player.Player2].base.match(/bg-(\w+)-(\d+)/)?.[1] || 'Red'}): Moves high index to low (23 &rarr; 0), Home: 0-5.
            </div>
        </div>
    );
};

export default App;
