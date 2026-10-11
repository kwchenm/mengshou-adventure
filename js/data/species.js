// 萌獸圖鑑資料（全部為原創角色）
(function () {
  G.ABILITIES = {
    overgrow: { name: '茂盛', desc: 'HP 剩下 1/3 以下時，草屬性招式威力提升 50%。' },
    blaze: { name: '猛火', desc: 'HP 剩下 1/3 以下時，火屬性招式威力提升 50%。' },
    torrent: { name: '激流', desc: 'HP 剩下 1/3 以下時，水屬性招式威力提升 50%。' },
    swarm: { name: '蟲之預感', desc: 'HP 剩下 1/3 以下時，蟲屬性招式威力提升 50%。' },
    intimidate: { name: '威嚇', desc: '出場時讓對手的攻擊降低 1 級。' },
    static: { name: '靜電', desc: '被物理招式碰到時，30% 機率讓對手麻痺。' },
    effectspore: { name: '孢子', desc: '被物理招式碰到時，30% 機率讓對手中毒、麻痺或睡著。' },
    poisonpoint: { name: '毒刺', desc: '被物理招式碰到時，30% 機率讓對手中毒。' },
    roughskin: { name: '粗糙皮膚', desc: '被物理招式碰到時，對手會受到 1/8 HP 的傷害。' },
    levitate: { name: '飄浮', desc: '浮在空中，地面屬性招式打不到。' },
    sturdy: { name: '結實', desc: 'HP 全滿時，就算受到致命一擊也會剩下 1 HP 撐住。' },
    thickfat: { name: '厚脂肪', desc: '受到火和冰屬性招式的傷害減半。' },
    guts: { name: '毅力', desc: '陷入異常狀態時，攻擊提升 50%（灼傷也不會減弱）。' },
    multiscale: { name: '多重鱗片', desc: 'HP 全滿時，受到的傷害減半。' },
    flashfire: { name: '引火', desc: '被火屬性招式打到不會受傷，還會讓自己的火招式變強。' },
    sapsipper: { name: '食草', desc: '被草屬性招式打到不會受傷，攻擊還會提升 1 級。' },
    clearbody: { name: '恆淨之軀', desc: '能力不會被對手降低。' },
    moxie: { name: '自信過度', desc: '打倒對手時，攻擊提升 1 級。' },
    icebody: { name: '冰晶之軀', desc: '每回合結束時回復 1/16 HP。' },
    toughclaws: { name: '硬爪', desc: '物理招式的威力提升 30%。' },
    regenerator: { name: '再生力', desc: '換下場時回復 1/3 HP。' },
  };

  // 招式學習表 [等級, 招式]
  const LS = {
    sprout: [[1, 'tackle'], [1, 'growl'], [4, 'vinewhip'], [8, 'megadrain'], [11, 'quickattack'], [14, 'razorleaf'], [17, 'sleeppowder'], [20, 'magicalleaf'], [24, 'gigadrain'], [28, 'drainingkiss'], [32, 'synthesis'], [37, 'energyball'], [42, 'calmmind'], [47, 'moonblast'], [54, 'leafstorm']],
    ember: [[1, 'scratch'], [1, 'growl'], [4, 'ember'], [8, 'quickattack'], [12, 'bite'], [15, 'flamecharge'], [19, 'firefang'], [22, 'karatechop'], [26, 'brickbreak'], [30, 'firepunch'], [33, 'bulkup'], [40, 'flareblitz'], [46, 'closecombat'], [52, 'swordsdance']],
    otter: [[1, 'tackle'], [1, 'tailwhip'], [4, 'watergun'], [8, 'aquajet'], [11, 'bubblebeam'], [15, 'bite'], [19, 'waterpulse'], [22, 'protect'], [25, 'dragonbreath'], [29, 'surf'], [33, 'icebeam'], [40, 'calmmind'], [45, 'hydropump'], [52, 'dracometeor']],
    mouse: [[1, 'tackle'], [1, 'tailwhip'], [4, 'quickattack'], [8, 'bite'], [12, 'headbutt'], [17, 'facade'], [21, 'bodyslam'], [25, 'suckerpunch'], [29, 'crunch'], [34, 'swordsdance'], [40, 'doubleedge']],
    bird: [[1, 'peck'], [1, 'growl'], [5, 'gust'], [9, 'quickattack'], [13, 'wingattack'], [17, 'aerialace'], [21, 'agility'], [25, 'drillpeck'], [30, 'roost'], [34, 'swordsdance'], [40, 'bravebird'], [45, 'ironhead']],
    bug: [[1, 'tackle'], [1, 'stringshot'], [6, 'bugbite'], [12, 'confusion'], [15, 'sleeppowder'], [18, 'psybeam'], [21, 'strugglebug'], [24, 'airslash'], [28, 'bugbuzz'], [32, 'quiverdance'], [37, 'psychic'], [43, 'hurricane']],
    shroom: [[1, 'tackle'], [1, 'megadrain'], [5, 'poisonpowder'], [8, 'acid'], [12, 'stunspore'], [16, 'sludge'], [20, 'sleeppowder'], [24, 'gigadrain'], [28, 'toxic'], [33, 'sludgebomb'], [38, 'energyball'], [44, 'synthesis']],
    elec: [[1, 'thundershock'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'thunderwave'], [13, 'spark'], [17, 'shockwave'], [21, 'agility'], [25, 'thunderpunch'], [30, 'thunderbolt'], [36, 'nastyplot'], [42, 'thunder']],
    shark: [[1, 'watergun'], [1, 'tailwhip'], [5, 'bite'], [9, 'aquajet'], [13, 'waterpulse'], [17, 'icefang'], [22, 'suckerpunch'], [26, 'waterfall'], [30, 'crunch'], [35, 'swordsdance'], [40, 'liquidation']],
    jelly: [[1, 'watergun'], [1, 'poisonsting'], [5, 'acid'], [9, 'waterpulse'], [13, 'toxic'], [17, 'sludge'], [21, 'bubblebeam'], [25, 'protect'], [29, 'surf'], [33, 'sludgebomb'], [38, 'recover'], [44, 'hydropump']],
    pony: [[1, 'tackle'], [1, 'growl'], [5, 'ember'], [9, 'quickattack'], [13, 'flamecharge'], [17, 'headbutt'], [21, 'firefang'], [25, 'agility'], [30, 'bodyslam'], [34, 'wildcharge'], [38, 'flareblitz'], [44, 'swordsdance']],
    mole: [[1, 'scratch'], [4, 'mudslap'], [8, 'metalclaw'], [12, 'bulldoze'], [16, 'rocktomb'], [20, 'nightslash'], [24, 'drillrun'], [30, 'swordsdance'], [36, 'earthquake'], [42, 'rockslide'], [48, 'xscissor']],
    rock: [[1, 'tackle'], [1, 'harden'], [6, 'rockthrow'], [10, 'mudslap'], [14, 'rocktomb'], [18, 'bulldoze'], [22, 'headbutt'], [26, 'rockslide'], [30, 'irondefense'], [35, 'earthquake'], [40, 'stoneedge'], [46, 'doubleedge']],
    bear: [[1, 'tackle'], [1, 'growl'], [4, 'rocksmash'], [8, 'machpunch'], [12, 'karatechop'], [16, 'headbutt'], [20, 'bulkup'], [24, 'brickbreak'], [29, 'icepunch'], [33, 'thunderpunch'], [38, 'crunch'], [44, 'closecombat']],
    monk: [[1, 'scratch'], [1, 'tailwhip'], [5, 'machpunch'], [9, 'rocksmash'], [13, 'karatechop'], [17, 'aerialace'], [21, 'brickbreak'], [25, 'agility'], [30, 'zenheadbutt'], [34, 'thunderpunch'], [38, 'closecombat'], [44, 'stoneedge']],
    slime: [[1, 'tackle'], [1, 'harden'], [5, 'acid'], [9, 'mudslap'], [13, 'sludge'], [17, 'toxic'], [21, 'protect'], [25, 'poisonjab'], [30, 'sludgebomb'], [35, 'shadowball'], [40, 'icepunch'], [46, 'gunkshot']],
    sheep: [[1, 'tackle'], [1, 'growl'], [5, 'confusion'], [9, 'disarmingvoice'], [13, 'hypnosis'], [17, 'psybeam'], [21, 'swift'], [25, 'calmmind'], [32, 'psychic'], [38, 'recover'], [44, 'moonblast']],
    ghost: [[1, 'astonish'], [1, 'ember'], [6, 'lick'], [10, 'willowisp'], [14, 'hex'], [19, 'shadowsneak'], [24, 'shadowball'], [28, 'calmmind'], [33, 'flamethrower'], [40, 'fireblast'], [47, 'overheat']],
    fox: [[1, 'powdersnow'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'disarmingvoice'], [13, 'iceshard'], [17, 'aurorabeam'], [21, 'drainingkiss'], [25, 'agility'], [32, 'icebeam'], [38, 'calmmind'], [44, 'moonblast'], [50, 'blizzard']],
    dragon: [[1, 'tackle'], [1, 'growl'], [4, 'twister'], [8, 'bite'], [12, 'dragonbreath'], [16, 'headbutt'], [20, 'dragonclaw'], [25, 'crunch'], [33, 'dragondance'], [38, 'dragonrush'], [44, 'earthquake'], [48, 'firepunch'], [52, 'bravebird']],
    dog: [[1, 'tackle'], [1, 'tailwhip'], [4, 'bite'], [8, 'quickattack'], [12, 'snarl'], [16, 'headbutt'], [18, 'firefang'], [20, 'icefang'], [24, 'crunch'], [32, 'suckerpunch'], [36, 'swordsdance'], [42, 'playrough']],
    crab: [[1, 'watergun'], [1, 'harden'], [5, 'metalclaw'], [9, 'bubblebeam'], [13, 'rocksmash'], [17, 'aquajet'], [21, 'waterfall'], [30, 'irondefense'], [34, 'swordsdance'], [38, 'liquidation'], [44, 'xscissor']],
    candy: [[1, 'disarmingvoice'], [1, 'charm'], [5, 'fairywind'], [9, 'drainingkiss'], [13, 'sing'], [17, 'swift'], [23, 'dazzlinggleam'], [27, 'protect'], [31, 'calmmind'], [36, 'moonblast'], [42, 'psychic'], [48, 'hypervoice']],
    flower: [[1, 'megadrain'], [1, 'growl'], [5, 'razorleaf'], [8, 'sleeppowder'], [11, 'magicalleaf'], [15, 'stunspore'], [18, 'gigadrain'], [23, 'drainingkiss'], [30, 'energyball'], [36, 'synthesis'], [42, 'leafstorm']],
    turtle: [[1, 'tackle'], [1, 'harden'], [5, 'megadrain'], [9, 'razorleaf'], [13, 'bite'], [17, 'bulldoze'], [21, 'seedbomb'], [25, 'synthesis'], [29, 'crunch'], [36, 'earthquake'], [42, 'leafblade'], [48, 'swordsdance']],
    panda: [[1, 'tackle'], [1, 'harden'], [6, 'headbutt'], [10, 'bite'], [15, 'bodyslam'], [20, 'protect'], [25, 'crunch'], [30, 'bulkup'], [35, 'drainpunch'], [40, 'earthquake'], [46, 'doubleedge']],
    apple: [[1, 'twister'], [1, 'megadrain'], [8, 'dragonbreath'], [14, 'magicalleaf'], [20, 'gigadrain'], [26, 'dragonpulse'], [32, 'energyball'], [38, 'synthesis'], [44, 'dracometeor'], [50, 'leafstorm']],
  };

  const S = (G.SPECIES = {});
  const ORDER = (G.DEX_ORDER = []);
  const sp = (key, o) => {
    o.key = key;
    o.no = ORDER.length + 1;
    S[key] = o;
    ORDER.push(key);
  };

  // ── 御三家 ──
  sp('sproutbun', { name: '芽芽兔', types: ['grass'], bs: [45, 49, 49, 60, 55, 57], ab: 'overgrow', evo: { lv: 16, to: 'leafbun' }, rate: 45, exp: 62, ls: LS.sprout,
    desc: '頭上的嫩芽會跟著心情搖來搖去。最喜歡在暖暖的陽光下打盹。',
    art: { b: 'chibi', c: '#9BDB72', c2: '#F7FFE9', c3: '#4FAE3F', ears: 'bunny', earIn: '#FFC2D4', top: 'sprout', tail: 'puff', eyes: 'big', iris: '#3E8E3A', mouth: 'cat', cheek: '#FF9BB5', s: 0.82 } });
  sp('leafbun', { name: '葉耳兔', types: ['grass'], bs: [60, 62, 63, 80, 70, 75], ab: 'overgrow', evo: { lv: 34, to: 'forestbun' }, rate: 45, exp: 142, ls: LS.sprout,
    desc: '耳朵是兩片大葉子，可以聽見很遠很遠的風聲。',
    art: { b: 'chibi', c: '#7DCB5C', c2: '#F2FCE3', c3: '#3E9A36', ears: 'leafbunny', top: 'sprout2', tail: 'leaf', eyes: 'big', iris: '#2F7D2C', mouth: 'smile', cheek: '#FF9BB5', extra: ['scarf'], scarf: '#FFD34E', s: 0.95 } });
  sp('forestbun', { name: '森語兔', types: ['grass', 'fairy'], bs: [78, 75, 80, 110, 95, 97], ab: 'overgrow', rate: 45, exp: 250, ls: LS.sprout, em: ['dazzlinggleam'],
    desc: '森林的守護者。據說牠唱歌的時候，花朵會一起開放。',
    art: { b: 'chibi', c: '#66BB52', c2: '#FFF7E3', c3: '#FF8FB8', ears: 'leafbunny', top: 'flowercrown', tail: 'puff', wings: 'fairy', eyes: 'star', iris: '#2F7D2C', mouth: 'smile', cheek: '#FF9BB5', extra: ['cape'], cape: '#3E9A36', s: 1.08 } });

  sp('embkit', { name: '火球貓', types: ['fire'], bs: [44, 58, 42, 52, 42, 68], ab: 'blaze', evo: { lv: 16, to: 'blazecat' }, rate: 45, exp: 62, ls: LS.ember,
    desc: '尾巴尖端的小火苗，開心的時候會燒得特別旺。',
    art: { b: 'chibi', c: '#FF9152', c2: '#FFEBD6', c3: '#FFD23F', ears: 'cat', earIn: '#FFC9A8', top: 'tuft', tail: 'flame', eyes: 'round', mouth: 'cat', cheek: '#FF6F6F', s: 0.82 } });
  sp('blazecat', { name: '焰尾貓', types: ['fire'], bs: [60, 80, 58, 68, 58, 88], ab: 'blaze', evo: { lv: 34, to: 'flamedancer' }, rate: 45, exp: 142, ls: LS.ember,
    desc: '動作非常敏捷，跑起來會在地上留下一道火焰軌跡。',
    art: { b: 'chibi', c: '#FF7A3D', c2: '#FFE6CC', c3: '#FFD23F', ears: 'cat', earIn: '#FFC9A8', top: 'flame', tail: 'flame', eyes: 'fierce', mouth: 'fang', cheek: '#FF6F6F', extra: ['scarf'], scarf: '#D7263D', s: 0.95 } });
  sp('flamedancer', { name: '炎舞貓', types: ['fire', 'fighting'], bs: [80, 115, 75, 75, 70, 112], ab: 'blaze', rate: 45, exp: 250, ls: LS.ember, em: ['drainpunch'],
    desc: '戴著火焰拳套的格鬥家，出拳快到會冒出火花。',
    art: { b: 'chibi', c: '#F2602B', c2: '#FFE1C2', c3: '#FFD23F', ears: 'cat', earIn: '#FFC9A8', top: 'bigflame', tail: 'flame', eyes: 'fierce', mouth: 'fang', extra: ['gloves', 'belt'], glove: '#FFD23F', s: 1.08 } });

  sp('bubotter', { name: '泡泡獺', types: ['water'], bs: [50, 50, 50, 58, 52, 50], ab: 'torrent', evo: { lv: 16, to: 'waveotter' }, rate: 45, exp: 62, ls: LS.otter,
    desc: '會從嘴巴吹出彩色泡泡。泡泡破掉的聲音是牠最喜歡的音樂。',
    art: { b: 'chibi', c: '#62B7F0', c2: '#EAF8FF', c3: '#2F86D1', ears: 'round', earIn: '#BFE4FF', top: 'drop', tail: 'otter', eyes: 'round', mouth: 'cat', cheek: '#FF9BB5', extra: ['whiskers'], s: 0.82 } });
  sp('waveotter', { name: '浪花獺', types: ['water'], bs: [66, 66, 66, 82, 70, 68], ab: 'torrent', evo: { lv: 34, to: 'tideotter' }, rate: 45, exp: 142, ls: LS.otter,
    desc: '可以踩著浪花在海面上滑行，是衝浪高手。',
    art: { b: 'chibi', c: '#4AA3E8', c2: '#E3F5FF', c3: '#1F6FB8', ears: 'round', earIn: '#BFE4FF', top: 'wave', tail: 'otter', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', extra: ['scarf', 'whiskers'], scarf: '#6FE0D2', s: 0.95 } });
  sp('tideotter', { name: '海潮獺', types: ['water', 'dragon'], bs: [88, 82, 85, 108, 90, 77], ab: 'torrent', rate: 45, exp: 250, ls: LS.otter, em: ['dragonpulse'],
    desc: '傳說牠能呼喚潮汐。身上流著古老海龍的血脈。',
    art: { b: 'chibi', c: '#3B82D9', c2: '#E0F4FF', c3: '#4FD3DE', ears: 'fin', top: 'wavecrown', tail: 'dragonfish', eyes: 'fierce', mouth: 'smile', cheek: '#FF9BB5', extra: ['whiskers'], s: 1.08 } });

  // ── 常見萌獸 ──
  sp('roundmouse', { name: '圓圓鼠', types: ['normal'], bs: [35, 55, 35, 30, 35, 70], ab: 'guts', evo: { lv: 18, to: 'chubmouse' }, rate: 255, exp: 51, ls: LS.mouse,
    desc: '隨處可見的小老鼠。門牙會一直長，所以很愛啃東西。',
    art: { b: 'chibi', c: '#D9B08C', c2: '#FFF3E4', ears: 'mouse', earIn: '#FFC2CF', tail: 'thin', eyes: 'round', mouth: 'buck', cheek: '#FF9BB5', s: 0.76 } });
  sp('chubmouse', { name: '胖胖鼠', types: ['normal'], bs: [75, 85, 65, 45, 65, 80], ab: 'guts', rate: 127, exp: 145, ls: LS.mouse,
    desc: '把食物存在臉頰裡，所以臉圓滾滾的。生氣起來很勇猛。',
    art: { b: 'chibi', c: '#C79A72', c2: '#FFF0DE', ears: 'mouse', earIn: '#FFC2CF', tail: 'thin', eyes: 'fierce', mouth: 'buck', cheek: '#FF9BB5', bw: 1.3, s: 0.96 } });

  sp('peepbird', { name: '咕咕雀', types: ['normal', 'flying'], bs: [40, 45, 40, 35, 35, 56], ab: 'moxie', evo: { lv: 18, to: 'windbird' }, rate: 255, exp: 50, ls: LS.bird,
    desc: '早上會「咕咕」地叫大家起床。圓滾滾的身體其實很會飛。',
    art: { b: 'bird', c: '#A9D3F7', c2: '#FFFFFF', c3: '#FFB347', top: 'tuft', tail: 'feather', eyes: 'round', mouth: 'beak', cheek: '#FF9BB5', s: 0.74 } });
  sp('windbird', { name: '疾風雀', types: ['normal', 'flying'], bs: [63, 72, 60, 50, 55, 90], ab: 'moxie', evo: { lv: 36, to: 'steelhawk' }, rate: 120, exp: 122, ls: LS.bird,
    desc: '能乘著風飛上一整天。銳利的眼睛可以看見很遠的獵物。',
    art: { b: 'bird', c: '#6FA8E8', c2: '#F4FAFF', c3: '#FFA63D', top: 'crest', tail: 'feather', eyes: 'fierce', mouth: 'beak', s: 0.92 } });
  sp('steelhawk', { name: '鋼翼鷹', types: ['flying', 'steel'], bs: [98, 95, 105, 55, 85, 72], ab: 'clearbody', rate: 45, exp: 248, ls: LS.bird, em: ['steelwing'],
    desc: '羽毛像鋼鐵一樣堅硬。是天空中最可靠的守護者。',
    art: { b: 'bird', c: '#4B5D8F', c2: '#C9D3EA', c3: '#FFC93C', top: 'crest', tail: 'feather', eyes: 'fierce', iris: '#E53950', mouth: 'beak', extra: ['armor'], s: 1.1 } });

  sp('fuzzball', { name: '毛毛球', types: ['bug'], bs: [45, 35, 50, 25, 30, 45], ab: 'swarm', evo: { lv: 10, to: 'rainbowfly' }, rate: 255, exp: 39, ls: LS.bug,
    desc: '軟綿綿的毛毛蟲，一天到晚都在吃葉子。',
    art: { b: 'blob', c: '#A5D95E', c2: '#FFF07A', c3: '#FF8A5B', ears: 'antenna', pattern: 'stripes', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.7 } });
  sp('rainbowfly', { name: '彩翼蝶', types: ['bug', 'flying'], bs: [60, 45, 50, 90, 80, 70], ab: 'swarm', rate: 120, exp: 140, ls: LS.bug, em: ['gust'],
    desc: '翅膀上的鱗粉會反射出彩虹的顏色，在陽光下閃閃發亮。',
    art: { b: 'chibi', c: '#B7A1F5', c2: '#FFFFFF', c3: '#FF9AD5', ears: 'antenna', wings: 'butterfly', eyes: 'big', iris: '#6B4FD8', mouth: 'smile', cheek: '#FF9BB5', s: 0.88 } });

  sp('shroomy', { name: '蘑菇球', types: ['grass', 'poison'], bs: [50, 50, 55, 60, 55, 30], ab: 'effectspore', evo: { lv: 24, to: 'shroomking' }, rate: 190, exp: 57, ls: LS.shroom,
    desc: '頭上的蘑菇傘會撒出孢子。看起來很好吃，但千萬不能吃！',
    art: { b: 'blob', c: '#FFF1E0', c2: '#FFFFFF', c3: '#F2607E', top: 'mushroom', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.76 } });
  sp('shroomking', { name: '蘑菇王', types: ['grass', 'poison'], bs: [85, 75, 85, 95, 90, 40], ab: 'effectspore', rate: 75, exp: 150, ls: LS.shroom,
    desc: '森林深處的蘑菇國王。慢吞吞的，但孢子非常厲害。',
    art: { b: 'blob', c: '#FBE6CF', c2: '#FFFFFF', c3: '#C43C6B', top: 'mushroom', extra: ['crown'], eyes: 'sleepy', mouth: 'smile', cheek: '#FF9BB5', bw: 1.1, s: 1.02 } });

  sp('sparkham', { name: '電電鼠', types: ['electric'], bs: [40, 45, 35, 60, 45, 85], ab: 'static', evo: { lv: 22, to: 'boltham' }, rate: 120, exp: 60, ls: LS.elec,
    desc: '臉頰的電氣袋會發出藍色火花。摸牠的時候會被電得麻麻的。',
    art: { b: 'chibi', c: '#FFD94F', c2: '#FFF7D1', c3: '#FFE14D', ears: 'round', earIn: '#FFF3B0', top: 'bolt', tail: 'bolt', eyes: 'round', mouth: 'cat', cheek: '#6CCBFF', s: 0.76 } });
  sp('boltham', { name: '雷光鼠', types: ['electric'], bs: [65, 75, 55, 95, 75, 115], ab: 'static', rate: 60, exp: 155, ls: LS.elec,
    desc: '速度快得像閃電。打雷的夜晚會特別興奮。',
    art: { b: 'chibi', c: '#FFCC2E', c2: '#FFF4C2', c3: '#FFE14D', ears: 'fox', earIn: '#FFF3B0', top: 'bolt', tail: 'bolt', eyes: 'fierce', mouth: 'fang', cheek: '#6CCBFF', s: 1.0 } });

  sp('roundfin', { name: '圓鰭魚', types: ['water'], bs: [50, 60, 45, 45, 45, 60], ab: 'roughskin', evo: { lv: 25, to: 'bladeshark' }, rate: 190, exp: 58, ls: LS.shark,
    desc: '圓滾滾的小魚，喜歡跟著船隻游泳。',
    art: { b: 'fish', c: '#62B0EC', c2: '#EAF6FF', c3: '#FF9E6B', top: 'fin', eyes: 'round', mouth: 'o', cheek: '#FF9BB5', s: 0.76 } });
  sp('bladeshark', { name: '鋒鰭鯊', types: ['water', 'dark'], bs: [70, 110, 45, 80, 45, 100], ab: 'roughskin', rate: 60, exp: 161, ls: LS.shark,
    desc: '背鰭像刀一樣鋒利，在海裡游得飛快。其實很怕寂寞。',
    art: { b: 'fish', c: '#3A68B5', c2: '#F1F6FF', c3: '#D63A5A', top: 'bigfin', eyes: 'fierce', iris: '#FFD23F', mouth: 'shark', s: 1.0 } });

  sp('jellybell', { name: '水母寶', types: ['water', 'poison'], bs: [55, 40, 40, 65, 95, 60], ab: 'clearbody', evo: { lv: 28, to: 'jellyqueen' }, rate: 190, exp: 67, ls: LS.jelly,
    desc: '在海面上輕飄飄地漂浮。觸手帶有一點點毒。',
    art: { b: 'jelly', c: '#A6DDF7', c2: '#E9F8FF', c3: '#C77DFF', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.78 } });
  sp('jellyqueen', { name: '水母后', types: ['water', 'poison'], bs: [80, 60, 65, 90, 120, 90], ab: 'clearbody', rate: 60, exp: 170, ls: LS.jelly,
    desc: '海洋的女王，戴著珍珠王冠。發光的觸手很美麗。',
    art: { b: 'jelly', c: '#86C8F2', c2: '#E3F4FF', c3: '#B05CFF', extra: ['crown'], eyes: 'big', iris: '#4F7FD8', mouth: 'smile', cheek: '#FF9BB5', s: 1.04 } });

  sp('emberpony', { name: '小火駒', types: ['fire'], bs: [50, 65, 50, 45, 50, 75], ab: 'flashfire', evo: { lv: 28, to: 'flamemane' }, rate: 150, exp: 82, ls: LS.pony,
    desc: '一出生就能奔跑。鬃毛是溫暖的火焰，摸起來不會燙。',
    art: { b: 'quad', c: '#FFF0D6', c2: '#FFFFFF', c3: '#FF8A3D', ears: 'pony', earIn: '#FFD3B0', top: 'mane', tail: 'flame', eyes: 'big', iris: '#C2410C', mouth: 'smile', cheek: '#FF9BB5', s: 0.84 } });
  sp('flamemane', { name: '焰鬃馬', types: ['fire'], bs: [75, 100, 70, 80, 80, 105], ab: 'flashfire', rate: 60, exp: 175, ls: LS.pony,
    desc: '奔跑時鬃毛會燃起熊熊烈火，像流星一樣劃過草原。',
    art: { b: 'quad', c: '#FFE6C2', c2: '#FFF8EC', c3: '#FF6A1F', ears: 'pony', earIn: '#FFD3B0', top: 'bigmane', tail: 'flame', eyes: 'fierce', mouth: 'smile', extra: ['horn'], s: 1.06 } });

  sp('digmole', { name: '沙沙鼴', types: ['ground'], bs: [50, 65, 40, 30, 45, 68], ab: 'toughclaws', evo: { lv: 26, to: 'drillmole' }, rate: 150, exp: 66, ls: LS.mole,
    desc: '用小爪子挖地道。眼睛不太好，靠鼻子找路。',
    art: { b: 'chibi', c: '#B98A63', c2: '#F3DCC2', ears: 'none', eyes: 'happy', mouth: 'smile', extra: ['nose', 'claws'], cheek: '#FF9BB5', s: 0.78 } });
  sp('drillmole', { name: '鑽地鼴', types: ['ground', 'steel'], bs: [100, 120, 60, 50, 65, 88], ab: 'toughclaws', rate: 60, exp: 178, ls: LS.mole, em: ['ironhead'],
    desc: '頭上的鋼鐵鑽頭能鑽穿岩石，一天能挖出一座迷宮。',
    art: { b: 'chibi', c: '#8A5E40', c2: '#F0D9BF', c3: '#A9B6C9', top: 'drill', eyes: 'fierce', mouth: 'smile', extra: ['nose', 'claws'], bw: 1.15, s: 1.02 } });

  sp('pebbit', { name: '小石怪', types: ['rock'], bs: [40, 70, 90, 30, 30, 20], ab: 'sturdy', evo: { lv: 25, to: 'boulder' }, rate: 190, exp: 60, ls: LS.rock,
    desc: '常常被誤認成路邊的石頭。被踩到會生氣地跳起來。',
    art: { b: 'rock', c: '#B9AC93', c2: '#DDD3BF', top: 'pebble', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.72 } });
  sp('boulder', { name: '岩甲怪', types: ['rock', 'ground'], bs: [60, 95, 115, 45, 45, 35], ab: 'sturdy', evo: { lv: 40, to: 'titanrock' }, rate: 120, exp: 137, ls: LS.rock,
    desc: '身上覆蓋著堅硬的岩石盔甲，喜歡從山坡上滾下來玩。',
    art: { b: 'chibi', c: '#A8977D', c2: '#D9CCB4', c3: '#8C7B62', top: 'rockspikes', extra: ['rockarmor'], eyes: 'round', mouth: 'smile', bw: 1.15, s: 0.95 } });
  sp('titanrock', { name: '巨岩怪', types: ['rock', 'ground'], bs: [85, 120, 130, 55, 65, 45], ab: 'sturdy', rate: 45, exp: 223, ls: LS.rock,
    desc: '背上長出閃亮的水晶。走路的時候整座山都會跟著搖晃。',
    art: { b: 'chibi', c: '#8F7E66', c2: '#CDBFA6', c3: '#5FC8E8', top: 'crystal', extra: ['rockarmor'], eyes: 'fierce', mouth: 'fang', bw: 1.3, s: 1.12 } });

  sp('punchbear', { name: '拳拳熊', types: ['fighting'], bs: [60, 75, 50, 30, 45, 45], ab: 'guts', evo: { lv: 28, to: 'brawlbear' }, rate: 150, exp: 70, ls: LS.bear,
    desc: '戴著拳擊手套的小熊，每天早上都會練習揮拳一百次。',
    art: { b: 'chibi', c: '#E3A56E', c2: '#FFF0DD', ears: 'bear', earIn: '#FFE0C2', extra: ['gloves'], glove: '#FF4D5E', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.82 } });
  sp('brawlbear', { name: '武鬥熊', types: ['fighting'], bs: [95, 120, 80, 40, 65, 70], ab: 'guts', rate: 60, exp: 170, ls: LS.bear, em: ['drainpunch'],
    desc: '綁著頭帶的格鬥大師。很照顧比自己弱小的萌獸。',
    art: { b: 'chibi', c: '#C9844D', c2: '#FBE3C8', ears: 'bear', earIn: '#FBE3C8', extra: ['gloves', 'belt', 'headband'], glove: '#FF4D5E', band: '#FF4D5E', eyes: 'fierce', mouth: 'fang', bw: 1.25, s: 1.06 } });

  sp('monkchi', { name: '猴拳拳', types: ['fighting'], bs: [50, 70, 45, 35, 45, 75], ab: 'moxie', evo: { lv: 30, to: 'kungfumonkey' }, rate: 150, exp: 68, ls: LS.monk,
    desc: '好動的小猴子，最喜歡在樹枝間翻跟斗。',
    art: { b: 'chibi', c: '#E59A63', c2: '#FFE5CC', ears: 'monkey', earIn: '#FFE5CC', top: 'tuft', tail: 'curl', extra: ['headband'], band: '#3D7BFF', eyes: 'round', mouth: 'open', cheek: '#FF9BB5', s: 0.8 } });
  sp('kungfumonkey', { name: '功夫猴', types: ['fighting'], bs: [70, 105, 60, 60, 70, 105], ab: 'moxie', rate: 60, exp: 165, ls: LS.monk, em: ['drainpunch'],
    desc: '練成了快如閃電的功夫。尾巴也能用來攻擊。',
    art: { b: 'chibi', c: '#D27F45', c2: '#FFE0C2', ears: 'monkey', earIn: '#FFE0C2', top: 'tuft', tail: 'curl', extra: ['headband', 'belt'], band: '#3D7BFF', eyes: 'fierce', mouth: 'smile', s: 1.0 } });

  sp('purpleslime', { name: '紫泡泡', types: ['poison'], bs: [65, 55, 50, 50, 55, 25], ab: 'poisonpoint', evo: { lv: 30, to: 'slimeking' }, rate: 190, exp: 65, ls: LS.slime,
    desc: '黏呼呼的身體會冒出紫色泡泡。其實很愛乾淨。',
    art: { b: 'blob', c: '#B987E0', c2: '#E5CCF7', top: 'bubbles', extra: ['drips'], eyes: 'round', mouth: 'open', cheek: '#FF9BB5', s: 0.78 } });
  sp('slimeking', { name: '毒泡泡王', types: ['poison'], bs: [100, 90, 80, 70, 95, 40], ab: 'poisonpoint', rate: 75, exp: 175, ls: LS.slime,
    desc: '巨大的泡泡國王。身體裡裝滿了各式各樣的毒。',
    art: { b: 'blob', c: '#9A62CF', c2: '#D9B8F2', top: 'bubbles', extra: ['drips', 'crown'], eyes: 'happy', mouth: 'open', cheek: '#FF9BB5', bw: 1.18, s: 1.06 } });

  sp('dreamsheep', { name: '夢夢羊', types: ['psychic'], bs: [55, 35, 50, 65, 65, 45], ab: 'thickfat', evo: { lv: 30, to: 'stardream' }, rate: 150, exp: 66, ls: LS.sheep,
    desc: '抱著牠睡覺會做美夢。毛裡藏著小小的念力。',
    art: { b: 'chibi', c: '#FBF8FF', c2: '#FFFFFF', c3: '#B9A3F0', ears: 'sheep', earIn: '#E7DCFF', top: 'wool', tail: 'puff', eyes: 'sleepy', mouth: 'smile', cheek: '#FF9BB5', line: '#6E5C9E', s: 0.82 } });
  sp('stardream', { name: '星夢羊', types: ['psychic', 'fairy'], bs: [80, 50, 80, 105, 105, 75], ab: 'thickfat', rate: 60, exp: 172, ls: LS.sheep, em: ['dazzlinggleam'],
    desc: '在夜空中散步的羊。毛上沾滿了星星的光。',
    art: { b: 'chibi', c: '#F7F2FF', c2: '#FFFFFF', c3: '#FFD23F', ears: 'sheep', earIn: '#E7DCFF', top: 'moonwool', wings: 'fairy', eyes: 'star', iris: '#7B5CE6', mouth: 'smile', cheek: '#FF9BB5', line: '#6E5C9E', extra: ['curlhorns'], s: 1.04 } });

  sp('littleghost', { name: '小幽靈', types: ['ghost'], bs: [40, 35, 40, 65, 50, 70], ab: 'levitate', evo: { lv: 28, to: 'lampghost' }, rate: 150, exp: 62, ls: LS.ghost,
    desc: '喜歡從背後「哇！」地嚇人，看到大家嚇一跳就很開心。',
    art: { b: 'ghost', c: '#EDE8FF', c2: '#FFFFFF', c3: '#8F7BFF', top: 'wisp', eyes: 'big', iris: '#6B5CE0', mouth: 'open', cheek: '#FF9BB5', line: '#6656B8', s: 0.78 } });
  sp('lampghost', { name: '夜燈幽靈', types: ['ghost', 'fire'], bs: [60, 55, 65, 105, 80, 90], ab: 'flashfire', rate: 45, exp: 172, ls: LS.ghost,
    desc: '頭上點著紫色的火焰燈。迷路的人跟著光走就能回家。',
    art: { b: 'ghost', c: '#5D4C99', c2: '#8C7AD6', c3: '#B48CFF', top: 'lamp', eyes: 'glow', mouth: 'smile', s: 1.0 } });

  sp('snowfox', { name: '雪球狐', types: ['ice'], bs: [45, 45, 45, 55, 60, 65], ab: 'icebody', evo: { lv: 30, to: 'crystalfox' }, rate: 150, exp: 64, ls: LS.fox,
    desc: '毛茸茸的大尾巴可以當成圍巾。吐出的氣是小雪花。',
    art: { b: 'chibi', c: '#F5FBFF', c2: '#FFFFFF', c3: '#9FD9F5', ears: 'fox', earIn: '#BFE6FA', tail: 'foxtail', top: 'tuft', eyes: 'round', iris: '#3A8FD6', mouth: 'cat', cheek: '#FF9BB5', line: '#4E79A8', s: 0.8 } });
  sp('crystalfox', { name: '冰晶狐', types: ['ice', 'fairy'], bs: [73, 67, 75, 91, 100, 109], ab: 'icebody', rate: 60, exp: 177, ls: LS.fox, em: ['dazzlinggleam'],
    desc: '九條尾巴會閃耀冰晶的光芒。被稱為雪山的公主。',
    art: { b: 'chibi', c: '#E8F7FF', c2: '#FFFFFF', c3: '#7FD0F2', ears: 'fox', earIn: '#BFE6FA', tail: 'foxtails', top: 'crystal', eyes: 'star', iris: '#2C7FD0', mouth: 'cat', cheek: '#FF9BB5', line: '#3F6E9E', extra: ['gem'], s: 1.04 } });

  sp('babydragon', { name: '小龍寶', types: ['dragon'], bs: [45, 65, 45, 40, 45, 50], ab: 'roughskin', evo: { lv: 30, to: 'skydragon' }, rate: 45, exp: 60, ls: LS.dragon,
    desc: '非常稀有的小龍。小小的翅膀還飛不起來，正在努力練習。',
    art: { b: 'chibi', c: '#86AEF7', c2: '#FFF2C9', c3: '#FFC94D', top: 'horns', tail: 'dragon', wings: 'tiny', eyes: 'big', iris: '#3858C9', mouth: 'fang', cheek: '#FF9BB5', s: 0.8 } });
  sp('skydragon', { name: '翔龍', types: ['dragon'], bs: [65, 90, 70, 60, 70, 75], ab: 'roughskin', evo: { lv: 45, to: 'heavendragon' }, rate: 45, exp: 147, ls: LS.dragon, em: ['wingattack'],
    desc: '終於學會飛了！最喜歡在雲層之間追逐。',
    art: { b: 'chibi', c: '#5F8BEB', c2: '#FFEDBA', c3: '#FFC94D', top: 'horns', tail: 'dragon', wings: 'dragon', eyes: 'round', mouth: 'fang', extra: ['spikes'], s: 0.98 } });
  sp('heavendragon', { name: '天穹龍', types: ['dragon', 'flying'], bs: [91, 128, 90, 90, 95, 100], ab: 'multiscale', rate: 45, exp: 270, ls: LS.dragon, em: ['drillpeck'],
    desc: '傳說中的天空之王。一天之內就能繞著地區飛一圈。',
    art: { b: 'chibi', c: '#4A6FD8', c2: '#FFE7A8', c3: '#FFC94D', top: 'bighorns', tail: 'dragon', wings: 'bigdragon', eyes: 'fierce', mouth: 'fang', extra: ['spikes', 'gem'], bw: 1.18, s: 1.14 } });

  sp('shadowpup', { name: '夜影狗', types: ['dark'], bs: [45, 60, 40, 40, 40, 65], ab: 'intimidate', evo: { lv: 28, to: 'nightwolf' }, rate: 150, exp: 66, ls: LS.dog,
    desc: '晚上才出來活動的小狗。額頭上有月亮形狀的花紋。',
    art: { b: 'chibi', c: '#5A5880', c2: '#D6D0F0', c3: '#FFD23F', ears: 'dog', earIn: '#3E3C5E', top: 'moonmark', tail: 'puff', eyes: 'round', mouth: 'fang', cheek: '#FF9BB5', s: 0.8 } });
  sp('nightwolf', { name: '暗夜狼', types: ['dark'], bs: [75, 105, 65, 65, 65, 105], ab: 'intimidate', rate: 60, exp: 168, ls: LS.dog, em: ['nightslash'],
    desc: '在月光下奔跑的孤狼。對認定的夥伴非常忠誠。',
    art: { b: 'chibi', c: '#45436A', c2: '#C9C1E8', c3: '#FFD23F', ears: 'wolf', earIn: '#2E2C4A', top: 'moonmark', tail: 'foxtail', eyes: 'fierce', iris: '#FFD23F', mouth: 'fang', extra: ['scarf'], scarf: '#8B5CF6', s: 1.04 } });

  sp('pinchcrab', { name: '小鉗蟹', types: ['water'], bs: [45, 65, 75, 35, 40, 40], ab: 'toughclaws', evo: { lv: 26, to: 'ironcrab' }, rate: 150, exp: 65, ls: LS.crab,
    desc: '在沙灘上橫著走。大鉗子夾到東西就不放開。',
    art: { b: 'crab', c: '#FF8E6E', c2: '#FFE3D9', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.78 } });
  sp('ironcrab', { name: '鐵甲蟹', types: ['water', 'steel'], bs: [70, 105, 115, 50, 65, 50], ab: 'toughclaws', rate: 60, exp: 166, ls: LS.crab, em: ['ironhead'],
    desc: '殼變成了鋼鐵，連大浪都打不動牠。',
    art: { b: 'crab', c: '#5F86B5', c2: '#D7E3F2', c3: '#FF7A59', extra: ['armor'], eyes: 'fierce', mouth: 'smile', s: 1.02 } });

  sp('cottoncandy', { name: '棉花糖', types: ['fairy'], bs: [55, 35, 50, 60, 65, 40], ab: 'regenerator', evo: { lv: 28, to: 'cloudcandy' }, rate: 150, exp: 64, ls: LS.candy,
    desc: '身體軟綿綿、甜甜的。下雨天會躲起來，因為怕被淋濕。',
    art: { b: 'blob', c: '#FFC7E4', c2: '#FFFFFF', top: 'cloud', eyes: 'happy', mouth: 'smile', cheek: '#FF8FB8', extra: ['sparkles'], line: '#C25E92', s: 0.76 } });
  sp('cloudcandy', { name: '雲朵糖', types: ['fairy'], bs: [95, 55, 80, 95, 105, 60], ab: 'regenerator', rate: 60, exp: 168, ls: LS.candy, em: ['recover'],
    desc: '像雲朵一樣飄在天空。經過的地方會下起甜甜的糖粉雨。',
    art: { b: 'blob', c: '#FFB0D8', c2: '#FFF5FB', top: 'bigcloud', wings: 'fairy', eyes: 'big', iris: '#E0559A', mouth: 'smile', cheek: '#FF8FB8', extra: ['sparkles'], line: '#B44F86', s: 1.02 } });

  sp('budbud', { name: '花苞苞', types: ['grass'], bs: [45, 40, 50, 55, 55, 40], ab: 'sapsipper', evo: { lv: 20, to: 'sunflower' }, rate: 190, exp: 55, ls: LS.flower,
    desc: '頭上的花苞會在晴天慢慢打開，聞起來香香的。',
    art: { b: 'blob', c: '#A3E27F', c2: '#F2FFE8', c3: '#FF8FC0', top: 'bud', eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', extra: ['sideleaves'], s: 0.7 } });
  sp('sunflower', { name: '向陽花', types: ['grass'], bs: [75, 60, 70, 95, 85, 70], ab: 'sapsipper', rate: 90, exp: 155, ls: LS.flower,
    desc: '臉永遠朝著太陽的方向。笑容會讓身邊的人都開心起來。',
    art: { b: 'chibi', c: '#8BD066', c2: '#EFFFE0', c3: '#FFD23F', extra: ['petalring'], eyes: 'happy', mouth: 'open', cheek: '#FF9BB5', s: 0.98 } });

  sp('leafturtle', { name: '小草龜', types: ['grass'], bs: [55, 68, 64, 45, 55, 31], ab: 'overgrow', evo: { lv: 32, to: 'forestturtle' }, rate: 120, exp: 64, ls: LS.turtle,
    desc: '背殼上長出了小草。曬太陽的時候會慢慢長大。',
    art: { b: 'quad', c: '#93CF72', c2: '#F6EBC8', c3: '#B97A45', top: 'sprout', extra: ['shell'], eyes: 'round', mouth: 'smile', cheek: '#FF9BB5', s: 0.82 } });
  sp('forestturtle', { name: '森林龜', types: ['grass', 'ground'], bs: [95, 109, 105, 60, 85, 56], ab: 'overgrow', rate: 45, exp: 236, ls: LS.turtle,
    desc: '背上長著一整片小森林，常常有小鳥在上面築巢。',
    art: { b: 'quad', c: '#6DB052', c2: '#EFE1B5', c3: '#8A5A35', top: 'tree', extra: ['shell'], eyes: 'sleepy', mouth: 'smile', cheek: '#FF9BB5', bw: 1.15, s: 1.12 } });

  sp('lazypanda', { name: '懶懶熊貓', types: ['normal'], bs: [150, 105, 70, 55, 105, 30], ab: 'thickfat', rate: 25, exp: 189, ls: LS.panda,
    desc: '一天要睡二十個小時。醒著的時候都在吃竹子。',
    art: { b: 'chibi', c: '#FFFFFF', c2: '#FFFFFF', c3: '#3A3A4F', ears: 'bear', earC: '#3A3A4F', earIn: '#3A3A4F', pattern: 'panda', eyes: 'sleepy', mouth: 'smile', cheek: '#FF9BB5', line: '#3A3A4F', extra: ['bamboo'], bw: 1.35, s: 1.1 } });

  sp('applecrisp', { name: '果果龍', types: ['dragon', 'grass'], bs: [70, 80, 80, 95, 75, 60], ab: 'sapsipper', rate: 45, exp: 170, ls: LS.apple,
    desc: '住在蘋果裡的小龍。蘋果熟透的時候，牠就會跑出來。',
    art: { b: 'apple', c: '#EF4D63', c2: '#FFE3A6', c3: '#5DBB4A', top: 'appleleaf', tail: 'dragon', eyes: 'round', mouth: 'fang', cheek: '#FFB0B0', s: 0.86 } });

  // 進化前的萌獸（反查用）
  G.PREVO = {};
  for (const k of ORDER) {
    const e = S[k].evo;
    if (e) G.PREVO[e.to] = k;
  }
  G.evoChain = (key) => {
    let first = key;
    while (G.PREVO[first]) first = G.PREVO[first];
    const chain = [first];
    let cur = first;
    while (S[cur].evo) {
      chain.push(S[cur].evo.to);
      cur = S[cur].evo.to;
    }
    return chain;
  };
})();
