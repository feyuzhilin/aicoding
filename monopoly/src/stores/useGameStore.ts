import { create } from 'zustand';
import type {
  GameConfig,
  GameState,
  Player,
  PropertyState,
  PendingCellAction,
  GameLogEntry,
  CardDef,
  PlayerId,
} from '../types/game';
import {
  GamePhase,
  PlayerStatus,
  CellType,
  INITIAL_MONEY,
  GO_SALARY,
  BOARD_SIZE,
  PLAYER_COLORS,
  PLAYER_AVATARS,
} from '../types/game';
import { PROPERTIES } from '../data/properties';
import { BOARD_CELLS } from '../data/board';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS, shuffleDeck } from '../data/cards';
import {
  rollDice as logicRollDice,
  isDoubles,
  sumDice,
  calculateNewPosition,
  passedGo,
  sendToJail,
  attemptJailExitWithDice,
  attemptJailExitWithPay,
  attemptJailExitWithCard,
  checkJailForcedExit,
  calculateRent,
  drawCard,
  executeCardEffect,
  isBankrupt,
  handleBankruptcy,
} from '../logic';

// ==================== Store 接口 ====================

interface GameStore {
  // 状态
  gameState: GameState;

  // 初始化
  initGame: (config: GameConfig) => void;

  // 掷骰
  rollDice: () => void;

  // 处理掷骰后的移动（由UI动画完成后调用）
  handlePostRoll: () => void;

  // 处理到达格子后的事件
  handleCellAction: () => void;

  // 购买地产
  buyProperty: () => void;

  // 跳过购买（进入拍卖）
  skipBuyProperty: () => void;

  // 支付租金
  payRent: () => void;

  // 支付税收
  payTax: () => void;

  // 处理卡片效果
  handleCardEffect: () => void;

  // 监狱：支付出狱
  payJailFee: () => void;

  // 监狱：使用出狱卡
  useJailCard: () => void;

  // 结束回合
  endTurn: () => void;

  // 查询
  getCurrentPlayer: () => Player | undefined;
  getActivePlayers: () => Player[];
  getPropertyState: (propertyId: string) => PropertyState | undefined;
}

// ==================== 辅助函数 ====================

/** 生成唯一 ID */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/** 添加日志条目 */
function addLog(
  gameState: GameState,
  playerId: PlayerId | null,
  playerName: string,
  action: string,
  detail: string,
  moneyChange?: number
): GameLogEntry[] {
  const entry: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    playerId,
    playerName,
    action,
    detail,
    moneyChange,
  };
  return [...gameState.log, entry];
}

/** 判断格子类型并生成 pendingCellAction */
function determineCellAction(
  cellIndex: number,
  playerId: PlayerId,
  gameState: GameState
): PendingCellAction | null {
  const cell = BOARD_CELLS[cellIndex];
  if (!cell) return null;

  switch (cell.type) {
    case CellType.PROPERTY:
    case CellType.RAILROAD:
    case CellType.UTILITY: {
      if (!cell.propertyId) return null;
      const propState = gameState.properties[cell.propertyId];
      if (!propState) return null;

      // 无主地产 → 可购买
      if (propState.ownerId === null) {
        return { type: 'buy', propertyId: cell.propertyId };
      }

      // 自己的地产 → 无事发生
      if (propState.ownerId === playerId) {
        return null;
      }

      // 已抵押 → 不收租
      if (propState.isMortgaged) {
        return null;
      }

      // 别人的地产 → 支付租金
      const rent = calculateRent(cell.propertyId, propState.ownerId, gameState, gameState.diceValues);
      return {
        type: 'rent',
        propertyId: cell.propertyId,
        amount: rent,
        creditorId: propState.ownerId,
      };
    }

    case CellType.TAX: {
      // 所得税格(index 4): ¥200, 奢侈税格(index 38): ¥100
      const taxAmount = cellIndex === 4 ? 200 : 100;
      return { type: 'tax', amount: taxAmount };
    }

    case CellType.CHANCE:
      return { type: 'card' };

    case CellType.COMMUNITY_CHEST:
      return { type: 'card' };

    case CellType.GO_TO_JAIL:
      return { type: 'go_to_jail' };

    case CellType.GO:
      return { type: 'go' };

    case CellType.JAIL:
      return { type: 'jail' };

    case CellType.FREE_PARKING:
      return null;

    default:
      return null;
  }
}

// ==================== 初始状态 ====================

const initialGameState: GameState = {
  phase: GamePhase.SETUP,
  players: [],
  currentPlayerId: null,
  properties: {},
  chanceDeck: [],
  communityChestDeck: [],
  diceValues: [0, 0],
  isDoubles: false,
  auction: null,
  log: [],
  roundNumber: 0,
  lastCardDrawn: null,
  pendingCellAction: null,
};

// ==================== Store ====================

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: { ...initialGameState },

  // ==================== 初始化 ====================
  initGame: (config: GameConfig) => {
    const { playerCount, playerNames, playerColors } = config;

    // 创建玩家数组
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: `player_${i}`,
      name: playerNames[i] || `玩家 ${i + 1}`,
      avatar: PLAYER_AVATARS[i] || '🎯',
      color: playerColors[i] || PLAYER_COLORS[i] || '#95a5a6',
      money: INITIAL_MONEY,
      position: 0,
      status: PlayerStatus.ACTIVE,
      properties: [],
      jailFreeCards: 0,
      jailTurns: 0,
      doublesCount: 0,
      order: i,
    }));

    // 初始化所有地产为银行所有
    const properties: Record<string, PropertyState> = {};
    for (const prop of PROPERTIES) {
      properties[prop.id] = {
        propertyId: prop.id,
        ownerId: null,
        houses: 0,
        hasHotel: false,
        isMortgaged: false,
      };
    }

    // 洗牌机会卡和命运卡
    const chanceDeck = shuffleDeck([...CHANCE_CARDS]);
    const communityChestDeck = shuffleDeck([...COMMUNITY_CHEST_CARDS]);

    set({
      gameState: {
        phase: GamePhase.WAITING_ROLL,
        players,
        currentPlayerId: players[0].id,
        properties,
        chanceDeck,
        communityChestDeck,
        diceValues: [0, 0],
        isDoubles: false,
        auction: null,
        log: [],
        roundNumber: 1,
        lastCardDrawn: null,
        pendingCellAction: null,
      },
    });
  },

  // ==================== 掷骰 ====================
  rollDice: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    // 调用逻辑函数掷骰
    const dice = logicRollDice();
    const doubles = isDoubles(dice);
    const newDoublesCount = doubles
      ? currentPlayer.doublesCount + 1
      : 0;

    let updatedState: GameState = {
      ...gameState,
      diceValues: dice,
      isDoubles: doubles,
    };

    // 更新玩家的 doublesCount
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, doublesCount: newDoublesCount }
          : p
      ),
    };

    // 连续3次双数 → 送入监狱
    if (newDoublesCount >= 3) {
      updatedState = sendToJail(currentPlayer.id, updatedState);
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '掷骰',
          `掷出 ${dice[0]}+${dice[1]}，连续3次双数，直接入狱！`
        ),
      };
      set({ gameState: updatedState });
      return;
    }

    // 设置 phase 为 ROLLING，显示骰子动画
    updatedState = {
      ...updatedState,
      phase: GamePhase.ROLLING,
      log: addLog(
        updatedState,
        currentPlayer.id,
        currentPlayer.name,
        '掷骰',
        `掷出 ${dice[0]}+${dice[1]}${doubles ? '（双数！）' : ''}`
      ),
    };

    set({ gameState: updatedState });

    // 延迟一段时间后自动执行移动（模拟动画完成）
    setTimeout(() => {
      get().handlePostRoll();
    }, 1000); // 1秒后自动移动
  },

  // ==================== 处理掷骰后的移动 ====================
  handlePostRoll: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const dice = gameState.diceValues;
    const total = sumDice(dice);
    let updatedState = { ...gameState };

    // 如果玩家在监狱中
    if (currentPlayer.status === PlayerStatus.IN_JAIL) {
      const result = attemptJailExitWithDice(currentPlayer.id, dice, updatedState);
      updatedState = result.newGameState;

      if (result.success) {
        // 出狱成功（双数或强制出狱）
        if (gameState.isDoubles) {
          // 掷出双数出狱，已经移动到新位置
          const newPosition = result.newPosition!;
          const wentPastGo = passedGo(currentPlayer.position, newPosition);

          if (wentPastGo) {
            updatedState = {
              ...updatedState,
              players: updatedState.players.map(p =>
                p.id === currentPlayer.id
                  ? { ...p, money: p.money + GO_SALARY }
                  : p
              ),
              log: addLog(
                updatedState,
                currentPlayer.id,
                currentPlayer.name,
                '出狱',
                `掷出双数 ${dice[0]}+${dice[1]} 成功出狱！经过起点获得 ¥${GO_SALARY}`
              ),
            };
          } else {
            updatedState = {
              ...updatedState,
              log: addLog(
                updatedState,
                currentPlayer.id,
                currentPlayer.name,
                '出狱',
                `掷出双数 ${dice[0]}+${dice[1]} 成功出狱！`
              ),
            };
          }
        } else {
          // 强制出狱（3回合后）
          updatedState = {
            ...updatedState,
            log: addLog(
              updatedState,
              currentPlayer.id,
              currentPlayer.name,
              '强制出狱',
              `监狱已满 ${3} 回合，强制支付 ¥50 出狱`,
              -50
            ),
          };
        }

        // 确定新位置的 pendingCellAction
        const playerAfterMove = updatedState.players.find(p => p.id === currentPlayer.id)!;
        const pendingAction = determineCellAction(playerAfterMove.position, currentPlayer.id, updatedState);
        updatedState = {
          ...updatedState,
          pendingCellAction: pendingAction,
          phase: GamePhase.CELL_ACTION,
        };
      } else {
        // 出狱失败，留在监狱
        updatedState = {
          ...updatedState,
          pendingCellAction: null,
          phase: GamePhase.POST_ACTION,
          log: addLog(
            updatedState,
            currentPlayer.id,
            currentPlayer.name,
            '监狱',
            `未掷出双数，继续留在监狱（第 ${currentPlayer.jailTurns + 1}/3 回合）`
          ),
        };
      }

      set({ gameState: updatedState });
      return;
    }

    // 正常移动
    const oldPosition = currentPlayer.position;
    const newPosition = calculateNewPosition(oldPosition, total);
    const wentPastGo = passedGo(oldPosition, newPosition);

    // 更新玩家位置
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, position: newPosition }
          : p
      ),
    };

    // 经过起点获得 ¥200
    if (wentPastGo) {
      updatedState = {
        ...updatedState,
        players: updatedState.players.map(p =>
          p.id === currentPlayer.id
            ? { ...p, money: p.money + GO_SALARY }
            : p
        ),
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '经过起点',
          `经过起点，获得 ¥${GO_SALARY}`,
          GO_SALARY
        ),
      };
    }

    // 确定 pendingCellAction
    const pendingAction = determineCellAction(newPosition, currentPlayer.id, updatedState);
    updatedState = {
      ...updatedState,
      pendingCellAction: pendingAction,
      phase: GamePhase.CELL_ACTION,
    };

    set({ gameState: updatedState });
  },

  // ==================== 处理到达格子后的事件 ====================
  handleCellAction: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action) {
      // 无需处理的事件，直接进入 POST_ACTION
      set({
        gameState: { ...gameState, phase: GamePhase.POST_ACTION },
      });
      return;
    }

    let updatedState = { ...gameState };

    switch (action.type) {
      case 'buy':
        // 等待玩家选择购买或跳过，phase 保持 CELL_ACTION
        // UI 应该弹出购买对话框
        break;

      case 'rent':
        // 自动扣租在 payRent 中处理
        break;

      case 'tax':
        // 自动扣税在 payTax 中处理
        break;

      case 'card': {
        // 抽卡
        const cell = BOARD_CELLS[currentPlayer.position];
        const deckType = cell?.type === CellType.CHANCE ? 'chance' : 'community_chest';
        const { card, newGameState } = drawCard(deckType, updatedState);
        updatedState = newGameState;

        // 保存卡片到 pendingCellAction
        updatedState = {
          ...updatedState,
          pendingCellAction: { ...action, card },
          lastCardDrawn: card,
        };
        // 卡片效果在 handleCardEffect 中处理
        break;
      }

      case 'go_to_jail': {
        updatedState = sendToJail(currentPlayer.id, updatedState);
        updatedState = {
          ...updatedState,
          phase: GamePhase.POST_ACTION,
          pendingCellAction: null,
          log: addLog(
            updatedState,
            currentPlayer.id,
            currentPlayer.name,
            '入狱',
            '被送入监狱！'
          ),
        };
        break;
      }

      case 'go':
        // 经过起点已在移动时处理
        updatedState = {
          ...updatedState,
          phase: GamePhase.POST_ACTION,
          pendingCellAction: null,
        };
        break;

      case 'jail':
        // 只是探视
        updatedState = {
          ...updatedState,
          phase: GamePhase.POST_ACTION,
          pendingCellAction: null,
        };
        break;
    }

    set({ gameState: updatedState });
  },

  // ==================== 购买地产 ====================
  buyProperty: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action || action.type !== 'buy' || !action.propertyId) return;

    const propDef = PROPERTIES.find(p => p.id === action.propertyId);
    if (!propDef) return;

    // 检查玩家是否有足够金钱
    if (currentPlayer.money < propDef.price) return;

    let updatedState = { ...gameState };

    // 扣除金钱
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p =>
        p.id === currentPlayer.id
          ? {
              ...p,
              money: p.money - propDef.price,
              properties: [...p.properties, action.propertyId!],
            }
          : p
      ),
    };

    // 设置地产所有者
    updatedState = {
      ...updatedState,
      properties: {
        ...updatedState.properties,
        [action.propertyId!]: {
          ...updatedState.properties[action.propertyId!],
          ownerId: currentPlayer.id,
        },
      },
    };

    updatedState = {
      ...updatedState,
      phase: GamePhase.POST_ACTION,
      pendingCellAction: null,
      log: addLog(
        updatedState,
        currentPlayer.id,
        currentPlayer.name,
        '购买地产',
        `购买了 ${propDef.name}，花费 ¥${propDef.price}`,
        -propDef.price
      ),
    };

    set({ gameState: updatedState });
  },

  // ==================== 跳过购买 ====================
  skipBuyProperty: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action || action.type !== 'buy' || !action.propertyId) return;

    const propDef = PROPERTIES.find(p => p.id === action.propertyId);

    set({
      gameState: {
        ...gameState,
        phase: GamePhase.AUCTION,
        auction: action.propertyId
          ? {
              propertyId: action.propertyId,
              currentBid: 0,
              currentBidderId: null,
              participants: gameState.players
                .filter(p => p.status !== PlayerStatus.BANKRUPT)
                .map(p => p.id),
              startingPlayerId: currentPlayer.id,
            }
          : null,
        pendingCellAction: null,
        log: addLog(
          gameState,
          currentPlayer.id,
          currentPlayer.name,
          '跳过购买',
          `放弃购买 ${propDef?.name ?? '未知地产'}，进入拍卖`
        ),
      },
    });
  },

  // ==================== 支付租金 ====================
  payRent: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action || action.type !== 'rent' || !action.propertyId || !action.creditorId) return;

    const rentAmount = action.amount ?? 0;
    const propDef = PROPERTIES.find(p => p.id === action.propertyId);
    const creditor = gameState.players.find(p => p.id === action.creditorId);

    let updatedState = { ...gameState };

    // 扣除当前玩家金钱
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p => {
        if (p.id === currentPlayer.id) {
          return { ...p, money: p.money - rentAmount };
        }
        if (p.id === action.creditorId) {
          return { ...p, money: p.money + rentAmount };
        }
        return p;
      }),
    };

    // 检查是否破产
    if (currentPlayer.money - rentAmount < 0) {
      updatedState = handleBankruptcy(currentPlayer.id, action.creditorId, updatedState);
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '破产',
          `无法支付 ${propDef?.name ?? ''} 的租金 ¥${rentAmount}，破产！`
        ),
      };
    } else {
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '支付租金',
          `向 ${creditor?.name ?? '未知'} 支付 ${propDef?.name ?? ''} 租金 ¥${rentAmount}`,
          -rentAmount
        ),
      };
    }

    set({ gameState: updatedState });
  },

  // ==================== 支付税收 ====================
  payTax: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action || action.type !== 'tax' || !action.amount) return;

    const taxAmount = action.amount;
    const cell = BOARD_CELLS[currentPlayer.position];
    const taxName = cell?.name ?? '税收';

    let updatedState = { ...gameState };

    // 扣除金钱
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, money: p.money - taxAmount }
          : p
      ),
    };

    // 检查是否破产
    if (currentPlayer.money - taxAmount < 0) {
      updatedState = handleBankruptcy(currentPlayer.id, null, updatedState);
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '破产',
          `无法支付${taxName} ¥${taxAmount}，破产！`
        ),
      };
    } else {
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '缴税',
          `支付${taxName} ¥${taxAmount}`,
          -taxAmount
        ),
      };
    }

    set({ gameState: updatedState });
  },

  // ==================== 处理卡片效果 ====================
  handleCardEffect: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    const action = gameState.pendingCellAction;
    if (!action || action.type !== 'card' || !action.card) return;

    const card = action.card;
    let updatedState = { ...gameState };

    // 执行卡片效果
    updatedState = executeCardEffect(card, currentPlayer.id, updatedState, gameState.diceValues);

    // 如果是出狱免费卡，不需要额外处理（executeCardEffect 已经增加卡片数）
    // 如果是移动类卡片，需要检查新位置
    const playerAfterEffect = updatedState.players.find(p => p.id === currentPlayer.id)!;

    // 检查是否入狱
    if (playerAfterEffect.status === PlayerStatus.IN_JAIL) {
      updatedState = {
        ...updatedState,
        phase: GamePhase.POST_ACTION,
        pendingCellAction: null,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '卡片效果',
          `${card.description}，被送入监狱！`
        ),
      };
    } else if (
      card.effectType === 'MOVE_TO' ||
      card.effectType === 'MOVE_TO_NEAREST' ||
      card.effectType === 'MOVE_BACK'
    ) {
      // 移动类卡片，检查新位置是否有需要处理的事件
      const newAction = determineCellAction(playerAfterEffect.position, currentPlayer.id, updatedState);
      updatedState = {
        ...updatedState,
        pendingCellAction: newAction,
        phase: newAction ? GamePhase.CELL_ACTION : GamePhase.POST_ACTION,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '卡片效果',
          card.description
        ),
      };
    } else {
      // 金钱类卡片，检查是否破产
      if (playerAfterEffect.money < 0) {
        updatedState = handleBankruptcy(currentPlayer.id, null, updatedState);
        updatedState = {
          ...updatedState,
          phase: GamePhase.POST_ACTION,
          pendingCellAction: null,
          log: addLog(
            updatedState,
            currentPlayer.id,
            currentPlayer.name,
            '破产',
            `${card.description}，破产！`
          ),
        };
      } else {
        updatedState = {
          ...updatedState,
          phase: GamePhase.POST_ACTION,
          pendingCellAction: null,
          log: addLog(
            updatedState,
            currentPlayer.id,
            currentPlayer.name,
            '卡片效果',
            card.description
          ),
        };
      }
    }

    set({ gameState: updatedState });
  },

  // ==================== 监狱：支付出狱 ====================
  payJailFee: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    let updatedState = attemptJailExitWithPay(currentPlayer.id, gameState);

    // 检查是否成功出狱
    const playerAfter = updatedState.players.find(p => p.id === currentPlayer.id)!;
    if (playerAfter.status === PlayerStatus.ACTIVE) {
      updatedState = {
        ...updatedState,
        phase: GamePhase.WAITING_ROLL,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '支付出狱',
          `支付 ¥50 出狱`,
          -50
        ),
      };
    }

    set({ gameState: updatedState });
  },

  // ==================== 监狱：使用出狱卡 ====================
  useJailCard: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    let updatedState = attemptJailExitWithCard(currentPlayer.id, gameState);

    // 检查是否成功出狱
    const playerAfter = updatedState.players.find(p => p.id === currentPlayer.id)!;
    if (playerAfter.status === PlayerStatus.ACTIVE) {
      updatedState = {
        ...updatedState,
        phase: GamePhase.WAITING_ROLL,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '使用出狱卡',
          '使用出狱免费卡出狱！'
        ),
      };
    }

    set({ gameState: updatedState });
  },

  // ==================== 结束回合 ====================
  endTurn: () => {
    const { gameState } = get();
    const currentPlayer = get().getCurrentPlayer();
    if (!currentPlayer) return;

    let updatedState = { ...gameState };

    // 重置 doublesCount
    updatedState = {
      ...updatedState,
      players: updatedState.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, doublesCount: 0 }
          : p
      ),
    };

    // 如果掷了双数且不在监狱中，可以再掷一次
    if (gameState.isDoubles && currentPlayer.status !== PlayerStatus.IN_JAIL) {
      updatedState = {
        ...updatedState,
        phase: GamePhase.WAITING_ROLL,
        log: addLog(
          updatedState,
          currentPlayer.id,
          currentPlayer.name,
          '双数再掷',
          '掷出双数，可以再掷一次！'
        ),
      };
      set({ gameState: updatedState });
      return;
    }

    // 找到下一个活跃玩家
    const activePlayers = updatedState.players.filter(
      p => p.status !== PlayerStatus.BANKRUPT
    );

    if (activePlayers.length <= 1) {
      // 游戏结束
      updatedState = {
        ...updatedState,
        phase: GamePhase.GAME_OVER,
        log: addLog(
          updatedState,
          activePlayers[0]?.id ?? null,
          activePlayers[0]?.name ?? '',
          '游戏结束',
          `${activePlayers[0]?.name ?? '未知'} 获胜！`
        ),
      };
      set({ gameState: updatedState });
      return;
    }

    // 找到下一个玩家的索引
    const currentOrder = currentPlayer.order;
    let nextPlayer: Player | undefined;

    // 从当前玩家的下一个位置开始找
    for (let i = 1; i <= updatedState.players.length; i++) {
      const candidate = updatedState.players.find(
        p => p.order === (currentOrder + i) % updatedState.players.length
      );
      if (candidate && candidate.status !== PlayerStatus.BANKRUPT) {
        nextPlayer = candidate;
        break;
      }
    }

    if (!nextPlayer) {
      set({ gameState: updatedState });
      return;
    }

    // 检查是否新一轮（回到第一个活跃玩家）
    const firstActivePlayer = activePlayers.reduce((min, p) =>
      p.order < min.order ? p : min
    );
    const newRoundNumber =
      nextPlayer.order <= currentOrder
        ? updatedState.roundNumber + 1
        : updatedState.roundNumber;

    updatedState = {
      ...updatedState,
      currentPlayerId: nextPlayer.id,
      phase: GamePhase.WAITING_ROLL,
      roundNumber: newRoundNumber,
      pendingCellAction: null,
      diceValues: [0, 0],
      isDoubles: false,
    };

    set({ gameState: updatedState });
  },

  // ==================== 查询方法 ====================
  getCurrentPlayer: () => {
    const { gameState } = get();
    if (!gameState.currentPlayerId) return undefined;
    return gameState.players.find(p => p.id === gameState.currentPlayerId);
  },

  getActivePlayers: () => {
    const { gameState } = get();
    return gameState.players.filter(p => p.status !== PlayerStatus.BANKRUPT);
  },

  getPropertyState: (propertyId: string) => {
    const { gameState } = get();
    return gameState.properties[propertyId];
  },
}));
