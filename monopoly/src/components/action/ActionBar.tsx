import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { GamePhase, PlayerStatus, JAIL_FEE } from '../../types/game';
import { PROPERTIES } from '../../data/properties';
import './ActionBar.css';

/** 按钮动画配置 */
const buttonVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

/** 操作栏 - 根据游戏阶段显示不同操作按钮 */
const ActionBar: React.FC = () => {
  const phase = useGameStore((s) => s.gameState.phase);
  const currentPlayer = useGameStore((s) => s.getCurrentPlayer());
  const pendingCellAction = useGameStore((s) => s.gameState.pendingCellAction);
  const diceRolling = useUIStore((s) => s.diceRolling);
  const isMoving = useUIStore((s) => s.isMoving);

  const rollDice = useGameStore((s) => s.rollDice);
  const endTurn = useGameStore((s) => s.endTurn);
  const buyProperty = useGameStore((s) => s.buyProperty);
  const skipBuyProperty = useGameStore((s) => s.skipBuyProperty);
  const payRent = useGameStore((s) => s.payRent);
  const payTax = useGameStore((s) => s.payTax);
  const handleCellAction = useGameStore((s) => s.handleCellAction);
  const handleCardEffect = useGameStore((s) => s.handleCardEffect);
  const handlePostRoll = useGameStore((s) => s.handlePostRoll);
  const payJailFee = useGameStore((s) => s.payJailFee);
  const useJailCard = useGameStore((s) => s.useJailCard);

  const isDisabled = diceRolling || isMoving;

  // 获取待购买地产的价格
  const buyPropertyPrice = React.useMemo(() => {
    if (pendingCellAction?.type === 'buy' && pendingCellAction.propertyId) {
      const prop = PROPERTIES.find((p) => p.id === pendingCellAction.propertyId);
      return prop?.price ?? 0;
    }
    return 0;
  }, [pendingCellAction]);

  // 获取待支付租金金额
  const rentAmount = pendingCellAction?.type === 'rent' ? (pendingCellAction.amount ?? 0) : 0;

  // 获取待支付税收金额
  const taxAmount = pendingCellAction?.type === 'tax' ? (pendingCellAction.amount ?? 0) : 0;

  // 获取卡片描述
  const cardDescription = pendingCellAction?.type === 'card' && pendingCellAction.card
    ? pendingCellAction.card.description
    : '';

  const isInJail = currentPlayer?.status === PlayerStatus.IN_JAIL;
  const hasJailCard = (currentPlayer?.jailFreeCards ?? 0) > 0;
  const canPayJailFee = (currentPlayer?.money ?? 0) >= JAIL_FEE;

  /** 渲染等待掷骰阶段按钮 */
  const renderWaitingRoll = () => {
    if (isInJail) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="jail-actions"
            className="action-bar__buttons"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <button
              className="action-bar__btn action-bar__btn--primary"
              onClick={rollDice}
              disabled={isDisabled}
            >
              掷骰出狱
            </button>
            <button
              className="action-bar__btn action-bar__btn--secondary"
              onClick={payJailFee}
              disabled={isDisabled || !canPayJailFee}
            >
              支付¥{JAIL_FEE}出狱
            </button>
            <button
              className="action-bar__btn action-bar__btn--secondary"
              onClick={useJailCard}
              disabled={isDisabled || !hasJailCard}
            >
              使用出狱卡
            </button>
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="roll-action"
          className="action-bar__buttons"
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <button
            className="action-bar__btn action-bar__btn--primary action-bar__btn--large"
            onClick={rollDice}
            disabled={isDisabled}
          >
            掷骰子
          </button>
        </motion.div>
      </AnimatePresence>
    );
  };

  /** 渲染移动中状态 */
  const renderMoving = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="moving"
        className="action-bar__buttons"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        <div className="action-bar__status">
          {phase === GamePhase.ROLLING ? '掷骰中...' : '移动中...'}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  /** 渲染格子事件按钮 */
  const renderCellAction = () => {
    if (!pendingCellAction) {
      // 无需处理的事件，自动进入 POST_ACTION
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="auto-continue"
            className="action-bar__buttons"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <button
              className="action-bar__btn action-bar__btn--primary"
              onClick={handleCellAction}
              disabled={isDisabled}
            >
              确认
            </button>
          </motion.div>
        </AnimatePresence>
      );
    }

    switch (pendingCellAction.type) {
      case 'buy':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="buy-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                className="action-bar__btn action-bar__btn--primary"
                onClick={buyProperty}
                disabled={isDisabled || (currentPlayer?.money ?? 0) < buyPropertyPrice}
              >
                购买地产 ¥{buyPropertyPrice}
              </button>
              <button
                className="action-bar__btn action-bar__btn--secondary"
                onClick={skipBuyProperty}
                disabled={isDisabled}
              >
                跳过
              </button>
            </motion.div>
          </AnimatePresence>
        );

      case 'rent':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="rent-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="action-bar__status action-bar__status--warning">
                需支付租金 ¥{rentAmount}
              </div>
              <button
                className="action-bar__btn action-bar__btn--danger"
                onClick={payRent}
                disabled={isDisabled}
              >
                支付租金 ¥{rentAmount}
              </button>
            </motion.div>
          </AnimatePresence>
        );

      case 'tax':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="tax-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="action-bar__status action-bar__status--warning">
                需支付税收 ¥{taxAmount}
              </div>
              <button
                className="action-bar__btn action-bar__btn--danger"
                onClick={payTax}
                disabled={isDisabled}
              >
                支付税收 ¥{taxAmount}
              </button>
            </motion.div>
          </AnimatePresence>
        );

      case 'card':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="card-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="action-bar__status action-bar__status--info">
                {cardDescription}
              </div>
              <button
                className="action-bar__btn action-bar__btn--primary"
                onClick={handleCardEffect}
                disabled={isDisabled}
              >
                确认
              </button>
            </motion.div>
          </AnimatePresence>
        );

      case 'go_to_jail':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="gotojail-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="action-bar__status action-bar__status--danger">
                被送入监狱！
              </div>
              <button
                className="action-bar__btn action-bar__btn--danger"
                onClick={handleCellAction}
                disabled={isDisabled}
              >
                确认
              </button>
            </motion.div>
          </AnimatePresence>
        );

      case 'go':
      case 'jail':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="go-action"
              className="action-bar__buttons"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                className="action-bar__btn action-bar__btn--primary"
                onClick={handleCellAction}
                disabled={isDisabled}
              >
                确认
              </button>
            </motion.div>
          </AnimatePresence>
        );

      default:
        return null;
    }
  };

  /** 渲染后操作阶段按钮 */
  const renderPostAction = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="post-action"
        className="action-bar__buttons"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        <button
          className="action-bar__btn action-bar__btn--primary"
          onClick={endTurn}
          disabled={isDisabled}
        >
          结束回合
        </button>
      </motion.div>
    </AnimatePresence>
  );

  /** 渲染游戏结束按钮 */
  const renderGameOver = () => {
    const winner = useGameStore.getState().getActivePlayers()[0];
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="game-over"
          className="action-bar__buttons"
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <div className="action-bar__status action-bar__status--success">
            {winner ? `${winner.name} 获胜！` : '游戏结束！'}
          </div>
          <button
            className="action-bar__btn action-bar__btn--primary action-bar__btn--large"
            onClick={() => window.location.reload()}
          >
            新游戏
          </button>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case GamePhase.SETUP:
        return (
          <div className="action-bar__status">等待游戏开始...</div>
        );
      case GamePhase.WAITING_ROLL:
        return renderWaitingRoll();
      case GamePhase.ROLLING:
        return renderMoving();
      case GamePhase.MOVING:
        return renderMoving();
      case GamePhase.CELL_ACTION:
        return renderCellAction();
      case GamePhase.POST_ACTION:
        return renderPostAction();
      case GamePhase.AUCTION:
        return (
          <div className="action-bar__status">拍卖进行中...</div>
        );
      case GamePhase.GAME_OVER:
        return renderGameOver();
      default:
        return null;
    }
  };

  return (
    <div className="action-bar">
      <div className="action-bar__title">操作</div>
      <div className="action-bar__content">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActionBar;
