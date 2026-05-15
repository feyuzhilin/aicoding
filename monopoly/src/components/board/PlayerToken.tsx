import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../types/game';

interface PlayerTokenProps {
  player: Player;
  index: number; // 同一格子上的排列索引
}

/** 2x2 排列偏移量 */
const TOKEN_OFFSETS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 0, y: 10 },
  { x: 10, y: 10 },
];

const PlayerToken: React.FC<PlayerTokenProps> = ({ player, index }) => {
  const offset = TOKEN_OFFSETS[index % TOKEN_OFFSETS.length];

  return (
    <motion.div
      className="player-token"
      style={{
        backgroundColor: player.color,
        position: 'absolute',
        bottom: 2 + offset.y,
        left: 2 + offset.x,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25,
        delay: index * 0.05,
      }}
      title={player.name}
    >
      {player.avatar}
    </motion.div>
  );
};

export default PlayerToken;
