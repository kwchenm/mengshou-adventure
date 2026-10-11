// 共用介面：畫面切換、彈窗、對話、提示
(function () {
  const U = G.U;
  const UI = (G.UI = {});
  G.Screens = {};
  const app = () => document.getElementById('app');

  UI.show = (name, params) => {
    UI.current = name;
    document.querySelectorAll('.modal-layer').forEach((m) => m.remove());
    app().onclick = null;
    G.Screens[name](params || {});
    window.scrollTo(0, 0);
  };

  UI.render = (html, onAct) => {
    const el = app();
    el.innerHTML = html;
    el.onclick = (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled || !el.contains(b)) return;
      G.Sound.init();
      onAct && onAct(b.dataset.act, b, e);
    };
  };

  UI.hpClass = (hp, max) => {
    const p = max ? hp / max : 0;
    return p > 0.5 ? '' : p > 0.2 ? 'mid' : 'lo';
  };
  UI.hpBar = (hp, max) => `<div class="hpbar ${UI.hpClass(hp, max)}"><i style="width:${max ? Math.max(0, (hp / max) * 100) : 0}%"></i></div>`;
  UI.types = (types, sm) => types.map((t) => G.Art.typeBadge(t, sm)).join(' ');
  UI.statusChip = (st) => (st ? `<span class="chip st" style="--sc:${G.STATUS_INFO[st].color}">${G.STATUS_INFO[st].icon}${G.STATUS_INFO[st].name}</span>` : '');
  UI.hearts = (f) => {
    const n = Math.round(f / 20);
    let s = '';
    for (let i = 0; i < 5; i++) s += i < n ? '❤' : '<span class="off">❤</span>';
    return `<span class="hearts" title="感情 ${f}/100">${s}</span>`;
  };
  UI.stars = (n, max = 3) => {
    let s = '';
    for (let i = 0; i < max; i++) s += i < n ? '★' : '<span class="off">★</span>';
    return `<span class="stars">${s}</span>`;
  };
  UI.itemIcon = (id) => (G.ITEMS[id].kind === 'ball' ? G.Art.ball(id, 34) : `<span>${G.ITEMS[id].icon}</span>`);

  // ── 提示 ──
  UI.toast = (text, ms = 2200) => {
    let layer = document.querySelector('.toast-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'toast-layer';
      document.body.appendChild(layer);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    layer.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  // ── 彈窗：回傳 Promise，按下 data-val 的按鈕或 X 時結束 ──
  UI.modal = ({ title, body, buttons = [], wide = false, onRender, closable = true }) =>
    new Promise((resolve) => {
      const layer = document.createElement('div');
      layer.className = 'modal-layer';
      layer.innerHTML = `<div class="modal panel${wide ? ' wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head"><h3>${title}</h3>${closable ? '<button class="modal-x" data-val="__close" aria-label="關閉">✕</button>' : ''}</div>
        <div class="modal-body">${body}</div>
        ${buttons.length ? `<div class="modal-foot">${buttons.map((b) => `<button class="btn ${b.cls || ''}" data-val="${b.value}" ${b.disabled ? 'disabled' : ''}>${b.label}</button>`).join('')}</div>` : ''}
      </div>`;
      document.body.appendChild(layer);
      const close = (v) => {
        layer.remove();
        resolve(v);
      };
      layer.addEventListener('click', (e) => {
        if (e.target === layer && closable) return close(null);
        const b = e.target.closest('[data-val]');
        if (!b || b.disabled) return;
        G.Sound.sfx(b.dataset.val === '__close' ? 'back' : 'select');
        close(b.dataset.val === '__close' ? null : b.dataset.val);
      });
      layer.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && closable) close(null);
      });
      if (onRender) onRender(layer.querySelector('.modal'), close);
      const first = layer.querySelector('.modal-foot .btn, .modal-x');
      if (first) first.focus({ preventScroll: true });
    });

  UI.confirm = (text, yes = '好', no = '取消') =>
    UI.modal({ title: '確認', body: `<p style="margin:0;font-size:17px;line-height:1.6">${text}</p>`, buttons: [{ label: no, value: 'no', cls: 'white' }, { label: yes, value: 'yes', cls: 'pink' }] }).then((v) => v === 'yes');

  UI.alert = (title, html, label = '好') => UI.modal({ title, body: html, buttons: [{ label, value: 'ok', cls: 'pink' }] });

  // ── 對話：lines 為字串陣列，who/look 決定頭像 ──
  UI.dialog = (lines, { who = '', look = null, mon = null } = {}) =>
    new Promise((resolve) => {
      const layer = document.createElement('div');
      layer.className = 'dialog-layer';
      const face = mon ? G.Art.mon(mon) : look ? G.Art.person(look) : '';
      layer.innerHTML = `<div class="dialog-box panel" role="dialog" tabindex="0">
        ${face ? `<div class="dialog-face">${face}</div>` : ''}
        <div class="dialog-text">${who ? `<span class="dialog-who">${who}</span>` : ''}<div class="dialog-line"></div><div class="dialog-next">點一下繼續 ▼</div></div>
      </div>`;
      document.body.appendChild(layer);
      const lineEl = layer.querySelector('.dialog-line');
      let i = 0, typing = null, full = '';
      const show = () => {
        full = lines[i];
        const t0 = performance.now();
        lineEl.textContent = '';
        clearInterval(typing);
        typing = setInterval(() => {
          const k = Math.floor((performance.now() - t0) / 26) + 1;
          lineEl.textContent = full.slice(0, k);
          if (k >= full.length) { clearInterval(typing); typing = null; }
        }, 26);
      };
      const next = () => {
        G.Sound.init();
        if (typing) { clearInterval(typing); typing = null; lineEl.textContent = full; return; }
        G.Sound.sfx('click');
        i++;
        if (i >= lines.length) { layer.remove(); resolve(); return; }
        show();
      };
      layer.addEventListener('click', next);
      layer.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
      layer.querySelector('.dialog-box').focus({ preventScroll: true });
      show();
    });

  // ── 選萌獸 ──
  UI.monPickCard = (m, i, { disabled = false, active = false, note = '' } = {}) => {
    const st = G.Mon.stats(m);
    return `<button class="pick-card${active ? ' active' : ''}" data-val="${i}" ${disabled ? 'disabled' : ''}>
      <div class="pa">${G.Art.mon(m.sp, { cls: 'still' })}</div>
      <div class="pi">
        <div class="pn">${U.esc(G.Mon.name(m))} <span>Lv.${m.lv}</span></div>
        <div class="row" style="gap:4px">${UI.types(G.SPECIES[m.sp].types, true)} ${UI.statusChip(m.status)}</div>
        ${UI.hpBar(m.hp, st.hp)}
        <small>HP ${m.hp}/${st.hp}${note ? ' · ' + note : ''}</small>
      </div>
    </button>`;
  };

  UI.pickMon = (title, mons, filter = () => true, opts = {}) =>
    UI.modal({
      title,
      wide: true,
      closable: opts.closable !== false,
      body: (opts.intro || '') + `<div class="pick-grid">${mons.map((m, i) => UI.monPickCard(m, i, { disabled: !filter(m, i), active: opts.active === i, note: opts.note ? opts.note(m, i) : '' })).join('')}</div>`,
    }).then((v) => (v === null ? null : +v));

  // ── 上方狀態列 ──
  UI.hud = () => {
    const s = G.Game.state;
    let badges = '';
    for (let i = 1; i <= 8; i++) {
      const L = G.LOCS[i];
      const got = s.badges >= i;
      badges += `<span class="badge-slot${got ? ' got' : ''}" style="--bc:${got ? L.color : 'transparent'}" title="${L.gym.badge}">${got ? G.TYPE_INFO[L.gym.type].icon : ''}</span>`;
    }
    return `<header class="hud">
      <div class="hud-who"><div class="hud-avatar">${G.Art.person(G.Game.playerLook())}</div>
        <div><div class="hud-name">${U.esc(s.name)}${s.champion ? ' 👑' : ''}</div><div class="hud-money num">💰 ${U.fmtMoney(s.money)}</div></div></div>
      <div class="hud-badges" aria-label="徽章 ${s.badges}/8">${badges}</div>
      <nav class="hud-menu">
        <button class="btn sm white" data-act="nav-map">🗺️ 地圖</button>
        <button class="btn sm mint" data-act="nav-team">🐾 隊伍</button>
        <button class="btn sm" data-act="nav-bag">🎒 背包</button>
        <button class="btn sm blue" data-act="nav-dex">📖 圖鑑</button>
        <button class="btn sm pink" data-act="nav-types">🔥 屬性表</button>
        <button class="btn sm white" data-act="nav-settings" aria-label="設定">⚙️</button>
      </nav>
    </header>`;
  };

  // HUD 按鈕的共用處理，回傳 true 代表已處理
  UI.hudAct = (act) => {
    const map = { 'nav-map': 'map', 'nav-team': 'team', 'nav-bag': 'bag', 'nav-dex': 'dex', 'nav-types': 'types' };
    if (map[act]) { G.Sound.sfx('click'); UI.show(map[act]); return true; }
    if (act === 'nav-settings') { G.Screens.settings(); return true; }
    return false;
  };

  // 彩色紙片
  UI.confetti = (n = 60) => {
    const cols = ['#FF5D8F', '#FFD23F', '#36CF9C', '#4F8EF0', '#B27BFF'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cols[i % cols.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
      c.style.animationDelay = Math.random() * 0.6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }
  };
})();
