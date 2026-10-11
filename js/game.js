// 遊戲進度與流程
(function () {
  const U = G.U;
  const KEY = 'mengshou-adventure-save-v1';

  G.PLAYER_LOOKS = [
    { hair: 'pony', hc: '#6B3E26', outfit: '#FF7AA8', acc: '#FFD23F' },
    { hair: 'long', hc: '#2E2238', outfit: '#8B5CF6' },
    { hair: 'bun', hc: '#E8A04B', outfit: '#36CF9C' },
    { hair: 'cap', acc: '#FF5D5D', outfit: '#4F8EF0' },
  ];
  G.PROF = { name: '橡果博士', look: { hair: 'old', outfit: '#8FB8D8', glasses: true, coat: true, beard: true, skin: '#F6D3B5' } };

  const Game = (G.Game = { state: null });

  Game.newGame = (name, diff, look) => {
    Game.state = {
      v: 1, name: name || '小星', diff, look, money: 3000, starter: null,
      team: [], box: [], bag: { potion: 5, ball1: 5 },
      badges: 0, loc: 0, unlocked: 0, defeated: {}, gymProg: {}, dex: {},
      stats: { battles: 0, wins: 0, caught: 0 }, champion: false,
      settings: { sfx: true, music: true, speed: 1 },
      created: Date.now(), savedAt: 0,
    };
    Game.save();
  };

  Game.playerLook = () => G.PLAYER_LOOKS[(Game.state && Game.state.look) || 0];
  Game.diff = () => G.DIFFS[Game.state.diff];

  // ── 存檔 ──
  Game.save = () => {
    if (!Game.state) return;
    Game.state.savedAt = Date.now();
    const ok = U.storage.set(KEY, JSON.stringify(Game.state));
    if (G.Cloud) G.Cloud.push(Game.state);
    return ok;
  };
  Game.writeLocal = (st) => U.storage.set(KEY, JSON.stringify(st));
  Game.readLocal = () => {
    const raw = U.storage.get(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  };
  Game.load = (st) => {
    st = st || Game.readLocal();
    if (!st || !st.team) return false;
    Game.state = st;
    st.settings = Object.assign({ sfx: true, music: true, speed: 1 }, st.settings || {});
    G.Sound.sfxOn = st.settings.sfx;
    G.Sound.musicOn = st.settings.music;
    return true;
  };
  Game.exportCode = () => btoa(unescape(encodeURIComponent(JSON.stringify(Game.state))));
  Game.importCode = (code) => {
    try {
      const st = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if (!st.team || !st.name) return false;
      Game.load(st);
      Game.save();
      return true;
    } catch (e) { return false; }
  };
  Game.wipe = () => { U.storage.del(KEY); Game.state = null; };

  // ── 圖鑑與隊伍 ──
  Game.markSeen = (sp) => { const d = Game.state.dex; if (!d[sp]) d[sp] = 1; };
  Game.markCaught = (sp) => { Game.state.dex[sp] = 2; };
  Game.addMon = (m) => {
    Game.markCaught(m.sp);
    if (Game.state.team.length < 6) { Game.state.team.push(m); return 'team'; }
    Game.state.box.push(m);
    return 'box';
  };
  Game.allMons = () => Game.state.team.concat(Game.state.box);
  Game.alive = () => Game.state.team.filter((m) => m.hp > 0).length;
  Game.healAll = () => Game.state.team.forEach(G.Mon.heal);

  // ── 對手設定 ──
  Game.gymIndexOf = (tid) => {
    const L = G.LOCS.find((l) => l.gym && (l.gym.leader === tid || l.gym.trainers.includes(tid)));
    return L ? L.id : -1;
  };
  Game.aiFor = (t) => {
    const d = Game.diff().ai;
    if (t.champion || t.id === 'rival4') return Math.min(2, d + 1);
    if (t.leader) return Game.gymIndexOf(t.id) <= 2 ? d : Math.min(2, d + 1);
    return d;
  };
  Game.buildTeam = (t) => {
    const d = Game.diff();
    const ivVal = [10, 20, 28][Game.state.diff];
    return G.resolveTeam(t, Game.state.starter).map(([sp, lv, mv]) =>
      G.Mon.create(sp, Math.max(2, lv + d.lvAdj), { ivs: 'trainer', ivVal, moves: mv, friend: 0 }));
  };

  // ── 對戰 ──
  Game.battle = async (cfg) => {
    const s = Game.state;
    const b = new G.Battle({
      kind: cfg.kind, pTeam: s.team, eTeam: cfg.eTeam, trainer: cfg.trainer,
      player: { name: s.name, bag: s.bag }, aiLv: cfg.ai ?? Game.diff().ai, allowDmax: !!cfg.allowDmax,
    });
    const res = await G.BattleView.run(b, cfg);
    b.cleanup();
    await Game.afterBattle(b, cfg);
    return res;
  };

  Game.afterBattle = async (b, cfg) => {
    const s = Game.state;
    b.seen.forEach(Game.markSeen);
    s.stats.battles++;
    if (b.result === 'win') {
      s.stats.wins++;
      s.money += b.money || 0;
      s.team.forEach((m) => { if (m.hp > 0) m.friend = Math.min(100, m.friend + 1); });
    }
    if (b.result === 'caught') {
      const m = b.caught;
      m.friend = 35;
      s.stats.caught++;
      const where = Game.addMon(m);
      if (where === 'box') G.Mon.heal(m);
      Game.save();
      const nick = await Game.askNickname(m);
      if (nick) m.nick = nick;
      await G.UI.alert('抓到了！', `<div class="row" style="flex-wrap:nowrap"><div style="width:110px;flex:none">${G.Art.mon(m.sp)}</div>
        <p style="margin:0;line-height:1.7">${U.esc(G.Mon.name(m))} 加入了${where === 'team' ? '你的隊伍' : '<b>箱子</b>（隊伍已經有 6 隻了，可以到「隊伍」頁面交換）'}！<br>已登錄到圖鑑 📖</p></div>`);
    }
    if (b.result === 'lose') await Game.blackout(cfg);
    await Game.growth(b.learnQ);
    Game.save();
  };

  Game.askNickname = async (m) => {
    const v = await G.UI.modal({
      title: '要幫牠取名字嗎？',
      body: `<div class="form-row"><label for="nick-in">${G.SPECIES[m.sp].name} 的暱稱（可以不填）</label><input id="nick-in" class="input" maxlength="8" placeholder="${G.SPECIES[m.sp].name}"></div>`,
      buttons: [{ label: '不用了', value: 'skip', cls: 'white' }, { label: '就叫這個！', value: 'ok', cls: 'pink' }],
      onRender: (el, close) => {
        const inp = el.querySelector('#nick-in');
        inp.focus();
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { Game._nick = inp.value; close('ok'); } });
        inp.addEventListener('input', () => { Game._nick = inp.value; });
      },
    });
    const n = (Game._nick || '').trim();
    Game._nick = '';
    return v === 'ok' && n ? n.slice(0, 8) : '';
  };

  Game.blackout = async (cfg) => {
    const s = Game.state;
    const lost = Math.floor(s.money * 0.1);
    s.money -= lost;
    Game.healAll();
    Game.save();
    const tip = cfg && cfg.trainer && cfg.trainer.tip ? `小提示：${cfg.trainer.tip}` : '小提示：帶上能剋制對手屬性的萌獸，或先在野外多練幾級吧！';
    await G.UI.dialog([
      '眼前一片漆黑……',
      `${s.name} 急忙帶著萌獸們回到了療癒中心。${lost ? `（掉了 $${lost}）` : ''}`,
      '萌獸們都恢復精神了！別灰心，再挑戰一次吧！',
      tip,
    ], { who: '療癒中心', look: { hair: 'bun', hc: '#FF8FB8', outfit: '#FFFFFF' } });
  };

  Game.wild = async (loc) => {
    if (!Game.alive()) return G.UI.alert('萌獸都累倒了', '<p>先去 💗 療癒中心讓萌獸們休息一下吧！</p>');
    const sp = U.weighted(loc.wild.list);
    const lv = U.rand(loc.wild.lv[0], loc.wild.lv[1]);
    const m = G.Mon.create(sp, lv, { ivs: 'wild', friend: 0 });
    return Game.battle({ kind: 'wild', eTeam: [m], bg: loc.theme, music: 'battle' });
  };

  Game.fightTrainer = async (id, opt = {}) => {
    if (!Game.alive()) { await G.UI.alert('萌獸都累倒了', '<p>先去 💗 療癒中心讓萌獸們休息一下吧！</p>'); return null; }
    const t = G.TRAINERS[id];
    const team = Game.buildTeam(t);
    const items = Object.assign({}, t.items || {});
    if (Game.state.diff === 2) for (const k in items) items[k]++;
    if (Game.state.diff === 0 && t.leader) for (const k in items) items[k] = Math.max(0, items[k] - 1);
    const trainer = Object.assign({}, t, { items });
    const big = t.leader || t.rival;
    const res = await Game.battle({
      kind: 'trainer', eTeam: team, trainer, ai: Game.aiFor(t), allowDmax: !!t.dmax,
      bg: opt.bg || (t.champion ? 'champion' : opt.gym ? 'arena' : G.LOCS[Game.state.loc].theme),
      accent: opt.accent, music: big ? 'gym' : 'battle', tutorial: opt.tutorial,
    });
    if (res === 'win') Game.state.defeated[id] = (Game.state.defeated[id] || 0) + 1;
    Game.save();
    return res;
  };

  // ── 成長：學招式、進化 ──
  Game.growth = async (learnQ = []) => {
    const all = Game.allMons();
    for (const q of learnQ) {
      const m = all.find((x) => x.uid === q.uid);
      if (m) await Game.learnFlow(m, q.id);
    }
    for (const m of Game.state.team) {
      while (G.Mon.canEvolve(m)) {
        const res = await Game.evolveFlow(m);
        if (!res) break;
        for (const id of res.newMoves) await Game.learnFlow(m, id);
      }
    }
  };

  Game.learnFlow = async (m, id) => {
    if (m.moves.some((x) => x.id === id)) return;
    const name = U.esc(G.Mon.name(m)), mv = G.MOVES[id];
    if (m.moves.length < 4) {
      G.Mon.learn(m, id);
      G.Sound.sfx('levelup');
      G.UI.toast(`${G.Mon.name(m)} 學會了「${mv.name}」！`);
      return;
    }
    const card = (mid, i, isNew) => {
      const x = G.MOVES[mid], ti = G.TYPE_INFO[x.type];
      return `<div class="mv-item${isNew ? ' new' : ' pick'}" style="--tc:${ti.color}" ${isNew ? '' : `data-val="${i}" role="button" tabindex="0"`}>
        <b>${isNew ? '🆕 ' : ''}${x.name}</b> <span class="meta">${ti.icon}${ti.name}・${G.CAT_INFO[x.cat].name}${x.pow ? `・威力${x.pow}` : ''}・命中${x.acc ?? '必中'}</span>
        <p>${G.moveDesc(mid)}</p></div>`;
    };
    const v = await G.UI.modal({
      title: `${name} 想學新招式！`,
      wide: true,
      body: `<p style="margin:0 0 10px">${name} 想要學「<b>${mv.name}</b>」，但是已經會 4 個招式了。<br>點一個<b>要忘記的招式</b>，或選「不學了」。</p>
        ${card(id, -1, true)}<div style="height:10px"></div>
        <div class="mv-list">${m.moves.map((x, i) => card(x.id, i, false)).join('')}</div>`,
      buttons: [{ label: '不學了', value: 'no', cls: 'white' }],
    });
    if (v === null || v === 'no') {
      G.UI.toast(`${G.Mon.name(m)} 沒有學「${mv.name}」。`);
      return;
    }
    const old = G.MOVES[m.moves[+v].id].name;
    G.Mon.learn(m, id, +v);
    G.Sound.sfx('levelup');
    await G.UI.alert('學會新招式！', `<p style="font-size:17px;line-height:1.7">1、2……啪！${name} 忘記了「${old}」，<br>學會了「<b>${mv.name}</b>」！</p>`);
  };

  Game.evolveFlow = (m) =>
    new Promise((resolve) => {
      const from = m.sp, to = G.Mon.canEvolve(m);
      const oldName = G.Mon.name(m);
      const layer = document.createElement('div');
      layer.className = 'evo-layer';
      layer.innerHTML = `<div><div class="evo-art"><div class="a">${G.Art.mon(from)}</div><div class="b white" style="opacity:0">${G.Art.mon(to)}</div></div>
        <div class="evo-text">咦？${U.esc(oldName)} 的樣子……</div></div>`;
      document.body.appendChild(layer);
      G.Sound.sfx('evo');
      const a = layer.querySelector('.a'), bEl = layer.querySelector('.b');
      a.classList.add('white');
      let t = 0, flip = false, interval = 520;
      const step = () => {
        flip = !flip;
        a.style.opacity = flip ? 0 : 1;
        bEl.style.opacity = flip ? 1 : 0;
        t += interval;
        interval = Math.max(90, interval * 0.84);
        if (t < 4200) setTimeout(step, interval);
        else finish();
      };
      const finish = () => {
        const res = G.Mon.evolve(m);
        Game.markCaught(m.sp);
        a.style.opacity = 0;
        bEl.style.opacity = 1;
        bEl.classList.remove('white');
        G.Sound.sfx('win');
        G.UI.confetti(50);
        layer.querySelector('.evo-text').innerHTML = `恭喜！${U.esc(oldName)} 進化成了 <b style="color:#FFD23F">${G.SPECIES[to].name}</b>！<br><button class="btn pink" style="margin-top:14px">太棒了！</button>`;
        layer.querySelector('button').onclick = () => { layer.remove(); resolve(res); };
      };
      setTimeout(step, 900);
    });

  // ── 道館 ──
  Game.badgeCeremony = async (loc) => {
    const s = Game.state;
    const first = s.badges < loc.id;
    if (!first) return;
    s.badges = loc.id;
    s.unlocked = Math.max(s.unlocked, loc.id + 1);
    s.bag.candy = (s.bag.candy || 0) + 2;
    Game.save();
    G.Sound.sfx('win');
    G.UI.confetti(80);
    const unlockShop = G.SHOP_ORDER.filter((k) => G.ITEMS[k].badge === loc.id).map((k) => G.ITEMS[k].name);
    const next = G.LOCS[loc.id + 1];
    await G.UI.alert(`獲得了${loc.gym.badge}！`, `<div style="text-align:center">
      <div class="badge-big" style="--bc:${loc.color}">${G.TYPE_INFO[loc.gym.type].icon}</div>
      <p style="font-size:19px;margin:8px 0">${U.esc(s.name)} 獲得了 <b>${loc.gym.badge}</b>！（${s.badges}/8）</p>
      <p class="muted">獎勵：🍬 神奇糖果 ×2${unlockShop.length ? `<br>商店開始賣：${unlockShop.join('、')}` : ''}${next ? `<br>🗺️ 可以前往「${next.name}」了！` : ''}</p></div>`, '太好了！');
  };

  Game.championEnding = async () => {
    const s = Game.state;
    if (s.champion) return;
    s.champion = true;
    Game.save();
    G.UI.confetti(140);
    G.Sound.sfx('win');
    await G.UI.dialog([
      `恭喜你，${s.name}！`,
      '你打敗了冠軍星辰，成為了星光地區的新冠軍！',
      '一路上和萌獸們一起努力的回憶，一定會變成最珍貴的寶物。',
      '冠軍之後，冒險還沒結束喔：試著收集圖鑑上所有的萌獸，或是用「挑戰」難度再玩一次吧！',
    ], { who: G.PROF.name, look: G.PROF.look });
    await G.UI.alert('🏆 星光冠軍 🏆', `<div style="text-align:center"><div class="badge-big" style="--bc:#FFD23F">🏆</div>
      <p style="font-size:18px">${U.esc(s.name)} 的冠軍隊伍</p>
      <div class="row" style="justify-content:center">${s.team.map((m) => `<div style="width:84px;text-align:center">${G.Art.mon(m.sp)}<div class="small">${U.esc(G.Mon.name(m))}</div></div>`).join('')}</div></div>`, '耶！');
  };
})();
