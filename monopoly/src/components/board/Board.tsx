import React, { useMemo } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { BOARD_CELLS, getCellGridPosition } from '../../data/board';
import { PROPERTY_MAP } from '../../data/properties';
import BoardCell from './BoardCell';
import DiceDisplay from './DiceDisplay';
import './board.css';

/** 棋盘主组件 - 使用 CSS Grid 11x11 布局 */
const Board: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const selectedCellIndex = useUIStore((s) => s.selectedCellIndex);
  const selectCell = useUIStore((s) => s.selectCell);
  const diceRolling = useUIStore((s) => s.diceRolling);

  const { players, properties, diceValues, roundNumber } = gameState;

  // 按格子索引分组玩家
  const playersByCell = useMemo(() => {
    const map: Record<number, typeof players> = {};
    for (const player of players) {
      if (player.status === 'BANKRUPT') continue;
      const pos = player.position;
      if (!map[pos]) map[pos] = [];
      map[pos].push(player);
    }
    return map;
  }, [players]);

  // 生成所有格子的渲染数据
  const cellRenderData = useMemo(() => {
    return BOARD_CELLS.map((cell) => {
      const [row, col] = getCellGridPosition(cell.index);
      const propertyDef = cell.propertyId ? PROPERTY_MAP[cell.propertyId] : undefined;
      const propertyState = cell.propertyId ? properties[cell.propertyId] : undefined;
      const cellPlayers = playersByCell[cell.index] || [];

      return {
        cell,
        row,
        col,
        propertyDef,
        propertyState,
        cellPlayers,
      };
    });
  }, [playersByCell, properties]);

  const handleCellClick = (index: number) => {
    selectCell(selectedCellIndex === index ? null : index);
  };

  return (
    <div className="board">
      {/* 渲染 40 个格子 */}
      {cellRenderData.map(({ cell, row, col, propertyDef, propertyState, cellPlayers }) => (
        <div
          key={cell.index}
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
          }}
        >
          <BoardCell
            cell={cell}
            propertyDef={propertyDef}
            propertyState={propertyState}
            playersOnCell={cellPlayers}
            isSelected={selectedCellIndex === cell.index}
            onClick={() => handleCellClick(cell.index)}
          />
        </div>
      ))}

      {/* 中央区域 */}
      <div className="board__center">
        <div className="board__title">大富翁</div>
        <div className="board__title-sub">MONOPOLY</div>
        <DiceDisplay diceValues={diceValues} rolling={diceRolling} />
        <div className="board__round-info">第 {roundNumber} 回合</div>
      </div>
    </div>
  );
};

export default Board;
