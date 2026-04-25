import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';
import './DiceBox3D.css';

export type DiceBox3DHandle = {
  roll: (count: number) => Promise<number[]>;
};

const DiceBox3D = forwardRef<DiceBox3DHandle>(function DiceBox3D(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<InstanceType<typeof DiceBox> | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const box = new DiceBox('#dice-box-3d', {
      assetPath: `${import.meta.env.BASE_URL}assets/dice-box/`,
      gravity: 3,
      mass: 1,
      friction: 0.8,
      restitution: 0,
      angularDamping: 0.4,
      linearDamping: 0.4,
      spinForce: 6,
      throwForce: 5,
      startingHeight: 8,
      settleTimeout: 5000,
      offscreen: true,
      delay: 10,
      scale: 6,
    });

    box.init().then(() => {
      boxRef.current = box;
    });

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    roll(count: number): Promise<number[]> {
      const box = boxRef.current;
      if (!box) {
        return Promise.resolve(
          Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
        );
      }

      setVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      return new Promise((resolve) => {
        box.onRollComplete = (results) => {
          const values = results.map(r => r.value);
          hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            box.clear();
          }, 600);
          resolve(values);
        };
        box.roll(`${count}d6`);
      });
    },
  }));

  return (
    <div
      id="dice-box-3d"
      ref={containerRef}
      className={`dice-box-3d${visible ? ' visible' : ''}`}
    />
  );
});

export default DiceBox3D;
