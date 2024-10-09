import type { PointerEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'

type DiceProps = {
    onPointerUp: PointerEventHandler,
    values: [number?, number?],
    color?: 'black' | 'white'
}
type ImageKey = keyof typeof IMAGES

export default function Dice({ onPointerUp, values, color }: DiceProps) {
    const left: ImageKey = `${color && color || 'black'}${values[0] || 6}`
    const right: ImageKey = `${color && color || 'white'}${values[1] || 6}`
    return <div className="dice" onPointerUp={onPointerUp}>
        <img src={IMAGES[left]} />
        <img src={IMAGES[right]} />
    </div>
}