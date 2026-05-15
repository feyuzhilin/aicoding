/**
 * 租金计算逻辑 - 纯函数
 */

import type { PlayerId, GameState, ColorGroup } from '../types/game';
import { CellType } from '../types/game';
import { PROPERTY_MAP, PROPERTIES } from '../data/properties';

/**
 * 计算指定地产的租金
 */
export function calculateRent(
  propertyId: string,
  ownerId: PlayerId,
  gameState: GameState,
  diceValues: [number, number]
): number {
  const propertyDef = PROPERTY_MAP[propertyId];
  if (!propertyDef) return 0;

  const propertyState = gameState.properties[propertyId];
  if (!propertyState || propertyState.ownerId !== ownerId) return 0;

  // 已抵押的地产不收租金
  if (propertyState.isMortgaged) return 0;

  // 铁路租金
  if (propertyDef.type === CellType.RAILROAD) {
    return calculateRailroadRent(ownerId, propertyDef.colorGroup, gameState);
  }

  // 公用事业租金
  if (propertyDef.type === CellType.UTILITY) {
    return calculateUtilityRent(ownerId, diceValues, gameState);
  }

  // 普通地产租金
  return calculatePropertyRent(propertyDef, propertyState.houses, propertyState.hasHotel, ownerId, gameState);
}

/**
 * 判断玩家是否拥有完整的颜色组
 */
export function ownsFullColorGroup(
  playerId: PlayerId,
  colorGroup: ColorGroup,
  gameState: GameState
): boolean {
  const groupProperties = PROPERTIES.filter(p => p.colorGroup === colorGroup);

  if (groupProperties.length === 0) return false;

  return groupProperties.every(p => {
    const state = gameState.properties[p.id];
    return state && state.ownerId === playerId && !state.isMortgaged;
  });
}

// ==================== 内部辅助函数 ====================

/** 计算铁路租金：拥有 N 条铁路，租金 = 25 * 2^(N-1) */
function calculateRailroadRent(
  ownerId: PlayerId,
  colorGroup: ColorGroup,
  gameState: GameState
): number {
  const railroads = PROPERTIES.filter(
    p => p.colorGroup === colorGroup && p.type === CellType.RAILROAD
  );

  let ownedCount = 0;
  for (const rr of railroads) {
    const state = gameState.properties[rr.id];
    if (state && state.ownerId === ownerId && !state.isMortgaged) {
      ownedCount++;
    }
  }

  // rentByHouse[N-1]: 1条=25, 2条=50, 3条=100, 4条=200
  if (ownedCount > 0 && ownedCount <= 4) {
    return 25 * Math.pow(2, ownedCount - 1);
  }

  return 0;
}

/** 计算公用事业租金 */
function calculateUtilityRent(
  ownerId: PlayerId,
  diceValues: [number, number],
  gameState: GameState
): number {
  const utilities = PROPERTIES.filter(p => p.type === CellType.UTILITY);

  let ownedCount = 0;
  for (const util of utilities) {
    const state = gameState.properties[util.id];
    if (state && state.ownerId === ownerId && !state.isMortgaged) {
      ownedCount++;
    }
  }

  const diceSum = diceValues[0] + diceValues[1];

  // 拥有 1 家：骰子总和 * 4
  if (ownedCount === 1) return diceSum * 4;
  // 拥有 2 家：骰子总和 * 10
  if (ownedCount === 2) return diceSum * 10;

  return 0;
}

/** 计算普通地产租金 */
function calculatePropertyRent(
  propertyDef: typeof PROPERTY_MAP[string],
  houses: number,
  hasHotel: boolean,
  ownerId: PlayerId,
  gameState: GameState
): number {
  // 有酒店：rentByHouse[5]
  if (hasHotel) {
    return propertyDef.rentByHouse[5];
  }

  // 有 N 栋房屋：rentByHouse[N]
  if (houses > 0) {
    return propertyDef.rentByHouse[houses];
  }

  // 拥有完整颜色组且无房屋：baseRent * 2
  if (ownsFullColorGroup(ownerId, propertyDef.colorGroup, gameState)) {
    return propertyDef.baseRent * 2;
  }

  // 否则：baseRent
  return propertyDef.baseRent;
}
