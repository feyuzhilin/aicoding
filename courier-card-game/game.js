const SAVE_KEY = "ruinCourierSaveV1";

const els = {
  dayStat: document.querySelector("#dayStat"),
  hpStat: document.querySelector("#hpStat"),
  packageStat: document.querySelector("#packageStat"),
  fatigueStat: document.querySelector("#fatigueStat"),
  noiseStat: document.querySelector("#noiseStat"),
  supplyStat: document.querySelector("#supplyStat"),
  seedLabel: document.querySelector("#seedLabel"),
  routeMap: document.querySelector("#routeMap"),
  relicList: document.querySelector("#relicList"),
  message: document.querySelector("#message"),
  combatView: document.querySelector("#combatView"),
  choiceView: document.querySelector("#choiceView"),
  enemyRow: document.querySelector("#enemyRow"),
  hand: document.querySelector("#hand"),
  playerHp: document.querySelector("#playerHp"),
  playerBlock: document.querySelector("#playerBlock"),
  intentText: document.querySelector("#intentText"),
  combatGoal: document.querySelector("#combatGoal"),
  deckCount: document.querySelector("#deckCount"),
  deckPreview: document.querySelector("#deckPreview"),
  logList: document.querySelector("#logList"),
  endTurnBtn: document.querySelector("#endTurnBtn"),
  fleeBtn: document.querySelector("#fleeBtn"),
  newRunBtn: document.querySelector("#newRunBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  importBtn: document.querySelector("#importBtn"),
  saveDialog: document.querySelector("#saveDialog"),
  saveText: document.querySelector("#saveText"),
  copySaveBtn: document.querySelector("#copySaveBtn"),
  downloadSaveBtn: document.querySelector("#downloadSaveBtn"),
  loadTextBtn: document.querySelector("#loadTextBtn"),
  fileInput: document.querySelector("#fileInput"),
};

const cardData = {
  crowbar: { name: "撬棍", cost: 1, type: "attack", text: "造成 7 伤害。", effect: { damage: 7 } },
  crowbar_plus: { name: "撬棍+", cost: 1, type: "attack", text: "造成 10 伤害。", effect: { damage: 10 } },
  quiet_step: { name: "静步", cost: 1, type: "skill", text: "获得 6 护甲，声响 -1。", effect: { block: 6, noise: -1 } },
  quiet_step_plus: { name: "静步+", cost: 1, type: "skill", text: "获得 8 护甲，声响 -2。", effect: { block: 8, noise: -2 } },
  sprint: { name: "冲刺", cost: 1, type: "skill", text: "抽 1 张牌，获得 1 速度。", effect: { draw: 1, speed: 1 } },
  sprint_plus: { name: "冲刺+", cost: 0, type: "skill", text: "抽 1 张牌，获得 1 速度。", effect: { draw: 1, speed: 1 } },
  brace: { name: "架包", cost: 1, type: "skill", text: "获得 8 护甲，包裹 +2%。", effect: { block: 8, package: 2 } },
  brace_plus: { name: "架包+", cost: 1, type: "skill", text: "获得 11 护甲，包裹 +3%。", effect: { block: 11, package: 3 } },
  trade_token: { name: "交易筹码", cost: 1, type: "talk", text: "造成 5 士气伤害，声响 -1。", effect: { damage: 5, noise: -1 } },
  trade_token_plus: { name: "交易筹码+", cost: 1, type: "talk", text: "造成 8 士气伤害，声响 -2。", effect: { damage: 8, noise: -2 } },
  map_reading: { name: "读图", cost: 1, type: "skill", text: "抽 2 张牌。", effect: { draw: 2 } },
  map_reading_plus: { name: "读图+", cost: 0, type: "skill", text: "抽 2 张牌。", effect: { draw: 2 } },
  signal_flare: { name: "信号枪", cost: 2, type: "attack", text: "对所有敌人造成 8 伤害，声响 +2。", effect: { damageAll: 8, noise: 2 } },
  signal_flare_plus: { name: "信号枪+", cost: 2, type: "attack", text: "对所有敌人造成 11 伤害，声响 +1。", effect: { damageAll: 11, noise: 1 } },
  bandage: { name: "绷带", cost: 1, type: "supply", text: "恢复 6 耐久。消耗。", exhaust: true, effect: { heal: 6 } },
  bandage_plus: { name: "绷带+", cost: 1, type: "supply", text: "恢复 10 耐久。消耗。", exhaust: true, effect: { heal: 10 } },
  filter_mask: { name: "滤毒面罩", cost: 1, type: "tool", text: "疲劳 -1，获得 5 护甲。", effect: { fatigue: -1, block: 5 } },
  filter_mask_plus: { name: "滤毒面罩+", cost: 1, type: "tool", text: "疲劳 -2，获得 7 护甲。", effect: { fatigue: -2, block: 7 } },
  decoy: { name: "诱饵罐", cost: 1, type: "tool", text: "敌人本回合伤害 -5，声响 +1。", effect: { weaken: 5, noise: 1 } },
  decoy_plus: { name: "诱饵罐+", cost: 1, type: "tool", text: "敌人本回合伤害 -8。", effect: { weaken: 8 } },
  badge: { name: "旧徽章", cost: 1, type: "talk", text: "造成 6 士气伤害，获得 4 护甲。", effect: { damage: 6, block: 4 } },
  badge_plus: { name: "旧徽章+", cost: 1, type: "talk", text: "造成 9 士气伤害，获得 6 护甲。", effect: { damage: 9, block: 6 } },
  wrench: { name: "扳手", cost: 1, type: "attack", text: "造成 5 伤害，包裹 +3%。", effect: { damage: 5, package: 3 } },
  wrench_plus: { name: "扳手+", cost: 1, type: "attack", text: "造成 8 伤害，包裹 +4%。", effect: { damage: 8, package: 4 } },
  ration: { name: "压缩口粮", cost: 0, type: "supply", text: "补给 +1，疲劳 -1。消耗。", exhaust: true, effect: { supply: 1, fatigue: -1 } },
  ration_plus: { name: "压缩口粮+", cost: 0, type: "supply", text: "补给 +2，疲劳 -1。消耗。", exhaust: true, effect: { supply: 2, fatigue: -1 } },
  ricochet: { name: "跳弹", cost: 1, type: "attack", text: "造成 4 伤害两次。", effect: { damage: 4, hits: 2 } },
  ricochet_plus: { name: "跳弹+", cost: 1, type: "attack", text: "造成 5 伤害三次。", effect: { damage: 5, hits: 3 } },
  barricade: { name: "临时路障", cost: 2, type: "skill", text: "获得 16 护甲。", effect: { block: 16 } },
  barricade_plus: { name: "临时路障+", cost: 2, type: "skill", text: "获得 20 护甲，声响 -1。", effect: { block: 20, noise: -1 } },
  hesitation: { name: "迟缓", cost: 1, type: "wound", text: "什么也不做。来自疲劳。", effect: {} },
};

const rewardPool = [
  "signal_flare",
  "bandage",
  "filter_mask",
  "decoy",
  "badge",
  "wrench",
  "ration",
  "ricochet",
  "barricade",
  "map_reading",
  "sprint",
];

const relicData = {
  old_map: { name: "旧城区地图", text: "路线奖励多一个选择。" },
  silencer: { name: "消音器", text: "每场战斗开始声响 -2。" },
  waterproof_bag: { name: "防水邮袋", text: "每天首次包裹损伤 -4。" },
  brass_badge: { name: "铜质徽章", text: "交涉牌首次使用返还 1 体力。" },
  hand_radio: { name: "手摇电台", text: "事件选项收益更高。" },
};

const enemies = [
  { id: "raider", name: "拦路劫匪", hp: 24, attacks: [6, 8, 10], packageHit: 3 },
  { id: "hound", name: "追踪无人机", hp: 18, attacks: [5, 5, 9], noise: 1 },
  { id: "guard", name: "失序哨兵", hp: 30, attacks: [8, 11], block: 4 },
  { id: "looter", name: "掏包客", hp: 20, attacks: [4, 7], packageHit: 6 },
  { id: "swarm", name: "废巷群影", hp: 16, attacks: [4, 4, 6], count: 2 },
  { id: "broker", name: "黑市债主", hp: 28, attacks: [7, 9], fatigue: 1 },
  { id: "turret", name: "旧式炮塔", hp: 26, attacks: [10, 12], noise: 2 },
  { id: "captain", name: "封锁队长", hp: 42, attacks: [10, 13, 15], block: 6, packageHit: 5 },
];

const eventData = [
  {
    title: "漏雨棚屋",
    body: "雨水正往邮袋里渗。你可以停下修补，也可以赶路。",
    choices: [
      { title: "修补邮袋", text: "消耗 1 补给，包裹 +12%。", effect: { supply: -1, package: 12 } },
      { title: "继续赶路", text: "疲劳 +1，获得一张奖励牌。", effect: { fatigue: 1, reward: true } },
    ],
  },
  {
    title: "避难所广播",
    body: "一段旧广播提到安全路线，但需要手摇电台放大信号。",
    choices: [
      { title: "记录路线", text: "疲劳 -1，声响 -2。", effect: { fatigue: -1, noise: -2 } },
      { title: "拆零件", text: "获得一个工具遗物，包裹 -5%。", effect: { relic: true, package: -5 } },
    ],
  },
  {
    title: "饥饿的孩子",
    body: "几个孩子盯着你的压缩口粮。帮助他们会拖慢行程。",
    choices: [
      { title: "分出补给", text: "补给 -1，获得 1 个遗物。", effect: { supply: -1, relic: true } },
      { title: "绕开巷口", text: "疲劳 +1，声响 -1。", effect: { fatigue: 1, noise: -1 } },
    ],
  },
  {
    title: "坍塌地铁口",
    body: "钢筋挡住了近路。撬开它会引来注意。",
    choices: [
      { title: "强行撬开", text: "声响 +2，跳过下一次事件。", effect: { noise: 2, skip: true } },
      { title: "绕远路", text: "疲劳 +2，恢复 5 耐久。", effect: { fatigue: 2, heal: 5 } },
    ],
  },
];

let state;
let rng = Math.random;

function createRng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function seeded() {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 1000000) / 1000000;
  };
}

function pick(list) {
  return list[Math.floor(rng() * list.length)];
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function newGame() {
  const seed = `RUST-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.floor(Math.random() * 9000 + 1000)}`;
  rng = createRng(seed);
  state = {
    version: 1,
    seed,
    day: 1,
    maxDay: 8,
    hp: 36,
    maxHp: 36,
    packageIntegrity: 100,
    fatigue: 0,
    noise: 0,
    supply: 2,
    route: buildRoute(),
    routeIndex: 0,
    skipNextEvent: false,
    relics: ["waterproof_bag"],
    usedWaterproofToday: false,
    deck: ["crowbar", "crowbar", "quiet_step", "quiet_step", "sprint", "brace", "trade_token", "map_reading", "wrench", "bandage"],
    combat: null,
    phase: "route",
    log: ["接下第 1 件邮包：送往北端避难站。"],
  };
  startNode();
}

function buildRoute() {
  const types = ["combat", "event", "combat", "rest", "combat", "event", "combat", "boss"];
  return types.map((type, index) => ({
    type,
    title: type === "boss" ? "北端封锁线" : ["废街", "地铁口", "黑市边缘", "避难棚", "高架桥", "雨巷", "旧邮局"][index],
    done: false,
  }));
}

function startNode() {
  state.usedWaterproofToday = false;
  const node = state.route[state.routeIndex];
  if (!node) return finishRun(true);
  if (node.type === "combat" || node.type === "boss") startCombat(node.type === "boss");
  if (node.type === "event") {
    if (state.skipNextEvent) {
      state.skipNextEvent = false;
      addLog("利用近路跳过一段麻烦路况。");
      completeNode();
    } else {
      showEvent();
    }
  }
  if (node.type === "rest") showRest();
  save();
  render();
}

function startCombat(isBoss = false) {
  state.pendingEventIndex = null;
  state.pendingRewardIds = null;
  const selected = isBoss ? [enemies.at(-1)] : shuffle(enemies.slice(0, -1)).slice(0, state.day > 4 ? 2 : 1);
  state.phase = "combat";
  state.combat = {
    energy: 3,
    block: 0,
    speed: 0,
    weaken: 0,
    target: 0,
    brassUsed: false,
    drawPile: shuffle([...state.deck, ...Array(Math.floor(state.fatigue / 2)).fill("hesitation")]),
    discard: [],
    hand: [],
    enemies: selected.map((enemy) => ({
      ...enemy,
      maxHp: enemy.hp,
      hp: enemy.hp,
      intent: enemy.attacks[0],
      intentIndex: 0,
      blockNow: enemy.block || 0,
    })),
  };
  if (state.relics.includes("silencer")) state.noise = clamp(state.noise - 2, 0, 10);
  addLog(isBoss ? "抵达封锁线，队长挡住了终点。" : "巷口出现拦截者。");
  drawCards(5);
}

function drawCards(amount) {
  for (let i = 0; i < amount; i += 1) {
    if (state.combat.drawPile.length === 0) {
      state.combat.drawPile = shuffle(state.combat.discard);
      state.combat.discard = [];
    }
    const card = state.combat.drawPile.shift();
    if (card) state.combat.hand.push(card);
  }
}

function playCard(index) {
  const combat = state.combat;
  const id = combat.hand[index];
  const card = cardData[id];
  if (!card || card.cost > combat.energy) return;
  combat.energy -= card.cost;
  applyCardEffect(card);
  combat.hand.splice(index, 1);
  if (!card.exhaust) combat.discard.push(id);
  if (card.type === "talk" && state.relics.includes("brass_badge") && !combat.brassUsed) {
    combat.energy += 1;
    combat.brassUsed = true;
  }
  cleanupEnemies();
  if (combat.enemies.length === 0) winCombat();
  save();
  render();
}

function applyCardEffect(card) {
  const effect = card.effect;
  if (effect.block) state.combat.block += effect.block;
  if (effect.draw) drawCards(effect.draw);
  if (effect.speed) state.combat.speed += effect.speed;
  if (effect.weaken) state.combat.weaken += effect.weaken;
  if (effect.heal) state.hp = clamp(state.hp + effect.heal, 0, state.maxHp);
  if (effect.supply) state.supply = Math.max(0, state.supply + effect.supply);
  if (effect.fatigue) state.fatigue = Math.max(0, state.fatigue + effect.fatigue);
  if (effect.package) changePackage(effect.package);
  if (effect.noise) state.noise = clamp(state.noise + effect.noise, 0, 10);
  if (effect.damageAll) state.combat.enemies.forEach((enemy) => damageEnemy(enemy, effect.damageAll));
  if (effect.damage) {
    const target = state.combat.enemies[state.combat.target] || state.combat.enemies[0];
    const hits = effect.hits || 1;
    for (let i = 0; i < hits; i += 1) damageEnemy(target, effect.damage);
  }
}

function damageEnemy(enemy, amount) {
  const blocked = Math.min(enemy.blockNow || 0, amount);
  enemy.blockNow = Math.max(0, (enemy.blockNow || 0) - amount);
  enemy.hp -= amount - blocked;
}

function cleanupEnemies() {
  state.combat.enemies = state.combat.enemies.filter((enemy) => enemy.hp > 0);
  state.combat.target = clamp(state.combat.target, 0, Math.max(0, state.combat.enemies.length - 1));
}

function endTurn() {
  const combat = state.combat;
  combat.hand.forEach((id) => combat.discard.push(id));
  combat.hand = [];
  let totalDamage = 0;
  let packageDamage = 0;
  combat.enemies.forEach((enemy) => {
    const attack = Math.max(0, enemy.intent - combat.weaken);
    totalDamage += attack;
    packageDamage += enemy.packageHit || 0;
    if (enemy.noise) state.noise = clamp(state.noise + enemy.noise, 0, 10);
    if (enemy.fatigue) state.fatigue += enemy.fatigue;
    enemy.intentIndex = (enemy.intentIndex + 1) % enemy.attacks.length;
    enemy.intent = enemy.attacks[enemy.intentIndex];
    enemy.blockNow = enemy.block || 0;
  });
  const hpDamage = Math.max(0, totalDamage - combat.block);
  state.hp = clamp(state.hp - hpDamage, 0, state.maxHp);
  if (packageDamage) changePackage(-packageDamage);
  if (state.noise >= 10) {
    addLog("声响达到上限，更多追兵涌来。疲劳 +2。");
    state.fatigue += 2;
    state.noise = 6;
  }
  combat.energy = 3;
  combat.block = 0;
  combat.speed = 0;
  combat.weaken = 0;
  combat.brassUsed = false;
  drawCards(5);
  if (state.hp <= 0 || state.packageIntegrity <= 0) finishRun(false);
  save();
  render();
}

function tryFlee() {
  const chance = 0.35 + state.combat.speed * 0.15 - state.combat.enemies.length * 0.08;
  if (rng() < chance) {
    addLog("成功脱离战斗，但路线变得更艰难。");
    state.fatigue += 1;
    state.noise = clamp(state.noise + 2, 0, 10);
    completeNode();
  } else {
    addLog("脱离失败，敌人逼近。");
    state.combat.weaken = Math.max(0, state.combat.weaken - 2);
    endTurn();
  }
}

function winCombat() {
  addLog("清出一条通路。");
  state.combat = null;
  state.phase = "reward";
  showReward();
}

function showReward() {
  const choices = [];
  const rewardCount = state.relics.includes("old_map") ? 4 : 3;
  if (!state.pendingRewardIds) {
    state.pendingRewardIds = shuffle(rewardPool).slice(0, rewardCount);
  }
  state.pendingRewardIds.forEach((id) => {
    choices.push({
      title: `获得：${cardData[id].name}`,
      text: cardData[id].text,
      action: () => {
        state.deck.push(id);
        addLog(`加入新牌：${cardData[id].name}。`);
        completeNode();
      },
    });
  });
  choices.push({
    title: "整理牌组",
    text: "删除一张迟缓、撬棍或静步；没有可删牌则恢复 4 耐久。",
    action: () => {
      const removeId = ["hesitation", "crowbar", "quiet_step"].find((id) => state.deck.includes(id));
      if (removeId) {
        state.deck.splice(state.deck.indexOf(removeId), 1);
        addLog(`移除一张：${cardData[removeId].name}。`);
      } else {
        state.hp = clamp(state.hp + 4, 0, state.maxHp);
      }
      completeNode();
    },
  });
  renderChoices("路段奖励", "你在废墟里找到一些能用的东西。", choices);
}

function showEvent() {
  state.phase = "event";
  if (state.pendingEventIndex === null || state.pendingEventIndex === undefined) {
    state.pendingEventIndex = Math.floor(rng() * eventData.length);
  }
  const event = eventData[state.pendingEventIndex];
  renderChoices(event.title, event.body, event.choices.map((choice) => ({
    title: choice.title,
    text: choice.text,
    action: () => {
      applyNodeEffect(choice.effect);
      completeNode();
    },
  })));
}

function showRest() {
  state.phase = "rest";
  renderChoices("避难棚", "这里还能挡住一阵酸雨。", [
    {
      title: "包扎伤口",
      text: "恢复 12 耐久，疲劳 -1。",
      action: () => {
        state.hp = clamp(state.hp + 12, 0, state.maxHp);
        state.fatigue = Math.max(0, state.fatigue - 1);
        completeNode();
      },
    },
    {
      title: "修补包裹",
      text: "消耗 1 补给，包裹 +18%。",
      action: () => {
        state.supply = Math.max(0, state.supply - 1);
        changePackage(18);
        completeNode();
      },
    },
    {
      title: "翻检仓库",
      text: "获得随机遗物，声响 +2。",
      action: () => {
        grantRelic();
        state.noise = clamp(state.noise + 2, 0, 10);
        completeNode();
      },
    },
  ]);
}

function applyNodeEffect(effect) {
  if (effect.supply) state.supply = Math.max(0, state.supply + effect.supply);
  if (effect.package) changePackage(effect.package);
  if (effect.fatigue) state.fatigue = Math.max(0, state.fatigue + effect.fatigue);
  if (effect.noise) state.noise = clamp(state.noise + effect.noise, 0, 10);
  if (effect.heal) state.hp = clamp(state.hp + effect.heal, 0, state.maxHp);
  if (effect.relic) grantRelic();
  if (effect.reward) state.deck.push(pick(rewardPool));
  if (effect.skip) state.skipNextEvent = true;
  if (state.relics.includes("hand_radio") && effect.noise) state.noise = clamp(state.noise - 1, 0, 10);
}

function grantRelic() {
  const available = Object.keys(relicData).filter((id) => !state.relics.includes(id));
  if (available.length) {
    const id = pick(available);
    state.relics.push(id);
    addLog(`获得遗物：${relicData[id].name}。`);
  } else {
    state.supply += 1;
  }
}

function changePackage(amount) {
  let nextAmount = amount;
  if (amount < 0 && state.relics.includes("waterproof_bag") && !state.usedWaterproofToday) {
    nextAmount = Math.min(0, amount + 4);
    state.usedWaterproofToday = true;
  }
  state.packageIntegrity = clamp(state.packageIntegrity + nextAmount, 0, 100);
}

function completeNode() {
  state.pendingEventIndex = null;
  state.pendingRewardIds = null;
  const node = state.route[state.routeIndex];
  if (node) node.done = true;
  state.routeIndex += 1;
  state.day += 1;
  state.combat = null;
  if (state.routeIndex >= state.route.length) {
    finishRun(true);
    return;
  }
  state.phase = "route";
  startNode();
}

function finishRun(won) {
  state.phase = "finished";
  state.combat = null;
  renderChoices(won ? "送达成功" : "路线失败", won
    ? "你把邮包送进北端避难站。新路线会保留这次的存档格式，但第一版暂不做永久解锁。"
    : "邮差倒在路上，或邮包已经无法交付。可以重新开始，也可以导入旧存档。", [
    {
      title: "开始新路线",
      text: "用新的随机种子重新出发。",
      action: newGame,
    },
  ]);
  addLog(won ? "邮包送达。" : "任务失败。");
  save();
  render();
}

function renderChoices(title, body, choices) {
  els.combatView.classList.add("hidden");
  els.choiceView.innerHTML = "";
  els.message.innerHTML = `<strong>${title}</strong><br>${body}`;
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-card";
    button.type = "button";
    button.innerHTML = `<strong>${choice.title}</strong><span>${choice.text}</span>`;
    button.addEventListener("click", choice.action);
    els.choiceView.appendChild(button);
  });
  save();
}

function render() {
  rng = createRng(`${state.seed}-${state.day}-${state.routeIndex}-${state.log.length}`);
  els.dayStat.textContent = `${Math.min(state.day, state.maxDay)} / ${state.maxDay}`;
  els.hpStat.textContent = `${state.hp} / ${state.maxHp}`;
  els.packageStat.textContent = `${state.packageIntegrity}%`;
  els.fatigueStat.textContent = state.fatigue;
  els.noiseStat.textContent = `${state.noise} / 10`;
  els.supplyStat.textContent = state.supply;
  els.seedLabel.textContent = state.seed;
  renderRoute();
  renderRelics();
  renderDeck();
  renderLog();
  if (state.phase === "combat") renderCombat();
}

function renderRoute() {
  els.routeMap.innerHTML = "";
  state.route.forEach((node, index) => {
    const row = document.createElement("div");
    row.className = `route-node ${index === state.routeIndex ? "current" : ""} ${node.done ? "done" : ""}`;
    row.innerHTML = `
      <div class="node-icon">${index + 1}</div>
      <div><strong>${node.title}</strong><span>${nodeLabel(node.type)}</span></div>
      <small>${node.done ? "完成" : index === state.routeIndex ? "当前" : "未达"}</small>
    `;
    els.routeMap.appendChild(row);
  });
}

function nodeLabel(type) {
  return { combat: "遭遇", event: "事件", rest: "休整", boss: "终点" }[type] || type;
}

function renderRelics() {
  els.relicList.innerHTML = "";
  state.relics.forEach((id) => {
    const relic = relicData[id];
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.title = relic.text;
    chip.textContent = relic.name;
    els.relicList.appendChild(chip);
  });
}

function renderDeck() {
  els.deckCount.textContent = `${state.deck.length} 张`;
  const counts = state.deck.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  els.deckPreview.innerHTML = "";
  Object.entries(counts).forEach(([id, count]) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `${cardData[id].name} x${count}`;
    els.deckPreview.appendChild(chip);
  });
}

function renderLog() {
  els.logList.innerHTML = "";
  state.log.slice(-9).reverse().forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    els.logList.appendChild(li);
  });
}

function renderCombat() {
  const combat = state.combat;
  els.combatView.classList.remove("hidden");
  els.choiceView.innerHTML = "";
  els.message.innerHTML = `<strong>第 ${state.day} 天</strong><br>花费体力打出卡牌。击退敌人、保护包裹，或用速度尝试脱离。`;
  els.playerHp.textContent = `${state.hp} / ${state.maxHp}`;
  els.playerBlock.textContent = `护甲 ${combat.block}，体力 ${combat.energy}`;
  els.intentText.textContent = combat.enemies.map((enemy) => `${enemy.name} ${enemy.intent}`).join(" / ");
  els.combatGoal.textContent = state.route[state.routeIndex]?.type === "boss" ? "送达前最后一战" : "清路或脱离";
  els.enemyRow.innerHTML = "";
  combat.enemies.forEach((enemy, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `enemy ${index === combat.target ? "targeted" : ""}`;
    button.innerHTML = `
      <strong>${enemy.name}</strong>
      <div class="bar"><i style="width:${(enemy.hp / enemy.maxHp) * 100}%"></i></div>
      <small>耐久 ${Math.max(0, enemy.hp)} / ${enemy.maxHp} · 下回合 ${enemy.intent}</small>
    `;
    button.addEventListener("click", () => {
      combat.target = index;
      renderCombat();
    });
    els.enemyRow.appendChild(button);
  });
  els.hand.innerHTML = "";
  combat.hand.forEach((id, index) => {
    const card = cardData[id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `card ${card.cost <= combat.energy ? "playable" : ""}`;
    button.disabled = card.cost > combat.energy;
    button.innerHTML = `
      <span class="cost">${card.cost}</span>
      <div><h3>${card.name}</h3><p>${card.text}</p></div>
      <small>${typeName(card.type)}</small>
    `;
    button.addEventListener("click", () => playCard(index));
    els.hand.appendChild(button);
  });
}

function typeName(type) {
  return { attack: "行动", skill: "技巧", talk: "交涉", supply: "补给", tool: "工具", wound: "负面" }[type] || type;
}

function addLog(entry) {
  state.log.push(entry);
  state.log = state.log.slice(-40);
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    newGame();
    return;
  }
  try {
    state = JSON.parse(raw);
    if (state.version !== 1) throw new Error("存档版本不兼容");
    resumePhase();
  } catch {
    newGame();
  }
}

function resumePhase() {
  rng = createRng(`${state.seed}-${state.day}-${state.routeIndex}-${state.log.length}`);
  if (state.phase === "combat" && state.combat) {
    render();
    renderCombat();
    return;
  }
  if (state.phase === "event") {
    showEvent();
    render();
    return;
  }
  if (state.phase === "reward") {
    showReward();
    render();
    return;
  }
  if (state.phase === "rest") {
    showRest();
    render();
    return;
  }
  if (state.phase === "finished") {
    finishRun(state.hp > 0 && state.packageIntegrity > 0 && state.routeIndex >= state.route.length);
    return;
  }
  startNode();
}

function exportSave() {
  els.saveText.value = JSON.stringify(state, null, 2);
  els.saveDialog.showModal();
}

function importSaveText(text) {
  const next = JSON.parse(text);
  if (next.version !== 1 || !Array.isArray(next.deck) || !Array.isArray(next.route)) {
    throw new Error("存档格式不正确");
  }
  state = next;
  addLog("导入存档成功。");
  save();
  resumePhase();
}

els.endTurnBtn.addEventListener("click", endTurn);
els.fleeBtn.addEventListener("click", tryFlee);
els.newRunBtn.addEventListener("click", () => {
  if (confirm("开始新路线会覆盖当前自动存档，确定继续？")) newGame();
});
els.saveBtn.addEventListener("click", exportSave);
els.importBtn.addEventListener("click", exportSave);
els.copySaveBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.saveText.value);
});
els.downloadSaveBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ruin-courier-${state.seed}.json`;
  a.click();
  URL.revokeObjectURL(url);
});
els.loadTextBtn.addEventListener("click", () => {
  try {
    importSaveText(els.saveText.value);
    els.saveDialog.close();
  } catch (error) {
    alert(error.message);
  }
});
els.fileInput.addEventListener("change", async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    importSaveText(text);
    els.saveDialog.close();
  } catch (error) {
    alert(error.message);
  } finally {
    els.fileInput.value = "";
  }
});

load();
