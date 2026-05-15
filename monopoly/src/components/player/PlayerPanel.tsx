import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { PlayerStatus, MAX_JAIL_TURNS } from '../../types/game';
import './PlayerPanel.css';

/** 玩家面板 - 显示所有玩家信息 */
const PlayerPanel: React.FC = () => {
  const players = useGameStore((s) => s.gameState.players);
  const currentPlayerId = useGameStore((s) => s.gameState.currentPlayerId);

  const getStatusText = (status: PlayerStatus, jailTurns: number): string => {
    switch (status) {
      case PlayerStatus.ACTIVE:
        return '活跃';
      case PlayerStatus.IN_JAIL:
        return `监狱 (${jailTurns}/${MAX_JAIL_TURNS})`;
      case PlayerStatus.BANKRUPT:
        return '破产';
      default:
        return '';
    }
  };

  const getStatusClass = (status: PlayerStatus): string => {
    switch (status) {
      case PlayerStatus.ACTIVE:
        return 'player-panel__status--active';
      case PlayerStatus.IN_JAIL:
        return 'player-panel__status--jail';
      case PlayerStatus.BANKRUPT:
        return 'player-panel__status--bankrupt';
      default:
        return '';
    }
  };

  return (
    <div className="player-panel">
      <div className="player-panel__title">玩家列表</div>
      <div className="player-panel__list">
        {players.map((player) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const isBankrupt = player.status === PlayerStatus.BANKRUPT;

          return (
            <div
              key={player.id}
              className={`player-panel__card ${
                isCurrentTurn ? 'player-panel__card--current' : ''
              } ${isBankrupt ? 'player-panel__card--bankrupt' : ''}`}
              style={
                isCurrentTurn
                  ? { '--player-color': player.color } as React.CSSProperties
                  : undefined
              }
            >
              {/* 颜色条 */}
              <div
                className="player-panel__color-bar"
                style={{ backgroundColor: player.color }}
              />

              <div className="player-panel__card-content">
                {/* 头像和名称 */}
                <div className="player-panel__header">
                  <span className="player-panel__avatar">{player.avatar}</span>
                  <span className="player-panel__name">{player.name}</span>
                  {isCurrentTurn && (
                    <span className="player-panel__turn-badge">当前</span>
                  )}
                </div>

                {/* 金额 */}
                <div className="player-panel__money">
                  <span
                    className={`player-panel__money-amount ${
                      player.money < 0
                        ? 'player-panel__money-amount--negative'
                        : ''
                    }`}
                  >
                    {player.money < 0 ? '-' : ''}¥{Math.abs(player.money).toLocaleString()}
                  </span>
                </div>

                {/* 信息行 */}
                <div className="player-panel__info">
                  <span className="player-panel__property-count">
                    地产: {player.properties.length}
                  </span>
                  {player.jailFreeCards > 0 && (
                    <span className="player-panel__jail-cards">
                      出狱卡: {player.jailFreeCards}
                    </span>
                  )}
                </div>

                {/* 状态 */}
                <div className="player-panel__status-row">
                  <span
                    className={`player-panel__status ${getStatusClass(
                      player.status
                    )}`}
                  >
                    {getStatusText(player.status, player.jailTurns)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerPanel;
