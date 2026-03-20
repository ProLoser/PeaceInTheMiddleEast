import { useLayoutEffect, useEffect, useCallback, useState, type RefObject } from 'react';
import { Color } from '../Types';
import type { MovePair } from '../Utils';
import blackImg from './images/piece-black-2.png';
import whiteImg from './images/piece-white-2.png';
import './MoveAnimation.css';

const IMAGES = { [Color.Black]: blackImg, [Color.White]: whiteImg };

const STEP_DURATION = 1.5;

type Segment = {
    fromX: number;
    fromY: number;
    dx: number;
    dy: number;
    color: Color;
    size: number;
    totalDuration: number;
    delay: string;
};

interface MoveAnimationProps {
    pairs: MovePair[];
    boardRef: RefObject<HTMLDivElement>;
}

export default function MoveAnimation({ pairs, boardRef }: MoveAnimationProps) {
    const [segments, setSegments] = useState<Segment[]>([]);

    const computeSegments = useCallback(() => {
        const board = boardRef.current;
        const activePairs = pairs.filter(p => p.to !== 'off');
        if (!board || activePairs.length === 0) {
            setSegments([]);
            return;
        }

        const boardRect = board.getBoundingClientRect();
        const boardStyle = getComputedStyle(board);
        const overlayLeft = boardRect.left + parseFloat(boardStyle.borderLeftWidth);
        const overlayTop = boardRect.top + parseFloat(boardStyle.borderTopWidth);

        const points = board.querySelectorAll<HTMLElement>('.point');
        const bars = board.querySelectorAll<HTMLElement>('.bar');

        const samplePiece = board.querySelector<HTMLElement>('.piece:not(.ghost):not(.moved) img');
        const pieceSize = samplePiece
            ? samplePiece.getBoundingClientRect().width
            : boardRect.width / 17;

        const totalDuration = STEP_DURATION * activePairs.length;
        const result: Segment[] = [];

        const fromCounts = new Map<number | 'bar', number>();
        const toCounts = new Map<number, number>();

        activePairs.forEach((pair, i) => {
            const fromKey = pair.from;
            const fromIdx = fromCounts.get(fromKey) ?? 0;
            fromCounts.set(fromKey, fromIdx + 1);

            let fromEl: HTMLElement | null = null;
            if (pair.from === 'bar') {
                const barIndex = pair.color === Color.White ? 0 : 1;
                const ghosts = bars[barIndex]?.querySelectorAll<HTMLElement>('.piece.ghost');
                fromEl = ghosts?.[fromIdx] ?? null;
            } else {
                const ghosts = points[pair.from]?.querySelectorAll<HTMLElement>('.piece.ghost');
                fromEl = ghosts?.[fromIdx] ?? null;
            }

            const toIdx = toCounts.get(pair.to as number) ?? 0;
            toCounts.set(pair.to as number, toIdx + 1);
            const movedEls = points[pair.to as number]?.querySelectorAll<HTMLElement>('.piece.moved');
            const ghostFallbackEls = points[pair.to as number]?.querySelectorAll<HTMLElement>('.piece.ghost');
            const toEl = movedEls?.[toIdx] ?? ghostFallbackEls?.[toIdx] ?? null;

            if (!fromEl || !toEl) return;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            result.push({
                fromX: fromRect.left - overlayLeft,
                fromY: fromRect.top - overlayTop,
                dx: toRect.left - fromRect.left,
                dy: toRect.top - fromRect.top,
                color: pair.color,
                size: pieceSize,
                totalDuration,
                delay: `${-(i * STEP_DURATION)}s`,
            });
        });

        setSegments(result);
    }, [pairs, boardRef]);

    useLayoutEffect(() => {
        computeSegments();
    }, [computeSegments]);

    useEffect(() => {
        const observer = new ResizeObserver(computeSegments);
        if (boardRef.current) observer.observe(boardRef.current);
        return () => observer.disconnect();
    }, [computeSegments, boardRef]);

    if (segments.length === 0) return null;

    return (
        <div className="move-animation-overlay">
            {segments.map((seg, i) => (
                <img
                    key={i}
                    className={`move-animation-piece ${seg.color}`}
                    src={IMAGES[seg.color]}
                    style={{
                        left: seg.fromX,
                        top: seg.fromY,
                        width: seg.size,
                        height: seg.size,
                        animationDuration: `${seg.totalDuration}s`,
                        animationDelay: seg.delay,
                        '--dx': `${seg.dx}px`,
                        '--dy': `${seg.dy}px`,
                    } as React.CSSProperties & { '--dx': string; '--dy': string }}
                />
            ))}
        </div>
    );
}
