import type { PointerEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'
import { Color } from '../Types';

type DiceProps = {
    onPointerUp: PointerEventHandler,
    values: [number?, number?],
    color?: Color,
    used: number[],
}

export default function Dice({ onPointerUp, values, color, used = [] }: DiceProps) {
    const left = `${color && color || Color.Black}${values[0] || 6}` as keyof typeof IMAGES
    const right = `${color && color || Color.White}${values[1] || 6}` as keyof typeof IMAGES
    // TODO: add class to used dice, may need to create array and map over it like if 3 of 4 6s are used
    return <div className="dice" onPointerUp={onPointerUp}>
        <img src={IMAGES[left]} />
        {color && values[0] === values[1] && <>
            <img src={IMAGES[left]} />
            <img src={IMAGES[right]} />
        </>}
        <img src={IMAGES[right]} />
    </div>
}