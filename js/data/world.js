// 道具、地區、訓練家、道館
(function () {
  G.ITEMS = {
    potion: { name: '傷藥', icon: '🧴', price: 200, kind: 'heal', heal: 20, desc: '回復一隻萌獸 20 HP。' },
    superpotion: { name: '好傷藥', icon: '💊', price: 600, kind: 'heal', heal: 60, badge: 1, desc: '回復一隻萌獸 60 HP。' },
    hyperpotion: { name: '厲害傷藥', icon: '🧃', price: 1200, kind: 'heal', heal: 150, badge: 3, desc: '回復一隻萌獸 150 HP。' },
    fullheal: { name: '萬能藥', icon: '🌈', price: 400, kind: 'cure', desc: '治好灼傷、麻痺、中毒、睡著和冰凍。' },
    revive: { name: '活力碎片', icon: '💎', price: 1500, kind: 'revive', badge: 2, desc: '讓倒下的萌獸恢復一半的 HP。' },
    ball1: { name: '萌萌球', price: 200, kind: 'ball', mul: 1, desc: '用來捕捉野生萌獸的球。' },
    ball2: { name: '星星球', price: 600, kind: 'ball', mul: 1.5, badge: 1, desc: '比萌萌球更容易捕捉（×1.5）。' },
    ball3: { name: '彩虹球', price: 1200, kind: 'ball', mul: 2, badge: 3, desc: '非常容易捕捉的高級球（×2）。' },
    candy: { name: '神奇糖果', icon: '🍬', price: 0, kind: 'candy', desc: '讓一隻萌獸升 1 級。道館獎勵限定！' },
  };
  G.SHOP_ORDER = ['potion', 'superpotion', 'hyperpotion', 'fullheal', 'revive', 'ball1', 'ball2', 'ball3'];

  G.DIFFS = [
    { name: '輕鬆', desc: '對手比較溫和，適合第一次玩。', ai: 0, lvAdj: -1 },
    { name: '標準', desc: '對手會找你的弱點、會換人、會用道具。', ai: 1, lvAdj: 0 },
    { name: '挑戰', desc: '對手更聰明、等級更高。要好好想策略！', ai: 2, lvAdj: 2 },
  ];

  G.STARTERS = ['sproutbun', 'embkit', 'bubotter'];
  // 阿光選的御三家會被你剋制；冠軍的王牌則剋制你
  G.RIVAL_OF = { sproutbun: 'bubotter', embkit: 'sproutbun', bubotter: 'embkit' };
  G.CHAMP_OF = { sproutbun: 'embkit', embkit: 'bubotter', bubotter: 'sproutbun' };

  const L = (look) => look;
  const LOOK = {
    kid: L({ hair: 'short', hc: '#5B3A29', outfit: '#4FA3F7' }),
    girl: L({ hair: 'pony', hc: '#8A4B2E', outfit: '#FF8FB8', acc: '#FFD23F' }),
    bug: L({ hair: 'cap', acc: '#5DBB4A', outfit: '#F5E6A8' }),
    camper: L({ hair: 'short', hc: '#3A2A1E', outfit: '#6FAF55' }),
    hiker: L({ hair: 'old', outfit: '#B97A45', beard: true, skin: '#F6CBA8' }),
    swimmer: L({ hair: 'short', hc: '#2B4C7E', outfit: '#3FB6E8' }),
    swimgirl: L({ hair: 'long', hc: '#E8A04B', outfit: '#FF7AA8' }),
    fisher: L({ hair: 'cap', acc: '#3D7BFF', outfit: '#8FB8D8' }),
    fire: L({ hair: 'spiky', hc: '#D7263D', outfit: '#FF8A3D' }),
    karate: L({ hair: 'spiky', hc: '#222', outfit: '#F4F4F4' }),
    sweet: L({ hair: 'bun', hc: '#FF9EC7', outfit: '#FFF0F7' }),
    idol: L({ hair: 'long', hc: '#B27BFF', outfit: '#FFD23F' }),
    worker: L({ hair: 'cap', acc: '#FFB100', outfit: '#E07A2E' }),
    sci: L({ hair: 'short', hc: '#555', outfit: '#fff', glasses: true, coat: true }),
    medium: L({ hair: 'long', hc: '#5A4E7A', outfit: '#6B4FA8' }),
    punk: L({ hair: 'spiky', hc: '#6B4FA8', outfit: '#333' }),
    dragon: L({ hair: 'spiky', hc: '#2C3E8F', outfit: '#6A3CF5' }),
    ace: L({ hair: 'long', hc: '#222', outfit: '#E53950' }),
  };
  G.LOOK = LOOK;

  // 地區（x, y 為地圖座標）
  G.LOCS = [
    { id: 0, name: '微風鎮', theme: 'meadow', x: 140, y: 500, color: '#7CC65A', icon: '🏡',
      desc: '故事開始的小鎮，總是吹著暖暖的微風。',
      wild: { lv: [2, 5], list: [['roundmouse', 30], ['peepbird', 30], ['fuzzball', 25], ['budbud', 15]] },
      trainers: ['t0a', 't0b'], key: 'rival1' },
    { id: 1, name: '嫩葉鎮', theme: 'forest', x: 320, y: 455, color: '#4FAE3F', icon: '🌳',
      desc: '被大森林包圍的小鎮。草屬性道館就在這裡。',
      wild: { lv: [5, 9], list: [['peepbird', 20], ['budbud', 18], ['fuzzball', 14], ['shroomy', 16], ['leafturtle', 10], ['sparkham', 10], ['roundmouse', 12]] },
      trainers: ['t1a', 't1b'],
      gym: { name: '嫩葉道館', type: 'grass', badge: '嫩葉徽章', leader: 'L1', trainers: ['g1a', 'g1b'] } },
    { id: 2, name: '浪花港', theme: 'beach', x: 175, y: 345, color: '#3FA9E8', icon: '⚓',
      desc: '充滿海風的港口城鎮，沙灘上有好多螃蟹。',
      wild: { lv: [9, 14], list: [['roundfin', 24], ['jellybell', 20], ['pinchcrab', 20], ['peepbird', 14], ['sparkham', 10], ['dreamsheep', 12]] },
      trainers: ['t2a', 't2b'],
      gym: { name: '浪花道館', type: 'water', badge: '浪花徽章', leader: 'L2', trainers: ['g2a', 'g2b'] } },
    { id: 3, name: '火山鎮', theme: 'volcano', x: 360, y: 285, color: '#FF6A3D', icon: '🌋',
      desc: '建在火山腳下的溫泉鎮。地面熱呼呼的。',
      wild: { lv: [13, 18], list: [['emberpony', 24], ['pebbit', 18], ['digmole', 18], ['littleghost', 14], ['sparkham', 12], ['punchbear', 14]] },
      trainers: ['t3a', 't3b', 'rival2'],
      gym: { name: '火焰道館', type: 'fire', badge: '火焰徽章', leader: 'L3', trainers: ['g3a', 'g3b'] } },
    { id: 4, name: '拳石城', theme: 'city', x: 545, y: 370, color: '#C9302C', icon: '🏙️',
      desc: '熱鬧的大城市。到處都有人在練功夫。',
      wild: { lv: [17, 22], list: [['punchbear', 18], ['monkchi', 18], ['purpleslime', 18], ['shadowpup', 18], ['windbird', 12], ['chubmouse', 10], ['sparkham', 6]] },
      trainers: ['t4a', 't4b'],
      gym: { name: '格鬥道館', type: 'fighting', badge: '鐵拳徽章', leader: 'L4', trainers: ['g4a', 'g4b'] } },
    { id: 5, name: '糖果城', theme: 'candy', x: 705, y: 470, color: '#FF8FC0', icon: '🍭',
      desc: '甜甜的城市，連空氣都是草莓口味的。',
      wild: { lv: [22, 27], list: [['cottoncandy', 22], ['dreamsheep', 18], ['snowfox', 18], ['sunflower', 10], ['jellybell', 14], ['rainbowfly', 12], ['budbud', 6]] },
      trainers: ['t5a', 't5b'],
      gym: { name: '妖精道館', type: 'fairy', badge: '甜心徽章', leader: 'L5', trainers: ['g5a', 'g5b'] } },
    { id: 6, name: '岩山城', theme: 'mountain', x: 830, y: 330, color: '#A99B8A', icon: '⛰️',
      desc: '蓋在高山上的石頭城，礦坑裡藏著寶石。',
      wild: { lv: [26, 31], list: [['pebbit', 12], ['boulder', 16], ['digmole', 12], ['drillmole', 10], ['windbird', 14], ['ironcrab', 10], ['lazypanda', 6], ['babydragon', 8], ['punchbear', 12]] },
      trainers: ['t6a', 't6b', 'rival3'],
      gym: { name: '岩石道館', type: 'rock', badge: '岩盤徽章', leader: 'L6', trainers: ['g6a', 'g6b'] } },
    { id: 7, name: '月影城', theme: 'night', x: 640, y: 225, color: '#6B4FA8', icon: '🌙',
      desc: '永遠是夜晚的神秘城市，聽說有幽靈出沒。',
      wild: { lv: [30, 35], list: [['shadowpup', 18], ['littleghost', 18], ['nightwolf', 10], ['bladeshark', 10], ['purpleslime', 12], ['slimeking', 8], ['lampghost', 6], ['roundfin', 8], ['dreamsheep', 10]] },
      trainers: ['t7a', 't7b'],
      gym: { name: '月影道館', type: 'ghost', badge: '月影徽章', leader: 'L7', trainers: ['g7a', 'g7b'] } },
    { id: 8, name: '龍之谷', theme: 'dragon', x: 815, y: 130, color: '#6A3CF5', icon: '🐉',
      desc: '龍族居住的山谷。只有強者才能到達。',
      wild: { lv: [34, 40], list: [['babydragon', 14], ['skydragon', 10], ['applecrisp', 14], ['windbird', 10], ['steelhawk', 8], ['crystalfox', 10], ['boltham', 10], ['lazypanda', 8], ['sunflower', 10], ['stardream', 6]] },
      trainers: ['t8a', 't8b'],
      gym: { name: '龍之道館', type: 'dragon', badge: '龍鱗徽章', leader: 'L8', trainers: ['g8a', 'g8b'] } },
    { id: 9, name: '星光競技場', theme: 'champion', x: 470, y: 110, color: '#FFD23F', icon: '🏆',
      desc: '集齊 8 個徽章的訓練家才能挑戰的最高殿堂。',
      wild: null, trainers: [],
      gym: { name: '冠軍盃', type: 'champion', badge: '冠軍獎盃', leader: 'CHAMP', trainers: ['rival4'], final: true } },
  ];

  const T = (G.TRAINERS = {});
  const tr = (id, o) => { o.id = id; T[id] = o; };

  // ── 一般訓練家 ──
  tr('t0a', { name: '小志', cls: '短褲小子', look: LOOK.kid, money: 30, team: [['roundmouse', 3], ['peepbird', 3]], intro: '我在草叢裡練了好久喔！', lose: '哇，你好強！' });
  tr('t0b', { name: '阿哲', cls: '捕蟲少年', look: LOOK.bug, money: 30, team: [['fuzzball', 4], ['fuzzball', 4]], intro: '蟲蟲是世界上最可愛的！', lose: '我的毛毛球……' });
  tr('t1a', { name: '小美', cls: '露營客', look: LOOK.girl, money: 40, team: [['budbud', 7], ['peepbird', 7]], intro: '一起來對戰吧！', lose: '下次我會帶更多夥伴來！' });
  tr('t1b', { name: '阿山', cls: '登山客', look: LOOK.hiker, money: 45, team: [['pebbit', 8], ['digmole', 7]], intro: '山上的萌獸都很硬喔！', lose: '哈哈，年輕人真厲害！' });
  tr('t2a', { name: '小海', cls: '游泳選手', look: LOOK.swimmer, money: 45, team: [['roundfin', 12], ['jellybell', 12]], intro: '海裡的萌獸可是很強的！', lose: '被沖走了～' });
  tr('t2b', { name: '阿釣', cls: '釣魚人', look: LOOK.fisher, money: 45, team: [['roundfin', 11], ['roundfin', 12], ['pinchcrab', 13]], intro: '今天釣到好多好東西！', lose: '魚兒都跑了……' });
  tr('t3a', { name: '大岩', cls: '登山客', look: LOOK.hiker, money: 50, team: [['pebbit', 16], ['digmole', 16]], intro: '火山的石頭超燙的！', lose: '真是熱血的對戰！' });
  tr('t3b', { name: '阿炎', cls: '火焰小子', look: LOOK.fire, money: 50, team: [['emberpony', 17], ['littleghost', 16]], intro: '我的心正在燃燒！', lose: '火……熄滅了……' });
  tr('t4a', { name: '阿武', cls: '空手道家', look: LOOK.karate, money: 55, team: [['punchbear', 21], ['monkchi', 21]], intro: '喝！看我的拳頭！', lose: '我還要再修行……' });
  tr('t4b', { name: '小琪', cls: '城市女孩', look: LOOK.girl, money: 55, team: [['purpleslime', 21], ['shadowpup', 22]], intro: '城市裡的萌獸也很厲害喔！', lose: '好吧，你贏了～' });
  tr('t5a', { name: '小蛋糕', cls: '甜點師', look: LOOK.sweet, money: 60, team: [['cottoncandy', 25], ['dreamsheep', 25]], intro: '要不要吃一口甜甜的對戰？', lose: '蛋糕被吃光光了！' });
  tr('t5b', { name: '小星星', cls: '偶像', look: LOOK.idol, money: 65, team: [['snowfox', 26], ['cottoncandy', 26]], intro: '看我閃閃發亮的舞台！', lose: '你比我還要閃亮呢！' });
  tr('t6a', { name: '阿嶺', cls: '登山客', look: LOOK.hiker, money: 65, team: [['boulder', 30], ['drillmole', 30]], intro: '這座山是我的訓練場！', lose: '佩服佩服！' });
  tr('t6b', { name: '小晶', cls: '研究員', look: LOOK.sci, money: 70, team: [['windbird', 30], ['ironcrab', 31]], intro: '讓我研究一下你的戰術。', lose: '數據顯示……你很強！' });
  tr('t7a', { name: '月婆婆', cls: '靈媒', look: LOOK.medium, money: 70, team: [['littleghost', 34], ['lampghost', 35]], intro: '呵呵呵……幽靈們想跟你玩……', lose: '幽靈們都很開心呢……' });
  tr('t7b', { name: '阿黑', cls: '夜行者', look: LOOK.punk, money: 70, team: [['shadowpup', 34], ['bladeshark', 35], ['nightwolf', 35]], intro: '晚上可是我的主場！', lose: '天……要亮了嗎？' });
  tr('t8a', { name: '阿翔', cls: '龍使', look: LOOK.dragon, money: 80, team: [['babydragon', 38], ['skydragon', 40]], intro: '龍的力量，你承受得住嗎？', lose: '你值得挑戰館主！' });
  tr('t8b', { name: '小雅', cls: '王牌訓練家', look: LOOK.ace, money: 90, team: [['steelhawk', 40], ['crystalfox', 40], ['sunflower', 40]], intro: '我的隊伍可是很平衡的喔。', lose: '不愧是你！' });

  // ── 道館訓練家 ──
  tr('g1a', { name: '小綠', cls: '園丁', look: LOOK.camper, money: 50, team: [['budbud', 8], ['shroomy', 8]], intro: '想見館主，要先通過我這關！', lose: '館主在裡面等你喔。' });
  tr('g1b', { name: '阿芽', cls: '園丁', look: LOOK.girl, money: 50, team: [['leafturtle', 9]], intro: '小草龜可是很硬的喔！', lose: '加油！' });
  tr('g2a', { name: '浪浪', cls: '游泳選手', look: LOOK.swimgirl, money: 55, team: [['pinchcrab', 13], ['jellybell', 13]], intro: '要小心水母的毒喔！', lose: '你游得真快！' });
  tr('g2b', { name: '小鯨', cls: '游泳選手', look: LOOK.swimmer, money: 55, team: [['roundfin', 14], ['roundfin', 14]], intro: '館主超強的！', lose: '去吧，館主在前面！' });
  tr('g3a', { name: '小火', cls: '消防員', look: LOOK.worker, money: 60, team: [['emberpony', 18], ['emberpony', 18]], intro: '火焰要用火焰來對抗！', lose: '被澆熄了！' });
  tr('g3b', { name: '小焰', cls: '魔術師', look: LOOK.fire, money: 60, team: [['littleghost', 18], ['blazecat', 19]], intro: '看我的火焰魔術！', lose: '魔術失敗了……' });
  tr('g4a', { name: '大力', cls: '空手道家', look: LOOK.karate, money: 60, team: [['monkchi', 22], ['punchbear', 22]], intro: '力量就是一切！', lose: '你的戰術更厲害……' });
  tr('g4b', { name: '阿剛', cls: '黑帶', look: LOOK.karate, money: 65, team: [['punchbear', 23], ['monkchi', 23]], intro: '來吧！', lose: '去挑戰館主吧！' });
  tr('g5a', { name: '小莓', cls: '童話少女', look: LOOK.sweet, money: 65, team: [['cottoncandy', 27], ['dreamsheep', 27]], intro: '歡迎來到夢幻的世界～', lose: '夢醒了……' });
  tr('g5b', { name: '小月', cls: '魔法少女', look: LOOK.idol, money: 70, team: [['snowfox', 27], ['stardream', 28]], intro: '妖精的魔法可是很強的！', lose: '魔法被破解了！' });
  tr('g6a', { name: '阿鐵', cls: '礦工', look: LOOK.worker, money: 70, team: [['boulder', 31], ['drillmole', 32]], intro: '我們每天都在挖石頭！', lose: '挖到寶了，是你！' });
  tr('g6b', { name: '大石', cls: '礦工', look: LOOK.worker, money: 70, team: [['pebbit', 31], ['boulder', 33]], intro: '岩石是最堅固的！', lose: '石頭也會碎啊……' });
  tr('g7a', { name: '小幽', cls: '靈媒', look: LOOK.medium, money: 75, team: [['littleghost', 35], ['lampghost', 36]], intro: '你……看得見嗎……？', lose: '咿嘻嘻，好好玩……' });
  tr('g7b', { name: '小影', cls: '夜行者', look: LOOK.punk, money: 75, team: [['nightwolf', 36], ['bladeshark', 36]], intro: '黑夜裡沒人看得到我們！', lose: '被看穿了！' });
  tr('g8a', { name: '阿鱗', cls: '龍使', look: LOOK.dragon, money: 85, team: [['skydragon', 41], ['applecrisp', 41]], intro: '龍之谷不歡迎弱者！', lose: '你是真正的強者。' });
  tr('g8b', { name: '阿昊', cls: '王牌訓練家', look: LOOK.ace, money: 90, team: [['boltham', 42], ['skydragon', 42]], intro: '館主是我的偶像！', lose: '館主一定會很開心有你這樣的對手。' });

  // ── 館主 ──
  const leader = (id, o) => tr(id, Object.assign({ cls: '道館館主', money: 120, leader: true, dmax: true }, o));
  leader('L1', { name: '小葵', look: { hair: 'pony', hc: '#5DBB4A', outfit: '#FFD23F', acc: '#FF8FB8' },
    team: [['shroomy', 9, ['megadrain', 'poisonpowder', 'acid', 'tackle']], ['leafturtle', 10, ['razorleaf', 'bite', 'megadrain', 'harden']], ['sunflower', 11, ['magicalleaf', 'razorleaf', 'growl', 'megadrain']]],
    items: { potion: 1 }, intro: '歡迎來到嫩葉道館！我的草屬性萌獸會讓你見識大自然的力量！', lose: '你和萌獸的感情真好！這個嫩葉徽章送給你！',
    tip: '草屬性怕火、冰、飛行、蟲和毒。如果你選的是水屬性，可以抓咕咕雀或毛毛球來幫忙！' });
  leader('L2', { name: '阿浪', look: { hair: 'spiky', hc: '#2F86D1', outfit: '#3FD0D4' },
    team: [['jellybell', 13, ['acid', 'waterpulse', 'toxic', 'protect']], ['pinchcrab', 14, ['metalclaw', 'bubblebeam', 'rocksmash', 'harden']], ['bladeshark', 15, ['aquajet', 'bite', 'waterpulse', 'icefang']]],
    items: { superpotion: 1 }, intro: '大海的力量可是很難捉摸的！準備好了嗎？', lose: '漂亮！就像一道大浪！浪花徽章是你的了！',
    tip: '水屬性怕電和草。小心水母寶的「劇毒」，HP 會越扣越多！' });
  leader('L3', { name: '炎太', look: { hair: 'spiky', hc: '#FF6A3D', outfit: '#C9302C' },
    team: [['emberpony', 19, ['flamecharge', 'firefang', 'quickattack', 'headbutt']], ['blazecat', 20, ['firefang', 'bite', 'karatechop', 'quickattack']], ['flamemane', 21, ['firefang', 'flamecharge', 'bodyslam', 'agility']]],
    items: { superpotion: 1 }, intro: '燃燒吧！讓我看看你的熱情有多少度！', lose: '好熱血的對戰！火焰徽章送你！',
    tip: '火屬性怕水、地面和岩石。焰鬃馬的「引火」會吸收火焰招式，別用火打牠！' });
  leader('L4', { name: '力丸', look: { hair: 'spiky', hc: '#222', outfit: '#F4F4F4', frown: true },
    team: [['monkchi', 23, ['machpunch', 'karatechop', 'aerialace', 'brickbreak']], ['punchbear', 24, ['brickbreak', 'machpunch', 'bulkup', 'headbutt']], ['kungfumonkey', 25, ['brickbreak', 'aerialace', 'agility', 'zenheadbutt']], ['brawlbear', 26, ['brickbreak', 'bulkup', 'icepunch', 'machpunch']]],
    items: { superpotion: 2 }, intro: '真正的力量來自日復一日的鍛鍊！來吧！', lose: '你的戰術比拳頭還要強！收下鐵拳徽章！',
    tip: '格鬥屬性怕飛行、超能力和妖精。武鬥熊的「健美」會越打越強，要早點打倒牠！' });
  leader('L5', { name: '甜甜', look: { hair: 'bun', hc: '#FF8FC0', outfit: '#FFFFFF' },
    team: [['cottoncandy', 28, ['dazzlinggleam', 'sing', 'drainingkiss', 'protect']], ['stardream', 29, ['dazzlinggleam', 'psybeam', 'calmmind', 'hypnosis']], ['crystalfox', 29, ['aurorabeam', 'dazzlinggleam', 'iceshard', 'agility']], ['cloudcandy', 30, ['dazzlinggleam', 'drainingkiss', 'calmmind', 'recover']]],
    items: { superpotion: 2 }, intro: '可愛也是一種力量喔！讓我們甜甜地對戰吧～', lose: '你好棒棒！這個甜心徽章給你～',
    tip: '妖精屬性怕毒和鋼。小心「唱歌」和「催眠術」會讓你睡著！' });
  leader('L6', { name: '石破', look: { hair: 'old', outfit: '#8D7E6C', beard: true, skin: '#E9B98F' },
    team: [['boulder', 33, ['rockslide', 'bulldoze', 'irondefense', 'headbutt']], ['drillmole', 34, ['drillrun', 'ironhead', 'rocktomb', 'swordsdance']], ['ironcrab', 34, ['waterfall', 'ironhead', 'swordsdance', 'rocksmash']], ['titanrock', 35, ['rockslide', 'earthquake', 'irondefense', 'headbutt']]],
    items: { hyperpotion: 1, superpotion: 1 }, intro: '岩石不會動搖！你能擊碎我的防禦嗎？', lose: '哈哈哈！好一記重擊！岩盤徽章是你的！',
    tip: '岩石+地面的萌獸被水和草打到是 ×4！但要小心「結實」會撐住一擊。' });
  leader('L7', { name: '夜月', look: { hair: 'long', hc: '#3A2A6B', outfit: '#2E2357' },
    team: [['littleghost', 37, ['shadowball', 'willowisp', 'hex', 'shadowsneak']], ['bladeshark', 38, ['crunch', 'waterfall', 'icefang', 'suckerpunch']], ['lampghost', 39, ['shadowball', 'flamethrower', 'willowisp', 'calmmind']], ['nightwolf', 40, ['crunch', 'suckerpunch', 'firefang', 'swordsdance']]],
    items: { hyperpotion: 2 }, intro: '在月光下……你的萌獸會害怕嗎？', lose: '你的光芒照亮了黑夜。月影徽章，收下吧。',
    tip: '幽靈怕幽靈和惡；惡怕格鬥、蟲和妖精。「鬼火」會讓物理攻擊變弱，小心！' });
  leader('L8', { name: '辰', look: { hair: 'long', hc: '#2C3E8F', outfit: '#6A3CF5', acc: '#FFD23F' },
    team: [['applecrisp', 43, ['dragonpulse', 'gigadrain', 'energyball', 'synthesis']], ['skydragon', 44, ['dragonclaw', 'dragondance', 'crunch', 'firepunch']], ['tideotter', 44, ['surf', 'dragonpulse', 'icebeam', 'calmmind']], ['heavendragon', 46, ['dragonclaw', 'earthquake', 'dragondance', 'firepunch']]],
    items: { hyperpotion: 2 }, intro: '我是龍之谷的守護者。讓我看看你配不配挑戰冠軍！', lose: '你已經是真正的龍了。龍鱗徽章，送給你。',
    tip: '龍屬性怕冰、龍和妖精！天穹龍是龍＋飛行，被冰打到是 ×4！' });

  // ── 對手阿光 ──
  const RIVAL_LOOK = { hair: 'spiky', hc: '#F2A33A', outfit: '#FF5D5D' };
  tr('rival1', { name: '阿光', cls: '好朋友', look: RIVAL_LOOK, money: 40, rival: true, team: [['R1', 5]],
    intro: '嘿！我們都拿到萌獸了，來比一場吧！', lose: '可惡～你比我想的還強！我們一起去收集徽章吧！' });
  tr('rival2', { name: '阿光', cls: '好朋友', look: RIVAL_LOOK, money: 60, rival: true, team: [['windbird', 18], ['sparkham', 17], ['R2', 20]],
    intro: '我已經變強很多了喔！這次不會輸的！', lose: '又輸了……但是好開心！' });
  tr('rival3', { name: '阿光', cls: '好朋友', look: RIVAL_LOOK, money: 80, rival: true, team: [['windbird', 30], ['boltham', 30], ['purpleslime', 31], ['R2', 33]],
    items: { superpotion: 1 }, intro: '我們都快要集齊徽章了！來一場認真的對戰吧！', lose: '你果然是我最好的對手！' });
  tr('rival4', { name: '阿光', cls: '好朋友', look: RIVAL_LOOK, money: 100, rival: true, team: [['steelhawk', 46], ['boltham', 46], ['slimeking', 47], ['lazypanda', 47], ['R3', 49]],
    items: { hyperpotion: 2 }, dmax: true, intro: '在挑戰冠軍之前，先過我這一關！這是我們最棒的一場對戰！', lose: '……你一定能贏過冠軍的！我會在觀眾席幫你加油！' });

  tr('CHAMP', { name: '星辰', cls: '冠軍', look: { hair: 'long', hc: '#4B2E8F', outfit: '#FFD23F', acc: '#FF5D8F' }, money: 200, leader: true, dmax: true, champion: true,
    team: [['boltham', 49, ['thunderbolt', 'nastyplot', 'shockwave', 'quickattack']], ['steelhawk', 49, ['bravebird', 'ironhead', 'roost', 'swordsdance']], ['lazypanda', 50, ['bodyslam', 'earthquake', 'crunch', 'bulkup']], ['crystalfox', 50, ['icebeam', 'moonblast', 'calmmind', 'agility']], ['jellyqueen', 50, ['surf', 'sludgebomb', 'toxic', 'recover']], ['C3', 52]],
    items: { hyperpotion: 3 }, intro: '歡迎來到星光競技場。能走到這裡的你，一定非常努力。讓我們來一場最精彩的對戰吧！', lose: '太精彩了……從今天起，你就是新的冠軍！',
    tip: '冠軍的隊伍什麼屬性都有，記得帶上各種屬性的夥伴，隨時換人應戰！' });

  // 依照玩家的御三家解析對手的隊伍
  G.resolveTeam = (t, starter) => {
    const line = G.evoChain(G.RIVAL_OF[starter] || 'bubotter');
    const champ = G.evoChain(G.CHAMP_OF[starter] || 'embkit');
    return t.team.map(([sp, lv, moves]) => {
      if (sp === 'R1') sp = line[0];
      if (sp === 'R2') sp = line[1];
      if (sp === 'R3') sp = line[2];
      if (sp === 'C3') sp = champ[2];
      return [sp, lv, moves];
    });
  };
})();
