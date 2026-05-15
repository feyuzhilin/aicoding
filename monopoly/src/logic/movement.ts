/**
 * 移动逻辑 - 纯函数
 */

import { BOARD_SIZE } from '../types/game';

/** 计算新位置，在 0-39 之间循环 */
export function calculateNewPosition(current: number, steps: number): number {
  return ((current + steps) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
}

/** 判断从 from 移动到 to 是否经过了起点（位置 0） */
export function passedGo(from: number, to: number): boolean {
  // 如果 to >= from，没有经过起点（正常前进）
  // 如果 to < from，说明经过了起点（绕了一圈）
  return to < from;
}

/** 获取从 from 到 to 的逐格移动路径（包含 from 和 to） */
export function getMovementPath(from: number, to: number): number[] {
  const path: number[] = [];
  let current = from;

  // 如果 from === to，返回 [from]
  if (from === to) {
    return [from];
  }

  do {
    path.push(current);
    current = (current + 1) % BOARD_SIZE;
  } while (current !== to);

  path.push(to);
  return path;
}
