/**
 * 卡片逻辑 - 纯函数
 */

import type { PlayerId, GameState, CardDef } from '../types/game';
import { CardEffectType, PlayerStatus, GO_SALARY } from '../types/game';
import { PROPERTY_MAP, PROPERTIES } from '../data/properties';
import { BOARD_SIZE } from '../types/game';
import { calculateNewPosition, passedGo } from './movement';
import { sendToJail } from './jail';

/** 铁路位置列表 */
const RAILROAD_POSITIONS = [5, 15, 25, 35];

/** 公用事业位置列表 */
const UTILITY_POSITIONS = [12, 28];

/**
 * 从指定牌堆抽一张牌
 * 返回抽到的卡片和新的 GameState（牌堆更新）
 */
export function drawCard(
  deck: 'chance' | 'community_chest',
  gameState: GameState
): { card: CardDef; newGameState: GameState } {
  const deckKey = deck === 'chance' ? 'chanceDeck' : 'communityChestDeck';
  const currentDeck = gameState[deckKey];

  if (currentDeck.length === 0) {
    // 牌堆为空，不应该发生（正常游戏会循环使用）
    throw new Error(`牌堆 ${deck} 已空`);
  }

  // 抽取第一张牌
  const [card, ...remaining] = currentDeck;

  // 将抽到的牌放到牌堆底部（循环使用）
  const newDeck = [...remaining, card];

  const newGameState: GameState = {
    ...gameState,
    [deckKey]: newDeck,
    lastCardDrawn: card,
  };

  return { card, newGameState };
}

/**
 * 执行卡片效果
 * 返回新的 GameState（不可变更新）
 */
export function executeCardEffect(
  card: CardDef,
  playerId: PlayerId,
  gameState: GameState,
  diceValues: [number, number]
): GameState {
  switch (card.effectType) {
    case CardEffectType.GAIN_MONEY:
      return handleGainMoney(playerId, card.effectValue, gameState);

    case CardEffectType.LOSE_MONEY:
      return handleLoseMoney(playerId, card.effectValue, gameState);

    case CardEffectType.MOVE_TO:
      return handleMoveTo(playerId, card.effectValue, gameState);

    case CardEffectType.MOVE_TO_NEAREST:
      return handleMoveToNearest(playerId, card.effectTarget ?? 'railroad', gameState, diceValues);

    case CardEffectType.MOVE_BACK:
      return handleMoveBack(playerId, card.effectValue, gameState);

    case CardEffectType.GO_TO_JAIL:
      return sendToJail(playerId, gameState);

    case CardEffectType.GET_OUT_OF_JAIL:
      return handleGetOutOfJail(playerId, gameState);

    case CardEffectType.GAIN_FROM_PLAYERS:
      return handleGainFromPlayers(playerId, card.effectValue, gameState);

    case CardEffectType.PAY_PER_HOUSE:
      return handlePayPerHouse(playerId, gameState);

    default:
      return gameState;
  }
}

// ==================== 内部效果处理函数 ====================

/** 获得金钱 */
function handleGainMoney(
  playerId: PlayerId,
  amount: number,
  gameState: GameState
): GameState {
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, money: p.money + amount } : p
  );
  return { ...gameState, players: updatedPlayers };
}

/** 失去金钱 */
function handleLoseMoney(
  playerId: PlayerId,
  amount: number,
  gameState: GameState
): GameState {
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, money: p.money - amount } : p
  );
  return { ...gameState, players: updatedPlayers };
}

/** 移动到指定位置，如果经过 GO 则收 ¥200 */
function handleMoveTo(
  playerId: PlayerId,
  targetPosition: number,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return gameState;

  const currentPosition = player.position;
  const newPosition = targetPosition;

  // 检查是否经过起点（向正方向移动）
  const wentPastGo = newPosition < currentPosition || (currentPosition === newPosition && currentPosition !== 0);

  let updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, position: newPosition } : p
  );

  // 特殊情况：移动到起点（位置 0），总是获得 ¥200
  if (newPosition === 0 || wentPastGo) {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === playerId ? { ...p, money: p.money + GO_SALARY } : p
    );
  }

  return { ...gameState, players: updatedPlayers };
}

/** 移动到最近的铁路或公用事业 */
function handleMoveToNearest(
  playerId: PlayerId,
  targetType: 'railroad' | 'utility',
  gameState: GameState,
  diceValues: [number, number]
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return gameState;

  const positions = targetType === 'railroad' ? RAILROAD_POSITIONS : UTILITY_POSITIONS;
  const currentPosition = player.position;

  // 找到当前位置之后（正向）最近的铁路/公用事业
  let nearestPosition = positions[0];
  let minDistance = BOARD_SIZE;

  for (const pos of positions) {
    // 计算正向距离
    const distance = (pos - currentPosition + BOARD_SIZE) % BOARD_SIZE;
    if (distance > 0 && distance < minDistance) {
      minDistance = distance;
      nearestPosition = pos;
    }
  }

  // 如果所有距离都是 0（玩家正好在目标位置上），找下一个
  if (minDistance === BOARD_SIZE) {
    nearestPosition = positions[0];
  }

  // 使用 handleMoveTo 处理移动（包含经过 GO 的逻辑）
  return handleMoveTo(playerId, nearestPosition, gameState);
}

/** 后退 N 步 */
function handleMoveBack(
  playerId: PlayerId,
  steps: number,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return gameState;

  const newPosition = (player.position - steps + BOARD_SIZE) % BOARD_SIZE;

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, position: newPosition } : p
  );

  return { ...gameState, players: updatedPlayers };
}

/** 获得出狱免费卡 */
function handleGetOutOfJail(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, jailFreeCards: p.jailFreeCards + 1 } : p
  );
  return { ...gameState, players: updatedPlayers };
}

/** 从每个活跃玩家获得金钱 */
function handleGainFromPlayers(
  playerId: PlayerId,
  amountPerPlayer: number,
  gameState: GameState
): GameState {
  const activePlayers = gameState.players.filter(
    p => p.id !== playerId && p.status !== PlayerStatus.BANKRUPT
  );

  let updatedPlayers = gameState.players.map(p =>
    p.id === playerId
      ? { ...p, money: p.money + amountPerPlayer * activePlayers.length }
      : p
  );

  // 其他活跃玩家各付金额
  updatedPlayers = updatedPlayers.map(p => {
    if (p.id === playerId || p.status === PlayerStatus.BANKRUPT) return p;
    return { ...p, money: p.money - amountPerPlayer };
  });

  return { ...gameState, players: updatedPlayers };
}

/** 每栋房屋付 ¥25，每座酒店付 ¥100 */
function handlePayPerHouse(
  playerId: PlayerId,
  gameState: GameState
): GameState {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return gameState;

  let totalHouses = 0;
  let totalHotels = 0;

  for (const propertyId of player.properties) {
    const propState = gameState.properties[propertyId];
    if (!propState) continue;

    totalHouses += propState.houses;
    if (propState.hasHotel) totalHotels += 1;
  }

  const totalPayment = totalHouses * 25 + totalHotels * 100;

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, money: p.money - totalPayment } : p
  );

  return { ...gameState, players: updatedPlayers };
}
