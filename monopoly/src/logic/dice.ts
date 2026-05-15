/**
 * 骰子逻辑 - 纯函数
 */

/** 掷两颗骰子，返回 [die1, die2] */
export function rollDice(): [number, number] {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return [die1, die2];
}

/** 判断是否为双数（两个骰子点数相同） */
export function isDoubles(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

/** 计算两颗骰子的总和 */
export function sumDice(dice: [number, number]): number {
  return dice[0] + dice[1];
}
