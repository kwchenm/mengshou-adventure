// 圖鑑與屬性相剋表
(function () {
  const U = G.U;
  const S = G.Screens;

  S.dex = () => {
    const s = G.Game.state;
    const seen = G.DEX_ORDER.filter((k) => s.dex[k]).length;
    const caught = G.DEX_ORDER.filter((k) => s.dex[k] === 2).length;
    const cells = G.DEX_ORDER.map((k) => {
      const sp = G.SPECIES[k], st = s.dex[k];
      return `<button class="dex-cell${st ? '' : ' unseen silhouette'}" data-act="dex" data-id="${k}">
        <div class="da">${G.Art.mon(k, { cls: 'still' })}</div>
        <div class="no">No.${String(sp.no).padStart(3, '0')} ${st === 2 ? '<span class="caught">●</span>' : ''}</div>
        <div class="dn">${st ? sp.name : '？？？'}</div></button>`;
    }).join('');
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page">
      <div class="page-head"><h2>📖 萌獸圖鑑</h2><span class="num">看過 ${seen}／抓到 ${caught}／全部 ${G.DEX_ORDER.length}</span></div>
      <p class="small muted" style="margin:0">● 表示已經抓到。遇到過的萌獸可以點開看詳細資料和出沒地點。</p>
      <div class="dex-grid">${cells}</div>
    </div></div>`, (act, el) => {
      if (G.UI.hudAct(act)) return;
      if (act === 'dex') S.dexEntry(el.dataset.id);
    });
  };

  S.dexEntry = (k) => {
    const s = G.Game.state;
    if (!s.dex[k]) { G.UI.toast('還沒遇過這隻萌獸，去野外找找看吧！'); return; }
    const sp = G.SPECIES[k];
    const chain = G.evoChain(k);
    const chainHtml = chain.map((c, i) => {
      const lv = i > 0 ? G.SPECIES[chain[i - 1]].evo.lv : 0;
      const known = s.dex[c];
      return `${i ? `<div class="small muted" style="align-self:center">→ Lv.${lv} →</div>` : ''}<div style="width:86px;text-align:center" class="${known ? '' : 'silhouette'}">${G.Art.mon(c, { cls: 'still' })}<div class="small">${known ? G.SPECIES[c].name : '？？？'}</div></div>`;
    }).join('');
    const where = G.LOCS.filter((l) => l.wild && l.wild.list.some(([x]) => x === k)).map((l) => l.name);
    const names = ['HP', '攻擊', '防禦', '特攻', '特防', '速度'];
    const stats = sp.bs.map((v, i) => `<div class="stat-row" style="grid-template-columns:46px 36px minmax(0,1fr)"><span>${names[i]}</span><span class="v">${v}</span><div class="stat-bar"><i style="width:${Math.min(100, v / 1.5)}%"></i></div></div>`).join('');
    const ab = G.ABILITIES[sp.ab];
    const prof = G.defProfile(sp.types);
    G.UI.modal({
      title: `No.${String(sp.no).padStart(3, '0')} ${sp.name}`,
      wide: true,
      body: `<div class="sum-grid"><div><div class="sum-art">${G.Art.mon(k)}</div><div class="row" style="margin-top:8px">${G.UI.types(sp.types)}</div></div>
        <div style="min-width:0"><p style="margin:0 0 10px;line-height:1.7">${sp.desc}</p>
        ${ab ? `<p class="help-ab">特性 <b>${ab.name}</b>：${ab.desc}</p>` : ''}
        <p class="small" style="margin:6px 0"><b>怕：</b>${[...prof.x4, ...prof.x2].map((t) => G.Art.typeBadge(t, true)).join(' ') || '沒有'}</p>
        <p class="small" style="margin:6px 0"><b>不怕：</b>${[...prof.half, ...prof.quarter, ...prof.zero].map((t) => G.Art.typeBadge(t, true)).join(' ') || '沒有'}</p>
        <h4 style="margin:10px 0 4px">基礎能力</h4>${stats}
        <h4 style="margin:12px 0 4px">進化</h4><div class="row" style="flex-wrap:nowrap;overflow-x:auto">${chain.length > 1 ? chainHtml : '<span class="muted small">不會進化</span>'}</div>
        <p class="small muted">出沒地點：${where.length ? where.join('、') : '野外找不到，可能要靠進化或其他方法'}</p>
        <p class="small muted">捕捉難度：${sp.rate >= 190 ? '★ 容易' : sp.rate >= 100 ? '★★ 普通' : sp.rate >= 45 ? '★★★ 困難' : '★★★★ 非常困難'}</p></div></div>`,
    });
  };

  // ── 屬性相剋表 ──
  function chartTable() {
    const T = G.TYPES;
    const head = T.map((t) => `<th><span class="ti" style="--tc:${G.TYPE_INFO[t].color}" title="${G.TYPE_INFO[t].name}（防守）">${G.TYPE_INFO[t].icon}</span></th>`).join('');
    const rows = T.map((a) => `<tr data-row="${a}"><th><span class="ti" style="--tc:${G.TYPE_INFO[a].color}" data-type="${a}">${G.TYPE_INFO[a].icon}</span> <b class="small">${G.TYPE_INFO[a].name}</b></th>${T.map((d) => {
      const e = G.eff1(a, d);
      const cls = e === 2 ? 'c2' : e === 0.5 ? 'ch' : e === 0 ? 'c0' : '';
      const txt = e === 2 ? '2' : e === 0.5 ? '½' : e === 0 ? '0' : '';
      return `<td class="${cls}" data-col="${d}" title="${G.TYPE_INFO[a].name} 打 ${G.TYPE_INFO[d].name}：×${e}">${txt}</td>`;
    }).join('')}</tr>`).join('');
    return `<div class="chart-legend"><span><i style="background:#3FCB85"></i>2 = 效果絕佳</span><span><i style="background:#FFB547"></i>½ = 效果不好</span><span><i style="background:#3B4060"></i>0 = 沒有效果</span><span class="muted">空白 = 普通（×1）</span></div>
      <p class="small muted" style="margin:6px 0">← 左邊是<b>攻擊</b>的招式屬性，上面是<b>被打</b>的萌獸屬性。點左邊的屬性圖示可以看說明。</p>
      <div class="chart-wrap"><table class="chart"><thead><tr><th class="small">攻＼守</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function calcHTML(sel) {
    const pick = G.TYPES.map((t) => `<button data-calc="${t}" class="${sel.includes(t) ? 'on' : ''}" aria-pressed="${sel.includes(t)}">${G.Art.typeBadge(t)}</button>`).join('');
    let out = '<p class="muted small" style="margin:8px 0 0">選一個或兩個屬性（像是「岩石＋地面」），看看牠怕什麼！</p>';
    if (sel.length) {
      const p = G.defProfile(sel);
      const line = (lab, arr, cls) => `<div class="help-row"><span class="lab ${cls}" style="width:84px">${lab}</span><div class="vals">${arr.length ? arr.map((t) => G.Art.typeBadge(t, true)).join('') : '<span class="muted small">沒有</span>'}</div></div>`;
      out = `<div style="margin-top:10px">${line('×4 超怕', p.x4, 'g')}${line('×2 怕', p.x2, 'g')}${line('×½ 不怕', p.half, 'b')}${line('×¼ 很不怕', p.quarter, 'b')}${line('×0 完全免疫', p.zero, 'z')}</div>`;
    }
    return `<div class="type-pick">${pick}</div>${out}`;
  }

  function typeTip(t) {
    const ti = G.TYPE_INFO[t];
    const strong = G.TYPES.filter((d) => G.eff1(t, d) === 2);
    const weak = G.TYPES.filter((a) => G.eff1(a, t) === 2);
    return `<h3>${G.Art.typeBadge(t)} 屬性小教室</h3><p>${G.TYPE_TIPS[t]}</p>
      <p class="small"><b>打誰最有效：</b>${strong.map((x) => G.Art.typeBadge(x, true)).join(' ') || '沒有'}</p>
      <p class="small"><b>被誰打最痛：</b>${weak.map((x) => G.Art.typeBadge(x, true)).join(' ') || '沒有'}</p>`;
  }

  function bindChart(root) {
    let sel = [];
    const calc = root.querySelector('#calc');
    const tip = root.querySelector('#tip');
    root.addEventListener('click', (e) => {
      const c = e.target.closest('[data-calc]');
      if (c) {
        const t = c.dataset.calc;
        if (sel.includes(t)) sel = sel.filter((x) => x !== t);
        else sel = sel.length >= 2 ? [sel[1], t] : [...sel, t];
        G.Sound.sfx('click');
        calc.innerHTML = calcHTML(sel);
        return;
      }
      const ty = e.target.closest('[data-type]');
      if (ty && tip) {
        const t = ty.dataset.type;
        root.querySelectorAll('.chart tr').forEach((r) => r.classList.toggle('hl', r.dataset.row === t));
        tip.innerHTML = typeTip(t);
        G.Sound.sfx('click');
      }
    });
    root.addEventListener('mouseover', (e) => {
      const td = e.target.closest('td[data-col]');
      root.querySelectorAll('td.hlc').forEach((x) => x.classList.remove('hlc'));
      if (td) root.querySelectorAll(`td[data-col="${td.dataset.col}"]`).forEach((x) => x.classList.add('hlc'));
    });
  }

  S.types = () => {
    G.UI.render(`${G.UI.hud()}<div class="screen"><div class="page">
      <div class="page-head"><h2>🔥 屬性相剋表</h2></div>
      <div class="two-col">
        <div class="tip-card panel" id="tip">${typeTip('fire')}</div>
        <div class="tip-card panel"><h3>🧮 屬性計算機</h3><div id="calc">${calcHTML([])}</div></div>
      </div>
      <div class="panel" style="padding:12px">${chartTable()}</div>
      <div class="tip-card panel"><h3>📝 對戰小訣竅</h3>
        <p>1. <b>同屬性加成</b>：萌獸使用和自己一樣屬性的招式，威力 ×1.5。</p>
        <p>2. <b>雙屬性</b>的萌獸，倍率會相乘：×2 × ×2 = ×4，×2 × ×½ = ×1。</p>
        <p>3. 被剋制的時候，<b>換上能抵抗的夥伴</b>，讓對手的攻擊變得不痛。</p>
        <p>4. 記不住的時候，對戰畫面旁邊的「屬性小幫手」會幫你標出 ×2 的招式！</p>
      </div>
    </div></div>`, (act) => G.UI.hudAct(act));
    bindChart(document.querySelector('.page'));
    document.querySelector('.chart tr[data-row="fire"]').classList.add('hl');
  };

  S.typesModal = () => {
    G.UI.modal({
      title: '📖 屬性相剋表',
      wide: true,
      body: `<div class="tip-card panel" id="tip" style="margin-bottom:12px;box-shadow:none">${typeTip('water')}</div>${chartTable()}<div class="tip-card" style="padding:12px 0 0"><h3>🧮 屬性計算機</h3><div id="calc">${calcHTML([])}</div></div>`,
      onRender: (el) => bindChart(el),
    });
  };
})();
