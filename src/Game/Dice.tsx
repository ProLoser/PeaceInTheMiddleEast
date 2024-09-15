import type { MouseEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'

type DiceProps = {
    onClick: MouseEventHandler,
    values: [number?, number?]
}
type ImageKey = keyof typeof IMAGES

export default function Dice({ onClick, values }: DiceProps) {
    const left: ImageKey = `black${values[0] || 6}`
    const right: ImageKey = `white${values[1] || 6}`
    return <div className="dice" onClick={onClick}>
        <img src={IMAGES[left]} />
        <img src={IMAGES[right]} />
    </div>
}