// 隊伍、箱子、萌獸詳細資料
(function () {
  const U = G.U;
  const S = G.Screens;
  const STAT_COLOR = { hp: '#FF6B6B', atk: '#FF9F43', def: '#FECA57', spa: '#54A0FF', spd: '#5FD3A0', spe: '#C780FF' };

  S.summaryHTML = (m) => {
    const sp = G.SPECIES[m.sp];
    const st = G.Mon.stats(m);
    const ab = G.ABILITIES[m.ability];
    const toNext = m.lv >= G.MAX_LV ? 0 : G.Mon.expFor(m.lv + 1) - m.exp;
    const stats = G.STAT_KEYS.map((k) => `<div class="stat-row"><span>${G.STAT_NAMES[k]}</span><span class="v">${st[k]}</span>
      <div class="stat-bar" style="--sc:${STAT_COLOR[k]}"><i style="width:${Math.min(100, (st[k] / (k === 'hp' ? 3.2 : 2.2) / Math.max(m.lv, 10)) * 100)}%"></i></div>${G.UI.stars(m.train[k] || 0)}</div>`).join('');
    const moves = m.moves.map((x) => {
      const mv = G.MOVES[x.id], ti = G.TYPE_INFO[mv.type];
      return `<div class="mv-item" style="--tc:${ti.color}"><b>${mv.name}</b> <span class="meta">${ti.icon}${ti.name}・${G.CAT_INFO[mv.cat].name}${mv.pow ? `・威力${mv.pow}` : ''}・PP ${x.pp}/${mv.pp}</span><p>${G.moveDesc(x.id)}</p></div>`;
    }).join('');
    const evo = sp.evo ? `下一個進化：Lv.${sp.evo.lv} → ${G.SPECIES[sp.evo.to].name}` : '已經是最終進化型態';
    return `<div class="sum-grid">
      <div><div class="sum-art">${G.Art.mon(m.sp)}</div>
        <div style="margin-top:8px" class="row">${G.UI.types(sp.types)}</div>
        <p class="small" style="margin:8px 0 2px">感情 ${G.UI.hearts(m.friend)}</p>
        <p class="small muted" style="margin:0">${evo}</p>
      </div>
      <div style="min-width:0">
        <div class="row"><b style="font-size:22px">${U.esc(G.Mon.name(m))}</b><span class="num" style="font-size:18px">Lv.${m.lv}</span>${m.nick ? `<span class="muted small">（${sp.name}）</span>` : ''} ${G.UI.statusChip(m.status)}</div>
        <div style="margin:6px 0">${G.UI.hpBar(m.hp, st.hp)}<div class="small num" style="text-align:right">HP ${m.hp}/${st.hp}</div></div>
        <div class="expbar"><i style="width:${G.Mon.expProgress(m) * 100}%"></i></div>
        <div class="small muted num" style="margin:2px 0 8px">${toNext ? `再 ${toNext} 經驗值升級` : '已經是最高等級'}</div>
        ${ab ? `<p class="help-ab" style="margin:0 0 8px">特性 <b>${ab.name}</b>：${ab.desc}</p>` : ''}
        ${stats}
        <p class="small muted" style="margin:4px 0 10px">★ 是在特訓場練出來的能力加成（每顆 +6%）</p>
        <div class="mv-list">${moves}</div>
        <p class="small muted" style="margin:10px 0 0">${sp.desc}</p>
      </div></div>`;
  };

  S.team = () => {
    const s = G.Game.state;
    const card = (m, i) => {
      const st = G.Mon.stats(m);
      return `<div class="team-card panel" data-act="mon" data-i="${i}" role="button" tabindex="0">
        <div class="ta">${G.Art.mon(m.sp)}</div>
        <div class="ti"><div class="tn">${i === 0 ? '⭐' : ''}${U.esc(G.Mon.name(m))} <span>Lv.${m.lv}</span></div>
          <div class="row" style="gap:4px;margin:3px 0">${G.UI.types(G.SPECIES[m.sp].types, true)} ${G.UI.statusChip(m.status)}</div>
          ${G.UI.hpBar(m.hp, st.hp)}<div class="small num muted">HP ${m.hp}/${st.hp}</div>${G.UI.hearts(m.friend)}</div>
      </div>`;
    };
    const box = s.box.length
      ? `<div class="box-grid">${s.box.map((m, i) => `<button class="box-cell" data-act="box" data-i="${i}"><div class="ba">${G.Art.mon(m.sp, { cls: 'still' })}</div>${U.esc(G.Mon.name(m))}<br><span class="num small">Lv.${m.lv}</span></button>`).join('')}</div>`
      : '<p class="empty">箱子是空的。隊伍滿 6 隻之後，新抓到的萌獸會放到這裡。</p>';
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page">
      <div class="page-head"><h2>🐾 我的隊伍 <span class="small muted">${s.team.length}/6</span></h2><span class="small muted">⭐ 第一隻會最先上場。點萌獸可以看詳細資料。</span></div>
      <div class="team-grid">${s.team.map(card).join('')}</div>
      <div class="page-head"><h2>📦 萌獸箱子 <span class="small muted">${s.box.length} 隻</span></h2></div>
      <div class="panel" style="padding:12px">${box}</div>
    </div></div>`, async (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'mon') return S.teamMon(+el.dataset.i);
      if (act === 'box') return S.boxMon(+el.dataset.i);
    });
  };

  S.teamMon = async (i) => {
    const s = G.Game.state;
    const m = s.team[i];
    const v = await G.UI.modal({
      title: `${G.Mon.name(m)} 的資料`,
      wide: true,
      body: S.summaryHTML(m),
      buttons: [
        { label: '✏️ 取名字', value: 'nick', cls: 'white' },
        { label: '⬅ 往前', value: 'up', cls: 'white', disabled: i === 0 },
        { label: '⭐ 設為第一隻', value: 'lead', cls: 'mint', disabled: i === 0 },
        { label: '📦 放進箱子', value: 'tobox', cls: 'white', disabled: s.team.length <= 1 },
      ],
    });
    if (v === 'lead') { s.team.splice(i, 1); s.team.unshift(m); }
    if (v === 'up') { [s.team[i - 1], s.team[i]] = [s.team[i], s.team[i - 1]]; }
    if (v === 'tobox') {
      if (s.team.filter((x, j) => j !== i && x.hp > 0).length === 0) { G.UI.toast('隊伍裡至少要留一隻有精神的萌獸！'); return; }
      s.team.splice(i, 1);
      s.box.push(m);
    }
    if (v === 'nick') {
      const n = await G.Game.askNickname(m);
      if (n) m.nick = n;
    }
    G.Game.save();
    S.team();
  };

  S.boxMon = async (i) => {
    const s = G.Game.state;
    const m = s.box[i];
    const full = s.team.length >= 6;
    const v = await G.UI.modal({
      title: `${G.Mon.name(m)} 的資料`,
      wide: true,
      body: S.summaryHTML(m),
      buttons: [{ label: full ? '🔄 和隊伍交換' : '➕ 加入隊伍', value: 'join', cls: 'pink' }],
    });
    if (v !== 'join') return;
    if (!full) {
      s.box.splice(i, 1);
      s.team.push(m);
    } else {
      const t = await G.UI.pickMon(`要讓誰回到箱子，換 ${G.Mon.name(m)} 上來？`, s.team);
      if (t === null) return;
      const out = s.team[t];
      s.team[t] = m;
      s.box[i] = out;
    }
    G.Mon.heal(m);
    G.Game.save();
    G.Sound.sfx('select');
    S.team();
  };

  // ── 背包 ──
  S.bag = () => {
    const s = G.Game.state;
    const ids = Object.keys(G.ITEMS).filter((k) => s.bag[k] > 0);
    const rows = ids.length
      ? ids.map((k) => {
          const it = G.ITEMS[k];
          const usable = it.kind !== 'ball';
          return `<div class="item-row"><div class="item-ico">${G.UI.itemIcon(k)}</div><div class="item-info"><b>${it.name}</b><p>${it.desc}</p></div>
            <div class="item-qty">×${s.bag[k]}</div>${usable ? `<button class="btn sm pink" data-act="use" data-id="${k}">使用</button>` : '<span class="small muted" style="width:56px;text-align:center">對戰用</span>'}</div>`;
        }).join('')
      : '<p class="empty">背包空空的，去商店買點東西吧！</p>';
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page" style="max-width:760px">
      <div class="page-head"><h2>🎒 背包</h2><button class="btn" data-act="goshop">🛒 去商店</button></div>
      <div class="item-list">${rows}</div>
    </div></div>`, async (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'goshop') return G.UI.show('shop');
      if (act === 'use') {
        await S.useItemOutside(el.dataset.id);
        S.bag();
      }
    });
  };

  S.useItemOutside = async (k) => {
    const s = G.Game.state;
    const it = G.ITEMS[k];
    const ok = (m) => {
      const mx = G.Mon.stats(m).hp;
      if (it.kind === 'heal') return m.hp > 0 && m.hp < mx;
      if (it.kind === 'cure') return m.hp > 0 && !!m.status;
      if (it.kind === 'revive') return m.hp <= 0;
      if (it.kind === 'candy') return m.lv < G.MAX_LV;
      return false;
    };
    if (!s.team.some(ok)) { G.UI.toast('現在沒有萌獸需要這個道具。'); return; }
    const i = await G.UI.pickMon(`要對誰使用${it.name}？`, s.team, ok);
    if (i === null) return;
    const m = s.team[i];
    s.bag[k]--;
    if (it.kind === 'heal') { m.hp = Math.min(G.Mon.stats(m).hp, m.hp + it.heal); G.Sound.sfx('heal'); G.UI.toast(`${G.Mon.name(m)} 回復了 HP！`); }
    if (it.kind === 'cure') { m.status = null; m.slp = 0; G.Sound.sfx('heal'); G.UI.toast(`${G.Mon.name(m)} 的異常狀態治好了！`); }
    if (it.kind === 'revive') { m.hp = Math.floor(G.Mon.stats(m).hp / 2); G.Sound.sfx('heal'); G.UI.toast(`${G.Mon.name(m)} 恢復了精神！`); }
    if (it.kind === 'candy') {
      const ups = G.Mon.levelUp(m);
      G.Sound.sfx('levelup');
      await G.UI.alert('升級了！', `<div class="row" style="flex-wrap:nowrap"><div style="width:100px;flex:none">${G.Art.mon(m.sp)}</div><p style="font-size:18px;margin:0">${U.esc(G.Mon.name(m))} 升到了 <b>Lv.${m.lv}</b>！</p></div>`);
      const q = [];
      ups.forEach((u) => u.newMoves.forEach((id) => q.push({ uid: m.uid, id })));
      await G.Game.growth(q);
    }
    G.Game.save();
  };

  // ── 商店 ──
  S.shop = () => {
    const s = G.Game.state;
    const qty = {};
    const avail = G.SHOP_ORDER.filter((k) => !G.ITEMS[k].badge || s.badges >= G.ITEMS[k].badge);
    const locked = G.SHOP_ORDER.filter((k) => !avail.includes(k));
    const draw = () => {
      G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page" style="max-width:820px">
        <div class="page-head"><h2>🛒 萌獸商店</h2><span class="num" style="font-size:18px">💰 ${U.fmtMoney(s.money)}</span></div>
        <div class="item-list">${avail.map((k) => {
          const it = G.ITEMS[k], q = qty[k] || 1;
          return `<div class="item-row"><div class="item-ico">${G.UI.itemIcon(k)}</div>
            <div class="item-info"><b>${it.name}</b> <span class="num small muted">$${it.price}</span><p>${it.desc}　<span class="muted">（擁有 ${s.bag[k] || 0}）</span></p></div>
            <div class="qty-ctl"><button class="btn sm white" data-act="minus" data-id="${k}" aria-label="減少">−</button><span class="num" style="min-width:26px;text-align:center;font-weight:700">${q}</span><button class="btn sm white" data-act="plus" data-id="${k}" aria-label="增加">＋</button></div>
            <button class="btn sm pink" data-act="buy" data-id="${k}" ${s.money < it.price * q ? 'disabled' : ''}>買 $${it.price * q}</button></div>`;
        }).join('')}</div>
        ${locked.length ? `<p class="small muted">🔒 拿到更多徽章後會開始賣：${locked.map((k) => `${G.ITEMS[k].name}（${G.ITEMS[k].badge} 個徽章）`).join('、')}</p>` : ''}
      </div></div>`, (act, el) => {
        if (G.UI.hudAct(act)) return;
        const k = el.dataset.id;
        if (act === 'plus') { qty[k] = Math.min(20, (qty[k] || 1) + 1); G.Sound.sfx('click'); draw(); }
        if (act === 'minus') { qty[k] = Math.max(1, (qty[k] || 1) - 1); G.Sound.sfx('click'); draw(); }
        if (act === 'buy') {
          const q = qty[k] || 1, cost = G.ITEMS[k].price * q;
          if (s.money < cost) return;
          s.money -= cost;
          s.bag[k] = (s.bag[k] || 0) + q;
          G.Game.save();
          G.Sound.sfx('buy');
          G.UI.toast(`買了 ${G.ITEMS[k].name} ×${q}！`);
          draw();
        }
      });
    };
    draw();
  };
})();
