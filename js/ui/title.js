// 標題、新遊戲、開場、選御三家
(function () {
  const U = G.U;
  const S = G.Screens;

  S.title = () => {
    const save = G.Game.readLocal();
    const floaters = [['sproutbun', 6, 14], ['embkit', 80, 10], ['bubotter', 10, 62], ['cottoncandy', 84, 60], ['babydragon', 70, 34], ['sparkham', 22, 36], ['littleghost', 90, 30], ['shroomy', 2, 86], ['lazypanda', 78, 82]];
    G.UI.render(`<div class="screen title-screen">
      <div class="title-mons">${floaters.map(([sp, x, y], i) => `<div class="tm" style="left:${x}%;top:${y}%;animation:floaty ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite">${G.Art.mon(sp)}</div>`).join('')}</div>
      <div class="title-card panel">
        <h1 class="logo"><span class="l1">萌獸冒險</span><span class="l2">✨ 星光道館之旅 ✨</span></h1>
        <div class="title-actions">
          ${save ? `<button class="btn lg pink" data-act="continue">▶ 繼續冒險</button>
            <div class="small muted">${U.esc(save.name)}・徽章 ${save.badges}/8・圖鑑 ${Object.values(save.dex || {}).filter((v) => v === 2).length} 隻</div>` : ''}
          <button class="btn lg ${save ? 'white' : 'pink'}" data-act="new">🌟 開始新冒險</button>
          <button class="btn white" data-act="types">📖 先看看屬性相剋表</button>
        </div>
        <div class="title-foot">收集 8 個道館徽章，成為星光地區的冠軍吧！<br>所有萌獸都是原創角色。</div>
      </div>
    </div>`, async (act) => {
      G.Sound.music('title');
      if (act === 'continue') {
        G.Game.load();
        G.Sound.sfx('select');
        if (!G.Game.state.starter) return S.intro();
        G.UI.show('map');
      }
      if (act === 'new') {
        if (save && !(await G.UI.confirm('開始新冒險會把<b>原本的進度蓋掉</b>，確定嗎？', '確定重新開始', '先不要'))) return;
        S.newgame();
      }
      if (act === 'types') S.typesModal();
    });
    G.Sound.music('title');
  };

  S.newgame = async () => {
    let look = 0, diff = 1;
    const looks = G.PLAYER_LOOKS.map((l, i) => `<button class="diff-opt${i === 0 ? ' on' : ''}" data-look="${i}" style="text-align:center;padding:4px"><div style="width:72px;height:78px;margin:auto">${G.Art.person(l)}</div></button>`).join('');
    const diffs = G.DIFFS.map((d, i) => `<button class="diff-opt${i === 1 ? ' on' : ''}" data-diff="${i}"><b>${['🌱', '⭐', '🔥'][i]} ${d.name}</b><span>${d.desc}</span></button>`).join('');
    const v = await G.UI.modal({
      title: '🌟 建立你的訓練家',
      wide: true,
      body: `<div class="form-row"><label for="pname">你的名字</label><input id="pname" class="input" maxlength="8" value="小星" autocomplete="off"></div>
        <div class="form-row"><label>選擇造型</label><div class="diff-list" style="grid-template-columns:repeat(4,1fr)" id="looks">${looks}</div></div>
        <div class="form-row"><label>對戰難度（之後也可以在設定裡更改）</label><div class="diff-list" id="diffs">${diffs}</div></div>`,
      buttons: [{ label: '出發！', value: 'go', cls: 'pink lg' }],
      onRender: (el) => {
        el.querySelector('#looks').addEventListener('click', (e) => {
          const bt = e.target.closest('[data-look]');
          if (!bt) return;
          look = +bt.dataset.look;
          el.querySelectorAll('[data-look]').forEach((x) => x.classList.toggle('on', x === bt));
        });
        el.querySelector('#diffs').addEventListener('click', (e) => {
          const bt = e.target.closest('[data-diff]');
          if (!bt) return;
          diff = +bt.dataset.diff;
          el.querySelectorAll('[data-diff]').forEach((x) => x.classList.toggle('on', x === bt));
        });
        el.querySelector('#pname').addEventListener('input', (e) => { S._pname = e.target.value; });
      },
    });
    if (v !== 'go') return;
    const name = (S._pname ?? '小星').trim() || '小星';
    G.Game.newGame(name.slice(0, 8), diff, look);
    S.intro();
  };

  S.intro = async () => {
    const s = G.Game.state;
    G.UI.render(`<div class="screen title-screen"><div class="title-mons">${['sproutbun', 'embkit', 'bubotter'].map((sp, i) => `<div class="tm" style="left:${18 + i * 26}%;top:30%;width:min(22vw,200px)">${G.Art.mon(sp)}</div>`).join('')}</div></div>`);
    G.Sound.music('title');
    await G.UI.dialog([
      `${s.name}，歡迎來到星光地區！我是研究萌獸的橡果博士。`,
      '這裡住著各式各樣的萌獸。牠們一共有 18 種屬性，屬性之間有「相剋」的關係喔！',
      '比如說：水能澆熄火🔥、火能燒掉草🌿、草能吸收水💧。',
      '厲害的訓練家會先觀察對手的屬性，再選出最有效的招式！',
      '今天，我要送你一隻萌獸當作冒險的夥伴。從這三隻裡面挑一隻吧！',
    ], { who: G.PROF.name, look: G.PROF.look });
    S.starter();
  };

  S.starter = () => {
    let pick = null;
    const info = {
      sproutbun: { pros: '💪 擅長打：水、地面、岩石<br>⚠️ 要小心：火、冰、飛行、毒、蟲', note: '溫柔的草屬性，會吸取對手體力。前期比較辛苦，但後期很強！' },
      embkit: { pros: '💪 擅長打：草、冰、蟲、鋼<br>⚠️ 要小心：水、地面、岩石', note: '活潑的火屬性，速度快、攻擊高。進化後會變成格鬥家！' },
      bubotter: { pros: '💪 擅長打：火、地面、岩石<br>⚠️ 要小心：電、草', note: '可愛的水屬性，攻守平衡。最後會覺醒龍之力！' },
    };
    const card = (sp) => `<div class="starter-card panel" data-act="pick" data-sp="${sp}" role="button" tabindex="0">
      <div class="art">${G.Art.mon(sp)}</div>
      <div><h3>${G.SPECIES[sp].name}</h3><div class="row" style="justify-content:center;margin:4px 0">${G.UI.types(G.SPECIES[sp].types)}</div>
      <p>${info[sp].note}</p><div class="pros" style="margin-top:6px">${info[sp].pros}</div></div>
    </div>`;
    const draw = () => G.UI.render(`<div class="screen starter-screen">
      <div class="starter-head panel"><h2>選擇你的第一隻萌獸！</h2><p class="muted" style="margin:0">點一下卡片看看，決定好了就按「就是你了！」</p></div>
      <div class="starter-row">${G.STARTERS.map(card).join('')}</div>
      <button class="btn lg pink" data-act="confirm" ${pick ? '' : 'disabled'}>${pick ? `就是你了，${G.SPECIES[pick].name}！` : '先選一隻吧'}</button>
    </div>`, async (act, el) => {
      if (act === 'pick') {
        pick = el.dataset.sp;
        G.Sound.sfx('select');
        draw();
        document.querySelector(`[data-sp="${pick}"]`).classList.add('on');
      }
      if (act === 'confirm' && pick) {
        const ok = await G.UI.confirm(`確定要選 <b>${G.SPECIES[pick].name}</b>（${G.UI.types(G.SPECIES[pick].types)}）當夥伴嗎？`, '確定！', '再想想');
        if (ok) S.afterStarter(pick);
      }
    });
    draw();
  };

  S.afterStarter = async (sp) => {
    const s = G.Game.state;
    s.starter = sp;
    const m = G.Mon.create(sp, 5, { ivs: 'wild', friend: 50 });
    m.ivs = { hp: 24, atk: 24, def: 24, spa: 24, spd: 24, spe: 24 };
    m.hp = G.Mon.stats(m).hp;
    G.Game.addMon(m);
    G.Sound.sfx('catch');
    const nick = await G.Game.askNickname(m);
    if (nick) m.nick = nick;
    G.Game.save();
    const rivalSp = G.RIVAL_OF[sp];
    await G.UI.dialog([
      `${G.Mon.name(m)} 看起來很喜歡你呢！`,
      '這些也送給你：萌萌球 ×5、傷藥 ×5。萌萌球可以用來抓野生的萌獸喔！',
    ], { who: G.PROF.name, look: G.PROF.look });
    await G.UI.dialog([
      `嘿，${s.name}！我是你的好朋友阿光！`,
      `我選了${G.SPECIES[rivalSp].name}！牠是${G.TYPE_INFO[G.SPECIES[rivalSp].types[0]].name}屬性的喔！`,
      '我們都拿到萌獸了，來比一場吧！',
    ], { who: '阿光', look: G.TRAINERS.rival1.look });
    const res = await G.Game.fightTrainer('rival1', { bg: 'meadow', tutorial: true });
    s.unlocked = Math.max(s.unlocked, 1);
    G.Game.healAll();
    G.Game.save();
    await G.UI.dialog([
      res === 'win' ? '好精彩的對戰！你很有天分喔！' : '沒關係，第一場對戰本來就很難！多練習就會變強的。',
      '我已經幫你的萌獸回復好了。',
      '接下來，去各個城鎮挑戰「道館」，收集 8 個徽章吧！',
      '路上可以在「野外探索」抓新的萌獸、和訓練家對戰累積經驗。',
      '對戰的時候，右邊的「屬性小幫手」會告訴你哪一招最有效。祝你冒險愉快！',
    ], { who: G.PROF.name, look: G.PROF.look });
    G.UI.show('map');
  };
})();
