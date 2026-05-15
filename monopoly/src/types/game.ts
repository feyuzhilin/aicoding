// ==================== 枚举类型 ====================

export enum CellType {
  GO = 'GO',
  PROPERTY = 'PROPERTY',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
  CHANCE = 'CHANCE',
  COMMUNITY_CHEST = 'COMMUNITY_CHEST',
  TAX = 'TAX',
  JAIL = 'JAIL',
  FREE_PARKING = 'FREE_PARKING',
  GO_TO_JAIL = 'GO_TO_JAIL',
}

export enum ColorGroup {
  BROWN = 'BROWN',
  LIGHT_BLUE = 'LIGHT_BLUE',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  DARK_BLUE = 'DARK_BLUE',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
}

export enum GamePhase {
  SETUP = 'SETUP',
  WAITING_ROLL = 'WAITING_ROLL',
  ROLLING = 'ROLLING',
  MOVING = 'MOVING',
  CELL_ACTION = 'CELL_ACTION',
  POST_ACTION = 'POST_ACTION',
  AUCTION = 'AUCTION',
  GAME_OVER = 'GAME_OVER',
}

export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  IN_JAIL = 'IN_JAIL',
  BANKRUPT = 'BANKRUPT',
}

export enum CardEffectType {
  GAIN_MONEY = 'GAIN_MONEY',
  LOSE_MONEY = 'LOSE_MONEY',
  MOVE_TO = 'MOVE_TO',
  MOVE_TO_NEAREST = 'MOVE_TO_NEAREST',
  GO_TO_JAIL = 'GO_TO_JAIL',
  GET_OUT_OF_JAIL = 'GET_OUT_OF_JAIL',
  GAIN_FROM_PLAYERS = 'GAIN_FROM_PLAYERS',
  PAY_PER_HOUSE = 'PAY_PER_HOUSE',
  MOVE_BACK = 'MOVE_BACK',
}

// ==================== 类型别名 ====================

export type PlayerId = string;
export type ModalType =
  | 'buy_property'
  | 'auction'
  | 'trade'
  | 'card_effect'
  | 'bankruptcy'
  | 'game_over'
  | 'jail_choice'
  | 'property_detail';

// ==================== 地产相关 ====================

export interface PropertyDef {
  id: string;
  name: string;
  cellIndex: number;
  type: CellType.PROPERTY | CellType.RAILROAD | CellType.UTILITY;
  colorGroup: ColorGroup;
  price: number;
  baseRent: number;
  /** [基础, 1房, 2房, 3房, 4房, 酒店] */
  rentByHouse: [number, number, number, number, number, number];
  buildCost: number;
  mortgageValue: number;
}

export interface PropertyState {
  propertyId: string;
  ownerId: PlayerId | null;
  houses: number;
  hasHotel: boolean;
  isMortgaged: boolean;
}

// ==================== 卡片相关 ====================

export interface CardDef {
  id: string;
  deck: 'chance' | 'community_chest';
  description: string;
  effectType: CardEffectType;
  effectValue: number;
  effectTarget?: string;
}

// ==================== 玩家相关 ====================

export interface Player {
  id: PlayerId;
  name: string;
  avatar: string;
  color: string;
  money: number;
  position: number;
  status: PlayerStatus;
  properties: string[];
  jailFreeCards: number;
  jailTurns: number;
  doublesCount: number;
  order: number;
}

// ==================== 游戏状态 ====================

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerId: PlayerId | null;
  properties: Record<string, PropertyState>;
  chanceDeck: CardDef[];
  communityChestDeck: CardDef[];
  diceValues: [number, number];
  isDoubles: boolean;
  auction: AuctionState | null;
  log: GameLogEntry[];
  roundNumber: number;
  lastCardDrawn: CardDef | null;
  pendingCellAction: PendingCellAction | null;
}

export interface AuctionState {
  propertyId: string;
  currentBid: number;
  currentBidderId: PlayerId | null;
  participants: PlayerId[];
  startingPlayerId: PlayerId;
}

export interface PendingCellAction {
  type: 'buy' | 'rent' | 'tax' | 'card' | 'jail' | 'go_to_jail' | 'go';
  propertyId?: string;
  amount?: number;
  card?: CardDef;
  creditorId?: PlayerId;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  playerId: PlayerId | null;
  playerName: string;
  action: string;
  detail: string;
  moneyChange?: number;
}

// ==================== UI 状态 ====================

export interface UIState {
  activeModal: ModalType | null;
  modalData: Record<string, unknown>;
  selectedCellIndex: number | null;
  showBuildPanel: boolean;
  showTradePanel: boolean;
  toasts: ToastMessage[];
  diceRolling: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

// ==================== 配置 ====================

export interface GameConfig {
  playerCount: number;
  playerNames: string[];
  playerColors: string[];
}

export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
export const PLAYER_AVATARS = ['🚗', '🚢', '🎩', '🐕'];
export const INITIAL_MONEY = 1500;
export const GO_SALARY = 200;
export const JAIL_FEE = 50;
export const MAX_JAIL_TURNS = 3;
export const BOARD_SIZE = 40;
