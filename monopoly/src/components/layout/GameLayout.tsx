import React from 'react';
import Board from '../board/Board';
import PlayerPanel from '../player/PlayerPanel';
import ActionBar from '../action/ActionBar';
import GameLog from '../common/GameLog';
import Toast from '../common/Toast';
import './GameLayout.css';

/** 游戏主布局组件 - 三栏布局 */
const GameLayout: React.FC = () => {
  return (
    <div className="game-layout">
      {/* 左侧：棋盘 */}
      <div className="game-layout__board">
        <Board />
      </div>

      {/* 右侧：面板区域 */}
      <div className="game-layout__sidebar">
        {/* 玩家面板 */}
        <div className="game-layout__panel">
          <PlayerPanel />
        </div>

        {/* 操作栏 */}
        <div className="game-layout__panel">
          <ActionBar />
        </div>

        {/* 游戏日志 */}
        <div className="game-layout__panel game-layout__panel--grow">
          <GameLog />
        </div>
      </div>

      {/* Toast 消息 */}
      <Toast />
    </div>
  );
};

export default GameLayout;
