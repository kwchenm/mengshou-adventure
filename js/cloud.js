// 雲端存檔：只在 claude.ai 上發布、且玩家有登入時啟用；本機開啟時不做任何事
(function () {
  const C = (G.Cloud = { ready: false, ref: null, busy: false, pending: null, t: null });

  // 回傳雲端上的存檔（沒有就回傳 null）
  C.init = async () => {
    if (!window.claude || typeof window.claude.use !== 'function') return null;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return null;
      const id = await user.id();
      if (!id) return null;
      C.ref = db.doc('data/users/' + id + '/game');
      const snap = await C.ref.get();
      C.ready = true;
      if (snap.exists) {
        const d = snap.data();
        if (d && typeof d.save === 'string') return JSON.parse(d.save);
      }
    } catch (e) {
      C.ready = false;
    }
    return null;
  };

  // 合併短時間內的多次存檔，一次只寫一筆
  C.push = (state) => {
    if (!C.ready) return;
    C.pending = JSON.stringify(state);
    clearTimeout(C.t);
    C.t = setTimeout(C.flush, 1500);
  };

  C.flush = async () => {
    if (!C.pending || C.busy || !C.ready) return;
    C.busy = true;
    const save = C.pending;
    C.pending = null;
    try {
      await C.ref.set({ save, savedAt: Date.now() });
    } catch (e) {
      const code = e && e.code;
      if (code === 'unavailable') C.pending = C.pending || save;
      else C.ready = false;
    }
    C.busy = false;
    if (C.pending) C.t = setTimeout(C.flush, 2500);
  };
})();
