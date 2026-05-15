import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/useGameStore';
import { PLAYER_COLORS, PLAYER_AVATARS, GameConfig } from '../types/game';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const initGame = useGameStore((s) => s.initGame);
  
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(['玩家1', '玩家2', '玩家3', '玩家4']);
  
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };
  
  const handleStart = () => {
    const config: GameConfig = {
      playerCount,
      playerNames: playerNames.slice(0, playerCount),
      playerColors: PLAYER_COLORS.slice(0, playerCount),
    };
    initGame(config);
    navigate('/game');
  };
  
  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1 className="home-title">
            <span className="title-icon">🎲</span>
            大富翁
            <span className="title-sub">MONOPOLY</span>
          </h1>
          <p className="home-subtitle">经典桌游 · 网页版</p>
        </header>
        
        <main className="home-main">
          <section className="setup-section">
            <h2 className="section-title">游戏设置</h2>
            
            <div className="player-count-selector">
              <label>玩家人数</label>
              <div className="count-buttons">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    className={`count-btn ${playerCount === count ? 'active' : ''}`}
                    onClick={() => setPlayerCount(count)}
                  >
                    {count} 人
                  </button>
                ))}
              </div>
            </div>
            
            <div className="player-names">
              <label>玩家名称</label>
              <div className="names-grid">
                {Array.from({ length: playerCount }).map((_, index) => (
                  <div key={index} className="player-name-input">
                    <span 
                      className="player-avatar"
                      style={{ backgroundColor: PLAYER_COLORS[index] }}
                    >
                      {PLAYER_AVATARS[index]}
                    </span>
                    <input
                      type="text"
                      value={playerNames[index]}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`玩家${index + 1}`}
                      maxLength={8}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          <section className="rules-section">
            <h2 className="section-title">游戏规则</h2>
            <ul className="rules-list">
              <li>🎯 每位玩家初始资金 <strong>¥1500</strong></li>
              <li>🎲 每回合掷两颗骰子，按点数移动</li>
              <li>🏠 到达无主地产可购买，到达他人地产需付租金</li>
              <li>🏗️ 拥有完整颜色组后可建造房屋，租金翻倍</li>
              <li>🔒 连续掷出3次双数将入狱</li>
              <li>💸 资金不足时需出售资产或宣告破产</li>
              <li>🏆 最后一位未破产的玩家获胜</li>
            </ul>
          </section>
        </main>
        
        <footer className="home-footer">
          <button className="start-button" onClick={handleStart}>
            <span className="btn-icon">🚀</span>
            开始游戏
          </button>
          <p className="tech-note">
            React + TypeScript + Zustand + Framer Motion
          </p>
        </footer>
      </div>
    </div>
  );
}
