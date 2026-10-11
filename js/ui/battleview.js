// 對戰畫面：播放引擎事件、選擇指令、屬性小幫手
(function () {
  const U = G.U;
  const BV = (G.BattleView = {});
  let b, cfg, disp, resolveChoice, dmaxArmed, tipIdx = 0;
  const $ = (s) => document.querySelector(s);
  const speed = () => G.Game.state.settings.speed;

  const TIPS = [
    '同屬性加成：萌獸使用和自己屬性一樣的招式，威力 ×1.5！（招式上有 ★同屬性）',
    '兩個屬性的萌獸，弱點會相乘：例如岩石＋地面被水打到是 ×4！',
    '速度快的萌獸先攻擊。「快速突擊」這種先制招式一定先出手。',
    '物理招式看「攻擊」和對手的「防禦」；特殊招式看「特攻」和「特防」。',
    '灼傷會讓物理攻擊減半，麻痺會讓速度變慢、有時動不了。',
    '對手 HP 越少越好抓！讓牠睡著或麻痺，更容易抓到喔。',
    '打不過的時候，換上能抵抗對手屬性的夥伴，也是好策略！',
    '草屬性不怕粉末類招式（催眠粉、麻痺粉、毒粉）。',
    '火不會灼傷、電不會麻痺、冰不會冰凍；毒和鋼不會中毒。',
    '館主的王牌會「星光巨大化」：3 回合內 HP 和招式威力大增！你也可以用一次。',
    '感情越好（❤️越多），越可能在危險時撐住，也更容易打出會心一擊！',
    '「劍舞」「冥想」這類招式能提升能力，趁對手打不痛你時用最划算。',
    '「禍不單行」打陷入異常狀態的對手時威力加倍！',
    '看看對手的「特性」：飄浮的萌獸不怕地面招式，引火的不怕火！',
  ];

  BV.run = async (battle, config) => {
    b = battle;
    cfg = config || {};
    disp = { p: null, e: null };
    dmaxArmed = false;
    render();
    G.Sound.music(cfg.music || 'battle');
    await play(b.start());
    while (!b.over) {
      if (b.need === 'switch') {
        const idx = await G.UI.pickMon('下一隻要派誰上場？', b.S.p.team, (m) => m.hp > 0, { closable: false, note: noteFor });
        await play(b.forceSwitch(idx));
        continue;
      }
      const act = await choose();
      tipIdx++;
      await play(b.turn(act));
    }
    await U.sleep(450);
    return b.result;
  };

  // ───────── 畫面 ─────────
  function render() {
    const collapsed = window.innerWidth < 980 && !cfg.tutorial;
    G.UI.render(`<div class="screen"><div class="bt-screen">
      <div class="bt-main">
        <div class="bt-stage" id="stage">
          <div class="bt-scene">${G.Art.scene(cfg.bg || 'meadow', cfg.accent)}</div>
          <div class="bt-plat e"></div><div class="bt-plat p"></div>
          <div class="bt-trainer" id="bt-trainer">${b.trainer ? G.Art.person(b.trainer.look) : ''}</div>
          <div class="bt-mon e gone" id="mon-e"><div class="wrap"><div class="scale"></div></div></div>
          <div class="bt-mon p gone" id="mon-p"><div class="wrap"><div class="scale"></div></div></div>
          <div class="bt-card e hide" id="card-e"></div>
          <div class="bt-card p hide" id="card-p"></div>
          <div class="bt-fx" id="fx"></div>
        </div>
        <div class="bt-console">
          <div class="bt-msg panel" id="msg" aria-live="polite"><p></p><span class="next">▼</span></div>
          <div class="bt-cmd" id="cmd"></div>
        </div>
      </div>
      <aside class="bt-help panel${collapsed ? ' collapsed' : ''}" id="help"></aside>
    </div></div>`, onAct);
    renderHelp();
    const cmd = $('#cmd');
    cmd.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('.mv-btn');
      if (!btn || !resolveChoice) return;
      const i = +btn.dataset.i;
      const s = b.mon('p').moves[i];
      if (!s) return;
      const mv = G.MOVES[s.id];
      hint(`<b>${mv.name}</b>（${G.CAT_INFO[mv.cat].name}${mv.pow ? `・威力 ${mv.pow}` : ''}・命中 ${mv.acc ?? '必中'}）<br>${G.moveDesc(s.id)}`);
    });
    cmd.addEventListener('mouseleave', () => resolveChoice && cmd.classList.contains('moves') && hint('要使出哪一招呢？'));
  }

  function onAct(act, el) {
    if (act === 'help-toggle') { $('#help').classList.toggle('collapsed'); renderHelp(); return; }
    if (act === 'chart') { G.Screens.typesModal(); return; }
    if (!resolveChoice) return;
    G.Sound.sfx('click');
    if (act === 'fight') showMoves();
    else if (act === 'back') showMain();
    else if (act === 'dmax') { dmaxArmed = !dmaxArmed; showMoves(); }
    else if (act === 'move') done({ type: 'move', idx: +el.dataset.i, dmax: dmaxArmed });
    else if (act === 'party') partyMenu();
    else if (act === 'bag') bagMenu();
    else if (act === 'run') done({ type: 'run' });
  }

  function choose() {
    return new Promise((res) => {
      resolveChoice = res;
      dmaxArmed = false;
      showMain();
    });
  }
  function done(act) {
    const r = resolveChoice;
    resolveChoice = null;
    $('#cmd').innerHTML = '';
    $('#cmd').className = 'bt-cmd';
    r(act);
  }

  function hint(html) {
    const p = $('#msg p');
    p.innerHTML = `<span class="hint">${html}</span>`;
  }

  function showMain() {
    const cmd = $('#cmd');
    cmd.className = 'bt-cmd';
    cmd.innerHTML = `<button class="btn cmd-btn fight" data-act="fight">⚔️ 戰鬥</button>
      <button class="btn cmd-btn party" data-act="party">🔄 換萌獸</button>
      <button class="btn cmd-btn bag" data-act="bag">🎒 背包</button>
      <button class="btn cmd-btn run" data-act="run" ${b.kind === 'wild' ? '' : 'disabled title="訓練家對戰不能逃跑"'}>🏃 逃跑</button>`;
    const n = G.Mon.name(b.mon('p'));
    hint(cfg.tutorial && b.turnNo === 0
      ? `💡 點「戰鬥」選招式！右邊的<b>屬性小幫手</b>會告訴你哪一招最有效。`
      : `${U.esc(n)} 要怎麼做呢？`);
    cmd.querySelector('.fight').focus({ preventScroll: true });
  }

  function effVs(mv, foe) {
    let e = G.eff(mv.type, G.SPECIES[foe.sp].types);
    if (foe.ability === 'levitate' && mv.type === 'ground') e = 0;
    if (foe.ability === 'flashfire' && mv.type === 'fire') e = 0;
    if (foe.ability === 'sapsipper' && mv.type === 'grass') e = 0;
    return e;
  }

  function showMoves() {
    const m = b.mon('p'), foe = b.mon('e');
    const myTypes = G.SPECIES[m.sp].types;
    const dm = b.S.p.vol.dmax > 0 || dmaxArmed;
    const cmd = $('#cmd');
    cmd.className = 'bt-cmd moves';
    const any = m.moves.some((s) => s.pp > 0);
    let html = '';
    if (!any) {
      html = `<button class="mv-btn" style="--tc:#A8A77A;grid-column:span 2" data-act="move" data-i="-1"><span class="mv-name">掙扎</span><span class="mv-meta">招式都沒有 PP 了，只能拚命掙扎！</span></button>`;
    } else {
      m.moves.forEach((s, i) => {
        const mv = G.MOVES[s.id], ti = G.TYPE_INFO[mv.type];
        let tag = '';
        if (mv.cat !== 'T') {
          const e = effVs(mv, foe);
          const L = G.effLabel(e);
          tag = `<span class="eff-tag ${L.cls}">${L.text} ${L.short}</span>`;
        } else tag = `<span class="eff-tag e1">變化招式</span>`;
        const stab = mv.cat !== 'T' && myTypes.includes(mv.type) ? '<span class="stab-tag">★同屬性</span>' : '';
        const pow = mv.pow ? (dm ? G.Dmg.dmaxPow(mv.pow) : mv.pow) : 0;
        html += `<button class="mv-btn" style="--tc:${ti.color}" data-act="move" data-i="${i}" ${s.pp <= 0 ? 'disabled' : ''}>
          <span class="mv-name">${dm && mv.cat !== 'T' ? '巨大' : ''}${mv.name}</span>
          <span class="mv-meta">${ti.icon} ${ti.name}・${G.CAT_INFO[mv.cat].name}${pow ? `・威力 ${pow}` : ''}</span>
          <span class="mv-bottom">${tag}${stab}</span>
          <span class="mv-pp">PP ${s.pp}/${mv.pp}</span>
        </button>`;
      });
    }
    const canDmax = !b.S.p.dmaxUsed && b.S.p.vol.dmax === 0;
    html += `<div class="cmd-row"><button class="btn white" data-act="back">↩ 返回</button>${canDmax ? `<button class="btn dmax-btn${dmaxArmed ? ' on' : ''}" data-act="dmax">🌟 星光巨大化${dmaxArmed ? '：準備好了！' : ''}</button>` : ''}</div>`;
    cmd.innerHTML = html;
    hint(dmaxArmed ? '🌟 選一個招式，萌獸就會巨大化並使出巨大招式！（3 回合）' : '要使出哪一招呢？把滑鼠移到招式上可以看說明。');
  }

  const noteFor = (m) => {
    if (!b || m.hp <= 0) return '';
    const foe = b.mon('e');
    const ft = G.SPECIES[foe.sp].types, mt = G.SPECIES[m.sp].types;
    const worst = Math.max(...ft.map((t) => G.eff(t, mt)));
    const best = Math.max(0, ...m.moves.map((s) => G.MOVES[s.id]).filter((mv) => mv.cat !== 'T').map((mv) => effVs(mv, foe)));
    const out = [];
    if (best >= 2) out.push('💥有絕佳招式');
    if (worst >= 2) out.push('⚠️怕對手屬性');
    else if (worst <= 0.5) out.push('🛡️能抵抗對手');
    return out.join(' ');
  };

  async function partyMenu() {
    const team = b.S.p.team;
    const v = await G.UI.pickMon('要換哪一隻萌獸上場？', team, (m, i) => m.hp > 0 && i !== b.S.p.idx, {
      active: b.S.p.idx,
      note: (m, i) => (i === b.S.p.idx ? '戰鬥中' : noteFor(m)),
      intro: '<p class="muted small" style="margin:0 0 10px">換人會用掉這一回合。💥 = 有效果絕佳的招式；⚠️ = 怕對手的屬性；🛡️ = 能抵抗對手。</p>',
    });
    if (v !== null && resolveChoice) done({ type: 'switch', idx: v });
  }

  async function bagMenu() {
    const bag = G.Game.state.bag;
    const ids = Object.keys(G.ITEMS).filter((k) => bag[k] > 0 && G.ITEMS[k].kind !== 'candy');
    if (!ids.length) { G.UI.toast('背包是空的！'); return; }
    const body = `<div class="item-list">${ids.map((k) => `<div class="item-row"><div class="item-ico">${G.UI.itemIcon(k)}</div>
      <div class="item-info"><b>${G.ITEMS[k].name}</b><p>${G.ITEMS[k].desc}</p></div><div class="item-qty">×${bag[k]}</div>
      <button class="btn sm pink" data-val="${k}">使用</button></div>`).join('')}</div>`;
    const k = await G.UI.modal({ title: '🎒 背包', body, wide: false });
    if (!k || !resolveChoice) return;
    const it = G.ITEMS[k];
    if (it.kind === 'ball') {
      if (b.kind !== 'wild') { G.UI.toast('訓練家的萌獸不能抓喔！'); return; }
      if (G.Game.state.team.length + G.Game.state.box.length >= 300) { G.UI.toast('箱子已經滿了！'); return; }
      done({ type: 'ball', item: k });
      return;
    }
    const team = b.S.p.team;
    const ok = (m, i) => {
      const mx = i === b.S.p.idx ? b.maxHp('p') : G.Mon.stats(m).hp;
      if (it.kind === 'heal') return m.hp > 0 && m.hp < mx;
      if (it.kind === 'cure') return m.hp > 0 && !!m.status;
      if (it.kind === 'revive') return m.hp <= 0;
      return false;
    };
    if (!team.some(ok)) { G.UI.toast('現在用不到這個道具。'); return; }
    const t = await G.UI.pickMon(`要對誰使用${it.name}？`, team, ok);
    if (t !== null && resolveChoice) done({ type: 'item', item: k, target: t });
  }

  // ───────── 事件播放 ─────────
  async function play(evs) {
    for (const ev of evs) await handle(ev);
  }

  async function handle(ev) {
    switch (ev.t) {
      case 'msg': return say(ev.text);
      case 'send': return sendIn(ev);
      case 'recall': return recall(ev.side);
      case 'trainer': return trainerShow(ev.on);
      case 'atk': return atkAnim(ev);
      case 'hit': return hitAnim(ev);
      case 'hp':
      case 'status': return updateCard(ev.side, ev.view);
      case 'stat': updateCard(ev.side, ev.view, false); return statAnim(ev);
      case 'fx': return fxAnim(ev);
      case 'faint': return faintAnim(ev.side);
      case 'dmax': return dmaxAnim(ev);
      case 'exp': return expAnim(ev);
      case 'levelup': return levelUpAnim(ev);
      case 'ball': return ballAnim(ev);
    }
  }

  function say(text) {
    return new Promise(async (resolve) => {
      const box = $('#msg');
      if (!box) return resolve();
      const p = box.querySelector('p');
      let skip = false;
      const onClick = () => { skip = true; };
      box.addEventListener('click', onClick);
      box.classList.remove('wait');
      const sp = speed();
      const cps = sp === 2 ? 8 : sp === 0 ? 36 : 20;
      if (sp === 2) p.textContent = text;
      else {
        // 依經過時間決定顯示幾個字，分頁在背景被降速時也不會卡住
        const t0 = performance.now();
        let shown = 0;
        while (!skip && shown < text.length) {
          shown = Math.min(text.length, Math.floor((performance.now() - t0) / cps) + 1);
          p.textContent = text.slice(0, shown);
          await U.sleep(16);
        }
        p.textContent = text;
      }
      skip = false;
      const pause = sp === 2 ? 420 : sp === 0 ? 1200 : 720;
      const t0 = performance.now();
      box.classList.add('wait');
      while (!skip && performance.now() - t0 < pause) await U.sleep(30);
      box.classList.remove('wait');
      box.removeEventListener('click', onClick);
      resolve();
    });
  }

  function cardHTML(side, v) {
    const stChips = Object.entries(v.st).filter(([, d]) => d)
      .map(([k, d]) => `<span class="chip ${d > 0 ? 'up' : 'down'}">${G.STAT_NAMES[k]}${d > 0 ? '↑' : '↓'}${Math.abs(d)}</span>`).join('');
    return `<div class="cd-top"><span class="cd-name">${U.esc(v.name)}</span><span class="cd-lv">Lv.${v.lv}</span></div>
      <div class="cd-row keep">${G.UI.types(v.types, true)} ${G.UI.statusChip(v.status)}${v.dmax ? `<span class="chip dmax">🌟巨大化 剩${v.dmax}回合</span>` : ''}</div>
      ${stChips ? `<div class="cd-row">${stChips}</div>` : ''}
      <div class="cd-hp"><b>HP</b>${G.UI.hpBar(v.hp, v.max)}</div>
      ${side === 'p' ? `<div class="cd-hpnum"><span class="hpn">${v.hp}</span> / ${v.max}</div><div class="cd-exp expbar"><i style="width:${v.exp * 100}%"></i></div>` : ''}`;
  }

  function updateCard(side, v, anim = true) {
    const el = $('#card-' + side);
    if (!el) return;
    const prev = disp[side];
    disp[side] = v;
    el.innerHTML = cardHTML(side, v);
    el.classList.remove('hide');
    renderHelp();
    if (anim && prev && prev.uid === v.uid && prev.hp !== v.hp) {
      const bar = el.querySelector('.hpbar'), fill = bar.querySelector('i');
      fill.style.transition = 'none';
      fill.style.width = (prev.hp / prev.max) * 100 + '%';
      bar.className = 'hpbar ' + G.UI.hpClass(prev.hp, prev.max);
      void fill.offsetWidth;
      fill.style.transition = '';
      fill.style.width = (v.hp / v.max) * 100 + '%';
      bar.className = 'hpbar ' + G.UI.hpClass(v.hp, v.max);
      const num = el.querySelector('.hpn');
      if (num) countNum(num, prev.hp, v.hp, 520);
      return U.sleep(560);
    }
  }

  function countNum(el, a, z, ms) {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(a + (z - a) * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 位置工具
  function center(side) {
    const st = $('#stage').getBoundingClientRect();
    const r = $('#mon-' + side + ' .scale').getBoundingClientRect();
    return { x: r.left - st.left + r.width / 2, y: r.top - st.top + r.height * 0.55, w: r.width, h: r.height };
  }
  function particle(content, x, y, cls = 'fx-p') {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = content;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    $('#fx').appendChild(s);
    return s;
  }
  async function burst(side, emoji, n = 6, spread = 0.5) {
    const c = center(side);
    const anims = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
      const r = c.w * spread * (0.5 + Math.random() * 0.5);
      const s = particle(emoji, c.x, c.y);
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) scale(1.1)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.2}px), calc(-50% + ${Math.sin(a) * r * 1.2 - 10}px)) scale(.8)`, opacity: 0 },
      ], { duration: 650, easing: 'ease-out' });
      anims.push(an.finished.then(() => s.remove()));
    }
    await Promise.all(anims);
  }
  async function projectile(from, to, emoji, n = 6) {
    const a = center(from), z = center(to);
    const anims = [];
    for (let i = 0; i < n; i++) {
      const s = particle(emoji, a.x, a.y);
      const jitter = (Math.random() - 0.5) * 40;
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.1 },
        { transform: `translate(calc(-50% + ${z.x - a.x}px), calc(-50% + ${z.y - a.y + jitter}px)) scale(1.2)`, opacity: 1 },
      ], { duration: 420, delay: i * 60, easing: 'ease-in' });
      anims.push(an.finished.then(() => s.remove()));
    }
    await Promise.all(anims);
  }
  function popText(side, text, cls = '', dy = 0) {
    const c = center(side);
    const s = particle(text, c.x, c.y - c.h * 0.3 + dy, 'fx-txt ' + cls);
    s.animate([
      { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
      { transform: 'translate(-50%,-80%) scale(1.15)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%,-150%) scale(1)', opacity: 0 },
    ], { duration: 1100, easing: 'ease-out' }).finished.then(() => s.remove());
  }
  function shakeStage() {
    const st = $('#stage');
    st.classList.remove('stage-shake');
    void st.offsetWidth;
    st.classList.add('stage-shake');
  }

  async function sendIn(ev) {
    const side = ev.side;
    const el = $('#mon-' + side);
    el.classList.remove('dmax');
    el.querySelector('.scale').innerHTML = G.Art.mon(ev.view.sp);
    el.querySelector('.wrap').style.opacity = 1;
    disp[side] = null;
    updateCard(side, ev.view, false);
    G.Sound.sfx('send');
    await U.sleep(50);
    el.classList.remove('gone');
    burst(side, ev.wild ? '🍃' : '✨', 8, 0.45);
    if (side === 'e') G.Game.markSeen(ev.view.sp);
    await U.sleep(520);
  }

  async function recall(side) {
    const el = $('#mon-' + side);
    G.Sound.sfx('back');
    el.classList.add('gone');
    el.classList.remove('dmax');
    await U.sleep(450);
    $('#card-' + side).classList.add('hide');
  }

  async function trainerShow(on) {
    const t = $('#bt-trainer');
    if (!t || !b.trainer) return;
    t.classList.toggle('on', on);
    await U.sleep(on ? 450 : 300);
  }

  async function atkAnim(ev) {
    const side = ev.side, tgt = side === 'p' ? 'e' : 'p';
    const w = $(`#mon-${side} .wrap`);
    const ti = G.TYPE_INFO[ev.type];
    if (ev.cat === 'P') {
      const dx = side === 'p' ? 1 : -1;
      G.Sound.sfx('throw');
      await w.animate([
        { transform: 'translate(0,0)' },
        { transform: `translate(${dx * 16}%, ${-dx * 12}%) rotate(${dx * 6}deg)`, offset: 0.45 },
        { transform: 'translate(0,0)' },
      ], { duration: 380, easing: 'ease-in-out' }).finished;
      if (!ev.miss && !ev.blocked) burst(tgt, ti.icon, 5, 0.35);
    } else if (ev.cat === 'S') {
      w.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 300 });
      G.Sound.sfx('throw');
      await projectile(side, tgt, ti.icon, ev.dmax ? 10 : 6);
    } else {
      G.Sound.sfx('status');
      if (ev.self) await burst(side, '✨', 6, 0.4);
      else await projectile(side, tgt, ti.icon, 4);
    }
    if (ev.miss) { G.Sound.sfx('miss'); popText(tgt, '沒打中！', 'bad'); await U.sleep(250); }
    if (ev.blocked) { popText(tgt, '擋住了！', 'bad'); await U.sleep(250); }
  }

  async function hitAnim(ev) {
    const w = $(`#mon-${ev.side} .wrap`);
    G.Sound.sfx(ev.eff > 1 ? 'super' : ev.eff < 1 ? 'weak' : 'hit');
    w.animate([{ opacity: 1 }, { opacity: 0.15 }, { opacity: 1 }, { opacity: 0.15 }, { opacity: 1 }], { duration: 420 });
    w.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 320 });
    if (ev.eff > 1 || ev.crit) shakeStage();
    popText(ev.side, `-${ev.dmg}`, 'dmg');
    if (ev.crit) popText(ev.side, '會心一擊！', 'crit', -30);
    else if (ev.eff > 1) popText(ev.side, ev.eff >= 4 ? '超級有效！！' : '效果絕佳！', 'good', -30);
    else if (ev.eff < 1) popText(ev.side, '效果不好…', 'bad', -30);
    await U.sleep(380);
  }

  async function statAnim(ev) {
    const up = ev.delta > 0;
    G.Sound.sfx(up ? 'up' : 'down');
    popText(ev.side, `${G.STAT_NAMES[ev.stat]}${up ? '↑' : '↓'}`, up ? 'good' : 'bad');
    const c = center(ev.side);
    const anims = [];
    for (let i = 0; i < 5; i++) {
      const s = particle(up ? '🔼' : '🔽', c.x + (i - 2) * c.w * 0.15, c.y + (up ? c.h * 0.2 : -c.h * 0.3));
      anims.push(s.animate([
        { transform: 'translate(-50%,-50%)', opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { transform: `translate(-50%, calc(-50% + ${up ? -60 : 60}px))`, opacity: 0 },
      ], { duration: 700, delay: i * 70 }).finished.then(() => s.remove()));
    }
    await Promise.all(anims);
  }

  const FX_ICON = { brn: '🔥', par: '⚡', psn: '💜', tox: '☠️', slp: '💤', frz: '🧊', heal: '💚', hurt: '💢' };
  async function fxAnim(ev) {
    if (ev.kind === 'protect') {
      const c = center(ev.side);
      const d = document.createElement('div');
      d.className = 'fx-shield';
      d.style.left = c.x - c.w * 0.45 + 'px';
      d.style.top = c.y - c.w * 0.45 + 'px';
      d.style.width = d.style.height = c.w * 0.9 + 'px';
      $('#fx').appendChild(d);
      G.Sound.sfx('heal');
      await d.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 900 }).finished;
      d.remove();
      return;
    }
    G.Sound.sfx(ev.kind === 'heal' ? 'heal' : 'status');
    await burst(ev.side, FX_ICON[ev.kind] || '✨', ev.kind === 'heal' ? 6 : 5, 0.35);
  }

  async function faintAnim(side) {
    const el = $('#mon-' + side), w = el.querySelector('.wrap');
    G.Sound.sfx('faint');
    await w.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(35%)', opacity: 0 }], { duration: 520, easing: 'ease-in' }).finished;
    w.style.opacity = 0;
    el.classList.add('gone');
    el.classList.remove('dmax');
    $('#card-' + side).classList.add('hide');
  }

  async function dmaxAnim(ev) {
    const el = $('#mon-' + ev.side);
    if (ev.on) {
      G.Sound.sfx('dmax');
      shakeStage();
      el.classList.add('dmax');
      burst(ev.side, '🌟', 10, 0.6);
      updateCard(ev.side, ev.view, false);
      await U.sleep(700);
    } else {
      el.classList.remove('dmax');
      if (ev.view.hp > 0) updateCard(ev.side, ev.view, false);
      await U.sleep(400);
    }
  }

  async function expAnim(ev) {
    const el = $('#card-p');
    const fill = el && el.querySelector('.expbar i');
    if (fill) {
      if (ev.levels > 0) {
        fill.style.width = '100%';
        await U.sleep(620);
        fill.style.transition = 'none';
        fill.style.width = '0%';
        void fill.offsetWidth;
        fill.style.transition = '';
      }
      fill.style.width = ev.view.exp * 100 + '%';
      await U.sleep(500);
    }
    if (disp.p) disp.p.exp = ev.view.exp;
  }

  async function levelUpAnim(ev) {
    G.Sound.sfx('levelup');
    const el = $('#card-p');
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    const lv = el.querySelector('.cd-lv');
    if (lv) lv.textContent = 'Lv.' + ev.lv;
    popText('p', 'LEVEL UP!', 'good');
    burst('p', '⭐', 6, 0.45);
    await U.sleep(300);
  }

  async function ballAnim(ev) {
    const st = $('#stage').getBoundingClientRect();
    const z = center('e');
    const ball = document.createElement('div');
    ball.className = 'fx-ball';
    ball.innerHTML = G.Art.ball(ev.item, 40);
    $('#fx').appendChild(ball);
    const sx = st.width * 0.12, sy = st.height * 0.92;
    G.Sound.sfx('throw');
    await ball.animate([
      { left: sx + 'px', top: sy + 'px', transform: 'translate(-50%,-50%) rotate(0deg)' },
      { left: (sx + z.x) / 2 + 'px', top: st.height * 0.05 + 'px', offset: 0.5 },
      { left: z.x + 'px', top: z.y + 'px', transform: 'translate(-50%,-50%) rotate(900deg)' },
    ], { duration: 650, easing: 'ease-out' }).finished;
    ball.style.left = z.x + 'px';
    ball.style.top = z.y + 'px';
    if (ev.shakes < 0) {
      G.Sound.sfx('miss');
      popText('e', '彈開了！', 'bad');
      await ball.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(150%, 200%) rotate(-300deg)', opacity: 0 }], { duration: 500 }).finished;
      ball.remove();
      return;
    }
    burst('e', '✨', 6, 0.3);
    $('#mon-e').classList.add('gone');
    await U.sleep(380);
    const groundY = z.y + z.h * 0.32;
    await ball.animate([{ top: z.y + 'px' }, { top: groundY + 'px' }], { duration: 300, easing: 'cubic-bezier(.5,0,1,.5)' }).finished;
    ball.style.top = groundY + 'px';
    for (let i = 0; i < ev.shakes; i++) {
      await U.sleep(320);
      G.Sound.sfx('shake');
      await ball.animate([
        { transform: 'translate(-50%,-50%) rotate(0)' }, { transform: 'translate(-50%,-50%) rotate(-28deg)' },
        { transform: 'translate(-50%,-50%) rotate(24deg)' }, { transform: 'translate(-50%,-50%) rotate(0)' },
      ], { duration: 460 }).finished;
    }
    await U.sleep(300);
    if (ev.ok) {
      G.Sound.sfx('catch');
      const c = center('e');
      for (let i = 0; i < 6; i++) {
        const s = particle('⭐', z.x, groundY);
        const a = -Math.PI / 2 + (i - 2.5) * 0.4;
        s.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * c.w * 0.4}px), calc(-50% + ${Math.sin(a) * c.w * 0.4}px))`, opacity: 0 }], { duration: 800 }).finished.then(() => s.remove());
      }
      ball.style.filter = 'brightness(.85)';
      await U.sleep(900);
    } else {
      G.Sound.sfx('send');
      ball.remove();
      $('#mon-e').classList.remove('gone');
      burst('e', '💨', 5, 0.4);
      await U.sleep(450);
    }
  }

  // ───────── 屬性小幫手 ─────────
  function renderHelp() {
    const h = $('#help');
    if (!h) return;
    const collapsed = h.classList.contains('collapsed');
    if (!disp.e || !disp.p) {
      h.innerHTML = `<div class="help-head"><h3>🔍 屬性小幫手</h3></div><div class="help-body"><div class="help-sec muted small">對戰開始後，這裡會告訴你怎麼打最有效！</div></div>`;
      return;
    }
    // 以畫面上正在顯示的萌獸為準（引擎可能已經算到下一隻）
    const e = b.S.e.team.find((x) => x.uid === disp.e.uid) || b.mon('e');
    const p = b.S.p.team.find((x) => x.uid === disp.p.uid) || b.mon('p');
    const eT = G.SPECIES[e.sp].types, pT = G.SPECIES[p.sp].types;
    const prof = G.defProfile(eT);
    const badges = (arr) => (arr.length ? arr.map((t) => G.Art.typeBadge(t, true)).join('') : '<span class="muted small">沒有</span>');
    const strong = [...prof.x4.map((t) => G.Art.typeBadge(t, true).replace('</span>', ' ×4</span>')), ...prof.x2.map((t) => G.Art.typeBadge(t, true))].join('') || '<span class="muted small">沒有</span>';
    const moves = p.moves.map((s) => {
      const mv = G.MOVES[s.id];
      if (mv.cat === 'T') return `<div class="help-mv"><span>${G.TYPE_INFO[mv.type].icon} ${mv.name}</span><span class="eff-tag e1">變化</span></div>`;
      const L = G.effLabel(effVs(mv, e));
      return `<div class="help-mv"><span>${G.TYPE_INFO[mv.type].icon} ${mv.name}</span><span class="eff-tag ${L.cls}">${L.short} ${L.text}</span></div>`;
    }).join('');
    const warns = eT.map((t) => {
      const x = G.eff(t, pT);
      const ti = G.TYPE_INFO[t];
      if (x >= 2) return `<div class="help-warn">⚠️ 對手的 <b>${ti.icon}${ti.name}</b> 招式打你 <b style="color:var(--bad)">×${x}</b>，要小心！</div>`;
      if (x === 0) return `<div class="help-warn">🛡️ 對手的 <b>${ti.icon}${ti.name}</b> 招式完全打不到你！</div>`;
      if (x < 1) return `<div class="help-warn">🛡️ 對手的 <b>${ti.icon}${ti.name}</b> 招式打你只有 ×${x === 0.25 ? '¼' : '½'}</div>`;
      return `<div class="help-warn">• 對手的 ${ti.icon}${ti.name} 招式打你是普通傷害</div>`;
    }).join('');
    const eAb = G.ABILITIES[e.ability], pAb = G.ABILITIES[p.ability];
    h.innerHTML = `<div class="help-head"><h3>🔍 屬性小幫手</h3><button class="btn sm white help-toggle" data-act="help-toggle">${collapsed ? '展開 ▼' : '收起 ▲'}</button></div>
      <div class="help-body">
        <div class="help-sec">
          <h4>對手 ${U.esc(G.Mon.name(e))} ${eT.map((t) => G.Art.typeBadge(t, true)).join('')}</h4>
          <div class="help-row"><span class="lab g">超有效 💥</span><div class="vals">${strong}</div></div>
          <div class="help-row"><span class="lab b">效果不好</span><div class="vals">${badges([...prof.half, ...prof.quarter])}</div></div>
          <div class="help-row"><span class="lab z">沒有效果</span><div class="vals">${badges(prof.zero)}</div></div>
          ${eAb ? `<div class="help-ab">特性 <b>${eAb.name}</b>：${eAb.desc}</div>` : ''}
        </div>
        <div class="help-sec"><h4>你的招式打牠</h4>${moves}</div>
        <div class="help-sec"><h4>小心對手的攻擊</h4>${warns}${pAb ? `<div class="help-ab" style="margin-top:4px">你的特性 <b>${pAb.name}</b>：${pAb.desc}</div>` : ''}</div>
        <div class="help-sec"><div class="help-tip">💡 ${TIPS[tipIdx % TIPS.length]}</div></div>
        <div class="help-sec"><button class="btn sm blue" data-act="chart" style="width:100%">📖 看完整的屬性相剋表</button></div>
      </div>`;
  }
})();
