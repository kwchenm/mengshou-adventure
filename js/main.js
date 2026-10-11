// 啟動
(function () {
  document.addEventListener('pointerdown', () => G.Sound.init(), { once: false, passive: true });
  document.addEventListener('keydown', () => G.Sound.init(), { passive: true });

  const start = () => {
    const s = G.Game.readLocal();
    if (s) {
      G.Sound.sfxOn = s.settings ? s.settings.sfx !== false : true;
      G.Sound.musicOn = s.settings ? s.settings.music !== false : true;
    }
    G.UI.show('title');
    // 雲端存檔比較新的話，換成雲端的進度
    G.Cloud.init().then((cs) => {
      if (!cs || !cs.team) return;
      const local = G.Game.readLocal();
      if (local && (local.savedAt || 0) >= (cs.savedAt || 0)) return;
      G.Game.writeLocal(cs);
      if (G.UI.current === 'title') G.UI.show('title');
    });
  };

  // 在 claude.ai 上發布時，畫面更新後保留遊戲進度
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => (G.Game.state ? { state: G.Game.state } : {}));
  const boot = (data) => {
    if (data && data.state && data.state.team) {
      G.Game.load(data.state);
      G.UI.show(data.state.starter ? 'map' : 'title');
      G.Cloud.init();
    } else start();
  };
  if (hot && hot.ready) hot.ready(boot);
  else boot(hot && hot.data);
})();
