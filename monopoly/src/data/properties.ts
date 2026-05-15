import { PropertyDef, ColorGroup, CellType } from '../types/game';

export const PROPERTIES: PropertyDef[] = [
  // 棕色组
  { id: 'taipei_road', name: '台北路', cellIndex: 1, type: CellType.PROPERTY, colorGroup: ColorGroup.BROWN, price: 60, baseRent: 2, rentByHouse: [2, 10, 30, 90, 160, 250], buildCost: 50, mortgageValue: 30 },
  { id: 'kaohsiung_road', name: '高雄路', cellIndex: 3, type: CellType.PROPERTY, colorGroup: ColorGroup.BROWN, price: 60, baseRent: 4, rentByHouse: [4, 20, 60, 180, 320, 450], buildCost: 50, mortgageValue: 30 },

  // 浅蓝组
  { id: 'nanjing_road', name: '南京路', cellIndex: 6, type: CellType.PROPERTY, colorGroup: ColorGroup.LIGHT_BLUE, price: 100, baseRent: 6, rentByHouse: [6, 30, 90, 270, 400, 550], buildCost: 50, mortgageValue: 50 },
  { id: 'shanghai_road', name: '上海路', cellIndex: 8, type: CellType.PROPERTY, colorGroup: ColorGroup.LIGHT_BLUE, price: 100, baseRent: 6, rentByHouse: [6, 30, 90, 270, 400, 550], buildCost: 50, mortgageValue: 50 },
  { id: 'hangzhou_road', name: '杭州路', cellIndex: 9, type: CellType.PROPERTY, colorGroup: ColorGroup.LIGHT_BLUE, price: 120, baseRent: 8, rentByHouse: [8, 40, 100, 300, 450, 600], buildCost: 50, mortgageValue: 60 },

  // 粉色组
  { id: 'guangzhou_road', name: '广州路', cellIndex: 11, type: CellType.PROPERTY, colorGroup: ColorGroup.PINK, price: 140, baseRent: 10, rentByHouse: [10, 50, 150, 450, 625, 750], buildCost: 100, mortgageValue: 70 },
  { id: 'shenzhen_road', name: '深圳路', cellIndex: 13, type: CellType.PROPERTY, colorGroup: ColorGroup.PINK, price: 140, baseRent: 10, rentByHouse: [10, 50, 150, 450, 625, 750], buildCost: 100, mortgageValue: 70 },
  { id: 'chengdu_road', name: '成都路', cellIndex: 14, type: CellType.PROPERTY, colorGroup: ColorGroup.PINK, price: 160, baseRent: 12, rentByHouse: [12, 60, 180, 500, 700, 900], buildCost: 100, mortgageValue: 80 },

  // 橙色组
  { id: 'wuhan_road', name: '武汉路', cellIndex: 16, type: CellType.PROPERTY, colorGroup: ColorGroup.ORANGE, price: 180, baseRent: 14, rentByHouse: [14, 70, 200, 550, 750, 950], buildCost: 100, mortgageValue: 90 },
  { id: 'chongqing_road', name: '重庆路', cellIndex: 18, type: CellType.PROPERTY, colorGroup: ColorGroup.ORANGE, price: 180, baseRent: 14, rentByHouse: [14, 70, 200, 550, 750, 950], buildCost: 100, mortgageValue: 90 },
  { id: 'tianjin_road', name: '天津路', cellIndex: 19, type: CellType.PROPERTY, colorGroup: ColorGroup.ORANGE, price: 200, baseRent: 16, rentByHouse: [16, 80, 220, 600, 800, 1000], buildCost: 100, mortgageValue: 100 },

  // 红色组
  { id: 'xian_road', name: '西安路', cellIndex: 21, type: CellType.PROPERTY, colorGroup: ColorGroup.RED, price: 220, baseRent: 18, rentByHouse: [18, 90, 250, 700, 875, 1050], buildCost: 150, mortgageValue: 110 },
  { id: 'changsha_road', name: '长沙路', cellIndex: 23, type: CellType.PROPERTY, colorGroup: ColorGroup.RED, price: 220, baseRent: 18, rentByHouse: [18, 90, 250, 700, 875, 1050], buildCost: 150, mortgageValue: 110 },
  { id: 'qingdao_road', name: '青岛路', cellIndex: 24, type: CellType.PROPERTY, colorGroup: ColorGroup.RED, price: 240, baseRent: 20, rentByHouse: [20, 100, 300, 750, 925, 1100], buildCost: 150, mortgageValue: 120 },

  // 黄色组
  { id: 'suzhou_road', name: '苏州路', cellIndex: 26, type: CellType.PROPERTY, colorGroup: ColorGroup.YELLOW, price: 260, baseRent: 22, rentByHouse: [22, 110, 330, 800, 975, 1150], buildCost: 150, mortgageValue: 130 },
  { id: 'xiamen_road', name: '厦门路', cellIndex: 27, type: CellType.PROPERTY, colorGroup: ColorGroup.YELLOW, price: 260, baseRent: 22, rentByHouse: [22, 110, 330, 800, 975, 1150], buildCost: 150, mortgageValue: 130 },
  { id: 'dalian_road', name: '大连路', cellIndex: 29, type: CellType.PROPERTY, colorGroup: ColorGroup.YELLOW, price: 280, baseRent: 24, rentByHouse: [24, 120, 360, 850, 1025, 1200], buildCost: 150, mortgageValue: 140 },

  // 绿色组
  { id: 'kunming_road', name: '昆明路', cellIndex: 31, type: CellType.PROPERTY, colorGroup: ColorGroup.GREEN, price: 300, baseRent: 26, rentByHouse: [26, 130, 390, 900, 1100, 1275], buildCost: 200, mortgageValue: 150 },
  { id: 'zhengzhou_road', name: '郑州路', cellIndex: 32, type: CellType.PROPERTY, colorGroup: ColorGroup.GREEN, price: 300, baseRent: 26, rentByHouse: [26, 130, 390, 900, 1100, 1275], buildCost: 200, mortgageValue: 150 },
  { id: 'shenyang_road', name: '沈阳路', cellIndex: 34, type: CellType.PROPERTY, colorGroup: ColorGroup.GREEN, price: 320, baseRent: 28, rentByHouse: [28, 150, 450, 1000, 1200, 1400], buildCost: 200, mortgageValue: 160 },

  // 深蓝组
  { id: 'harbin_road', name: '哈尔滨路', cellIndex: 37, type: CellType.PROPERTY, colorGroup: ColorGroup.DARK_BLUE, price: 350, baseRent: 35, rentByHouse: [35, 175, 500, 1100, 1300, 1500], buildCost: 200, mortgageValue: 175 },
  { id: 'beijing_road', name: '北京路', cellIndex: 39, type: CellType.PROPERTY, colorGroup: ColorGroup.DARK_BLUE, price: 400, baseRent: 50, rentByHouse: [50, 200, 600, 1400, 1700, 2000], buildCost: 200, mortgageValue: 200 },

  // 铁路
  { id: 'eastern_railroad', name: '东方铁路', cellIndex: 5, type: CellType.RAILROAD, colorGroup: ColorGroup.RAILROAD, price: 200, baseRent: 25, rentByHouse: [25, 50, 100, 200, 0, 0], buildCost: 0, mortgageValue: 100 },
  { id: 'nanjing_railroad', name: '南京铁路', cellIndex: 15, type: CellType.RAILROAD, colorGroup: ColorGroup.RAILROAD, price: 200, baseRent: 25, rentByHouse: [25, 50, 100, 200, 0, 0], buildCost: 0, mortgageValue: 100 },
  { id: 'hankou_railroad', name: '汉口铁路', cellIndex: 25, type: CellType.RAILROAD, colorGroup: ColorGroup.RAILROAD, price: 200, baseRent: 25, rentByHouse: [25, 50, 100, 200, 0, 0], buildCost: 0, mortgageValue: 100 },
  { id: 'beijing_railroad', name: '北京铁路', cellIndex: 35, type: CellType.RAILROAD, colorGroup: ColorGroup.RAILROAD, price: 200, baseRent: 25, rentByHouse: [25, 50, 100, 200, 0, 0], buildCost: 0, mortgageValue: 100 },

  // 公用事业
  { id: 'electric_company', name: '电力公司', cellIndex: 12, type: CellType.UTILITY, colorGroup: ColorGroup.UTILITY, price: 150, baseRent: 0, rentByHouse: [0, 0, 0, 0, 0, 0], buildCost: 0, mortgageValue: 75 },
  { id: 'water_company', name: '自来水公司', cellIndex: 28, type: CellType.UTILITY, colorGroup: ColorGroup.UTILITY, price: 150, baseRent: 0, rentByHouse: [0, 0, 0, 0, 0, 0], buildCost: 0, mortgageValue: 75 },
];

export const PROPERTY_MAP = Object.fromEntries(PROPERTIES.map(p => [p.id, p]));

export function getPropertyByCellIndex(cellIndex: number): PropertyDef | undefined {
  return PROPERTIES.find(p => p.cellIndex === cellIndex);
}
