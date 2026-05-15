import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { PROPERTIES } from '../../data/properties';
import { PlayerStatus } from '../../types/game';
import './GameOverModal.css';

/** 计算玩家净资产（现金 + 地产价值） */
function calculateNetWorth(player: {
  money: number;
  properties: string[];
  status: string;
}): number {
  if (player.status === PlayerStatus.BANKRUPT) return 0;
  let total = player.money;
  for (const propId of player.properties) {
    const propDef = PROPERTIES.find((p) => p.id === propId);
    if (propDef) {
      total += propDef.price * 0.5; // 地产按半价估算
    }
  }
  return total;
}

const GameOverModal: React.FC = () => {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const players = useGameStore((s) => s.gameState.players);
  const navigate = useNavigate();

  const isOpen = activeModal === 'game_over';

  if (!isOpen) return null;

  // 按净资产排序
  const rankings = [...players]
    .map((p) => ({
      ...p,
      netWorth: calculateNetWorth(p),
    }))
    .sort((a, b) => b.netWorth - a.netWorth);

  const winner = rankings[0];

  const handleRestart = () => {
    closeModal();
    navigate('/');
  };

  const getRankClass = (index: number, player: typeof rankings[0]) => {
    if (player.status === PlayerStatus.BANKRUPT) {
      return 'game-over-modal__ranking-item--bankrupt';
    }
    if (index === 0) return 'game-over-modal__ranking-item--first';
    if (index === 1) return 'game-over-modal__ranking-item--second';
    if (index === 2) return 'game-over-modal__ranking-item--third';
    return '';
  };

  return (
    <Modal
      isOpen={isOpen}
      title="游戏结束"
      type="success"
    >
      <div className="game-over-modal">
        <div className="game-over-modal__celebration">&#127881;</div>
        <div className="game-over-modal__winner">获胜者</div>
        <div className="game-over-modal__winner-name">
          {winner ? `${winner.avatar} ${winner.name}` : '未知'}
        </div>

        <div className="game-over-modal__rankings">
          <div className="game-over-modal__rankings-title">最终排名</div>
          {rankings.map((player, index) => (
            <div
              key={player.id}
              className={`game-over-modal__ranking-item ${getRankClass(index, player)}`}
            >
              <div className="game-over-modal__rank">
                {player.status === PlayerStatus.BANKRUPT ? '-' : index + 1}
              </div>
              <div className="game-over-modal__player-info">
                <span className="game-over-modal__player-avatar">
                  {player.avatar}
                </span>
                <span className="game-over-modal__player-name">
                  {player.name}
                </span>
              </div>
              <div className="game-over-modal__player-assets">
                ¥{player.netWorth}
              </div>
            </div>
          ))}
        </div>

        <button className="game-over-modal__btn" onClick={handleRestart}>
          再来一局
        </button>
      </div>
    </Modal>
  );
};

export default GameOverModal;
