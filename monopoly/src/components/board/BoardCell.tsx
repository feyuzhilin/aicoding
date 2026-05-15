import React from 'react';
import type { Player, PropertyDef, PropertyState } from '../../types/game';
import { ColorGroup, CellType } from '../../types/game';
import type { BoardCell } from '../../data/board';
import { getCellSide } from '../../data/board';
import PlayerToken from './PlayerToken';

interface BoardCellProps {
  cell: BoardCell;
  propertyDef?: PropertyDef;
  propertyState?: PropertyState;
  playersOnCell: Player[];
  isSelected: boolean;
  onClick: () => void;
}

/** 颜色组映射 */
const COLOR_MAP: Record<ColorGroup, string> = {
  [ColorGroup.BROWN]: '#8B4513',
  [ColorGroup.LIGHT_BLUE]: '#87CEEB',
  [ColorGroup.PINK]: '#FF69B4',
  [ColorGroup.ORANGE]: '#FF8C00',
  [ColorGroup.RED]: '#DC143C',
  [ColorGroup.YELLOW]: '#FFD700',
  [ColorGroup.GREEN]: '#2E8B57',
  [ColorGroup.DARK_BLUE]: '#00008B',
  [ColorGroup.RAILROAD]: '#333333',
  [ColorGroup.UTILITY]: '#888888',
};

/** 格子类型图标映射 */
const CELL_ICONS: Record<string, string> = {
  [CellType.GO]: '\u{1F3C1}',
  [CellType.JAIL]: '\u{1F512}',
  [CellType.FREE_PARKING]: '\u{1F17F}\uFE0F',
  [CellType.GO_TO_JAIL]: '\u{1F46E}',
  [CellType.CHANCE]: '\u2753',
  [CellType.COMMUNITY_CHEST]: '\u{1F0CF}',
  [CellType.TAX]: '\u{1F4B0}',
  [CellType.RAILROAD]: '\u{1F682}',
  [CellType.UTILITY]: '\u26A1',
};

/** 判断是否为角落格子 */
function isCorner(index: number): boolean {
  return index === 0 || index === 10 || index === 20 || index === 30;
}

/** 获取公用事业图标 */
function getUtilityIcon(cellIndex: number): string {
  return cellIndex === 12 ? '\u26A1' : '\u{1F4A7}';
}

const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  propertyDef,
  propertyState,
  playersOnCell,
  isSelected,
  onClick,
}) => {
  const side = getCellSide(cell.index);
  const corner = isCorner(cell.index);

  // 构建样式类名
  const classNames = [
    'board-cell',
    `board-cell--${side}`,
    corner && 'board-cell--corner',
    isSelected && 'board-cell--selected',
    propertyState?.isMortgaged && 'board-cell--mortgaged',
  ]
    .filter(Boolean)
    .join(' ');

  // 获取颜色条颜色
  const colorBarColor = propertyDef ? COLOR_MAP[propertyDef.colorGroup] : undefined;

  // 获取格子图标
  const getIcon = (): string | null => {
    if (corner) {
      return CELL_ICONS[cell.type] || null;
    }
    switch (cell.type) {
      case CellType.CHANCE:
        return CELL_ICONS[CellType.CHANCE];
      case CellType.COMMUNITY_CHEST:
        return CELL_ICONS[CellType.COMMUNITY_CHEST];
      case CellType.TAX:
        return CELL_ICONS[CellType.TAX];
      case CellType.RAILROAD:
        return CELL_ICONS[CellType.RAILROAD];
      case CellType.UTILITY:
        return getUtilityIcon(cell.index);
      default:
        return null;
    }
  };

  const icon = getIcon();

  // 渲染房屋指示器
  const renderHouses = () => {
    if (!propertyState || propertyState.houses === 0) return null;

    if (propertyState.hasHotel) {
      return (
        <div className="board-cell__houses">
          <div className="board-cell__house board-cell__house--hotel" />
        </div>
      );
    }

    return (
      <div className="board-cell__houses">
        {Array.from({ length: propertyState.houses }, (_, i) => (
          <div key={i} className="board-cell__house" />
        ))}
      </div>
    );
  };

  // 渲染所有者标记
  const renderOwnerMark = () => {
    if (!propertyState?.ownerId) return null;
    // 从玩家颜色中获取（通过传入的 props 无法直接获取，使用 propertyState 中的信息）
    // 所有者标记由父组件通过 ownerColor prop 传入更合理，但这里简化处理
    return null;
  };

  return (
    <div className={classNames} onClick={onClick}>
      {/* 颜色条 */}
      {colorBarColor && <div className="board-cell__color-bar" style={{ backgroundColor: colorBarColor }} />}

      {/* 格子内容 */}
      <div className="board-cell__content">
        {icon && <span className="board-cell__icon">{icon}</span>}
        <span className="board-cell__name">{cell.name}</span>
        {propertyDef && !corner && (
          <span className="board-cell__price">${propertyDef.price}</span>
        )}
      </div>

      {/* 房屋指示器 */}
      {renderHouses()}

      {/* 所有者标记 */}
      {renderOwnerMark()}

      {/* 玩家棋子 */}
      {playersOnCell.map((player, idx) => (
        <PlayerToken key={player.id} player={player} index={idx} />
      ))}
    </div>
  );
};

export default BoardCell;
export { COLOR_MAP };
