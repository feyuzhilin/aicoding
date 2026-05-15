/**
 * 监狱逻辑 - 纯函数
 */

import type { PlayerId, GameState, PlayerStatus } from '../types/game';
import { JAIL_FEE, MAX_JAIL_TURNS, GO_SALARY } from '../types/game';

/** 监狱所在位置 */
const JAIL_POSITION = 10;

/**
 * 将玩家送入监狱
 * 返回新的 GameState（不可变更新）
 */
export function sendToJail(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? {
          ...p,
          position: JAIL_POSITION,
          status: PlayerStatus.IN_JAIL,
          jailTurns: 0,
          doublesCount: 0,
        }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
  };
}

/**
 * 尝试用掷骰子出狱
 * - 掷出双数则成功出狱，移动到对应位置
 * - 否则留在监狱
 */
export function attemptJailExitWithDice(
  playerId: PlayerId,
  dice: [number, number],
  gameState: GameState
): { success: boolean; newPosition?: number; newGameState: GameState } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.status !== PlayerStatus.IN_JAIL) {
    return { success: false, newGameState: gameState };
  }

  const isDoubles = dice[0] === dice[1];

  if (isDoubles) {
    // 掷出双数，成功出狱
    const steps = dice[0] + dice[1];
    const newPosition = (JAIL_POSITION + steps) % 40;

    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId
        ? {
            ...p,
            position: newPosition,
            status: PlayerStatus.ACTIVE,
            jailTurns: 0,
          }
        : p
    );

    return {
      success: true,
      newPosition,
      newGameState: {
        ...gameState,
        players: updatedPlayers,
      },
    };
  }

  // 未掷出双数，增加监狱回合数
  const newJailTurns = player.jailTurns + 1;

  // 检查是否达到最大回合数（3回合后强制出狱）
  if (newJailTurns >= MAX_JAIL_TURNS) {
    // 强制支付 ¥50 出狱
    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId
        ? {
            ...p,
            money: p.money - JAIL_FEE,
            status: PlayerStatus.ACTIVE,
            jailTurns: 0,
          }
        : p
    );

    return {
      success: true,
      newPosition: JAIL_POSITION,
      newGameState: {
        ...gameState,
        players: updatedPlayers,
      },
    };
  }

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? { ...p, jailTurns: newJailTurns }
      : p
  );

  return {
    success: false,
    newGameState: {
      ...gameState,
      players: updatedPlayers,
    },
  };
}

/**
 * 尝试支付 ¥50 出狱
 * 返回新的 GameState（不可变更新）
 */
export function attemptJailExitWithPay(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.status !== PlayerStatus.IN_JAIL) return gameState;
  if (player.money < JAIL_FEE) return gameState;

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? {
            ...p,
            money: p.money - JAIL_FEE,
            status: PlayerStatus.ACTIVE,
            jailTurns: 0,
          }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
  };
}

/**
 * 尝试使用出狱免费卡出狱
 * 返回新的 GameState（不可变更新）
 */
export function attemptJailExitWithCard(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.status !== PlayerStatus.IN_JAIL) return gameState;
  if (player.jailFreeCards <= 0) return gameState;

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? {
            ...p,
            jailFreeCards: p.jailFreeCards - 1,
            status: PlayerStatus.ACTIVE,
            jailTurns: 0,
          }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
  };
}

/**
 * 检查并强制出狱（3 回合后强制支付 ¥50 出狱）
 * 如果玩家钱不够，仍然强制出狱（可能导致负数金额，由破产逻辑处理）
 * 返回新的 GameState（不可变更新）
 */
export function checkJailForcedExit(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.status !== PlayerStatus.IN_JAIL) return gameState;

  if (player.jailTurns < MAX_JAIL_TURNS) return gameState;

  // 强制出狱，扣除 ¥50（即使钱不够也扣）
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? {
            ...p,
            money: p.money - JAIL_FEE,
            status: PlayerStatus.ACTIVE,
            jailTurns: 0,
          }
      : p
  );

  return {
    ...gameState,
    players: updatedPlayers,
  };
}
