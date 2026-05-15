/**
 * 建造逻辑 - 纯函数
 */

import type { PlayerId, GameState, PropertyState } from '../types/game';
import { CellType } from '../types/game';
import { PROPERTY_MAP, PROPERTIES } from '../data/properties';

export interface BuildablePropertyInfo {
  propertyId: string;
  currentHouses: number;
  canBuild: boolean;
  buildCost: number;
  reason?: string;
}

/**
 * 获取玩家所有可建造的地产信息
 */
export function getBuildableProperties(
  playerId: PlayerId,
  gameState: GameState
): BuildablePropertyInfo[] {
  const playerProperties = PROPERTIES.filter(p => {
    const state = gameState.properties[p.id];
    return (
      state &&
      state.ownerId === playerId &&
      !state.isMortgaged &&
      p.type === CellType.PROPERTY
    );
  });

  return playerProperties.map(prop => {
    const state = gameState.properties[prop.id];
    const currentHouses = state.houses;
    const hasHotel = state.hasHotel;

    // 已经有酒店，不能再建造
    if (hasHotel) {
      return {
        propertyId: prop.id,
        currentHouses,
        canBuild: false,
        buildCost: prop.buildCost,
        reason: '已有酒店',
      };
    }

    // 检查是否拥有完整颜色组
    const ownsGroup = ownsFullColorGroup(playerId, prop.colorGroup, gameState);
    if (!ownsGroup) {
      return {
        propertyId: prop.id,
        currentHouses,
        canBuild: false,
        buildCost: prop.buildCost,
        reason: '未拥有完整颜色组',
      };
    }

    // 检查均匀建造规则：当前地产房屋数 <= 同组最少房屋数 + 1
    const minHousesInGroup = getMinHousesInGroup(playerId, prop.colorGroup, gameState);
    if (currentHouses > minHousesInGroup + 1) {
      return {
        propertyId: prop.id,
        currentHouses,
        canBuild: false,
        buildCost: prop.buildCost,
        reason: '不满足均匀建造规则（需先在其他地产建房）',
      };
    }

    // 检查资金是否足够
    if (gameState.players.find(p => p.id === playerId)!.money < prop.buildCost) {
      return {
        propertyId: prop.id,
        currentHouses,
        canBuild: false,
        buildCost: prop.buildCost,
        reason: '资金不足',
      };
    }

    return {
      propertyId: prop.id,
      currentHouses,
      canBuild: true,
      buildCost: prop.buildCost,
    };
  });
}

/**
 * 在指定地产上建造房屋
 * 返回新的 GameState（不可变更新）
 */
export function buildHouse(
  playerId: PlayerId,
  propertyId: string,
  gameState: GameState
): GameState {
  const propertyDef = PROPERTY_MAP[propertyId];
  if (!propertyDef) return gameState;

  const propertyState = gameState.properties[propertyId];
  if (!propertyState || propertyState.ownerId !== playerId) return gameState;
  if (propertyState.isMortgaged) return gameState;
  if (propertyState.hasHotel) return gameState;

  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.money < propertyDef.buildCost) return gameState;

  // 检查是否拥有完整颜色组
  if (!ownsFullColorGroup(playerId, propertyDef.colorGroup, gameState)) return gameState;

  // 检查均匀建造规则
  const minHousesInGroup = getMinHousesInGroup(playerId, propertyDef.colorGroup, gameState);
  if (propertyState.houses > minHousesInGroup + 1) return gameState;

  // 4 栋房屋时，再建造变为酒店
  const newHouses = propertyState.houses + 1;
  const newHasHotel = newHouses >= 5;
  const finalHouses = newHasHotel ? 0 : newHouses;

  const updatedPropertyState: PropertyState = {
    ...propertyState,
    houses: finalHouses,
    hasHotel: newHasHotel,
  };

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? { ...p, money: p.money - propertyDef.buildCost }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
    properties: {
      ...gameState.properties,
      [propertyId]: updatedPropertyState,
    },
  };
}

/**
 * 卖掉指定地产上的一栋房屋（或酒店）
 * 返回新的 GameState（不可变更新）
 */
export function sellHouse(
  playerId: PlayerId,
  propertyId: string,
  gameState: GameState
): GameState {
  const propertyDef = PROPERTY_MAP[propertyId];
  if (!propertyDef) return gameState;

  const propertyState = gameState.properties[propertyId];
  if (!propertyState || propertyState.ownerId !== playerId) return gameState;

  // 没有房屋也没有酒店，无法出售
  if (!propertyState.hasHotel && propertyState.houses === 0) return gameState;

  // 卖出价格为建造价格的一半
  const sellPrice = Math.floor(propertyDef.buildCost / 2);

  let newHouses: number;
  let newHasHotel: boolean;

  if (propertyState.hasHotel) {
    // 酒店变回 4 栋房屋
    newHouses = 4;
    newHasHotel = false;
  } else {
    newHouses = propertyState.houses - 1;
    newHasHotel = false;
  }

  const updatedPropertyState: PropertyState = {
    ...propertyState,
    houses: newHouses,
    hasHotel: newHasHotel,
  };

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? { ...p, money: p.money + sellPrice }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
    properties: {
      ...gameState.properties,
      [propertyId]: updatedPropertyState,
    },
  };
}

// ==================== 内部辅助函数 ====================

/** 判断玩家是否拥有完整的颜色组（所有地产未被抵押） */
function ownsFullColorGroup(
  playerId: PlayerId,
  colorGroup: string,
  gameState: GameState
): boolean {
  const groupProperties = PROPERTIES.filter(p => p.colorGroup === colorGroup);
  if (groupProperties.length === 0) return false;

  return groupProperties.every(p => {
    const state = gameState.properties[p.id];
    return state && state.ownerId === playerId && !state.isMortgaged;
  });
}

/** 获取玩家在同颜色组中拥有最少的房屋数 */
function getMinHousesInGroup(
  playerId: PlayerId,
  colorGroup: string,
  gameState: GameState
): number {
  const groupProperties = PROPERTIES.filter(p => p.colorGroup === colorGroup);

  let minHouses = Infinity;
  for (const prop of groupProperties) {
    const state = gameState.properties[prop.id];
    if (state && state.ownerId === playerId && !state.isMortgaged) {
      // 酒店算作 5 栋房屋
      const effectiveHouses = state.hasHotel ? 5 : state.houses;
      if (effectiveHouses < minHouses) {
        minHouses = effectiveHouses;
      }
    }
  }

  return minHouses === Infinity ? 0 : minHouses;
}
