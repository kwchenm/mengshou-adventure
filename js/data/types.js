// 18 種屬性與相剋表
(function () {
  G.TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  G.TYPE_INFO = {
    normal:   { name: '一般',   color: '#A8A77A', icon: '⭐' },
    fire:     { name: '火',     color: '#F08030', icon: '🔥' },
    water:    { name: '水',     color: '#4F8EF0', icon: '💧' },
    electric: { name: '電',     color: '#F2C200', icon: '⚡' },
    grass:    { name: '草',     color: '#5DBB4A', icon: '🌿' },
    ice:      { name: '冰',     color: '#5CC8D0', icon: '❄️' },
    fighting: { name: '格鬥',   color: '#C9302C', icon: '👊' },
    poison:   { name: '毒',     color: '#A040A0', icon: '🧪' },
    ground:   { name: '地面',   color: '#D4A847', icon: '⛰️' },
    flying:   { name: '飛行',   color: '#8F7FEA', icon: '🪶' },
    psychic:  { name: '超能力', color: '#F85888', icon: '🔮' },
    bug:      { name: '蟲',     color: '#9AB51A', icon: '🐛' },
    rock:     { name: '岩石',   color: '#B49A3A', icon: '🪨' },
    ghost:    { name: '幽靈',   color: '#705898', icon: '👻' },
    dragon:   { name: '龍',     color: '#6A3CF5', icon: '🐉' },
    dark:     { name: '惡',     color: '#6B5546', icon: '🌙' },
    steel:    { name: '鋼',     color: '#8C94B8', icon: '⚙️' },
    fairy:    { name: '妖精',   color: '#E27AB4', icon: '✨' },
  };

  // 攻擊屬性 → 防守屬性 的倍率（沒寫的就是 1）
  const C = {
    normal:   { rock: .5, ghost: 0, steel: .5 },
    fire:     { fire: .5, water: .5, grass: 2, ice: 2, bug: 2, rock: .5, dragon: .5, steel: 2 },
    water:    { fire: 2, water: .5, grass: .5, ground: 2, rock: 2, dragon: .5 },
    electric: { water: 2, electric: .5, grass: .5, ground: 0, flying: 2, dragon: .5 },
    grass:    { fire: .5, water: 2, grass: .5, poison: .5, ground: 2, flying: .5, bug: .5, rock: 2, dragon: .5, steel: .5 },
    ice:      { fire: .5, water: .5, grass: 2, ice: .5, ground: 2, flying: 2, dragon: 2, steel: .5 },
    fighting: { normal: 2, ice: 2, poison: .5, flying: .5, psychic: .5, bug: .5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: .5 },
    poison:   { grass: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0, fairy: 2 },
    ground:   { fire: 2, electric: 2, grass: .5, poison: 2, flying: 0, bug: .5, rock: 2, steel: 2 },
    flying:   { electric: .5, grass: 2, fighting: 2, bug: 2, rock: .5, steel: .5 },
    psychic:  { fighting: 2, poison: 2, psychic: .5, dark: 0, steel: .5 },
    bug:      { fire: .5, grass: 2, fighting: .5, poison: .5, flying: .5, psychic: 2, ghost: .5, dark: 2, steel: .5, fairy: .5 },
    rock:     { fire: 2, ice: 2, fighting: .5, ground: .5, flying: 2, bug: 2, steel: .5 },
    ghost:    { normal: 0, psychic: 2, ghost: 2, dark: .5 },
    dragon:   { dragon: 2, steel: .5, fairy: 0 },
    dark:     { fighting: .5, psychic: 2, ghost: 2, dark: .5, fairy: .5 },
    steel:    { fire: .5, water: .5, electric: .5, ice: 2, rock: 2, steel: .5, fairy: 2 },
    fairy:    { fire: .5, fighting: 2, poison: .5, dragon: 2, dark: 2, steel: .5 },
  };
  G.TYPE_CHART = C;

  G.eff1 = (atk, def) => (C[atk][def] === undefined ? 1 : C[atk][def]);
  G.eff = (atk, defTypes) => defTypes.reduce((m, t) => m * G.eff1(atk, t), 1);

  // 防守方的弱點整理
  G.defProfile = (defTypes) => {
    const out = { x4: [], x2: [], half: [], quarter: [], zero: [] };
    for (const t of G.TYPES) {
      const e = G.eff(t, defTypes);
      if (e === 0) out.zero.push(t);
      else if (e >= 4) out.x4.push(t);
      else if (e >= 2) out.x2.push(t);
      else if (e <= 0.25) out.quarter.push(t);
      else if (e < 1) out.half.push(t);
    }
    return out;
  };

  G.effLabel = (e) => {
    if (e === 0) return { text: '沒有效果', short: '×0', cls: 'e0' };
    if (e >= 4) return { text: '超級有效', short: '×4', cls: 'e4' };
    if (e >= 2) return { text: '效果絕佳', short: '×2', cls: 'e2' };
    if (e <= 0.25) return { text: '幾乎沒效', short: '×¼', cls: 'eq' };
    if (e < 1) return { text: '效果不好', short: '×½', cls: 'eh' };
    return { text: '普通', short: '×1', cls: 'e1' };
  };

  // 給小朋友的記憶小口訣
  G.TYPE_TIPS = {
    normal: '沒有特別擅長打誰，但很穩定。一般招式摸不到幽靈，打岩石和鋼也不痛。',
    fire: '火會燒掉草🌿、融化冰❄️、烤熟蟲🐛、熔化鋼⚙️。但是怕水💧、地面⛰️和岩石🪨。',
    water: '水能澆熄火🔥，還能沖垮地面⛰️和岩石🪨。被草🌿吸收、被電⚡導電要小心。',
    electric: '電流最會打水💧和天上的飛行🪶！可是地面⛰️會把電導走，完全沒效。',
    grass: '草會吸收水💧，把根扎進地面⛰️和岩石🪨裡。怕火、冰、毒、飛行和蟲。',
    ice: '冰能凍住草🌿、地面⛰️、飛行🪶，還有龍🐉！自己卻怕火、格鬥、岩石和鋼。',
    fighting: '拳頭能打碎岩石🪨、鋼⚙️、冰❄️，也能打倒一般和惡🌙。但打不到幽靈👻。',
    poison: '毒能讓草🌿枯萎、讓妖精✨中毒。對鋼⚙️完全沒用。',
    ground: '地面能埋住火🔥、電⚡、毒、岩石和鋼。飛行🪶會飛走，打不到喔！',
    flying: '從天上攻擊草🌿、蟲🐛和格鬥👊。怕電⚡、冰❄️和岩石🪨。',
    psychic: '用念力壓制格鬥👊和毒🧪。但是惡🌙屬性完全不怕超能力。',
    bug: '蟲蟲很會打草🌿、超能力🔮和惡🌙。可是很多屬性都能擋住牠。',
    rock: '大石頭能砸下飛行🪶，還能擋住火🔥、冰❄️和蟲🐛。',
    ghost: '幽靈最會嚇唬超能力🔮和其他幽靈👻。一般屬性摸不到幽靈。',
    dragon: '只有龍才能對付龍🐉！不過妖精✨完全不怕龍的招式。',
    dark: '惡屬性擅長偷襲超能力🔮和幽靈👻。怕格鬥、蟲和妖精。',
    steel: '鋼能擊碎岩石🪨、冰❄️和妖精✨。防守超強，很多屬性都打不痛它。',
    fairy: '妖精能打敗龍🐉、格鬥👊和惡🌙！但怕毒🧪和鋼⚙️。',
  };

  G.STATUS_INFO = {
    brn: { name: '灼傷', icon: '🔥', color: '#F08030', desc: '每回合受到傷害，物理招式威力減半。' },
    par: { name: '麻痺', icon: '⚡', color: '#E0B000', desc: '速度變慢，有 1/4 機率動不了。' },
    psn: { name: '中毒', icon: '🧪', color: '#A040A0', desc: '每回合受到 1/8 HP 的傷害。' },
    tox: { name: '劇毒', icon: '☠️', color: '#7A1F8A', desc: '每回合受到的傷害越來越多！' },
    slp: { name: '睡著', icon: '💤', color: '#6C7AA8', desc: '睡著時不能行動，1～3 回合後醒來。' },
    frz: { name: '冰凍', icon: '🧊', color: '#4FB8D8', desc: '被凍住不能行動，每回合有機會融化。' },
  };

  G.STAT_NAMES = { hp: 'HP', atk: '攻擊', def: '防禦', spa: '特攻', spd: '特防', spe: '速度' };
  G.STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
})();
