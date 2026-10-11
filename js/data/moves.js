// 招式資料
// cat: P = 物理, S = 特殊, T = 變化
(function () {
  const MV = (G.MOVES = {});
  const M = (id, name, type, cat, pow, acc, pp, x = {}) => {
    MV[id] = Object.assign({ id, name, type, cat, pow, acc, pp, pri: 0 }, x);
  };

  // 一般
  M('tackle', '撞擊', 'normal', 'P', 40, 100, 35);
  M('scratch', '抓抓', 'normal', 'P', 40, 100, 35);
  M('quickattack', '快速突擊', 'normal', 'P', 40, 100, 30, { pri: 1 });
  M('headbutt', '頭錘', 'normal', 'P', 70, 100, 15, { fl: 30 });
  M('facade', '硬撐', 'normal', 'P', 70, 100, 20, { facade: 1 });
  M('bodyslam', '泰山壓頂', 'normal', 'P', 85, 100, 15, { st: ['par', 30] });
  M('doubleedge', '捨身衝撞', 'normal', 'P', 120, 100, 15, { recoil: 1 / 3 });
  M('swift', '高速星星', 'normal', 'S', 60, null, 20);
  M('hypervoice', '巨聲', 'normal', 'S', 90, 100, 10);
  M('growl', '叫聲', 'normal', 'T', 0, 100, 40, { foe: { atk: -1 } });
  M('tailwhip', '搖尾巴', 'normal', 'T', 0, 100, 30, { foe: { def: -1 } });
  M('harden', '變硬', 'normal', 'T', 0, null, 30, { self: { def: 1 } });
  M('swordsdance', '劍舞', 'normal', 'T', 0, null, 20, { self: { atk: 2 } });
  M('recover', '自我再生', 'normal', 'T', 0, null, 10, { heal: 0.5 });
  M('protect', '守住', 'normal', 'T', 0, null, 10, { pri: 4, protect: 1 });
  M('sing', '唱歌', 'normal', 'T', 0, 55, 15, { st: ['slp', 100] });

  // 火
  M('ember', '火花', 'fire', 'S', 40, 100, 25, { st: ['brn', 10] });
  M('flamecharge', '蓄能焰襲', 'fire', 'P', 50, 100, 20, { self: { spe: 1 } });
  M('flamewheel', '火焰輪', 'fire', 'P', 60, 100, 25, { st: ['brn', 10] });
  M('firefang', '火焰牙', 'fire', 'P', 65, 95, 15, { st: ['brn', 10], fl: 10 });
  M('firepunch', '火焰拳', 'fire', 'P', 75, 100, 15, { st: ['brn', 10] });
  M('flamethrower', '噴射火焰', 'fire', 'S', 90, 100, 15, { st: ['brn', 10] });
  M('fireblast', '大字爆炎', 'fire', 'S', 110, 85, 5, { st: ['brn', 10] });
  M('flareblitz', '閃焰衝鋒', 'fire', 'P', 120, 100, 15, { recoil: 1 / 3, st: ['brn', 10] });
  M('overheat', '過熱', 'fire', 'S', 130, 90, 5, { self: { spa: -2 } });
  M('willowisp', '鬼火', 'fire', 'T', 0, 85, 15, { st: ['brn', 100] });

  // 水
  M('watergun', '水槍', 'water', 'S', 40, 100, 25);
  M('aquajet', '水流噴射', 'water', 'P', 40, 100, 20, { pri: 1 });
  M('waterpulse', '水之波動', 'water', 'S', 60, 100, 20);
  M('bubblebeam', '泡沫光線', 'water', 'S', 65, 100, 20, { foe: { spe: -1 }, foeCh: 10 });
  M('waterfall', '攀瀑', 'water', 'P', 80, 100, 15, { fl: 20 });
  M('liquidation', '水流裂破', 'water', 'P', 85, 100, 10, { foe: { def: -1 }, foeCh: 20 });
  M('surf', '衝浪', 'water', 'S', 90, 100, 15);
  M('hydropump', '水炮', 'water', 'S', 110, 80, 5);

  // 電
  M('thundershock', '電擊', 'electric', 'S', 40, 100, 30, { st: ['par', 10] });
  M('shockwave', '電擊波', 'electric', 'S', 60, null, 20);
  M('spark', '電光', 'electric', 'P', 65, 100, 20, { st: ['par', 30] });
  M('thunderpunch', '雷電拳', 'electric', 'P', 75, 100, 15, { st: ['par', 10] });
  M('thunderbolt', '十萬伏特', 'electric', 'S', 90, 100, 15, { st: ['par', 10] });
  M('wildcharge', '瘋狂伏特', 'electric', 'P', 90, 100, 15, { recoil: 1 / 4 });
  M('thunder', '打雷', 'electric', 'S', 110, 70, 10, { st: ['par', 30] });
  M('thunderwave', '電磁波', 'electric', 'T', 0, 90, 20, { st: ['par', 100] });

  // 草
  M('vinewhip', '藤鞭', 'grass', 'P', 45, 100, 25);
  M('megadrain', '超級吸取', 'grass', 'S', 40, 100, 15, { drain: 0.5 });
  M('razorleaf', '飛葉快刀', 'grass', 'P', 55, 95, 25, { crit: 1 });
  M('magicalleaf', '魔法葉', 'grass', 'S', 60, null, 20);
  M('seedbomb', '種子炸彈', 'grass', 'P', 80, 100, 15);
  M('gigadrain', '終極吸取', 'grass', 'S', 75, 100, 10, { drain: 0.5 });
  M('energyball', '能量球', 'grass', 'S', 90, 100, 10, { foe: { spd: -1 }, foeCh: 10 });
  M('leafblade', '葉刃', 'grass', 'P', 90, 100, 15, { crit: 1 });
  M('leafstorm', '飛葉風暴', 'grass', 'S', 130, 90, 5, { self: { spa: -2 } });
  M('sleeppowder', '催眠粉', 'grass', 'T', 0, 75, 15, { st: ['slp', 100], powder: 1 });
  M('stunspore', '麻痺粉', 'grass', 'T', 0, 75, 30, { st: ['par', 100], powder: 1 });
  M('synthesis', '光合作用', 'grass', 'T', 0, null, 5, { heal: 0.5 });

  // 冰
  M('powdersnow', '細雪', 'ice', 'S', 40, 100, 25, { st: ['frz', 10] });
  M('iceshard', '冰礫', 'ice', 'P', 40, 100, 30, { pri: 1 });
  M('icefang', '冰凍牙', 'ice', 'P', 65, 95, 15, { st: ['frz', 10], fl: 10 });
  M('aurorabeam', '極光束', 'ice', 'S', 65, 100, 20, { foe: { atk: -1 }, foeCh: 10 });
  M('icepunch', '冰凍拳', 'ice', 'P', 75, 100, 15, { st: ['frz', 10] });
  M('iciclecrash', '冰柱墜擊', 'ice', 'P', 85, 90, 10, { fl: 30 });
  M('icebeam', '冰凍光束', 'ice', 'S', 90, 100, 10, { st: ['frz', 10] });
  M('blizzard', '暴風雪', 'ice', 'S', 110, 70, 5, { st: ['frz', 10] });

  // 格鬥
  M('rocksmash', '碎岩', 'fighting', 'P', 40, 100, 15, { foe: { def: -1 }, foeCh: 50 });
  M('machpunch', '音速拳', 'fighting', 'P', 40, 100, 30, { pri: 1 });
  M('karatechop', '空手劈', 'fighting', 'P', 50, 100, 25, { crit: 1 });
  M('brickbreak', '劈瓦', 'fighting', 'P', 75, 100, 15);
  M('drainpunch', '吸取拳', 'fighting', 'P', 75, 100, 10, { drain: 0.5 });
  M('aurasphere', '波導彈', 'fighting', 'S', 80, null, 20);
  M('closecombat', '近身戰', 'fighting', 'P', 120, 100, 5, { self: { def: -1, spd: -1 } });
  M('focusblast', '真氣彈', 'fighting', 'S', 120, 70, 5, { foe: { spd: -1 }, foeCh: 10 });
  M('bulkup', '健美', 'fighting', 'T', 0, null, 20, { self: { atk: 1, def: 1 } });

  // 毒
  M('poisonsting', '毒針', 'poison', 'P', 35, 100, 35, { st: ['psn', 30] });
  M('acid', '溶解液', 'poison', 'S', 40, 100, 30, { foe: { spd: -1 }, foeCh: 10 });
  M('sludge', '污泥攻擊', 'poison', 'S', 65, 100, 20, { st: ['psn', 30] });
  M('poisonjab', '毒擊', 'poison', 'P', 80, 100, 20, { st: ['psn', 30] });
  M('sludgebomb', '污泥炸彈', 'poison', 'S', 90, 100, 10, { st: ['psn', 30] });
  M('gunkshot', '垃圾射擊', 'poison', 'P', 120, 80, 5, { st: ['psn', 30] });
  M('poisonpowder', '毒粉', 'poison', 'T', 0, 75, 35, { st: ['psn', 100], powder: 1 });
  M('toxic', '劇毒', 'poison', 'T', 0, 90, 10, { st: ['tox', 100] });

  // 地面
  M('mudslap', '擲泥', 'ground', 'S', 30, 100, 10);
  M('mudshot', '泥巴射擊', 'ground', 'S', 55, 95, 15, { foe: { spe: -1 } });
  M('bulldoze', '重踏', 'ground', 'P', 60, 100, 20, { foe: { spe: -1 } });
  M('drillrun', '直衝鑽', 'ground', 'P', 80, 95, 10, { crit: 1 });
  M('earthpower', '大地之力', 'ground', 'S', 90, 100, 10, { foe: { spd: -1 }, foeCh: 10 });
  M('earthquake', '地震', 'ground', 'P', 100, 100, 10);

  // 飛行
  M('peck', '啄', 'flying', 'P', 35, 100, 35);
  M('gust', '起風', 'flying', 'S', 40, 100, 35);
  M('wingattack', '翅膀攻擊', 'flying', 'P', 60, 100, 35);
  M('aerialace', '燕返', 'flying', 'P', 60, null, 20);
  M('airslash', '空氣斬', 'flying', 'S', 75, 95, 15, { fl: 30 });
  M('drillpeck', '啄鑽', 'flying', 'P', 80, 100, 20);
  M('hurricane', '暴風', 'flying', 'S', 110, 70, 10);
  M('bravebird', '勇鳥猛攻', 'flying', 'P', 120, 100, 15, { recoil: 1 / 3 });
  M('roost', '羽棲', 'flying', 'T', 0, null, 10, { heal: 0.5 });

  // 超能力
  M('confusion', '念力', 'psychic', 'S', 50, 100, 25);
  M('psybeam', '幻象光線', 'psychic', 'S', 65, 100, 20);
  M('zenheadbutt', '意念頭錘', 'psychic', 'P', 80, 90, 15, { fl: 20 });
  M('psychic', '精神強念', 'psychic', 'S', 90, 100, 10, { foe: { spd: -1 }, foeCh: 10 });
  M('calmmind', '冥想', 'psychic', 'T', 0, null, 20, { self: { spa: 1, spd: 1 } });
  M('agility', '高速移動', 'psychic', 'T', 0, null, 30, { self: { spe: 2 } });
  M('hypnosis', '催眠術', 'psychic', 'T', 0, 60, 20, { st: ['slp', 100] });

  // 蟲
  M('bugbite', '蟲咬', 'bug', 'P', 60, 100, 20);
  M('strugglebug', '蟲之抵抗', 'bug', 'S', 50, 100, 20, { foe: { spa: -1 } });
  M('leechlife', '吸血', 'bug', 'P', 80, 100, 10, { drain: 0.5 });
  M('xscissor', '十字剪', 'bug', 'P', 80, 100, 15);
  M('bugbuzz', '蟲鳴', 'bug', 'S', 90, 100, 10, { foe: { spd: -1 }, foeCh: 10 });
  M('stringshot', '吐絲', 'bug', 'T', 0, 95, 40, { foe: { spe: -2 } });
  M('quiverdance', '蝶舞', 'bug', 'T', 0, null, 20, { self: { spa: 1, spd: 1, spe: 1 } });

  // 岩石
  M('rockthrow', '落石', 'rock', 'P', 50, 90, 15);
  M('rocktomb', '岩石封鎖', 'rock', 'P', 60, 95, 15, { foe: { spe: -1 } });
  M('ancientpower', '原始之力', 'rock', 'S', 60, 100, 5, { self: { atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }, selfCh: 10 });
  M('rockslide', '岩崩', 'rock', 'P', 75, 90, 10, { fl: 30 });
  M('powergem', '力量寶石', 'rock', 'S', 80, 100, 20);
  M('stoneedge', '尖石攻擊', 'rock', 'P', 100, 80, 5, { crit: 1 });
  M('rockpolish', '岩石打磨', 'rock', 'T', 0, null, 20, { self: { spe: 2 } });

  // 幽靈
  M('astonish', '驚嚇', 'ghost', 'P', 30, 100, 15, { fl: 30 });
  M('lick', '舌舔', 'ghost', 'P', 30, 100, 30, { st: ['par', 30] });
  M('shadowsneak', '影子偷襲', 'ghost', 'P', 40, 100, 30, { pri: 1 });
  M('hex', '禍不單行', 'ghost', 'S', 65, 100, 10, { hex: 1 });
  M('shadowclaw', '暗影爪', 'ghost', 'P', 70, 100, 15, { crit: 1 });
  M('shadowball', '暗影球', 'ghost', 'S', 80, 100, 15, { foe: { spd: -1 }, foeCh: 20 });

  // 龍
  M('twister', '龍捲風', 'dragon', 'S', 40, 100, 20, { fl: 20 });
  M('dragonbreath', '龍息', 'dragon', 'S', 60, 100, 20, { st: ['par', 30] });
  M('dragonclaw', '龍爪', 'dragon', 'P', 80, 100, 15);
  M('dragonpulse', '龍之波動', 'dragon', 'S', 85, 100, 10);
  M('dragonrush', '龍之俯衝', 'dragon', 'P', 100, 75, 10, { fl: 20 });
  M('dracometeor', '流星群', 'dragon', 'S', 130, 90, 5, { self: { spa: -2 } });
  M('dragondance', '龍之舞', 'dragon', 'T', 0, null, 20, { self: { atk: 1, spe: 1 } });

  // 惡
  M('bite', '咬住', 'dark', 'P', 60, 100, 25, { fl: 30 });
  M('snarl', '大聲咆哮', 'dark', 'S', 55, 95, 15, { foe: { spa: -1 } });
  M('suckerpunch', '突襲', 'dark', 'P', 70, 100, 5, { pri: 1, sucker: 1 });
  M('nightslash', '暗襲要害', 'dark', 'P', 70, 100, 15, { crit: 1 });
  M('crunch', '咬碎', 'dark', 'P', 80, 100, 15, { foe: { def: -1 }, foeCh: 20 });
  M('darkpulse', '惡之波動', 'dark', 'S', 80, 100, 15, { fl: 20 });
  M('nastyplot', '詭計', 'dark', 'T', 0, null, 20, { self: { spa: 2 } });

  // 鋼
  M('metalclaw', '金屬爪', 'steel', 'P', 50, 95, 35, { self: { atk: 1 }, selfCh: 10 });
  M('bulletpunch', '子彈拳', 'steel', 'P', 40, 100, 30, { pri: 1 });
  M('steelwing', '鋼翼', 'steel', 'P', 70, 90, 25, { self: { def: 1 }, selfCh: 10 });
  M('ironhead', '鐵頭', 'steel', 'P', 80, 100, 15, { fl: 30 });
  M('flashcannon', '加農光炮', 'steel', 'S', 80, 100, 10, { foe: { spd: -1 }, foeCh: 10 });
  M('irondefense', '鐵壁', 'steel', 'T', 0, null, 15, { self: { def: 2 } });

  // 妖精
  M('fairywind', '妖精之風', 'fairy', 'S', 40, 100, 30);
  M('disarmingvoice', '魅惑之聲', 'fairy', 'S', 40, null, 15);
  M('drainingkiss', '吸取之吻', 'fairy', 'S', 50, 100, 10, { drain: 0.75 });
  M('dazzlinggleam', '魔法閃耀', 'fairy', 'S', 80, 100, 10);
  M('playrough', '嬉鬧', 'fairy', 'P', 90, 90, 10, { foe: { atk: -1 }, foeCh: 10 });
  M('moonblast', '月亮之力', 'fairy', 'S', 95, 100, 15, { foe: { spa: -1 }, foeCh: 30 });
  M('charm', '撒嬌', 'fairy', 'T', 0, 100, 20, { foe: { atk: -2 } });

  // PP 用完時
  M('struggle', '掙扎', 'normal', 'P', 50, null, 1, { recoil: 0.25 });

  // 招式說明（自動產生）
  const lvWord = (n) => (Math.abs(n) >= 2 ? '大幅' : '');
  const statText = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => `${G.STAT_NAMES[k]}${v > 0 ? '提升' : '降低'}${Math.abs(v)}級`)
      .join('、');

  G.moveDesc = (id) => {
    const m = MV[id];
    const parts = [];
    if (m.pri > 0 && !m.protect) parts.push('一定會比對手先出手');
    if (m.protect) parts.push('這回合完全擋住對手的攻擊，連續使用容易失敗');
    if (m.sucker) parts.push('對手準備攻擊時才會成功');
    if (m.hex) parts.push('對手陷入異常狀態時威力加倍');
    if (m.facade) parts.push('自己陷入異常狀態時威力加倍');
    if (m.crit) parts.push('容易擊中要害');
    if (m.acc === null && m.cat !== 'T') parts.push('一定會命中');
    if (m.drain) parts.push(`回復造成傷害的 ${Math.round(m.drain * 100)}%`);
    if (m.recoil) parts.push(`自己也會受到 ${m.recoil > 0.3 ? '1/3' : '1/4'} 的反作用傷害`);
    if (m.heal) parts.push('回復自己一半的 HP');
    if (m.st) {
      const s = G.STATUS_INFO[m.st[0]].name;
      parts.push(m.st[1] >= 100 ? `讓對手${s}` : `${m.st[1]}% 機率讓對手${s}`);
    }
    if (m.fl) parts.push(`${m.fl}% 機率讓對手畏縮`);
    if (m.self) parts.push((m.selfCh ? `${m.selfCh}% 機率讓自己的` : '自己的') + statText(m.self));
    if (m.foe) parts.push((m.foeCh ? `${m.foeCh}% 機率讓對手的` : '對手的') + statText(m.foe));
    if (m.powder) parts.push('草屬性不受粉末影響');
    if (!parts.length) parts.push('普通的攻擊招式');
    return parts.join('；') + '。';
  };

  G.CAT_INFO = {
    P: { name: '物理', icon: '💥', desc: '用身體碰撞的攻擊，看「攻擊」和對手的「防禦」' },
    S: { name: '特殊', icon: '🌀', desc: '發射能量的攻擊，看「特攻」和對手的「特防」' },
    T: { name: '變化', icon: '🔆', desc: '不造成傷害，改變能力或狀態' },
  };
})();
