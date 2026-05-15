/**
 * 游戏逻辑模块 - 统一导出
 */

// 骰子逻辑
export { rollDice, isDoubles, sumDice } from './dice';

// 移动逻辑
export { calculateNewPosition, passedGo, getMovementPath } from './movement';

// 租金计算
export { calculateRent, ownsFullColorGroup } from './rent';

// 建造逻辑
export { getBuildableProperties, buildHouse, sellHouse } from './building';
export type { BuildablePropertyInfo } from './building';

// 破产逻辑
export { isBankrupt, handleBankruptcy, calculateNetWorth } from './bankruptcy';

// 监狱逻辑
export {
  sendToJail,
  attemptJailExitWithDice,
  attemptJailExitWithPay,
  attemptJailExitWithCard,
  checkJailForcedExit,
} from './jail';

// 卡片逻辑
export { drawCard, executeCardEffect } from './cards';
