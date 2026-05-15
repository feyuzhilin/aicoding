import { CellType } from '../types/game';

export interface BoardCell {
  index: number;
  name: string;
  type: CellType;
  propertyId?: string;
}

export const BOARD_CELLS: BoardCell[] = [
  { index: 0, name: '起点', type: CellType.GO },
  { index: 1, name: '台北路', type: CellType.PROPERTY, propertyId: 'taipei_road' },
  { index: 2, name: '命运', type: CellType.COMMUNITY_CHEST },
  { index: 3, name: '高雄路', type: CellType.PROPERTY, propertyId: 'kaohsiung_road' },
  { index: 4, name: '所得税', type: CellType.TAX },
  { index: 5, name: '东方铁路', type: CellType.RAILROAD, propertyId: 'eastern_railroad' },
  { index: 6, name: '南京路', type: CellType.PROPERTY, propertyId: 'nanjing_road' },
  { index: 7, name: '机会', type: CellType.CHANCE },
  { index: 8, name: '上海路', type: CellType.PROPERTY, propertyId: 'shanghai_road' },
  { index: 9, name: '杭州路', type: CellType.PROPERTY, propertyId: 'hangzhou_road' },
  { index: 10, name: '监狱', type: CellType.JAIL },
  { index: 11, name: '广州路', type: CellType.PROPERTY, propertyId: 'guangzhou_road' },
  { index: 12, name: '电力公司', type: CellType.UTILITY, propertyId: 'electric_company' },
  { index: 13, name: '深圳路', type: CellType.PROPERTY, propertyId: 'shenzhen_road' },
  { index: 14, name: '成都路', type: CellType.PROPERTY, propertyId: 'chengdu_road' },
  { index: 15, name: '南京铁路', type: CellType.RAILROAD, propertyId: 'nanjing_railroad' },
  { index: 16, name: '武汉路', type: CellType.PROPERTY, propertyId: 'wuhan_road' },
  { index: 17, name: '命运', type: CellType.COMMUNITY_CHEST },
  { index: 18, name: '重庆路', type: CellType.PROPERTY, propertyId: 'chongqing_road' },
  { index: 19, name: '天津路', type: CellType.PROPERTY, propertyId: 'tianjin_road' },
  { index: 20, name: '免费停车', type: CellType.FREE_PARKING },
  { index: 21, name: '西安路', type: CellType.PROPERTY, propertyId: 'xian_road' },
  { index: 22, name: '机会', type: CellType.CHANCE },
  { index: 23, name: '长沙路', type: CellType.PROPERTY, propertyId: 'changsha_road' },
  { index: 24, name: '青岛路', type: CellType.PROPERTY, propertyId: 'qingdao_road' },
  { index: 25, name: '汉口铁路', type: CellType.RAILROAD, propertyId: 'hankou_railroad' },
  { index: 26, name: '苏州路', type: CellType.PROPERTY, propertyId: 'suzhou_road' },
  { index: 27, name: '厦门路', type: CellType.PROPERTY, propertyId: 'xiamen_road' },
  { index: 28, name: '自来水公司', type: CellType.UTILITY, propertyId: 'water_company' },
  { index: 29, name: '大连路', type: CellType.PROPERTY, propertyId: 'dalian_road' },
  { index: 30, name: '入狱', type: CellType.GO_TO_JAIL },
  { index: 31, name: '昆明路', type: CellType.PROPERTY, propertyId: 'kunming_road' },
  { index: 32, name: '郑州路', type: CellType.PROPERTY, propertyId: 'zhengzhou_road' },
  { index: 33, name: '命运', type: CellType.COMMUNITY_CHEST },
  { index: 34, name: '沈阳路', type: CellType.PROPERTY, propertyId: 'shenyang_road' },
  { index: 35, name: '北京铁路', type: CellType.RAILROAD, propertyId: 'beijing_railroad' },
  { index: 36, name: '机会', type: CellType.CHANCE },
  { index: 37, name: '哈尔滨路', type: CellType.PROPERTY, propertyId: 'harbin_road' },
  { index: 38, name: '奢侈税', type: CellType.TAX },
  { index: 39, name: '北京路', type: CellType.PROPERTY, propertyId: 'beijing_road' },
];

export const CELL_MAP = Object.fromEntries(BOARD_CELLS.map(c => [c.index, c]));

/** 获取格子所在的棋盘边 */
export function getCellSide(index: number): 'bottom' | 'left' | 'top' | 'right' {
  if (index <= 10) return 'bottom';
  if (index <= 20) return 'left';
  if (index <= 30) return 'top';
  return 'right';
}

/** 获取格子在该边上的位置索引 (0=角落, 1-9=中间) */
export function getCellIndexOnSide(index: number): number {
  if (index <= 10) return 10 - index;
  if (index <= 20) return index - 10;
  if (index <= 30) return index - 20;
  return 30 - index;
}

/** 获取格子在 CSS Grid 中的 [row, col] 位置 */
export function getCellGridPosition(index: number): [number, number] {
  const side = getCellSide(index);
  const pos = getCellIndexOnSide(index);
  switch (side) {
    case 'bottom': return [10, 10 - pos];
    case 'left': return [10 - pos, 0];
    case 'top': return [0, pos];
    case 'right': return [pos, 10];
  }
}
