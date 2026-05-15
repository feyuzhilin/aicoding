import React from 'react';
import Modal from './Modal';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { PROPERTIES } from '../../data/properties';
import { ColorGroup, CellType } from '../../types/game';
import './PropertyDetailModal.css';

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

/** 颜色组中文名映射 */
const COLOR_GROUP_NAME_MAP: Record<string, string> = {
  [ColorGroup.BROWN]: '棕色组',
  [ColorGroup.LIGHT_BLUE]: '浅蓝组',
  [ColorGroup.PINK]: '粉色组',
  [ColorGroup.ORANGE]: '橙色组',
  [ColorGroup.RED]: '红色组',
  [ColorGroup.YELLOW]: '黄色组',
  [ColorGroup.GREEN]: '绿色组',
  [ColorGroup.DARK_BLUE]: '深蓝组',
  [ColorGroup.RAILROAD]: '铁路',
  [ColorGroup.UTILITY]: '公用事业',
};

const PropertyDetailModal: React.FC = () => {
  const activeModal = useUIStore((s) => s.activeModal);
  const modalData = useUIStore((s) => s.modalData);
  const closeModal = useUIStore((s) => s.closeModal);
  const gameState = useGameStore((s) => s.gameState);
  const players = useGameStore((s) => s.gameState.players);

  const isOpen = activeModal === 'property_detail';

  // 从 modalData 获取 propertyId
  const propertyId = modalData?.propertyId as string | undefined;

  if (!isOpen || !propertyId) return null;

  const propDef = PROPERTIES.find((p) => p.id === propertyId);
  if (!propDef) return null;

  const propState = gameState.properties[propertyId];
  const owner = propState?.ownerId
    ? players.find((p) => p.id === propState.ownerId)
    : null;

  const color = COLOR_GROUP_MAP[propDef.colorGroup] ?? '#999';
  const colorName = COLOR_GROUP_NAME_MAP[propDef.colorGroup] ?? '未知';
  const isProperty = propDef.type === CellType.PROPERTY;
  const isRailroad = propDef.type === CellType.RAILROAD;
  const isUtility = propDef.type === CellType.UTILITY;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="地产详情"
      type="info"
    >
      <div className="property-detail-modal">
        {/* 颜色条 */}
        <div
          className="property-detail-modal__color-bar"
          style={{ background: color }}
        />

        {/* 名称和颜色组 */}
        <div className="property-detail-modal__header">
          <div className="property-detail-modal__name">{propDef.name}</div>
          <div className="property-detail-modal__group">{colorName}</div>
        </div>

        {/* 拥有者信息 */}
        <div className="property-detail-modal__owner">
          <span className="property-detail-modal__owner-label">拥有者：</span>
          {owner ? (
            <span className="property-detail-modal__owner-name">
              {owner.avatar} {owner.name}
            </span>
          ) : (
            <span className="property-detail-modal__owner-none">无主</span>
          )}
        </div>

        {/* 抵押状态 */}
        {propState?.isMortgaged && (
          <div className="property-detail-modal__mortgaged">
            已抵押
          </div>
        )}

        {/* 价格信息 */}
        <div className="property-detail-modal__info">
          <div className="property-detail-modal__info-row">
            <span className="property-detail-modal__info-label">购买价格</span>
            <span className="property-detail-modal__info-value">
              ¥{propDef.price}
            </span>
          </div>
          <div className="property-detail-modal__info-row">
            <span className="property-detail-modal__info-label">抵押价值</span>
            <span className="property-detail-modal__info-value">
              ¥{propDef.mortgageValue}
            </span>
          </div>
        </div>

        {/* 租金表 - 地产类型 */}
        {isProperty && (
          <div className="property-detail-modal__rent">
            <div className="property-detail-modal__rent-title">租金表</div>
            <div className="property-detail-modal__rent-table">
              <div className="property-detail-modal__rent-row">
                <span>基础租金</span>
                <span>¥{propDef.rentByHouse[0]}</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>1栋房屋</span>
                <span>¥{propDef.rentByHouse[1]}</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>2栋房屋</span>
                <span>¥{propDef.rentByHouse[2]}</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>3栋房屋</span>
                <span>¥{propDef.rentByHouse[3]}</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>4栋房屋</span>
                <span>¥{propDef.rentByHouse[4]}</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>酒店</span>
                <span>¥{propDef.rentByHouse[5]}</span>
              </div>
            </div>
          </div>
        )}

        {/* 租金表 - 铁路 */}
        {isRailroad && (
          <div className="property-detail-modal__rent">
            <div className="property-detail-modal__rent-title">租金表</div>
            <div className="property-detail-modal__rent-table">
              <div className="property-detail-modal__rent-row">
                <span>拥有1条铁路</span>
                <span>¥25</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>拥有2条铁路</span>
                <span>¥50</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>拥有3条铁路</span>
                <span>¥100</span>
              </div>
              <div className="property-detail-modal__rent-row">
                <span>拥有4条铁路</span>
                <span>¥200</span>
              </div>
            </div>
          </div>
        )}

        {/* 租金表 - 公用事业 */}
        {isUtility && (
          <div className="property-detail-modal__rent">
            <div className="property-detail-modal__rent-title">租金计算</div>
            <div className="property-detail-modal__utility-rent">
              <p>拥有1家公用事业：掷骰点数 × 4</p>
              <p>拥有2家公用事业：掷骰点数 × 10</p>
            </div>
          </div>
        )}

        {/* 建造费用 - 仅地产类型 */}
        {isProperty && propDef.buildCost > 0 && (
          <div className="property-detail-modal__build">
            <div className="property-detail-modal__build-title">建造费用</div>
            <div className="property-detail-modal__build-cost">
              每栋房屋 ¥{propDef.buildCost}
            </div>
          </div>
        )}

        {/* 当前房屋/酒店数量 */}
        {isProperty && propState && (propState.houses > 0 || propState.hasHotel) && (
          <div className="property-detail-modal__buildings">
            {propState.hasHotel ? (
              <span className="property-detail-modal__hotel">酒店</span>
            ) : (
              <span className="property-detail-modal__houses">
                {propState.houses} 栋房屋
              </span>
            )}
          </div>
        )}

        {/* 关闭按钮 */}
        <button className="property-detail-modal__btn" onClick={closeModal}>
          关闭
        </button>
      </div>
    </Modal>
  );
};

export default PropertyDetailModal;
