// 萌獸個體：建立、能力值、經驗值、招式學習
(function () {
  const U = G.U;
  const KEYS = G.STAT_KEYS;
  G.EXP_MULT = 1.6;
  G.MAX_LV = 100;

  const Mon = (G.Mon = {});

  Mon.expFor = (lv) => lv * lv * lv;

  Mon.movesAt = (sp, lv) => {
    const ls = G.SPECIES[sp].ls;
    const ids = [];
    for (const [l, id] of ls) {
      if (l > lv) break;
      const i = ids.indexOf(id);
      if (i >= 0) ids.splice(i, 1);
      ids.push(id);
    }
    return ids.slice(-4).map((id) => ({ id, pp: G.MOVES[id].pp }));
  };

  // opts: { ivs:'wild'|'trainer'|'perfect', moves:[ids], friend }
  Mon.create = (sp, lv, opts = {}) => {
    const S = G.SPECIES[sp];
    const ivs = {};
    for (const k of KEYS) {
      ivs[k] = opts.ivs === 'perfect' ? 31 : opts.ivs === 'trainer' ? opts.ivVal ?? 20 : U.rand(6, 31);
    }
    const mon = {
      uid: U.uid(),
      sp,
      nick: '',
      lv,
      exp: Mon.expFor(lv),
      ivs,
      train: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      friend: opts.friend ?? 30,
      ability: S.ab,
      moves: opts.moves ? opts.moves.map((id) => ({ id, pp: G.MOVES[id].pp })) : Mon.movesAt(sp, lv),
      status: null,
      slp: 0,
      hp: 1,
    };
    mon.hp = Mon.stats(mon).hp;
    return mon;
  };

  Mon.stats = (mon) => {
    const S = G.SPECIES[mon.sp];
    const out = {};
    KEYS.forEach((k, i) => {
      const b = S.bs[i];
      const iv = mon.ivs[k];
      let v = k === 'hp'
        ? Math.floor(((2 * b + iv) * mon.lv) / 100) + mon.lv + 10
        : Math.floor(((2 * b + iv) * mon.lv) / 100) + 5;
      const tr = (mon.train && mon.train[k]) || 0;
      v = Math.floor(v * (1 + tr * 0.06));
      out[k] = v;
    });
    return out;
  };

  Mon.name = (mon) => mon.nick || G.SPECIES[mon.sp].name;
  Mon.types = (mon) => G.SPECIES[mon.sp].types;

  Mon.expProgress = (mon) => {
    if (mon.lv >= G.MAX_LV) return 1;
    const a = Mon.expFor(mon.lv), b = Mon.expFor(mon.lv + 1);
    return U.clamp((mon.exp - a) / (b - a), 0, 1);
  };

  // 加經驗值，回傳升級紀錄 [{lv, newMoves:[ids]}]
  Mon.addExp = (mon, amount) => {
    const ups = [];
    if (mon.lv >= G.MAX_LV) return ups;
    mon.exp += amount;
    while (mon.lv < G.MAX_LV && mon.exp >= Mon.expFor(mon.lv + 1)) {
      const before = Mon.stats(mon).hp;
      mon.lv++;
      const after = Mon.stats(mon).hp;
      if (mon.hp > 0) mon.hp = Math.min(after, mon.hp + (after - before));
      mon.friend = Math.min(100, mon.friend + 1);
      const newMoves = G.SPECIES[mon.sp].ls.filter(([l]) => l === mon.lv).map(([, id]) => id)
        .filter((id) => !mon.moves.some((m) => m.id === id));
      ups.push({ lv: mon.lv, newMoves });
    }
    return ups;
  };

  Mon.levelUp = (mon) => {
    if (mon.lv >= G.MAX_LV) return [];
    return Mon.addExp(mon, Mon.expFor(mon.lv + 1) - mon.exp);
  };

  Mon.canEvolve = (mon) => {
    const e = G.SPECIES[mon.sp].evo;
    return e && mon.lv >= e.lv ? e.to : null;
  };

  Mon.evolve = (mon) => {
    const to = Mon.canEvolve(mon);
    if (!to) return null;
    const before = Mon.stats(mon).hp;
    mon.sp = to;
    mon.ability = G.SPECIES[to].ab;
    const after = Mon.stats(mon).hp;
    if (mon.hp > 0) mon.hp = Math.min(after, mon.hp + (after - before));
    const em = (G.SPECIES[to].em || []).filter((id) => !mon.moves.some((m) => m.id === id));
    // 進化當下等級的招式也一併學
    const lvMoves = G.SPECIES[to].ls.filter(([l]) => l === mon.lv).map(([, id]) => id)
      .filter((id) => !mon.moves.some((m) => m.id === id) && !em.includes(id));
    return { to, newMoves: em.concat(lvMoves) };
  };

  Mon.learn = (mon, id, replaceIdx = -1) => {
    if (mon.moves.some((m) => m.id === id)) return false;
    const slot = { id, pp: G.MOVES[id].pp };
    if (mon.moves.length < 4) mon.moves.push(slot);
    else if (replaceIdx >= 0) mon.moves[replaceIdx] = slot;
    else return false;
    return true;
  };

  Mon.heal = (mon) => {
    mon.hp = Mon.stats(mon).hp;
    mon.status = null;
    mon.slp = 0;
    mon.moves.forEach((m) => (m.pp = G.MOVES[m.id].pp));
  };

  Mon.trainTotal = (mon) => KEYS.reduce((s, k) => s + (mon.train[k] || 0), 0);
})();
