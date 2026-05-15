import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import './GameLog.css';

/** 最大显示日志条数 */
const MAX_LOG_ENTRIES = 20;

/** 格式化时间戳 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/** 游戏日志组件 - 显示最近的游戏事件 */
const GameLog: React.FC = () => {
  const log = useGameStore((s) => s.gameState.log);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 只显示最近 20 条日志
  const recentLog = log.slice(-MAX_LOG_ENTRIES);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  /** 渲染金钱变化 */
  const renderMoneyChange = (moneyChange?: number) => {
    if (moneyChange === undefined || moneyChange === 0) return null;

    const isPositive = moneyChange > 0;
    return (
      <span
        className={`game-log__money ${
          isPositive ? 'game-log__money--positive' : 'game-log__money--negative'
        }`}
      >
        {isPositive ? '+' : ''}¥{moneyChange.toLocaleString()}
      </span>
    );
  };

  return (
    <div className="game-log">
      <div className="game-log__title">游戏日志</div>
      <div className="game-log__list" ref={scrollRef}>
        {recentLog.length === 0 ? (
          <div className="game-log__empty">暂无日志</div>
        ) : (
          recentLog.map((entry) => (
            <div key={entry.id} className="game-log__entry">
              <span className="game-log__timestamp">
                {formatTime(entry.timestamp)}
              </span>
              {entry.playerName && (
                <span className="game-log__player">{entry.playerName}</span>
              )}
              <span className="game-log__action">{entry.action}</span>
              <span className="game-log__detail">{entry.detail}</span>
              {renderMoneyChange(entry.moneyChange)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameLog;
