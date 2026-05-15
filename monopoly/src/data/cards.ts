import { CardDef, CardEffectType } from '../types/game';

export const CHANCE_CARDS: CardDef[] = [
  { id: 'ch1', deck: 'chance', description: '银行付你股息 ¥50', effectType: CardEffectType.GAIN_MONEY, effectValue: 50 },
  { id: 'ch2', deck: 'chance', description: '前进到起点，收取 ¥200', effectType: CardEffectType.MOVE_TO, effectValue: 0 },
  { id: 'ch3', deck: 'chance', description: '前进到北京铁路', effectType: CardEffectType.MOVE_TO, effectValue: 35 },
  { id: 'ch4', deck: 'chance', description: '直接入狱！', effectType: CardEffectType.GO_TO_JAIL, effectValue: 0 },
  { id: 'ch5', deck: 'chance', description: '房屋维修费：每栋房屋 ¥25，每座酒店 ¥100', effectType: CardEffectType.PAY_PER_HOUSE, effectValue: 0 },
  { id: 'ch6', deck: 'chance', description: '你被选为董事会主席，获得 ¥150', effectType: CardEffectType.GAIN_MONEY, effectValue: 150 },
  { id: 'ch7', deck: 'chance', description: '超速罚款 ¥50', effectType: CardEffectType.LOSE_MONEY, effectValue: 50 },
  { id: 'ch8', deck: 'chance', description: '前进到南京路', effectType: CardEffectType.MOVE_TO, effectValue: 6 },
  { id: 'ch9', deck: 'chance', description: '你的贷款到期，收取 ¥150', effectType: CardEffectType.GAIN_MONEY, effectValue: 150 },
  { id: 'ch10', deck: 'chance', description: '前进到最近的铁路', effectType: CardEffectType.MOVE_TO_NEAREST, effectValue: 0, effectTarget: 'railroad' },
  { id: 'ch11', deck: 'chance', description: '后退 3 步', effectType: CardEffectType.MOVE_BACK, effectValue: 3 },
  { id: 'ch12', deck: 'chance', description: '前进到最近的公用事业', effectType: CardEffectType.MOVE_TO_NEAREST, effectValue: 0, effectTarget: 'utility' },
  { id: 'ch13', deck: 'chance', description: '缴纳学费 ¥50', effectType: CardEffectType.LOSE_MONEY, effectValue: 50 },
  { id: 'ch14', deck: 'chance', description: '前进到上海路', effectType: CardEffectType.MOVE_TO, effectValue: 8 },
  { id: 'ch15', deck: 'chance', description: '你在选美比赛中获奖，获得 ¥100', effectType: CardEffectType.GAIN_MONEY, effectValue: 100 },
  { id: 'ch16', deck: 'chance', description: '出狱免费卡！', effectType: CardEffectType.GET_OUT_OF_JAIL, effectValue: 0 },
];

export const COMMUNITY_CHEST_CARDS: CardDef[] = [
  { id: 'cc1', deck: 'community_chest', description: '银行错误，获得 ¥200', effectType: CardEffectType.GAIN_MONEY, effectValue: 200 },
  { id: 'cc2', deck: 'community_chest', description: '看病花费 ¥100', effectType: CardEffectType.LOSE_MONEY, effectValue: 100 },
  { id: 'cc3', deck: 'community_chest', description: '前进到起点，收取 ¥200', effectType: CardEffectType.MOVE_TO, effectValue: 0 },
  { id: 'cc4', deck: 'community_chest', description: '直接入狱！', effectType: CardEffectType.GO_TO_JAIL, effectValue: 0 },
  { id: 'cc5', deck: 'community_chest', description: '节日基金分红，获得 ¥100', effectType: CardEffectType.GAIN_MONEY, effectValue: 100 },
  { id: 'cc6', deck: 'community_chest', description: '保险到期，获得 ¥100', effectType: CardEffectType.GAIN_MONEY, effectValue: 100 },
  { id: 'cc7', deck: 'community_chest', description: '缴纳医院费用 ¥100', effectType: CardEffectType.LOSE_MONEY, effectValue: 100 },
  { id: 'cc8', deck: 'community_chest', description: '继承遗产 ¥100', effectType: CardEffectType.GAIN_MONEY, effectValue: 100 },
  { id: 'cc9', deck: 'community_chest', description: '缴纳所得税 ¥150', effectType: CardEffectType.LOSE_MONEY, effectValue: 150 },
  { id: 'cc10', deck: 'community_chest', description: '前进到武汉路', effectType: CardEffectType.MOVE_TO, effectValue: 16 },
  { id: 'cc11', deck: 'community_chest', description: '支付学费 ¥50', effectType: CardEffectType.LOSE_MONEY, effectValue: 50 },
  { id: 'cc12', deck: 'community_chest', description: '你的生日！每位玩家给你 ¥25', effectType: CardEffectType.GAIN_FROM_PLAYERS, effectValue: 25 },
  { id: 'cc13', deck: 'community_chest', description: '出狱免费卡！', effectType: CardEffectType.GET_OUT_OF_JAIL, effectValue: 0 },
  { id: 'cc14', deck: 'community_chest', description: '缴纳贫困税 ¥100', effectType: CardEffectType.LOSE_MONEY, effectValue: 100 },
  { id: 'cc15', deck: 'community_chest', description: '前进到广州路', effectType: CardEffectType.MOVE_TO, effectValue: 11 },
  { id: 'cc16', deck: 'community_chest', description: '获得 ¥50', effectType: CardEffectType.GAIN_MONEY, effectValue: 50 },
];

/** 洗牌 */
export function shuffleDeck<T>(deck: T[]): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
