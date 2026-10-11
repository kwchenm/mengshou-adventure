// 共用小工具
window.G = window.G || {};
(function () {
  const U = (G.U = {});
  U.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.chance = (p) => Math.random() * 100 < p;
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  U.uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  U.copy = (o) => JSON.parse(JSON.stringify(o));
  U.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  U.weighted = (list) => {
    // list: [[value, weight], ...]
    const total = list.reduce((s, x) => s + x[1], 0);
    let r = Math.random() * total;
    for (const [v, w] of list) {
      if ((r -= w) < 0) return v;
    }
    return list[list.length - 1][0];
  };

  // 顏色
  U.hex2rgb = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgb2hex = (r, g, b) =>
    '#' + [r, g, b].map((v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  U.mix = (a, b, t) => {
    const A = U.hex2rgb(a), B = U.hex2rgb(b);
    return U.rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  };
  // amt > 0 變亮，amt < 0 變暗
  U.shade = (hex, amt) => (amt >= 0 ? U.mix(hex, '#ffffff', amt) : U.mix(hex, '#1b1530', -amt));

  U.fmtMoney = (n) => '$' + n.toLocaleString('en-US');

  U.storage = {
    get(k) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    },
    set(k, v) {
      try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
    },
    del(k) {
      try { localStorage.removeItem(k); } catch (e) {}
    },
  };
})();
