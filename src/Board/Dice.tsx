import type { PointerEventHandler } from 'react';
import * as IMAGES from './images/dice';
import './Dice.css'
import { Color, UsedDie } from '../Types';
import { classes } from '../Utils';

type DiceProps = {
    onPointerUp: PointerEventHandler,
    values: [number?, number?],
    used: UsedDie[],
    color?: Color,
    disabled?: boolean,
    pulsate?: boolean,
}

export default function Dice({ onPointerUp, values = [6, 6], used = [], color, disabled, pulsate }: DiceProps) {
    let dice = values;
    
    const usedClone = [...used];
    
    return <div className={classes("dice", { pulsate })} onPointerUp={onPointerUp}>
        {dice.map((value, index) => {
            const diceColor = color || (index % 2 === 0 ? Color.Black : Color.White);
            const src = `${diceColor}${value}` as keyof typeof IMAGES;
            const usedIndex = usedClone.findIndex(usedItem => usedItem.value === value);
            const isUsed = ~usedIndex;
            
            if (isUsed)
                usedClone.splice(usedIndex, 1);
            
            return (
                <img 
                    key={index}
                    src={IMAGES[src]} 
                    className={classes({ used: isUsed || disabled })}
                    draggable="false"
                />
            );
        })}
    </div>
}