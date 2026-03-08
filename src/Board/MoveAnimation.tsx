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
        const points = board.querySelectorAll<HTMLElement>('.point');
        const bars = board.querySelectorAll<HTMLElement>('.bar');

        const samplePiece = board.querySelector<HTMLElement>('.piece:not(.ghost) img');
        const pieceSize = samplePiece
            ? samplePiece.getBoundingClientRect().width
            : boardRect.width / 17;

        const isLandscape = boardRect.width >= boardRect.height;

        const getPiecePos = (rect: DOMRect, pointIndex: number | 'bar') => {
            if (pointIndex === 'bar') {
                return {
                    x: rect.left - boardRect.left + (rect.width - pieceSize) / 2,
                    y: rect.top - boardRect.top + (rect.height - pieceSize) / 2,
                };
            }
            const isTopHalf = pointIndex < 12;
            if (isLandscape) {
                return {
                    x: rect.left - boardRect.left + (rect.width - pieceSize) / 2,
                    y: isTopHalf
                        ? rect.top - boardRect.top - pieceSize / 2
                        : rect.bottom - boardRect.top - pieceSize / 2,
                };
            }
            // portrait (writing-mode: tb): "column" stacks left, "column-reverse" stacks right
            return {
                x: isTopHalf
                    ? rect.left - boardRect.left - pieceSize / 2
                    : rect.right - boardRect.left - pieceSize / 2,
                y: rect.top - boardRect.top + (rect.height - pieceSize) / 2,
            };
        };

        const totalDuration = STEP_DURATION * activePairs.length;
        const result: Segment[] = [];

        activePairs.forEach((pair, i) => {
            let fromRect: DOMRect | null = null;
            let toRect: DOMRect | null = null;

            if (pair.from === 'bar') {
                const barIndex = pair.color === Color.White ? 0 : 1;
                fromRect = bars[barIndex]?.getBoundingClientRect() ?? null;
            } else {
                fromRect = points[pair.from]?.getBoundingClientRect() ?? null;
            }

            toRect = points[pair.to as number]?.getBoundingClientRect() ?? null;

            if (!fromRect || !toRect) return;

            const fromPos = getPiecePos(fromRect, pair.from);
            const toPos = getPiecePos(toRect, pair.to as number);

            result.push({
                fromX: fromPos.x,
                fromY: fromPos.y,
                dx: toPos.x - fromPos.x,
                dy: toPos.y - fromPos.y,
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
