import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DiceDisplayProps {
  diceValues: [number, number];
  rolling: boolean;
}

/** 骰子点数位置定义（基于 50x50 的 SVG） */
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[25, 25]],
  2: [
    [14, 14],
    [36, 36],
  ],
  3: [
    [14, 14],
    [25, 25],
    [36, 36],
  ],
  4: [
    [14, 14],
    [36, 14],
    [14, 36],
    [36, 36],
  ],
  5: [
    [14, 14],
    [36, 14],
    [25, 25],
    [14, 36],
    [36, 36],
  ],
  6: [
    [14, 14],
    [36, 14],
    [14, 25],
    [36, 25],
    [14, 36],
    [36, 36],
  ],
};

const DiceFace: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  const dots = useMemo(() => DOT_POSITIONS[value] || DOT_POSITIONS[1], [value]);

  return (
    <motion.div
      className={`dice ${rolling ? 'dice--rolling' : ''}`}
      animate={
        rolling
          ? {
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.1, 1, 1.1, 1],
            }
          : { rotate: 0, scale: 1 }
      }
      transition={
        rolling
          ? {
              duration: 0.5,
              repeat: 2,
              ease: 'linear',
            }
          : {
              duration: 0.3,
              ease: 'easeOut',
            }
      }
    >
      <svg width="50" height="50" viewBox="0 0 50 50">
        {dots.map(([cx, cy], i) => (
          <circle key={i} className="dice__dot" cx={cx} cy={cy} r="4" />
        ))}
      </svg>
    </motion.div>
  );
};

const DiceDisplay: React.FC<DiceDisplayProps> = ({ diceValues, rolling }) => {
  const showDice = diceValues[0] > 0 || diceValues[1] > 0;

  if (!showDice && !rolling) {
    return null;
  }

  return (
    <div className="dice-display">
      <DiceFace value={rolling ? Math.ceil(Math.random() * 6) : diceValues[0]} rolling={rolling} />
      <DiceFace value={rolling ? Math.ceil(Math.random() * 6) : diceValues[1]} rolling={rolling} />
    </div>
  );
};

export default DiceDisplay;
