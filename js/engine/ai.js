// 對手 AI：0 = 輕鬆、1 = 標準、2 = 挑戰
(function () {
  const U = G.U;
  const AI = (G.AI = {});

  const bench = (b, side, i) => {
    const m = b.S[side].team[i];
    return { mon: m, st: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, dmax: false, ff: false, hp: m.hp, max: G.Mon.stats(m).hp };
  };

  // 預期傷害佔對方「目前 HP」的比例（>= 1 代表大概能打倒）
  AI.moveValue = (A, D, mv) => {
    if (mv.cat === 'T') return 0;
    const r = G.Dmg.calc(A, D, mv, { roll: 0.925 });
    if (r.immune || r.eff === 0) return 0;
    const acc = A.dmax || mv.acc === null ? 1 : mv.acc / 100;
    return (r.dmg / Math.max(1, D.hp)) * acc;
  };

  AI.best = (A, D) => {
    let best = { v: 0, idx: -1 };
    A.mon.moves.forEach((s, i) => {
      if (s.pp <= 0) return;
      const v = AI.moveValue(A, D, G.MOVES[s.id]);
      if (v > best.v) best = { v, idx: i };
    });
    return best;
  };

  AI.scoreMove = (b, me, foe, mv, c) => {
    const fm = foe.mon;
    if (mv.cat !== 'T') {
      const v = AI.moveValue(me, foe, mv);
      if (v <= 0) return -60;
      let sc = Math.min(v, 1) * 100;
      if (v >= 1) {
        sc = 150 + (mv.acc ?? 100) / 10;
        if (mv.pri > 0 && c.foeSpe >= c.meSpe) sc += 40;
      }
      if (mv.recoil && c.myHpPct < 0.3) sc -= 10;
      if (mv.self && Object.values(mv.self).some((d) => d < 0) && v < 1) sc -= 8;
      if (mv.st && !fm.status && mv.st[1] >= 30) sc += 6;
      if (mv.sucker) sc -= 18;
      return sc;
    }
    if (mv.protect) {
      if (b.S.e.vol.lastMoveId === 'protect') return -40;
      return b.S.p.vol.dmax ? 70 : fm.status === 'tox' || fm.status === 'psn' || fm.status === 'brn' ? 30 : 6;
    }
    if (mv.heal) {
      if (c.myHpPct > 0.75) return -30;
      if (c.myHpPct < 0.45 && c.foeBest.v < 0.5) return 95;
      return c.myHpPct < 0.55 ? 50 : 10;
    }
    if (mv.st) {
      const st = mv.st[0];
      if (fm.status || G.Dmg.statusImmune(fm, st, mv)) return -40;
      let sc = 50;
      const fs = G.Mon.stats(fm);
      if (st === 'slp') sc = 78;
      if (st === 'par') sc = c.foeSpe > c.meSpe ? 74 : 45;
      if (st === 'brn') sc = fs.atk > fs.spa ? 76 : 30;
      if (st === 'tox' || st === 'psn') sc = 54;
      if (c.foeBest.v >= 1 && c.foeSpe > c.meSpe) sc -= 35;
      return sc * ((mv.acc ?? 100) / 100);
    }
    if (mv.self) {
      const keys = Object.keys(mv.self);
      if (keys.every((k) => b.S.e.vol.st[k] >= 2)) return -20;
      if (c.myHpPct > 0.6 && c.foeBest.v < 0.35) return 88;
      if (c.myHpPct > 0.5 && c.foeBest.v < 0.5) return 55;
      return 4;
    }
    if (mv.foe) {
      const k = Object.keys(mv.foe)[0];
      if (b.S.p.vol.st[k] <= -2) return -10;
      const fs = G.Mon.stats(fm);
      if (k === 'atk' && fs.atk < fs.spa) return 4;
      return c.foeBest.v >= 0.5 ? 18 : 30;
    }
    return 0;
  };

  AI.choose = (b) => {
    const lvl = b.aiLv;
    const me = b.bt('e'), foe = b.bt('p');
    const m = me.mon;
    const usable = m.moves.map((s, i) => ({ s, i, mv: G.MOVES[s.id] })).filter((x) => x.s.pp > 0);
    if (!usable.length) return { type: 'move', idx: -1 };
    const meSpe = b.effSpeed('e'), foeSpe = b.effSpeed('p');
    const foeBest = AI.best(foe, me);
    const myBest = AI.best(me, foe);
    const myHpPct = m.hp / me.max;
    const alive = b.S.e.team.filter((x) => x.hp > 0).length;

    // 1. 補血道具
    const items = b.S.e.items || {};
    const healItem = ['hyperpotion', 'superpotion', 'potion'].find((k) => items[k] > 0);
    if (lvl >= 1 && healItem && myHpPct < 0.3 && !(myBest.v >= 1 && meSpe > foeSpe) && Math.random() < (lvl >= 2 ? 0.9 : 0.6)) {
      items[healItem]--;
      return { type: 'item', item: healItem };
    }

    // 2. 屬性不利時換人
    if (lvl >= 1 && b.kind === 'trainer' && alive > 1 && b.turnNo - b.lastSwitch.e > 2 && !b.S.e.vol.dmax) {
      if (foeBest.v >= 0.8 && myBest.v < 0.45 && !(myBest.v >= 1 && meSpe > foeSpe)) {
        let pick = null;
        b.S.e.team.forEach((cm, i) => {
          if (i === b.S.e.idx || cm.hp <= 0) return;
          const C = bench(b, 'e', i);
          const threat = AI.best(foe, C).v;
          const off = AI.best(C, foe).v;
          const score = off - threat;
          if (threat < 0.5 && (!pick || score > pick.score)) pick = { i, score };
        });
        if (pick && Math.random() < (lvl >= 2 ? 0.75 : 0.35)) {
          b.lastSwitch.e = b.turnNo;
          return { type: 'switch', idx: pick.i };
        }
      }
    }

    // 3. 招式評分
    const c = { meSpe, foeSpe, foeBest, myHpPct };
    const scored = usable.map((x) => ({ x, sc: AI.scoreMove(b, me, foe, x.mv, c) + Math.random() * [45, 18, 6][lvl] }));
    let pick;
    if (lvl === 0 && Math.random() < 0.35) pick = U.pick(scored);
    else pick = scored.sort((a, z) => z.sc - a.sc)[0];
    const act = { type: 'move', idx: pick.x.i };

    // 4. 王牌或最後一隻時使用星光巨大化
    if (!b.S.e.dmaxUsed && (b.S.e.idx === b.S.e.team.length - 1 || alive === 1)) act.dmax = true;
    return act;
  };

  // 野生萌獸：隨機出招，但偏好攻擊招式
  AI.wild = (b) => {
    const m = b.mon('e');
    const usable = m.moves.map((s, i) => ({ s, i, mv: G.MOVES[s.id] })).filter((x) => x.s.pp > 0);
    if (!usable.length) return { type: 'move', idx: -1 };
    const pick = U.weighted(usable.map((x) => [x, x.mv.cat === 'T' ? 1 : 3]));
    return { type: 'move', idx: pick.i };
  };

  // 訓練家的下一隻
  AI.pickNext = (b) => {
    const team = b.S.e.team;
    const alive = team.map((m, i) => i).filter((i) => team[i].hp > 0);
    if (b.aiLv === 0 || alive.length === 1) return alive[0];
    const foe = b.bt('p');
    let best = null;
    for (const i of alive) {
      const C = bench(b, 'e', i);
      let sc = AI.best(C, foe).v - AI.best(foe, C).v * 0.8;
      if (i === team.length - 1 && alive.length > 1) sc -= 0.6; // 王牌留到最後
      if (!best || sc > best.sc) best = { i, sc };
    }
    return best.i;
  };
})();
