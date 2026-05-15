import React from 'react';
import Modal from './Modal';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { PROPERTIES } from '../../data/properties';
import { ColorGroup, CellType } from '../../types/game';
import './BuyPropertyModal.css';

/** 颜色组对应颜色映射 */
const COLOR_GROUP_MAP: Record<string, string> = {
  [ColorGroup.BROWN]: '#8B4513',
  [ColorGroup.LIGHT_BLUE]: '#87CEEB',
  [ColorGroup.PINK]: '#FF69B4',
  [ColorGroup.ORANGE]: '#FF8C00',
  [ColorGroup.RED]: '#DC143C',
  [ColorGroup.YELLOW]: '#FFD700',
  [ColorGroup.GREEN]: '#2E8B57',
  [ColorGroup.DARK_BLUE]: '#191970',
  [ColorGroup.RAILROAD]: '#333',
  [ColorGroup.UTILITY]: '#666',
};

const BuyPropertyModal: React.FC = () => {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const pendingCellAction = useGameStore((s) => s.gameState.pendingCellAction);
  const currentPlayer = useGameStore((s) => s.getCurrentPlayer());
  const buyProperty = useGameStore((s) => s.buyProperty);
  const skipBuyProperty = useGameStore((s) => s.skipBuyProperty);

  const isOpen = activeModal === 'buy_property';

  if (!isOpen || !pendingCellAction || !pendingCellAction.propertyId) return null;

  const propDef = PROPERTIES.find((p) => p.id === pendingCellAction.propertyId);
  if (!propDef) return null;

  const playerMoney = currentPlayer?.money ?? 0;
  const canAfford = playerMoney >= propDef.price;
  const color = COLOR_GROUP_MAP[propDef.colorGroup] ?? '#999';
  const isProperty = propDef.type === CellType.PROPERTY;
  const isRailroad = propDef.type === CellType.RAILROAD;
  const isUtility = propDef.type === CellType.UTILITY;

  const handleBuy = () => {
    buyProperty();
    closeModal();
  };

  const handleSkip = () => {
    skipBuyProperty();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title="购买地产"
      type="info"
    >
      <div className="buy-property-modal">
        <div
          className="buy-property-modal__color-bar"
          style={{ background: color }}
        />
        <div className="buy-property-modal__name">{propDef.name}</div>
        <div className="buy-property-modal__price">¥{propDef.price}</div>

        {/* 租金表 - 地产类型 */}
        {isProperty && (
          <div className="buy-property-modal__rent">
            <div className="buy-property-modal__rent-title">租金表</div>
            <div className="buy-property-modal__rent-table">
              <div className="buy-property-modal__rent-row">
                <span>基础租金</span>
                <span>¥{propDef.rentByHouse[0]}</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>1栋房屋</span>
                <span>¥{propDef.rentByHouse[1]}</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>2栋房屋</span>
                <span>¥{propDef.rentByHouse[2]}</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>3栋房屋</span>
                <span>¥{propDef.rentByHouse[3]}</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>4栋房屋</span>
                <span>¥{propDef.rentByHouse[4]}</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>酒店</span>
                <span>¥{propDef.rentByHouse[5]}</span>
              </div>
            </div>
          </div>
        )}

        {/* 租金表 - 铁路 */}
        {isRailroad && (
          <div className="buy-property-modal__rent">
            <div className="buy-property-modal__rent-title">租金表</div>
            <div className="buy-property-modal__rent-table">
              <div className="buy-property-modal__rent-row">
                <span>拥有1条铁路</span>
                <span>¥25</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>拥有2条铁路</span>
                <span>¥50</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>拥有3条铁路</span>
                <span>¥100</span>
              </div>
              <div className="buy-property-modal__rent-row">
                <span>拥有4条铁路</span>
                <span>¥200</span>
              </div>
            </div>
          </div>
        )}

        {/* 租金表 - 公用事业 */}
        {isUtility && (
          <div className="buy-property-modal__rent">
            <div className="buy-property-modal__rent-title">租金计算</div>
            <div className="buy-property-modal__utility-rent">
              <p>拥有1家公用事业：掷骰点数 × 4</p>
              <p>拥有2家公用事业：掷骰点数 × 10</p>
            </div>
          </div>
        )}

        <div className="buy-property-modal__info">
          <div className="buy-property-modal__info-row">
            <span className="buy-property-modal__info-label">建房费用</span>
            <span className="buy-property-modal__info-value">
              {propDef.buildCost > 0 ? `¥${propDef.buildCost}` : '不可建造'}
            </span>
          </div>
          <div className="buy-property-modal__info-row">
            <span className="buy-property-modal__info-label">抵押价值</span>
            <span className="buy-property-modal__info-value">¥{propDef.mortgageValue}</span>
          </div>
        </div>

        <div
          className={`buy-property-modal__balance ${
            !canAfford ? 'buy-property-modal__balance--insufficient' : ''
          }`}
        >
          当前余额：<strong>¥{playerMoney}</strong>
        </div>

        {!canAfford && (
          <div className="buy-property-modal__warning">
            余额不足，无法购买该地产
          </div>
        )}

        <div className="buy-property-modal__buttons">
          <button
            className="buy-property-modal__btn buy-property-modal__btn--buy"
            onClick={handleBuy}
            disabled={!canAfford}
          >
            购买 ¥{propDef.price}
          </button>
          <button
            className="buy-property-modal__btn buy-property-modal__btn--skip"
            onClick={handleSkip}
          >
            跳过/拍卖
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BuyPropertyModal;
