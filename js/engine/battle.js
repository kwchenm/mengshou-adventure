// 對戰引擎：產生事件列表交給畫面播放
(function () {
  const U = G.U;
  const zeroSt = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
  const newVol = () => ({ st: zeroSt(), flinch: false, protect: false, protectChain: 0, dmax: 0, toxN: 0, ff: false, lastMoveId: null });
  const stageMul = (s) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
  const dmaxPow = (p) => (p <= 40 ? 75 : p <= 55 ? 85 : p <= 70 ? 95 : p <= 85 ? 105 : p <= 100 ? 120 : 130);

  const statusImmune = (mon, st, mv) => {
    const t = G.SPECIES[mon.sp].types;
    if (st === 'brn' && t.includes('fire')) return true;
    if (st === 'par' && t.includes('electric')) return true;
    if ((st === 'psn' || st === 'tox') && (t.includes('poison') || t.includes('steel'))) return true;
    if (st === 'frz' && t.includes('ice')) return true;
    if (mv && mv.powder && t.includes('grass')) return true;
    if (mv && mv.cat === 'T' && mv.type === 'electric' && t.includes('ground')) return true;
    return false;
  };

  G.Dmg = {
    stageMul,
    dmaxPow,
    statusImmune,
    // A / D：{ mon, st, dmax, ff, hp, max }
    calc(A, D, mv, o = {}) {
      const am = A.mon, dm = D.mon;
      if (mv.cat === 'T') return { dmg: 0, eff: 1 };
      const ab = dm.ability;
      if (ab === 'levitate' && mv.type === 'ground') return { dmg: 0, eff: 0, immune: 'levitate' };
      if (ab === 'flashfire' && mv.type === 'fire') return { dmg: 0, eff: 0, immune: 'flashfire' };
      if (ab === 'sapsipper' && mv.type === 'grass') return { dmg: 0, eff: 0, immune: 'sapsipper' };
      const eff = G.eff(mv.type, G.SPECIES[dm.sp].types);
      if (eff === 0) return { dmg: 0, eff: 0 };
      let pow = mv.pow;
      if (mv.hex && dm.status) pow *= 2;
      if (mv.facade && am.status) pow *= 2;
      if (A.dmax) pow = dmaxPow(pow);
      const pinch = { overgrow: 'grass', blaze: 'fire', torrent: 'water', swarm: 'bug' }[am.ability];
      if (pinch === mv.type && A.hp <= A.max / 3) pow *= 1.5;
      if (A.ff && mv.type === 'fire') pow *= 1.5;
      if (am.ability === 'toughclaws' && mv.cat === 'P') pow *= 1.3;
      const phys = mv.cat === 'P';
      const ast = G.Mon.stats(am), dst = G.Mon.stats(dm);
      let atk = phys ? ast.atk : ast.spa;
      let def = phys ? dst.def : dst.spd;
      let aS = A.st[phys ? 'atk' : 'spa'], dS = D.st[phys ? 'def' : 'spd'];
      if (o.crit) { aS = Math.max(0, aS); dS = Math.min(0, dS); }
      atk *= stageMul(aS);
      def *= stageMul(dS);
      if (am.ability === 'guts' && am.status && phys) atk *= 1.5;
      const base = Math.floor(Math.floor((Math.floor((2 * am.lv) / 5 + 2) * pow * atk) / def) / 50) + 2;
      let mod = eff;
      if (G.SPECIES[am.sp].types.includes(mv.type)) mod *= 1.5;
      if (o.crit) mod *= 1.5;
      if (am.status === 'brn' && phys && am.ability !== 'guts') mod *= 0.5;
      if (ab === 'thickfat' && (mv.type === 'fire' || mv.type === 'ice')) mod *= 0.5;
      if (ab === 'multiscale' && D.hp >= D.max) mod *= 0.5;
      const roll = o.roll ?? U.rand(85, 100) / 100;
      return { dmg: Math.max(1, Math.floor(base * mod * roll)), eff };
    },
  };

  const STATUS_MSG = {
    brn: (n) => `${n} 被灼傷了！`,
    par: (n) => `${n} 麻痺了！可能會動不了！`,
    psn: (n) => `${n} 中毒了！`,
    tox: (n) => `${n} 中了劇毒！`,
    slp: (n) => `${n} 睡著了！`,
    frz: (n) => `${n} 被凍住了！`,
  };

  class Battle {
    // o: { kind:'wild'|'trainer', pTeam, eTeam, trainer, player:{name,bag}, aiLv, allowDmax }
    constructor(o) {
      this.kind = o.kind;
      this.trainer = o.trainer || null;
      this.player = o.player;
      this.aiLv = o.aiLv ?? 1;
      this.allowDmax = !!o.allowDmax;
      this.S = {
        p: { team: o.pTeam, idx: Math.max(0, o.pTeam.findIndex((m) => m.hp > 0)), vol: newVol(), dmaxUsed: !this.allowDmax },
        e: { team: o.eTeam, idx: 0, vol: newVol(), dmaxUsed: !(this.trainer && this.trainer.dmax), items: Object.assign({}, (this.trainer && this.trainer.items) || {}) },
      };
      this.ev = [];
      this.over = false;
      this.result = null;
      this.need = null;
      this.turnNo = 0;
      this.partic = {};
      this.learnQ = [];
      this.seen = new Set();
      this.money = 0;
      this.runTries = 0;
      this.lastSwitch = { p: -9, e: -9 };
      this.acts = null;
      this.moved = { p: false, e: false };
      this.downed = new Set();
    }

    // ── 基本查詢 ──
    foe(side) { return side === 'p' ? 'e' : 'p'; }
    mon(side) { const s = this.S[side]; return s.team[s.idx]; }
    nm(side) {
      const n = G.Mon.name(this.mon(side));
      if (side === 'p') return n;
      return this.kind === 'wild' ? `野生的${n}` : `對手的${n}`;
    }
    maxHp(side) {
      const base = G.Mon.stats(this.mon(side)).hp;
      return this.S[side].vol.dmax > 0 ? Math.floor(base * 1.5) : base;
    }
    effSpeed(side) {
      const m = this.mon(side);
      let s = G.Mon.stats(m).spe * stageMul(this.S[side].vol.st.spe);
      if (m.status === 'par') s *= 0.5;
      return s;
    }
    bt(side) {
      const V = this.S[side].vol, m = this.mon(side);
      return { mon: m, st: V.st, dmax: V.dmax > 0, ff: V.ff, hp: m.hp, max: this.maxHp(side) };
    }
    view(side) {
      const m = this.mon(side), V = this.S[side].vol;
      return {
        uid: m.uid, sp: m.sp, name: G.Mon.name(m), lv: m.lv, hp: Math.max(0, m.hp), max: this.maxHp(side),
        status: m.status, st: Object.assign({}, V.st), dmax: V.dmax, types: G.SPECIES[m.sp].types,
        exp: side === 'p' ? G.Mon.expProgress(m) : 0, friend: m.friend,
      };
    }
    speedOrder() {
      const a = this.effSpeed('p'), b = this.effSpeed('e');
      return a > b || (a === b && Math.random() < 0.5) ? ['p', 'e'] : ['e', 'p'];
    }
    prio(side) {
      const a = this.acts[side];
      if (a.type !== 'move' || a.idx < 0) return 0;
      return G.MOVES[this.mon(side).moves[a.idx].id].pri;
    }

    // ── 事件 ──
    emit(e) { this.ev.push(e); }
    msg(text) { this.ev.push({ t: 'msg', text }); }
    emitView(t, side) { this.emit({ t, side, view: this.view(side) }); }

    // ── 開場 ──
    start() {
      this.ev = [];
      const e = this.mon('e');
      this.seen.add(e.sp);
      if (this.kind === 'wild') {
        this.emit({ t: 'send', side: 'e', view: this.view('e'), wild: true });
        this.msg(`野生的 ${G.Mon.name(e)} 跳出來了！`);
      } else {
        this.emit({ t: 'trainer', on: true });
        this.msg(`${this.trainer.cls} ${this.trainer.name} 想要和你對戰！`);
        if (this.trainer.intro) this.msg(`${this.trainer.name}：「${this.trainer.intro}」`);
        this.emit({ t: 'trainer', on: false });
        this.msg(`${this.trainer.name} 派出了 ${G.Mon.name(e)}！`);
        this.emit({ t: 'send', side: 'e', view: this.view('e') });
      }
      this.msg(`去吧！${G.Mon.name(this.mon('p'))}！`);
      this.emit({ t: 'send', side: 'p', view: this.view('p') });
      this.markPartic();
      for (const s of this.speedOrder()) this.entryAbility(s);
      return this.ev;
    }

    markPartic() {
      const e = this.mon('e'), p = this.mon('p');
      if (e.hp > 0 && p.hp > 0) (this.partic[e.uid] = this.partic[e.uid] || new Set()).add(p.uid);
    }

    entryAbility(side) {
      const m = this.mon(side);
      if (m.hp <= 0) return;
      if (m.ability === 'intimidate' && this.mon(this.foe(side)).hp > 0) {
        this.msg(`${this.nm(side)} 的「威嚇」讓對手害怕了！`);
        this.changeStages(this.foe(side), { atk: -1 }, side);
      }
    }

    // ── 一回合 ──
    turn(pAct) {
      this.ev = [];
      if (this.over) return this.ev;
      this.turnNo++;
      this.markPartic();
      const eAct = this.kind === 'wild' ? G.AI.wild(this) : G.AI.choose(this);
      this.acts = { p: pAct, e: eAct };
      this.moved = { p: false, e: false };
      if (pAct.type === 'switch') this.lastSwitch.p = this.turnNo;

      // 先處理換人、道具、丟球、逃跑
      for (const side of ['p', 'e']) {
        if (this.over) return this.ev;
        const a = this.acts[side];
        if (a.type === 'run') this.tryRun();
        else if (a.type === 'switch') { this.doSwitch(side, a.idx); this.moved[side] = true; }
        else if (a.type === 'item') { side === 'p' ? this.useItemP(a) : this.useItemE(a.item); this.moved[side] = true; }
        else if (a.type === 'ball') { this.throwBall(a.item); this.moved[side] = true; }
      }
      if (this.over) return this.ev;

      // 星光巨大化
      for (const side of ['p', 'e']) {
        const a = this.acts[side];
        if (a.type === 'move' && a.dmax && !this.S[side].dmaxUsed && this.mon(side).hp > 0) this.dynamax(side);
      }

      // 出招順序：先制度 → 速度
      const movers = ['p', 'e'].filter((s) => this.acts[s].type === 'move');
      movers.sort((x, y) => this.prio(y) - this.prio(x) || this.effSpeed(y) - this.effSpeed(x) || Math.random() - 0.5);
      for (const side of movers) {
        if (this.over) break;
        if (this.mon(side).hp <= 0) continue;
        let idx = this.acts[side].idx;
        const m = this.mon(side);
        if (idx >= 0 && (!m.moves[idx] || m.moves[idx].pp <= 0)) idx = -1;
        if (idx < 0 && m.moves.some((x) => x.pp > 0)) idx = m.moves.findIndex((x) => x.pp > 0);
        if (idx < 0) this.msg(`${this.nm(side)} 已經沒有可以使用的招式了！`);
        this.useMove(side, idx);
        this.moved[side] = true;
      }
      if (!this.over) this.endTurn();
      if (!this.over) this.resolveFaints();
      return this.ev;
    }

    forceSwitch(idx) {
      this.ev = [];
      this.need = null;
      this.switchIn('p', idx);
      return this.ev;
    }

    // ── 招式 ──
    useMove(side, idx) {
      const S = this.S[side], m = this.mon(side), n = this.nm(side);
      const tSide = this.foe(side), T = this.S[tSide], t = this.mon(tSide), tn = this.nm(tSide);
      const slot = idx >= 0 ? m.moves[idx] : null;
      const mv = slot ? G.MOVES[slot.id] : G.MOVES.struggle;

      if (m.status === 'frz') {
        if (U.chance(20)) { m.status = null; this.msg(`${n} 身上的冰融化了！`); this.emitView('status', side); }
        else { this.emit({ t: 'fx', side, kind: 'frz' }); this.msg(`${n} 被凍住了，動不了！`); return; }
      }
      if (m.status === 'slp') {
        m.slp--;
        if (m.slp <= 0) { m.status = null; this.msg(`${n} 醒過來了！`); this.emitView('status', side); }
        else { this.emit({ t: 'fx', side, kind: 'slp' }); this.msg(`${n} 正在呼呼大睡……`); return; }
      }
      if (S.vol.flinch) { this.msg(`${n} 畏縮了，沒辦法行動！`); return; }
      if (m.status === 'par' && U.chance(25)) { this.emit({ t: 'fx', side, kind: 'par' }); this.msg(`${n} 身體麻痺，動不了！`); return; }

      if (slot) slot.pp = Math.max(0, slot.pp - 1);
      S.vol.lastMoveId = mv.id;
      const dm = S.vol.dmax > 0;
      this.msg(`${n} 使出了${dm && mv.cat !== 'T' ? '巨大' : ''}「${mv.name}」！`);

      if (mv.protect) {
        if (U.chance(100 / Math.pow(3, S.vol.protectChain))) {
          S.vol.protect = true;
          S.vol.protectChain++;
          this.emit({ t: 'fx', side, kind: 'protect' });
          this.msg(`${n} 守住了自己！`);
        } else {
          S.vol.protectChain = 0;
          this.msg('但是失敗了！');
        }
        return;
      }
      S.vol.protectChain = 0;

      const hitsFoe = mv.cat !== 'T' || mv.st || mv.foe;
      if (hitsFoe) {
        if (t.hp <= 0) { this.msg('但是沒有目標……'); return; }
        if (mv.sucker) {
          const ta = this.acts && this.acts[tSide];
          const tm = ta && ta.type === 'move' ? (ta.idx >= 0 ? G.MOVES[t.moves[ta.idx].id] : G.MOVES.struggle) : null;
          if (this.moved[tSide] || !tm || tm.cat === 'T') { this.msg('但是失敗了！'); return; }
        }
        if (T.vol.protect) {
          this.emit({ t: 'atk', side, type: mv.type, cat: mv.cat, blocked: true });
          this.msg(`${tn} 守住了攻擊！`);
          return;
        }
        const acc = dm && mv.cat !== 'T' ? null : mv.acc;
        if (acc !== null && !U.chance(acc)) {
          this.emit({ t: 'atk', side, type: mv.type, cat: mv.cat, miss: true });
          this.msg(mv.cat === 'T' ? '但是沒有命中！' : `${tn} 閃開了攻擊！`);
          return;
        }
      }
      if (mv.cat === 'T') return this.statusMove(side, mv);

      const A = this.bt(side), D = this.bt(tSide);
      const pre = G.Dmg.calc(A, D, mv, { roll: 1 });
      if (pre.immune) {
        this.emit({ t: 'atk', side, type: mv.type, cat: mv.cat, blocked: true });
        this.handleImmune(tSide, pre.immune);
        return;
      }
      if (pre.eff === 0) {
        this.emit({ t: 'atk', side, type: mv.type, cat: mv.cat, blocked: true });
        this.msg(`對 ${tn} 好像沒有效果……`);
        return;
      }
      const cs = (mv.crit ? 1 : 0) + (side === 'p' && m.friend >= 70 ? 1 : 0);
      const crit = U.chance([4.17, 12.5, 50, 100][Math.min(cs, 3)]);
      const r = G.Dmg.calc(A, D, mv, { crit });
      this.emit({ t: 'atk', side, type: mv.type, cat: mv.cat, dmax: dm });
      let dmg = Math.min(r.dmg, t.hp);
      const tmax = this.maxHp(tSide);
      let endured = null;
      if (dmg >= t.hp && t.hp > 1) {
        if (t.ability === 'sturdy' && t.hp === tmax) { dmg = t.hp - 1; endured = 'sturdy'; }
        else if (tSide === 'p' && t.friend >= 50 && U.chance(t.friend >= 90 ? 25 : 12)) { dmg = t.hp - 1; endured = 'friend'; }
      }
      t.hp -= dmg;
      this.emit({ t: 'hit', side: tSide, eff: r.eff, crit, dmg, type: mv.type });
      this.emitView('hp', tSide);
      if (crit) this.msg('擊中要害了！');
      if (r.eff > 1) this.msg(r.eff >= 4 ? '效果超級絕佳！！' : '效果絕佳！');
      else if (r.eff < 1) this.msg('效果不太好……');
      if (endured === 'sturdy') this.msg(`${tn} 靠著「結實」撐住了！`);
      if (endured === 'friend') this.msg(`${tn} 為了不讓${this.player.name}傷心，咬緊牙關撐住了！`);

      if (mv.drain && dmg > 0 && m.hp > 0) this.healHp(side, Math.max(1, Math.floor(dmg * mv.drain)), `${tn} 的體力被吸走了！`);
      if (mv.recoil && dmg > 0 && m.hp > 0) {
        const rc = Math.max(1, Math.floor((mv.id === 'struggle' ? this.maxHp(side) : dmg) * mv.recoil));
        m.hp = Math.max(0, m.hp - rc);
        this.emitView('hp', side);
        this.msg(`${n} 受到了反作用力的傷害！`);
      }
      if (t.hp > 0) {
        if (t.status === 'frz' && mv.type === 'fire') { t.status = null; this.emitView('status', tSide); this.msg(`${tn} 身上的冰融化了！`); }
        if (mv.st && U.chance(mv.st[1])) this.tryStatus(tSide, mv.st[0], false, mv);
        if (mv.foe && (!mv.foeCh || U.chance(mv.foeCh))) this.changeStages(tSide, mv.foe, side);
        if (mv.fl && !this.moved[tSide] && !T.vol.dmax && U.chance(mv.fl)) T.vol.flinch = true;
        if (mv.cat === 'P' && m.hp > 0) this.contactAbility(side, tSide);
      }
      if (mv.self && m.hp > 0 && (!mv.selfCh || U.chance(mv.selfCh))) this.changeStages(side, mv.self, side);
      if (t.hp <= 0) {
        this.faint(tSide);
        if (m.ability === 'moxie' && m.hp > 0 && !this.over) {
          this.msg(`${n} 的「自信過度」發動了！`);
          this.changeStages(side, { atk: 1 }, side);
        }
      }
      if (m.hp <= 0) this.faint(side);
    }

    statusMove(side, mv) {
      const m = this.mon(side), n = this.nm(side), tSide = this.foe(side);
      this.emit({ t: 'atk', side, type: mv.type, cat: 'T', self: !!(mv.self || mv.heal) && !mv.st && !mv.foe });
      if (mv.heal) {
        const mx = this.maxHp(side);
        if (m.hp >= mx) this.msg('但是 HP 已經是滿的了！');
        else this.healHp(side, Math.floor(mx * mv.heal), `${n} 回復了體力！`);
      }
      if (mv.self) this.changeStages(side, mv.self, side);
      if (mv.st) this.tryStatus(tSide, mv.st[0], true, mv);
      if (mv.foe) this.changeStages(tSide, mv.foe, side);
    }

    handleImmune(tSide, kind) {
      const tn = this.nm(tSide);
      if (kind === 'levitate') this.msg(`${tn} 浮在空中，地面招式打不到！`);
      if (kind === 'flashfire') {
        this.S[tSide].vol.ff = true;
        this.msg(`${tn} 的「引火」把火焰吸收了！火屬性招式變強了！`);
      }
      if (kind === 'sapsipper') {
        this.msg(`${tn} 的「食草」把招式吃掉了！`);
        this.changeStages(tSide, { atk: 1 }, tSide);
      }
    }

    contactAbility(aSide, dSide) {
      const a = this.mon(aSide), d = this.mon(dSide);
      const dn = this.nm(dSide), an = this.nm(aSide);
      const abName = G.ABILITIES[d.ability] ? G.ABILITIES[d.ability].name : '';
      if (d.ability === 'static' && !a.status && U.chance(30) && !statusImmune(a, 'par')) {
        this.msg(`${dn} 的「${abName}」電到了 ${an}！`);
        this.tryStatus(aSide, 'par');
      } else if (d.ability === 'poisonpoint' && !a.status && U.chance(30) && !statusImmune(a, 'psn')) {
        this.msg(`${dn} 的「${abName}」刺到了 ${an}！`);
        this.tryStatus(aSide, 'psn');
      } else if (d.ability === 'effectspore' && !a.status && U.chance(30)) {
        const st = U.pick(['psn', 'par', 'slp']);
        if (!statusImmune(a, st) && !G.SPECIES[a.sp].types.includes('grass')) {
          this.msg(`${dn} 撒出了孢子！`);
          this.tryStatus(aSide, st);
        }
      } else if (d.ability === 'roughskin' && a.hp > 0) {
        const dmg = Math.max(1, Math.floor(this.maxHp(aSide) / 8));
        a.hp = Math.max(0, a.hp - dmg);
        this.emitView('hp', aSide);
        this.msg(`${an} 被 ${dn} 的「粗糙皮膚」刮傷了！`);
      }
    }

    tryStatus(side, st, fromMove = false, mv = null) {
      const m = this.mon(side), n = this.nm(side);
      if (m.hp <= 0) return false;
      if (m.status) {
        if (fromMove) this.msg(m.status === st ? `${n} 已經${G.STATUS_INFO[st].name}了！` : '但是失敗了！');
        return false;
      }
      if (statusImmune(m, st, mv)) {
        if (fromMove) this.msg(`對 ${n} 好像沒有效果……`);
        return false;
      }
      m.status = st;
      if (st === 'slp') m.slp = U.rand(2, 4);
      if (st === 'tox') this.S[side].vol.toxN = 0;
      this.emit({ t: 'fx', side, kind: st });
      this.emitView('status', side);
      this.msg(STATUS_MSG[st](n));
      return true;
    }

    changeStages(side, ch, src) {
      const m = this.mon(side), n = this.nm(side), st = this.S[side].vol.st;
      if (m.hp <= 0) return;
      for (const [k, d] of Object.entries(ch)) {
        if (d < 0 && src !== side && m.ability === 'clearbody') {
          this.msg(`${n} 的「恆淨之軀」讓能力不會被降低！`);
          continue;
        }
        const before = st[k];
        st[k] = U.clamp(st[k] + d, -6, 6);
        const real = st[k] - before;
        const sn = G.STAT_NAMES[k];
        if (real === 0) {
          this.msg(`${n} 的${sn}已經${d > 0 ? '不能再提升' : '不能再降低'}了！`);
          continue;
        }
        this.emit({ t: 'stat', side, stat: k, delta: real, view: this.view(side) });
        const word = Math.abs(real) >= 3 ? '巨幅' : Math.abs(real) === 2 ? '大幅' : '';
        this.msg(`${n} 的${sn}${word}${real > 0 ? '提升' : '降低'}了！`);
      }
    }

    healHp(side, amt, text) {
      const m = this.mon(side), mx = this.maxHp(side);
      m.hp = Math.min(mx, m.hp + amt);
      this.emit({ t: 'fx', side, kind: 'heal' });
      this.emitView('hp', side);
      if (text) this.msg(text);
    }

    residual(side, amt, text) {
      const m = this.mon(side);
      m.hp = Math.max(0, m.hp - amt);
      this.emit({ t: 'fx', side, kind: m.status || 'hurt' });
      this.emitView('hp', side);
      this.msg(text);
    }

    // ── 回合結束 ──
    endTurn() {
      for (const side of this.speedOrder()) {
        const m = this.mon(side);
        if (m.hp <= 0) continue;
        const n = this.nm(side), mx = this.maxHp(side), V = this.S[side].vol;
        if (m.status === 'brn') this.residual(side, Math.max(1, Math.floor(mx / 16)), `${n} 受到灼傷的傷害！`);
        else if (m.status === 'psn') this.residual(side, Math.max(1, Math.floor(mx / 8)), `${n} 受到毒的傷害！`);
        else if (m.status === 'tox') {
          V.toxN = Math.min(15, V.toxN + 1);
          this.residual(side, Math.max(1, Math.floor((mx * V.toxN) / 16)), `${n} 受到劇毒的傷害！`);
        }
        if (m.hp <= 0) { this.faint(side); continue; }
        if (m.ability === 'icebody' && m.hp < mx) this.healHp(side, Math.max(1, Math.floor(mx / 16)), `${n} 的「冰晶之軀」回復了一點 HP！`);
        if (m.ability === 'speedboost') this.changeStages(side, { spe: 1 }, side);
        if (side === 'p' && m.status && m.friend >= 90 && U.chance(20)) {
          m.status = null;
          this.emitView('status', side);
          this.msg(`${n} 不想讓${this.player.name}擔心，自己治好了異常狀態！`);
        }
        if (V.dmax > 0) {
          V.dmax--;
          if (V.dmax === 0) this.endDmax(side);
        }
      }
      for (const s of ['p', 'e']) {
        this.S[s].vol.flinch = false;
        this.S[s].vol.protect = false;
      }
    }

    faint(side) {
      const m = this.mon(side);
      if (this.downed.has(m.uid)) return;
      this.downed.add(m.uid);
      m.hp = 0;
      if (this.S[side].vol.dmax) this.endDmax(side, true);
      m.status = null;
      m.slp = 0;
      this.emit({ t: 'faint', side });
      this.msg(`${this.nm(side)} 倒下了！`);
      if (side === 'e') this.giveExp(m);
      else m.friend = Math.max(0, m.friend - 1);
    }

    resolveFaints() {
      const pDown = this.mon('p').hp <= 0, eDown = this.mon('e').hp <= 0;
      const pAlive = this.S.p.team.some((m) => m.hp > 0);
      const eAlive = this.S.e.team.some((m) => m.hp > 0);
      if (eDown && !eAlive) return this.win();
      if (pDown && !pAlive) return this.lose();
      if (eDown) this.switchIn('e', G.AI.pickNext(this));
      if (pDown) this.need = 'switch';
    }

    win() {
      this.over = true;
      this.result = 'win';
      if (this.trainer) {
        this.emit({ t: 'trainer', on: true });
        this.msg(`打敗了${this.trainer.cls} ${this.trainer.name}！`);
        if (this.trainer.lose) this.msg(`${this.trainer.name}：「${this.trainer.lose}」`);
        const top = Math.max(...this.S.e.team.map((m) => m.lv));
        this.money = (this.trainer.money || 40) * top;
        this.msg(`${this.player.name} 獲得了 $${this.money} 獎金！`);
      }
    }

    lose() {
      this.over = true;
      this.result = 'lose';
      this.msg(`${this.player.name} 已經沒有可以戰鬥的萌獸了……`);
    }

    // ── 經驗值 ──
    giveExp(em) {
      const base = G.SPECIES[em.sp].exp, L = em.lv;
      const part = this.partic[em.uid] || new Set([this.mon('p').uid]);
      const later = [];
      let shared = false;
      for (const pm of this.S.p.team) {
        if (pm.hp <= 0 || pm.lv >= G.MAX_LV) continue;
        const Lp = pm.lv;
        let e = ((base * L) / 5) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5) + 1;
        if (this.kind === 'trainer') e *= 1.5;
        e *= G.EXP_MULT;
        const isPart = part.has(pm.uid);
        if (!isPart) e *= 0.5;
        e = Math.max(1, Math.floor(e));
        const name = G.Mon.name(pm);
        const active = pm === this.mon('p');
        const out = [];
        if (isPart) this.msg(`${name} 獲得了 ${e} 點經驗值！`);
        else shared = true;
        const ups = G.Mon.addExp(pm, e);
        if (active) this.emit({ t: 'exp', side: 'p', levels: ups.length, view: this.view('p') });
        for (const u of ups) {
          if (active) out.push({ t: 'levelup', side: 'p', lv: u.lv });
          out.push({ t: 'msg', text: `${name} 升到了 Lv.${u.lv}！` });
          for (const id of u.newMoves) {
            if (pm.moves.length < 4) {
              G.Mon.learn(pm, id);
              out.push({ t: 'msg', text: `${name} 學會了「${G.MOVES[id].name}」！` });
            } else if (!this.learnQ.some((q) => q.uid === pm.uid && q.id === id)) {
              this.learnQ.push({ uid: pm.uid, id });
            }
          }
        }
        if (active && ups.length) out.push({ t: 'hp', side: 'p', view: this.view('p') });
        if (isPart) out.forEach((x) => this.emit(x));
        else later.push(...out);
      }
      if (shared) this.msg('隊伍裡的其他夥伴也一起獲得了經驗值！');
      later.forEach((x) => this.emit(x));
    }

    // ── 星光巨大化 ──
    dynamax(side) {
      const S = this.S[side], m = this.mon(side), n = this.nm(side);
      S.dmaxUsed = true;
      if (side === 'p') this.msg(`${this.player.name} 把星光的力量傳給了 ${n}！`);
      else this.msg(`${this.trainer.name}：「讓你見識我的全力吧！」`);
      S.vol.dmax = 3;
      m.hp = Math.floor(m.hp * 1.5);
      this.emit({ t: 'dmax', side, on: true, view: this.view(side) });
      this.msg(`${n} 星光巨大化了！`);
    }

    endDmax(side, silent) {
      const m = this.mon(side), V = this.S[side].vol;
      V.dmax = 0;
      if (m.hp > 0) m.hp = Math.max(1, Math.ceil(m.hp / 1.5));
      this.emit({ t: 'dmax', side, on: false, view: this.view(side) });
      if (!silent) this.msg(`${this.nm(side)} 恢復成原本的大小了！`);
    }

    // ── 換人 ──
    switchOut(side) {
      const S = this.S[side], m = this.mon(side);
      if (S.vol.dmax) this.endDmax(side, true);
      if (m.ability === 'regenerator' && m.hp > 0) m.hp = Math.min(G.Mon.stats(m).hp, m.hp + Math.floor(G.Mon.stats(m).hp / 3));
      this.msg(side === 'p' ? `${G.Mon.name(m)}，回來吧！` : `${this.trainer.name} 收回了 ${G.Mon.name(m)}！`);
      this.emit({ t: 'recall', side });
    }

    switchIn(side, idx) {
      const S = this.S[side];
      S.idx = idx;
      S.vol = newVol();
      const m = this.mon(side);
      if (side === 'e') {
        this.seen.add(m.sp);
        this.msg(`${this.trainer ? this.trainer.name : ''} 派出了 ${G.Mon.name(m)}！`);
      } else {
        this.msg(`就決定是你了！${G.Mon.name(m)}！`);
      }
      this.emit({ t: 'send', side, view: this.view(side) });
      this.markPartic();
      this.entryAbility(side);
    }

    doSwitch(side, idx) {
      this.switchOut(side);
      this.switchIn(side, idx);
    }

    // ── 道具 / 捕捉 / 逃跑 ──
    useItemP(a) {
      const it = G.ITEMS[a.item], m = this.S.p.team[a.target], n = G.Mon.name(m);
      this.player.bag[a.item] = Math.max(0, (this.player.bag[a.item] || 0) - 1);
      this.msg(`${this.player.name} 使用了 ${it.name}！`);
      const active = a.target === this.S.p.idx;
      const mx = active ? this.maxHp('p') : G.Mon.stats(m).hp;
      if (it.kind === 'heal') {
        const before = m.hp;
        m.hp = Math.min(mx, m.hp + it.heal);
        if (active) { this.emit({ t: 'fx', side: 'p', kind: 'heal' }); this.emitView('hp', 'p'); }
        this.msg(`${n} 回復了 ${m.hp - before} HP！`);
      } else if (it.kind === 'cure') {
        m.status = null;
        m.slp = 0;
        if (active) this.emitView('status', 'p');
        this.msg(`${n} 的異常狀態治好了！`);
      } else if (it.kind === 'revive') {
        m.hp = Math.floor(G.Mon.stats(m).hp / 2);
        this.downed.delete(m.uid);
        this.msg(`${n} 恢復了精神！`);
      }
    }

    useItemE(item) {
      const it = G.ITEMS[item], m = this.mon('e');
      this.msg(`${this.trainer.name} 使用了 ${it.name}！`);
      const before = m.hp;
      m.hp = Math.min(this.maxHp('e'), m.hp + it.heal);
      this.emit({ t: 'fx', side: 'e', kind: 'heal' });
      this.emitView('hp', 'e');
      this.msg(`${this.nm('e')} 回復了 ${m.hp - before} HP！`);
    }

    throwBall(item) {
      const it = G.ITEMS[item];
      this.player.bag[item] = Math.max(0, (this.player.bag[item] || 0) - 1);
      this.msg(`${this.player.name} 丟出了 ${it.name}！`);
      if (this.kind !== 'wild') {
        this.emit({ t: 'ball', item, shakes: -1, ok: false });
        this.msg('訓練家把球彈開了！不可以搶別人的萌獸喔！');
        return;
      }
      const e = this.mon('e'), mx = this.maxHp('e'), rate = G.SPECIES[e.sp].rate;
      const stMul = e.status === 'slp' || e.status === 'frz' ? 2.5 : e.status ? 1.5 : 1;
      const a = (((3 * mx - 2 * e.hp) * rate * it.mul) / (3 * mx)) * stMul;
      const p = Math.min(1, a / 255);
      const ok = Math.random() < p;
      let shakes = 3;
      if (!ok) {
        const q = Math.pow(p, 0.25);
        shakes = 0;
        while (shakes < 2 && Math.random() < q) shakes++;
      }
      this.emit({ t: 'ball', item, shakes, ok });
      if (ok) {
        this.msg(`太好了！抓到 ${G.Mon.name(e)} 了！`);
        this.over = true;
        this.result = 'caught';
        this.caught = e;
      } else {
        this.msg([`${G.Mon.name(e)} 從球裡跳出來了！`, '哎呀！還以為抓到了！', '啊！就差一點點！'][shakes]);
      }
    }

    // 對戰結束後還原巨大化等暫時狀態
    cleanup() {
      for (const side of ['p', 'e']) {
        const V = this.S[side].vol, m = this.mon(side);
        if (V.dmax > 0) {
          V.dmax = 0;
          if (m.hp > 0) m.hp = Math.min(G.Mon.stats(m).hp, Math.max(1, Math.ceil(m.hp / 1.5)));
        }
      }
      for (const m of this.S.p.team) m.hp = Math.min(m.hp, G.Mon.stats(m).hp);
    }

    tryRun() {
      if (this.kind !== 'wild') { this.msg('不能從訓練家對戰中逃走！'); return; }
      this.runTries++;
      const ps = this.effSpeed('p'), es = this.effSpeed('e');
      const odds = ps >= es ? 256 : Math.floor((ps * 128) / es) + 30 * this.runTries;
      if (Math.random() * 256 < odds) {
        this.msg('順利逃走了！');
        this.over = true;
        this.result = 'run';
      } else this.msg('逃不掉！');
    }
  }

  G.Battle = Battle;
})();
