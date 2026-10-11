// 營地、特訓場、設定
(function () {
  const U = G.U;
  const S = G.Screens;
  const pets = {};

  const tentSVG = `<svg viewBox="0 0 200 150" class="tent" aria-hidden="true"><path d="M10 140 L100 14 L190 140 Z" fill="#FF8F6B" stroke="#23305E" stroke-width="5" stroke-linejoin="round"/><path d="M100 14 L76 140 L124 140 Z" fill="#FFD23F" stroke="#23305E" stroke-width="5" stroke-linejoin="round"/><path d="M100 60 L86 140 L114 140 Z" fill="#5B3A29"/><path d="M40 98 l10 -4 M150 98 l10 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;
  const fireSVG = `<svg viewBox="0 0 100 100" class="fire" aria-hidden="true"><g fill="#8A5A35" stroke="#23305E" stroke-width="3"><rect x="14" y="78" width="72" height="10" rx="5" transform="rotate(12 50 83)"/><rect x="14" y="78" width="72" height="10" rx="5" transform="rotate(-12 50 83)"/></g><path d="M50 80 C30 78 26 60 36 46 C38 56 44 58 46 54 C44 40 52 28 60 22 C56 36 68 44 66 60 C64 74 58 80 50 80 Z" fill="#FF8A3D" stroke="#C2410C" stroke-width="3"><animate attributeName="d" dur="1s" repeatCount="indefinite" values="M50 80 C30 78 26 60 36 46 C38 56 44 58 46 54 C44 40 52 28 60 22 C56 36 68 44 66 60 C64 74 58 80 50 80 Z;M50 80 C32 78 28 58 38 44 C40 54 44 56 48 50 C46 38 50 26 56 18 C58 34 70 44 66 60 C64 74 58 80 50 80 Z;M50 80 C30 78 26 60 36 46 C38 56 44 58 46 54 C44 40 52 28 60 22 C56 36 68 44 66 60 C64 74 58 80 50 80 Z"/></path><path d="M50 78 C42 76 40 66 46 58 C48 64 52 64 52 60 C54 54 58 52 60 50 C58 60 62 66 58 72 C56 76 54 78 50 78 Z" fill="#FFE14D"/></svg>`;

  S.camp = () => {
    const s = G.Game.state;
    const spots = [[24, 74], [40, 82], [62, 82], [78, 72], [88, 50], [66, 46]];
    const mons = s.team.map((m, i) => `<div class="camp-mon" data-act="pet" data-i="${i}" style="left:${spots[i][0]}%;top:${spots[i][1]}%" role="button" tabindex="0" aria-label="摸摸 ${U.esc(G.Mon.name(m))}">${G.Art.mon(m.sp)}</div>`).join('');
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page">
      <div class="page-head"><h2>🏕️ 營地</h2><span class="small muted">點萌獸可以摸摸牠，增加感情 ❤️</span></div>
      <div class="camp-stage" id="camp">${tentSVG}${fireSVG}${mons}</div>
      <div class="camp-bar panel" style="padding:12px 14px">
        <button class="btn pink lg" data-act="curry" ${s.money < 300 ? 'disabled' : ''}>🍛 一起煮咖哩（$300）</button>
        <p class="grow small muted" style="margin:0">煮咖哩可以讓全隊回復體力、增加感情，還能得到一點經驗值！<br>感情越好，萌獸越可能在危急時撐住攻擊、打出會心一擊，甚至自己治好異常狀態。</p>
      </div>
      <div class="team-grid">${s.team.map((m) => `<div class="team-card panel" style="cursor:default"><div class="ta" style="width:60px;height:60px">${G.Art.mon(m.sp, { cls: 'still' })}</div><div class="ti"><div class="tn">${U.esc(G.Mon.name(m))}</div>${G.UI.hearts(m.friend)} <span class="small num muted">${m.friend}/100</span></div></div>`).join('')}</div>
    </div></div>`, async (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'pet') {
        const m = s.team[+el.dataset.i];
        pets[m.uid] = pets[m.uid] || 0;
        const camp = document.getElementById('camp');
        const pop = (txt) => {
          const h = document.createElement('div');
          h.className = 'heart-pop';
          h.textContent = txt;
          h.style.left = el.style.left;
          h.style.top = `calc(${el.style.top} - 60px)`;
          camp.appendChild(h);
          setTimeout(() => h.remove(), 1000);
        };
        el.querySelector('svg').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-18px)' }, { transform: 'translateY(0)' }], { duration: 380 });
        if (pets[m.uid] >= 3) { pop('💤'); G.UI.toast(`${G.Mon.name(m)} 玩累了，想休息一下～`); return; }
        pets[m.uid]++;
        m.friend = Math.min(100, m.friend + 2);
        G.Sound.sfx('pet');
        pop('❤️');
        G.Game.save();
        if (pets[m.uid] === 3) setTimeout(S.camp, 700);
      }
      if (act === 'curry') {
        if (s.money < 300) return;
        s.money -= 300;
        G.Sound.sfx('heal');
        const camp = document.getElementById('camp');
        camp.insertAdjacentHTML('beforeend', `<div class="heart-pop" style="left:46%;top:40%;font-size:60px;animation-duration:1.6s">🍛</div>`);
        await U.sleep(900);
        const q = [];
        const lines = [];
        s.team.forEach((m) => {
          G.Mon.heal(m);
          m.friend = Math.min(100, m.friend + 4);
          const before = m.lv;
          const ups = G.Mon.addExp(m, Math.floor(m.lv * m.lv * 0.9) + 10);
          ups.forEach((u) => u.newMoves.forEach((id) => q.push({ uid: m.uid, id })));
          if (m.lv > before) lines.push(`${U.esc(G.Mon.name(m))} 升到了 Lv.${m.lv}！`);
        });
        Object.keys(pets).forEach((k) => delete pets[k]);
        G.Game.save();
        await G.UI.alert('🍛 咖哩煮好了！', `<p style="font-size:17px;line-height:1.7;margin:0">好香喔！大家吃得津津有味！<br>全隊都恢復了體力，感情也變好了 ❤️<br>${lines.join('<br>')}</p>`, '好好吃！');
        await G.Game.growth(q);
        G.Game.save();
        S.camp();
      }
    });
    G.Sound.music('map');
  };

  // ── 特訓場 ──
  const MAX_STAR = 3, MAX_TOTAL = 6;
  const cost = (m, k) => 300 * ((m.train[k] || 0) + 1) * (1 + Math.floor(m.lv / 20));
  S.train = (sel) => {
    sel = typeof sel === 'number' ? sel : 0;
    const s = G.Game.state;
    const m = s.team[Math.min(sel, s.team.length - 1)];
    const st = G.Mon.stats(m);
    const total = G.Mon.trainTotal(m);
    const list = s.team.map((x, i) => `<button class="train-pick${x === m ? ' on' : ''}" data-act="sel" data-i="${i}"><div class="ta">${G.Art.mon(x.sp, { cls: 'still' })}</div><div><b>${U.esc(G.Mon.name(x))}</b><br><span class="small muted">特訓 ${G.Mon.trainTotal(x)}/${MAX_TOTAL} ★</span></div></button>`).join('');
    const rows = G.STAT_KEYS.map((k) => {
      const n = m.train[k] || 0;
      const c = cost(m, k);
      const can = n < MAX_STAR && total < MAX_TOTAL && s.money >= c;
      return `<div class="item-row"><div class="item-ico">${{ hp: '💗', atk: '💥', def: '🛡️', spa: '🌀', spd: '🔰', spe: '💨' }[k]}</div>
        <div class="item-info"><b>${G.STAT_NAMES[k]}</b> <span class="num">${st[k]}</span><p>${G.UI.stars(n)}</p></div>
        <button class="btn sm ${can ? 'pink' : 'white'}" data-act="do" data-k="${k}" ${can ? '' : 'disabled'}>${n >= MAX_STAR ? '已練滿' : `特訓 $${c}`}</button></div>`;
    }).join('');
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page">
      <div class="page-head"><h2>💪 特訓場</h2><span class="small muted">每顆 ★ 讓該能力 +6%。每項最多 ${MAX_STAR} 顆，每隻萌獸最多 ${MAX_TOTAL} 顆，要好好規劃！</span></div>
      <div class="train-grid"><div class="train-list">${list}</div>
        <div class="panel" style="padding:14px">
          <div class="row" style="flex-wrap:nowrap;margin-bottom:10px"><div style="width:110px;flex:none" id="train-art">${G.Art.mon(m.sp)}</div>
            <div><b style="font-size:20px">${U.esc(G.Mon.name(m))}</b> <span class="num">Lv.${m.lv}</span><div class="row" style="margin:4px 0">${G.UI.types(G.SPECIES[m.sp].types, true)}</div>
            <p class="small muted" style="margin:0">建議：物理招式多就練「攻擊」，特殊招式多就練「特攻」；想先出手就練「速度」。已用 ${total}/${MAX_TOTAL} ★</p></div></div>
          <div class="item-list">${rows}</div>
        </div></div>
    </div></div>`, async (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'sel') { G.Sound.sfx('click'); return S.train(+el.dataset.i); }
      if (act === 'do') {
        const k = el.dataset.k, c = cost(m, k);
        if (s.money < c) return;
        s.money -= c;
        const before = G.Mon.stats(m).hp;
        m.train[k] = (m.train[k] || 0) + 1;
        if (k === 'hp' && m.hp > 0) m.hp += G.Mon.stats(m).hp - before;
        G.Game.save();
        G.Sound.sfx('levelup');
        const art = document.querySelector('#train-art svg');
        if (art) await art.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-22px) scale(1.06)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 700 }).finished;
        G.UI.toast(`${G.Mon.name(m)} 的${G.STAT_NAMES[k]}變強了！★`);
        S.train(sel);
      }
    });
  };

  // ── 設定 ──
  S.settings = async () => {
    const s = G.Game.state;
    const st = s.settings;
    const v = await G.UI.modal({
      title: '⚙️ 設定',
      body: `<div class="form-row"><label>音效與音樂</label><div class="row">
          <button class="btn sm ${st.sfx ? 'mint' : 'white'}" data-val="sfx">🔊 音效：${st.sfx ? '開' : '關'}</button>
          <button class="btn sm ${st.music ? 'mint' : 'white'}" data-val="music">🎵 音樂：${st.music ? '開' : '關'}</button></div></div>
        <div class="form-row"><label>對話速度</label><div class="row">${['慢', '普通', '快'].map((n, i) => `<button class="btn sm ${st.speed === i ? 'pink' : 'white'}" data-val="speed${i}">${n}</button>`).join('')}</div></div>
        <div class="form-row"><label>對戰難度</label><div class="row">${G.DIFFS.map((d, i) => `<button class="btn sm ${s.diff === i ? 'pink' : 'white'}" data-val="diff${i}">${d.name}</button>`).join('')}</div>
          <span class="small muted">${G.DIFFS[s.diff].desc}</span></div>
        <div class="form-row"><label>存檔</label><div class="row">
          <button class="btn sm" data-val="export">📤 複製存檔碼</button>
          <button class="btn sm white" data-val="import">📥 貼上存檔碼</button></div>
          <span class="small muted">遊戲會自動存檔${G.Cloud && G.Cloud.ready ? '，也會同步到你的 Claude 帳號雲端 ☁️' : ''}。換電腦或平板玩時，可以用存檔碼把進度帶過去。</span></div>
        <div class="row" style="margin-top:6px"><button class="btn sm white" data-val="title">🏠 回到標題畫面</button></div>`,
    });
    if (!v) return;
    if (v === 'sfx') { st.sfx = !st.sfx; G.Sound.sfxOn = st.sfx; }
    if (v === 'music') { st.music = !st.music; G.Sound.setMusic(st.music); }
    if (v.startsWith('speed')) st.speed = +v.slice(5);
    if (v.startsWith('diff')) { s.diff = +v.slice(4); G.UI.toast(`難度改成「${G.DIFFS[s.diff].name}」了`); }
    G.Game.save();
    if (v === 'export') return S.exportSave();
    if (v === 'import') return S.importSave();
    if (v === 'title') return G.UI.show('title');
    S.settings();
  };

  S.exportSave = async () => {
    const code = G.Game.exportCode();
    await G.UI.modal({
      title: '📤 存檔碼',
      body: `<p class="small muted" style="margin-top:0">把下面這串文字複製起來，在另一台裝置的「設定 → 貼上存檔碼」貼上就能繼續玩。</p>
        <textarea class="code-box" id="code-out" readonly>${code}</textarea>`,
      buttons: [{ label: '📋 複製', value: 'copy', cls: 'pink' }],
      onRender: (el) => {
        el.querySelector('[data-val="copy"]').addEventListener('click', (e) => {
          e.stopPropagation();
          const ta = el.querySelector('#code-out');
          ta.select();
          (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
            .then(() => G.UI.toast('已複製！'))
            .catch(() => { try { document.execCommand('copy'); G.UI.toast('已複製！'); } catch (x) { G.UI.toast('請手動選取文字複製'); } });
        }, true);
      },
    });
  };

  S.importSave = async () => {
    let txt = '';
    const v = await G.UI.modal({
      title: '📥 貼上存檔碼',
      body: `<p class="small muted" style="margin-top:0">⚠️ 貼上之後，目前的進度會被取代喔。</p><textarea class="code-box" id="code-in" placeholder="把存檔碼貼在這裡"></textarea>`,
      buttons: [{ label: '讀取存檔', value: 'ok', cls: 'pink' }],
      onRender: (el) => el.querySelector('#code-in').addEventListener('input', (e) => { txt = e.target.value; }),
    });
    if (v !== 'ok') return;
    if (G.Game.importCode(txt)) { G.UI.toast('讀取成功！'); G.UI.show('map'); }
    else G.UI.alert('讀取失敗', '<p>存檔碼好像不太對，請確認有完整複製。</p>');
  };
})();
