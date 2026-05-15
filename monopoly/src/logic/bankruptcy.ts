/**
 * 破产逻辑 - 纯函数
 */

import type { PlayerId, GameState, PlayerStatus, PropertyState } from '../types/game';
import { PROPERTY_MAP, PROPERTIES } from '../data/properties';

/**
 * 判断玩家是否破产（无法支付指定金额）
 */
export function isBankrupt(
  playerId: PlayerId,
  amount: number,
  gameState: GameState
): boolean {
  const netWorth = calculateNetWorth(playerId, gameState);
  return netWorth < amount;
}

/**
 * 计算玩家的净资产
 * = 现金 + 未抵押地产的抵押价值 + 房屋/酒店的出售价值
 */
export function calculateNetWorth(
  playerId: PlayerId,
  gameState: GameState
): number {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return 0;

  let total = player.money;

  // 加上所有地产的价值
  for (const propertyId of player.properties) {
    const propDef = PROPERTY_MAP[propertyId];
    const propState = gameState.properties[propertyId];
    if (!propDef || !propState) continue;

    if (propState.isMortgaged) {
      // 已抵押的地产：抵押价值 - 需要赎回的利息（抵押价值的10%）
      // 净值中只算抵押价值（因为可以取消抵押获得抵押价值，但要扣利息）
      // 简化处理：已抵押地产的净值 = 0（因为赎回需要花费抵押价值）
      // 但实际上玩家可以选择不赎回，所以这里保守估计
      continue;
    }

    // 未抵押地产的抵押价值
    total += propDef.mortgageValue;

    // 房屋的出售价值（建造价格的一半）
    const houseCount = propState.hasHotel ? 5 : propState.houses;
    total += houseCount * Math.floor(propDef.buildCost / 2);
  }

  return total;
}

/**
 * 处理破产
 * - creditorId 为 null 时表示破产给银行
 * - creditorId 有值时表示破产给另一个玩家
 * 返回新的 GameState（不可变更新）
 */
export function handleBankruptcy(
  playerId: PlayerId,
  creditorId: PlayerId | null,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return gameState;

  // 1. 将破产玩家状态设为 BANKRUPT
  let updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? {
          ...p,
          status: PlayerStatus.BANKRUPT,
          money: 0,
          properties: [],
          jailFreeCards: 0,
        }
      : p
  );

  // 2. 转移所有地产给债权人
  let updatedProperties = { ...gameState.properties };

  for (const propertyId of player.properties) {
    const propState = updatedProperties[propertyId];
    if (!propState) continue;

    if (creditorId !== null) {
      // 转移给另一个玩家（保留房屋和酒店）
      updatedProperties[propertyId] = {
        ...propState,
        ownerId: creditorId,
      };

      // 将地产加入债权人的财产列表
      updatedPlayers = updatedPlayers.map(p =>
        p.id === creditorId
          ? { ...p, properties: [...p.properties, propertyId] }
          : p
      );
    } else {
      // 破产给银行：归还地产（无主），清除房屋
      updatedProperties[propertyId] = {
        ...propState,
        ownerId: null,
        houses: 0,
        hasHotel: false,
        isMortgaged: false,
      };
    }
  }

  // 3. 转移出狱免费卡给债权人
  if (player.jailFreeCards > 0 && creditorId !== null) {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === creditorId
        ? { ...p, jailFreeCards: p.jailFreeCards + player.jailFreeCards }
        : p
    );
  }

  // 4. 检查是否游戏结束（只剩一个活跃玩家）
  const activePlayers = updatedPlayers.filter(p => p.status !== PlayerStatus.BANKRUPT);
  const isGameOver = activePlayers.length <= 1;

  return {
    ...gameState,
    players: updatedPlayers,
    properties: updatedProperties,
    phase: isGameOver ? 'GAME_OVER' as any : gameState.phase,
  };
}
