import React from 'react';
import Modal from './Modal';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { CardEffectType } from '../../types/game';
import type { CardDef } from '../../types/game';
import './CardModal.css';

/** 获取卡片效果的展示信息 */
function getCardEffectInfo(card: CardDef): {
  text: string;
  className: string;
} {
  switch (card.effectType) {
    case CardEffectType.GAIN_MONEY:
      return {
        text: `+¥${card.effectValue}`,
        className: 'card-modal__effect--gain',
      };
    case CardEffectType.LOSE_MONEY:
      return {
        text: `-¥${card.effectValue}`,
        className: 'card-modal__effect--lose',
      };
    case CardEffectType.MOVE_TO:
      return {
        text: '移动到指定位置',
        className: 'card-modal__effect--move',
      };
    case CardEffectType.MOVE_TO_NEAREST:
      return {
        text: '移动到最近位置',
        className: 'card-modal__effect--move',
      };
    case CardEffectType.GO_TO_JAIL:
      return {
        text: '直接入狱！',
        className: 'card-modal__effect--jail',
      };
    case CardEffectType.GET_OUT_OF_JAIL:
      return {
        text: '获得出狱免费卡！',
        className: 'card-modal__effect--other',
      };
    case CardEffectType.GAIN_FROM_PLAYERS:
      return {
        text: `从每位玩家获得 ¥${card.effectValue}`,
        className: 'card-modal__effect--gain',
      };
    case CardEffectType.PAY_PER_HOUSE:
      return {
        text: `每栋房屋支付 ¥${card.effectValue}`,
        className: 'card-modal__effect--lose',
      };
    case CardEffectType.MOVE_BACK:
      return {
        text: `后退 ${card.effectValue} 步`,
        className: 'card-modal__effect--move',
      };
    default:
      return {
        text: '特殊效果',
        className: 'card-modal__effect--other',
      };
  }
}

const CardModal: React.FC = () => {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const lastCardDrawn = useGameStore((s) => s.gameState.lastCardDrawn);
  const handleCardEffect = useGameStore((s) => s.handleCardEffect);

  const isOpen = activeModal === 'card_effect';

  if (!isOpen || !lastCardDrawn) return null;

  const isChance = lastCardDrawn.deck === 'chance';
  const effectInfo = getCardEffectInfo(lastCardDrawn);

  const handleConfirm = () => {
    handleCardEffect();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isChance ? '机会卡' : '命运卡'}
      type={isChance ? 'info' : 'warning'}
    >
      <div className="card-modal">
        <div className="card-modal__icon">{isChance ? '?' : '★'}</div>
        <span
          className={`card-modal__type ${
            isChance
              ? 'card-modal__type--chance'
              : 'card-modal__type--community_chest'
          }`}
        >
          {isChance ? '机会' : '命运'}
        </span>
        <div className="card-modal__description">
          {lastCardDrawn.description}
        </div>
        <div className={`card-modal__effect ${effectInfo.className}`}>
          {effectInfo.text}
        </div>
        <button className="card-modal__btn" onClick={handleConfirm}>
          确认
        </button>
      </div>
    </Modal>
  );
};

export default CardModal;
