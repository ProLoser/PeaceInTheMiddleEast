import { MouseEventHandler } from 'react';
import * as IMAGES from './images';

type DiceProps = {
    onClick: MouseEventHandler,
    values: [number?, number?]
}

export default function Dice({ onClick, values }: DiceProps) {
    return <div className="dice" onClick={onClick} style={{ cursor: 'pointer' }}>
        <img src={IMAGES[`black${values[0] || 6}`]} />
        <img src={IMAGES[`white${values[1] || 3}`]} />
    </div>
}