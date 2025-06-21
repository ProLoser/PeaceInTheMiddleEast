import type { PointerEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'
import { Color } from '../Types';

type DiceProps = {
    onPointerUp: PointerEventHandler,
    values: [number?, number?],
    used: number[],
    color?: Color,
}

export default function Dice({ onPointerUp, values = [6, 6], used = [], color }: DiceProps) {
    let dice = [values[0]!, values[1]!];
    
    if (color && values[0] === values[1])
        dice.push(values[0]!, values[1]!);
    
    const usedClone = [...used];
    
    return <div className="dice" onPointerUp={onPointerUp}>
        {dice.map((value, index) => {
            const diceColor = color || (index % 2 === 0 ? Color.Black : Color.White);
            const src = `${diceColor}${value}` as keyof typeof IMAGES;
            const usedIndex = usedClone.indexOf(value);
            const isUsed = ~usedIndex;
            
            if (isUsed)
                usedClone.splice(usedIndex, 1);
            
            return (
                <img 
                    key={index}
                    src={IMAGES[src]} 
                    className={isUsed ? 'used' : ''} 
                />
            );
        })}
    </div>
}