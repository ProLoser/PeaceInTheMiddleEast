import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';
import './DiceBox3D.css';

export type DiceBox3DHandle = {
  roll: (values: number[]) => void;
};

// Pre-computed (v1, v2) Uint32 pairs that produce the desired d6 face value through
// dice-box's internal Zl.range: Math.floor(1e14 * (v1/2^32) * (v2/2^32)) % 6 + 1
const VALUE_SEED: Record<number, [number, number]> = {
  1: [2147483648, 0],
  2: [2147483648, 1],
  3: [2147483648, 17],
  4: [2147483648, 2],
  5: [2147483648, 3],
  6: [2147483648, 19],
};

const DiceBox3D = forwardRef<DiceBox3DHandle>(function DiceBox3D(_, ref) {
  const boxRef = useRef<InstanceType<typeof DiceBox> | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedGetRandomValues = useRef<typeof crypto.getRandomValues | null>(null);

  useEffect(() => {
    const box = new DiceBox('#dice-box-3d', {
      assetPath: `${import.meta.env.BASE_URL}assets/dice-box/`,
      // suspendSimulation skips physics so we can seed exact face values
      suspendSimulation: true,
      delay: 200,
      scale: 6,
    });

    box.init().then(() => {
      box.onRollComplete = () => {
        if (savedGetRandomValues.current) {
          crypto.getRandomValues = savedGetRandomValues.current;
          savedGetRandomValues.current = null;
        }
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          box.clear();
        }, 600);
      };
      boxRef.current = box;
    });

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    roll(values: number[]) {
      if (!boxRef.current) return;

      // Build a Uint32 queue: dice-box calls getRandomValues twice per die (Zl.range → Zl.value × 2)
      const uint32Queue: number[] = [];
      for (const v of values) {
        const [v1, v2] = VALUE_SEED[v] ?? VALUE_SEED[1];
        uint32Queue.push(v1, v2);
      }

      // Temporarily override crypto so dice-box's RNG produces our specific values
      savedGetRandomValues.current = crypto.getRandomValues.bind(crypto);
      const orig = savedGetRandomValues.current;
      crypto.getRandomValues = (<T extends ArrayBufferView | null>(buffer: T): T => {
        if (buffer instanceof Uint32Array && uint32Queue.length > 0) {
          buffer[0] = uint32Queue.shift()!;
          return buffer;
        }
        return orig(buffer as ArrayBufferView) as T;
      }) as typeof crypto.getRandomValues;

      setVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      boxRef.current.roll(`${values.length}d6`);
    },
  }));

  return (
    <div
      id="dice-box-3d"
      className={`dice-box-3d${visible ? ' visible' : ''}`}
    />
  );
});

export default DiceBox3D;
