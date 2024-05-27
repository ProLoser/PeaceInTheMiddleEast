import type { MouseEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'

type DiceProps = {
    onClick: MouseEventHandler,
    values: [number?, number?]
}

export default function Dice({ onClick, values }: DiceProps) {
    return <div className="dice" onClick={onClick}>
        <img src={IMAGES[`black${values[0] || 6}`]} />
        <img src={IMAGES[`white${values[1] || 6}`]} />
    </div>
}