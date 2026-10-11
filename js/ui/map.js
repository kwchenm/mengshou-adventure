// 世界地圖與城鎮
(function () {
  const U = G.U;
  const S = G.Screens;

  // 平滑曲線（Catmull-Rom → Bezier）
  const smooth = (pts) => {
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x} ${p2.y}`;
    }
    return d;
  };

  function mapSVG() {
    const s = G.Game.state;
    const L = G.LOCS;
    const tree = (x, y, r = 14, c = '#4FAE3F') => `<g><rect x="${x - 3}" y="${y}" width="6" height="${r * 0.9}" fill="#8A5A35"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#2F6B2A" stroke-width="2"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".2"/></g>`;
    const house = (x, y, c) => `<g><rect x="${x - 12}" y="${y - 10}" width="24" height="18" rx="2" fill="#FFF6E0" stroke="#23305E" stroke-width="2"/><path d="M${x - 16} ${y - 8} L${x} ${y - 22} L${x + 16} ${y - 8} Z" fill="${c}" stroke="#23305E" stroke-width="2" stroke-linejoin="round"/><rect x="${x - 3}" y="${y - 1}" width="6" height="9" fill="#C48A5A"/></g>`;
    const mount = (x, y, w, h, c, snow) => `<path d="M${x - w} ${y} L${x} ${y - h} L${x + w} ${y} Z" fill="${c}" stroke="#23305E" stroke-width="2" stroke-linejoin="round"/>${snow ? `<path d="M${x - w * 0.3} ${y - h * 0.7} L${x} ${y - h} L${x + w * 0.3} ${y - h * 0.7} L${x + w * 0.1} ${y - h * 0.62} L${x - w * 0.08} ${y - h * 0.72} Z" fill="#fff"/>` : ''}`;
    const lolli = (x, y, c) => `<g><rect x="${x - 2}" y="${y}" width="4" height="22" fill="#fff" stroke="#23305E" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="11" fill="${c}" stroke="#23305E" stroke-width="2"/><path d="M${x - 6} ${y} a6 6 0 1 1 12 0 a4 4 0 1 1 -8 0" fill="none" stroke="#fff" stroke-width="2.4"/></g>`;
    let deco = '';
    // 0 微風鎮
    deco += house(100, 545, '#FF7A6B') + house(185, 548, '#4F8EF0') + house(150, 565, '#FFD23F');
    // 1 森林
    [[280, 410], [300, 395], [262, 440], [370, 420], [390, 440], [350, 400], [395, 480], [255, 480]].forEach(([x, y], i) => (deco += tree(x, y, 13 + (i % 3) * 3)));
    // 2 海邊
    deco += `<path d="M95 300 Q130 280 120 340 Q110 390 130 410 Q90 400 80 360 Z" fill="#FFE4A8" stroke="#E8C27A" stroke-width="2"/>`;
    deco += `<g transform="translate(120 330)"><path d="M0 26 Q3 10 0 0" stroke="#9A6A3A" stroke-width="4" fill="none"/><path d="M0 0 Q-14 -4 -20 6 Q-10 -2 0 0 Q-6 -14 -16 -14 Q-4 -8 0 0 Q10 -14 20 -10 Q6 -6 0 0 Q14 -2 18 10 Q10 2 0 0" fill="#4FB05A"/></g>`;
    // 3 火山
    deco += `<path d="M330 260 L380 190 Q400 182 420 190 L470 260 Z" fill="#9A5A48" stroke="#23305E" stroke-width="2.5" stroke-linejoin="round"/><path d="M380 190 Q400 182 420 190 L410 204 Q400 198 390 204 Z" fill="#FF6A3D"/><path d="M395 196 Q388 220 378 240" stroke="#FF8A3D" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#C8B8B0" opacity=".85"><circle cx="402" cy="170" r="10"/><circle cx="414" cy="156" r="8"/><circle cx="406" cy="142" r="6"/></g>`;
    // 4 城市
    [[565, 330, 22, 46, '#C9D6F2'], [592, 336, 18, 36, '#FFD9E6'], [612, 326, 16, 52, '#D7F5E8'], [520, 334, 18, 30, '#FFF0C2']].forEach(([x, y, w, h, c]) => {
      deco += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="3" fill="${c}" stroke="#23305E" stroke-width="2"/><rect x="${x + 4}" y="${y - h + 6}" width="${w - 8}" height="4" fill="#fff"/><rect x="${x + 4}" y="${y - h + 16}" width="${w - 8}" height="4" fill="#fff"/>`;
    });
    // 5 糖果
    deco += `<ellipse cx="720" cy="505" rx="80" ry="34" fill="#FFD0E6" opacity=".8"/>` + lolli(660, 485, '#FF8FC0') + lolli(760, 500, '#8FD6FF') + lolli(740, 440, '#FFE14D');
    // 6 岩山
    deco += mount(880, 340, 46, 80, '#A99B8A', true) + mount(920, 360, 34, 56, '#8D7E6C', false) + mount(790, 290, 30, 50, '#B8AA98', true);
    // 7 月影
    deco += `<ellipse cx="640" cy="225" rx="90" ry="52" fill="#4A3F8A" opacity=".55"/><path d="M684 168 A16 16 0 1 0 684 200 A12 12 0 1 1 684 168 Z" fill="#FFF3B0"/>` + [[590, 190], [700, 250], [610, 262], [560, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join('');
    // 8 龍之谷
    deco += mount(860, 120, 36, 76, '#8E7BD6', true) + mount(900, 140, 26, 50, '#6F5CC0', false) + mount(760, 110, 28, 52, '#A493E6', true);
    // 9 競技場
    deco += `<g><ellipse cx="470" cy="80" rx="62" ry="22" fill="#FFE07A" stroke="#23305E" stroke-width="2.5"/><ellipse cx="470" cy="76" rx="44" ry="13" fill="#9ED97A" stroke="#23305E" stroke-width="2"/><path d="M420 64 V40 M520 64 V40" stroke="#23305E" stroke-width="2"/><path d="M420 40 l14 5 -14 5 Z M520 40 l14 5 -14 5 Z" fill="#FF5D8F"/></g>`;

    const path = smooth(L.map((l) => ({ x: l.x, y: l.y })));
    const unlockedPath = smooth(L.slice(0, s.unlocked + 1).map((l) => ({ x: l.x, y: l.y })));
    const nodes = L.map((l) => {
      const open = l.id <= s.unlocked;
      const here = l.id === s.loc;
      const done = l.gym ? (l.gym.final ? s.champion : s.badges >= l.id) : s.unlocked > l.id;
      return `<g class="map-node${open ? '' : ' locked'}" data-act="goto" data-id="${l.id}" role="button" aria-label="${l.name}${open ? '' : '（還沒解鎖）'}">
        <g class="ring"><circle cx="${l.x}" cy="${l.y}" r="${here ? 27 : 23}" fill="${open ? l.color : '#B9BFD6'}" stroke="#23305E" stroke-width="4"/>
        <circle cx="${l.x}" cy="${l.y}" r="${here ? 19 : 16}" fill="#fff" opacity=".92"/>
        <text x="${l.x}" y="${l.y + 7}" text-anchor="middle" font-size="${here ? 21 : 18}">${open ? l.icon : '🔒'}</text>
        ${done ? `<circle cx="${l.x + 18}" cy="${l.y - 18}" r="9" fill="#36CF9C" stroke="#23305E" stroke-width="2.5"/><path d="M${l.x + 14} ${l.y - 18} l3 3 6 -6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : ''}</g>
        <g><rect x="${l.x - l.name.length * 8.5 - 8}" y="${l.y + 28}" width="${l.name.length * 17 + 16}" height="25" rx="12" fill="${open ? '#FFFDF6' : '#E3E6F2'}" stroke="#23305E" stroke-width="2.5"/>
        <text x="${l.x}" y="${l.y + 46}" text-anchor="middle" font-size="15" font-weight="700" fill="${open ? '#23305E' : '#8C95BD'}">${l.name}</text></g>
      </g>`;
    }).join('');
    const here = L[s.loc];
    const pin = `<g class="map-pin" pointer-events="none"><path d="M${here.x} ${here.y - 30} l-9 -14 a14 14 0 1 1 18 0 Z" fill="#FF5D8F" stroke="#23305E" stroke-width="2.5"/><circle cx="${here.x}" cy="${here.y - 55}" r="9" fill="#fff"/></g>`;

    return `<svg class="map-svg" viewBox="0 0 1000 600" role="img" aria-label="星光地區地圖">
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FCBFF"/><stop offset="1" stop-color="#4FA6F0"/></linearGradient>
        <radialGradient id="land" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#C6EE9E"/><stop offset="1" stop-color="#9ED97A"/></radialGradient>
        <pattern id="waves" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 q15 -8 30 0 t30 0" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/></pattern>
      </defs>
      <rect width="1000" height="600" fill="url(#sea)"/><rect width="1000" height="600" fill="url(#waves)"/>
      <path d="M118 572 C58 532 46 440 92 392 C60 330 74 262 136 238 C140 168 214 124 290 140 C330 74 444 44 528 62 C600 30 706 40 766 76 C850 44 958 86 962 176 C996 250 966 330 930 378 C968 446 940 540 864 566 C760 604 640 576 556 594 C456 612 376 584 296 594 C214 604 160 598 118 572 Z" fill="#FFE9B0" stroke="#23305E" stroke-width="4"/>
      <path d="M128 558 C74 522 64 440 106 396 C76 336 90 272 146 250 C152 184 222 142 294 156 C336 92 444 62 526 80 C598 50 702 58 760 92 C842 64 940 102 944 182 C976 252 950 330 914 376 C948 440 924 524 856 550 C758 586 640 560 556 578 C458 596 378 568 298 578 C220 586 168 582 128 558 Z" fill="url(#land)"/>
      ${deco}
      <path d="${path}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".7"/>
      <path d="${path}" fill="none" stroke="#B9A27A" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>
      <path d="${unlockedPath}" fill="none" stroke="#FF8FB8" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>
      ${nodes}${pin}
    </svg>`;
  }

  function locPanel(loc) {
    const s = G.Game.state;
    const wild = loc.wild
      ? `<div class="loc-sec"><h4>🌿 野外會出現（Lv.${loc.wild.lv[0]}～${loc.wild.lv[1]}）</h4><div class="wild-list">${loc.wild.list.map(([sp]) => {
          const seen = s.dex[sp];
          return `<div class="wm${seen ? '' : ' silhouette'}" title="${seen ? G.SPECIES[sp].name : '？？？'}">${G.Art.mon(sp, { cls: 'still' })}</div>`;
        }).join('')}</div></div>`
      : '';
    const trs = loc.trainers.length
      ? `<div class="loc-sec"><h4>⚔️ 附近的訓練家</h4>${loc.trainers.map((id) => {
          const t = G.TRAINERS[id];
          const team = G.resolveTeam(t, s.starter);
          const lv = Math.max(...team.map((x) => x[1])) + G.Game.diff().lvAdj;
          const beat = s.defeated[id];
          const key = loc.key === id;
          return `<div class="tr-row"><div class="tr-face">${G.Art.person(t.look)}</div>
            <div class="tr-info"><b>${t.rival ? '⭐ ' : ''}${t.cls} ${t.name}</b><br><small>${team.length} 隻萌獸・最高 Lv.${lv}</small>
            ${beat ? `<br><span class="done-mark">✔ 打贏過了</span>` : key ? '<br><small style="color:var(--berry-d)">打贏才能前往下一個城鎮！</small>' : ''}</div>
            <button class="btn sm ${beat ? 'white' : 'pink'}" data-act="trainer" data-id="${id}">${beat ? '再戰' : '對戰'}</button></div>`;
        }).join('')}</div>`
      : '';
    let gym = '';
    if (loc.gym) {
      const g = loc.gym;
      const list = [...g.trainers, g.leader];
      const prog = Math.min(s.gymProg[loc.id] || 0, list.length);
      const got = g.final ? s.champion : s.badges >= loc.id;
      const canTry = g.final ? s.badges >= 8 : true;
      gym = `<button class="btn lg ${got ? 'white' : 'grape'} wide" data-act="gym" ${canTry ? '' : 'disabled'}>🏟️ ${g.name}${got ? '（已通過 ✔）' : prog ? `（進度 ${prog}/${list.length}）` : ''}</button>
        ${canTry ? '' : '<p class="small muted wide" style="margin:0">需要 8 個徽章才能挑戰冠軍盃。</p>'}`;
    }
    return `<div class="loc-hero">${G.Art.scene(loc.theme)}<div class="loc-title"><h2>${loc.icon} ${loc.name}</h2></div></div>
      <div class="loc-body">
        <p class="loc-desc">${loc.desc}</p>
        <div class="loc-actions">
          ${gym}
          ${loc.wild ? `<button class="btn mint wide" data-act="wild">🌿 野外探索・找萌獸</button>` : ''}
          <button class="btn pink" data-act="heal">💗 療癒中心</button>
          <button class="btn" data-act="shop">🛒 商店</button>
          <button class="btn blue" data-act="camp">🏕️ 營地</button>
          <button class="btn white" data-act="train">💪 特訓場</button>
        </div>
        ${trs}${wild}
      </div>`;
  }

  S.map = () => {
    const s = G.Game.state;
    const loc = G.LOCS[s.loc];
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="map-screen">
      <div class="map-box panel">${mapSVG()}</div>
      <section class="loc-panel panel">${locPanel(loc)}</section>
    </div></div>`, async (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'goto') {
        const id = +el.dataset.id;
        if (id > s.unlocked) {
          const need = G.LOCS[id - 1];
          G.UI.toast(need.gym ? `先在「${need.name}」拿到${need.gym.badge}吧！` : `先在「${need.name}」打贏阿光吧！`);
          G.Sound.sfx('miss');
          return;
        }
        G.Sound.sfx('select');
        s.loc = id;
        G.Game.save();
        S.map();
        return;
      }
      if (act === 'wild') { await G.Game.wild(loc); return S.map(); }
      if (act === 'trainer') {
        const id = el.dataset.id;
        const res = await G.Game.fightTrainer(id);
        if (res === 'win' && loc.key === id) {
          s.unlocked = Math.max(s.unlocked, loc.id + 1);
          G.Game.save();
          G.UI.toast(`🗺️ 可以前往「${G.LOCS[loc.id + 1].name}」了！`, 3000);
        }
        return S.map();
      }
      if (act === 'gym') return S.gym(loc);
      if (act === 'heal') {
        G.Game.healAll();
        G.Game.save();
        G.Sound.sfx('heal');
        G.UI.toast('💗 萌獸們都恢復精神了！');
        return;
      }
      if (act === 'shop') return G.UI.show('shop');
      if (act === 'camp') return G.UI.show('camp');
      if (act === 'train') return G.UI.show('train');
    });
    G.Sound.music('map');
  };

  // ── 道館挑戰 ──
  S.gym = async (loc) => {
    const s = G.Game.state;
    const g = loc.gym;
    const list = [...g.trainers, g.leader];
    const prog = Math.min(s.gymProg[loc.id] || 0, list.length);
    const leader = G.TRAINERS[g.leader];
    const done = prog >= list.length;
    const nextId = done ? g.leader : list[prog];
    const nextT = G.TRAINERS[nextId];
    const typeHtml = g.type === 'champion' ? '各種屬性' : G.Art.typeBadge(g.type);
    const rows = list.map((id, i) => {
      const t = G.TRAINERS[id];
      const st = i < prog ? '<span class="done-mark">✔ 已通過</span>' : i === prog ? '<b style="color:var(--berry-d)">▶ 下一位</b>' : '<span class="muted small">等待中</span>';
      return `<div class="tr-row"><div class="tr-face">${G.Art.person(t.look)}</div><div class="tr-info"><b>${t.cls} ${t.name}</b><br><small>${G.resolveTeam(t, s.starter).length} 隻萌獸</small></div>${st}</div>`;
    }).join('');
    const v = await G.UI.modal({
      title: `🏟️ ${g.name}`,
      wide: true,
      body: `<div class="two-col">
        <div class="tip-card panel" style="box-shadow:none">
          <div class="row" style="flex-wrap:nowrap"><div style="width:100px;height:108px;flex:none;background:#FFF3BF;border:3px solid var(--ink);border-radius:16px;overflow:hidden">${G.Art.person(leader.look)}</div>
          <div><h3 style="margin:0">${leader.cls} ${leader.name}</h3><div class="row" style="margin:6px 0">${typeHtml}</div><p class="small muted" style="margin:0">「${leader.intro}」</p></div></div>
          <p class="help-tip" style="margin-top:12px">💡 攻略提示：${leader.tip}</p>
          <p class="small muted">館主的王牌會使用「🌟星光巨大化」。你也可以在選招式時按下巨大化按鈕，一場對戰可以用一次！</p>
        </div>
        <div>${rows}</div></div>`,
      buttons: [
        { label: '先去準備', value: 'no', cls: 'white' },
        { label: done ? `再次挑戰 ${leader.name}` : `挑戰 ${nextT.name}！`, value: 'go', cls: 'pink' },
      ],
    });
    if (v !== 'go') return;
    const res = await G.Game.fightTrainer(nextId, { gym: true, bg: g.final ? 'champion' : 'arena', accent: g.type !== 'champion' ? G.TYPE_INFO[g.type].color : null });
    if (res === 'win' && !done) {
      s.gymProg[loc.id] = prog + 1;
      G.Game.save();
      if (prog + 1 >= list.length) {
        if (g.final) await G.Game.championEnding();
        else await G.Game.badgeCeremony(loc);
      } else {
        G.UI.toast('✔ 通過了！準備好就挑戰下一位吧。', 2600);
      }
    }
    S.map();
  };
})();
