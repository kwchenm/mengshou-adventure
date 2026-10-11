// 向量美術：萌獸、場景、人物、道具
(function () {
  const U = G.U;
  const A = (G.Art = {});
  let uidc = 0;
  const OUT = 3.6; // 外框粗細
  const f = (n) => Math.round(n * 10) / 10;

  // 左右對稱：x = 100 為中線
  const pair = (svg) => svg + `<g transform="translate(200 0) scale(-1 1)">${svg}</g>`;
  const at = (x, y, r = 0, k = 1, inner = '') =>
    `<g transform="translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''}${k !== 1 ? ` scale(${f(k * 100) / 100})` : ''}">${inner}</g>`;

  // ───────── 部件：耳朵（左耳，局部座標，往上長） ─────────
  function earShape(type, P) {
    const { fill, line, inner, tip } = P;
    const s = `stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"`;
    switch (type) {
      case 'cat':
        return `<path d="M-16 8 L-6 -32 Q-2 -40 4 -33 L17 6 Z" fill="${fill}" ${s}/><path d="M-9 4 L-3 -22 L8 4 Z" fill="${inner}"/>`;
      case 'fox':
      case 'wolf': {
        const w = type === 'wolf' ? 1.1 : 1;
        return `<g transform="scale(${w} 1)"><path d="M-17 10 L-5 -42 Q-1 -50 4 -42 L18 8 Z" fill="${fill}" ${s}/><path d="M-10 6 L-3 -30 L9 6 Z" fill="${inner}"/><path d="M-4.4 -38 Q-1 -48 3.4 -38 Q0 -35 -4.4 -38Z" fill="${tip}"/></g>`;
      }
      case 'pony':
        return `<path d="M-11 8 L-4 -26 Q0 -32 4 -26 L12 6 Z" fill="${fill}" ${s}/><path d="M-6 4 L-2 -16 L6 4 Z" fill="${inner}"/>`;
      case 'dog':
        return `<path d="M-4 2 C-24 -4 -34 16 -26 32 C-20 42 -8 38 -6 26 C-4 16 2 10 8 4 Z" fill="${fill}" ${s}/><path d="M-10 8 C-22 8 -26 22 -20 30 C-14 32 -12 22 -10 16Z" fill="${inner}" opacity=".7"/>`;
      case 'bunny':
        return `<ellipse cx="0" cy="-30" rx="12" ry="34" fill="${fill}" ${s}/><ellipse cx="0" cy="-27" rx="5.5" ry="23" fill="${inner}"/>`;
      case 'leafbunny':
        return `<path d="M0 8 C-20 -8 -19 -44 0 -64 C19 -44 20 -8 0 8 Z" fill="${fill}" ${s}/><path d="M0 2 L0 -54 M0 -18 L-8 -27 M0 -32 L8 -41 M0 -18 L8 -25" stroke="${tip}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
      case 'mouse':
        return `<circle cx="-6" cy="-12" r="22" fill="${fill}" ${s}/><circle cx="-6" cy="-12" r="13" fill="${inner}"/>`;
      case 'round':
        return `<circle cx="0" cy="-8" r="15" fill="${fill}" ${s}/><circle cx="0" cy="-8" r="8" fill="${inner}"/>`;
      case 'bear':
        return `<circle cx="0" cy="-6" r="14" fill="${fill}" ${s}/><circle cx="0" cy="-6" r="7" fill="${inner}"/>`;
      case 'monkey':
        return `<circle cx="-8" cy="0" r="15" fill="${fill}" ${s}/><circle cx="-8" cy="0" r="9" fill="${inner}"/>`;
      case 'sheep':
        return `<ellipse cx="-14" cy="6" rx="17" ry="9" transform="rotate(24)" fill="${fill}" ${s}/><ellipse cx="-13" cy="6" rx="10" ry="4.5" transform="rotate(24)" fill="${inner}"/>`;
      case 'antenna':
        return `<path d="M0 4 Q-4 -20 -14 -32" fill="none" stroke="${line}" stroke-width="3.4" stroke-linecap="round"/><circle cx="-15" cy="-34" r="6.5" fill="${tip}" ${s}/><circle cx="-17" cy="-36" r="2" fill="#fff" opacity=".8"/>`;
      case 'fin':
        return `<path d="M-6 8 C-30 -2 -30 -30 -12 -40 C-10 -24 -2 -10 12 4 Z" fill="${tip}" ${s}/><path d="M-10 -2 L-18 -26 M-4 2 L-10 -20" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
      default:
        return '';
    }
  }
  const EAR_ANGLE = { cat: -122, fox: -118, wolf: -120, pony: -112, dog: -150, bunny: -104, leafbunny: -102, mouse: -138, round: -132, bear: -130, monkey: 180, sheep: -165, antenna: -100, fin: -150 };
  const EAR_TILT = { dog: 0, monkey: 0, sheep: 0, mouse: -20 };

  function ears(a, H, P) {
    if (!a.ears || a.ears === 'none') return '';
    const ang = EAR_ANGLE[a.ears] ?? -120;
    const rad = (ang * Math.PI) / 180;
    const x = H.x + H.rx * 0.94 * Math.cos(rad), y = H.y + H.ry * 0.94 * Math.sin(rad);
    const tilt = EAR_TILT[a.ears] ?? (ang + 90) * 0.75;
    return pair(at(x, y, tilt, H.k * (a.ears === 'fin' ? 0.72 : 1), earShape(a.ears, P)));
  }

  // ───────── 部件：頭頂 ─────────
  const flamePath = 'M0 6 C-14 2 -16 -12 -8 -24 C-6 -16 -2 -14 0 -18 C0 -30 8 -38 14 -42 C10 -30 18 -22 16 -10 C15 0 8 6 0 6 Z';
  const flameInner = 'M1 3 C-6 1 -7 -7 -3 -13 C-1 -9 1 -9 2 -12 C3 -18 7 -22 9 -24 C7 -16 11 -11 9 -4 C8 1 5 3 1 3 Z';
  function flame(id, k = 1, x = 0, y = 0, purple = false) {
    const g = purple ? `url(#${id}fp)` : `url(#${id}f)`;
    const ln = purple ? '#4B2E8F' : '#C2410C';
    return at(x, y, 0, k, `<path d="${flamePath}" fill="${g}" stroke="${ln}" stroke-width="${OUT / k}" stroke-linejoin="round"/><path d="${flameInner}" fill="${purple ? '#E9DBFF' : '#FFF4B0'}" opacity=".9"/>`);
  }
  const leaf = (fill, line, d) => `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"/>`;

  function topper(a, H, P, id) {
    const x = H.x, y = H.y - H.ry;
    const { line, c3, c, c2 } = P;
    const s = `stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"`;
    switch (a.top) {
      case 'sprout': {
        const g = `url(#${id}a)`;
        return at(x, y + 3, 0, H.k,
          `<path d="M0 2 Q2 -8 0 -15" stroke="${line}" stroke-width="3.4" fill="none" stroke-linecap="round"/>` +
          leaf(g, line, 'M0 -12 C-6 -24 -20 -27 -25 -18 C-18 -9 -8 -8 0 -12 Z') +
          leaf(g, line, 'M0 -15 C6 -30 22 -33 27 -22 C20 -12 8 -10 0 -15 Z') +
          `<path d="M-3 -13 L-17 -19 M3 -16 L19 -24" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/>`);
      }
      case 'sprout2': {
        const g = `url(#${id}a)`;
        return at(x, y + 3, 0, H.k,
          `<path d="M0 2 Q1 -10 0 -18" stroke="${line}" stroke-width="3.4" fill="none" stroke-linecap="round"/>` +
          leaf(g, line, 'M0 -12 C-8 -22 -24 -24 -30 -14 C-20 -6 -8 -6 0 -12 Z') +
          leaf(g, line, 'M0 -12 C8 -22 24 -24 30 -14 C20 -6 8 -6 0 -12 Z') +
          leaf(g, line, 'M0 -16 C-9 -28 -6 -42 0 -48 C6 -42 9 -28 0 -16 Z'));
      }
      case 'flowercrown': {
        let out = '';
        const cols = ['#FF8FB8', '#FFFFFF', '#FFD23F', '#FFFFFF', '#FF8FB8'];
        for (let i = 0; i < 5; i++) {
          const ang = (-150 + i * 30) * Math.PI / 180;
          const fx = H.x + H.rx * 0.82 * Math.cos(ang), fy = H.y + H.ry * 0.82 * Math.sin(ang);
          let petals = '';
          for (let j = 0; j < 5; j++) {
            const pa = (j * 72) * Math.PI / 180;
            petals += `<circle cx="${f(Math.cos(pa) * 6)}" cy="${f(Math.sin(pa) * 6)}" r="5.2" fill="${cols[i]}" stroke="${line}" stroke-width="2"/>`;
          }
          out += at(fx, fy, i * 17, H.k, petals + `<circle r="3.6" fill="${cols[i] === '#FFD23F' ? '#FF8FB8' : '#FFD23F'}" stroke="${line}" stroke-width="1.6"/>`);
        }
        return out;
      }
      case 'tuft': {
        const col = c3 && a.b !== 'bird' && a.c3 && /fire|#FFD/.test(a.c3) ? c : c;
        return at(x, y + 4, 0, H.k, `<path d="M-12 6 Q-12 -10 -4 -16 Q-4 -6 0 2 Q0 -16 10 -20 Q6 -8 9 -2 Q14 -10 18 -10 Q16 0 12 6 Z" fill="${col}" ${s}/>`);
      }
      case 'flame':
        return flame(id, H.k * 0.95, x + 2, y + 6);
      case 'bigflame':
        return flame(id, H.k * 1.45, x + 2, y + 9);
      case 'drop':
        return at(x + 4, y + 4, 12, H.k, `<path d="M0 4 C-11 4 -13 -8 -7 -16 L0 -28 L7 -16 C13 -8 11 4 0 4 Z" fill="url(#${id}a)" ${s}/><ellipse cx="-4" cy="-9" rx="2.5" ry="4" fill="#fff" opacity=".8"/>`);
      case 'wave':
        return at(x, y + 6, 0, H.k * 1.1, `<path d="M-24 6 C-24 -14 -6 -28 12 -26 C2 -20 0 -10 8 -6 C14 -3 21 -8 23 -15 C28 -4 22 6 10 7 Z" fill="url(#${id}a)" ${s}/><path d="M-14 -4 C-12 -14 -4 -20 4 -21" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`);
      case 'wavecrown':
        return at(x, y + 8, 0, H.k * 1.0, `<path d="M-30 8 C-30 -12 -14 -30 6 -34 C-2 -26 -4 -16 4 -10 C10 -24 22 -30 32 -28 C24 -20 22 -10 28 -4 C32 4 26 10 16 9 Z" fill="url(#${id}a)" ${s}/><circle cx="-2" cy="-6" r="4" fill="#FFD23F" stroke="${line}" stroke-width="2"/>`);
      case 'bolt':
        return at(x + 2, y + 6, 8, H.k, `<path d="M-2 2 L-8 -16 L-1 -16 L-6 -34 L12 -10 L3 -10 L7 2 Z" fill="#FFE14D" stroke="#8A5A00" stroke-width="${OUT}" stroke-linejoin="round"/><path d="M-4 -20 L-1 -28" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`);
      case 'crystal': {
        const g = `url(#${id}a)`;
        const cs = `stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"`;
        return at(x, y + 8, 0, H.k,
          `<path d="M-14 6 L-22 -12 L-16 -26 L-8 -10 Z" fill="${g}" ${cs}/>` +
          `<path d="M14 6 L22 -12 L16 -26 L8 -10 Z" fill="${g}" ${cs}/>` +
          `<path d="M0 6 L-8 -20 L0 -44 L8 -20 Z" fill="${g}" ${cs}/>` +
          `<path d="M0 -40 L-3 -20 L0 2" stroke="#fff" stroke-width="2" fill="none" opacity=".75"/>`);
      }
      case 'mushroom': {
        const cap = `<path d="M-64 14 C-66 -38 -32 -60 0 -60 C32 -60 66 -38 64 14 C40 26 -40 26 -64 14 Z" fill="url(#${id}a)" ${s}/>`;
        const spots = [[-38, -20, 9], [-8, -40, 11], [26, -28, 8], [44, -6, 6], [-50, 2, 5], [8, -12, 6]]
          .map(([sx, sy, r]) => `<ellipse cx="${sx}" cy="${sy}" rx="${r}" ry="${r * 0.85}" fill="#fff" opacity=".95"/>`).join('');
        return at(x, y + 30, 0, H.k * (a.bw || 1), cap + spots + `<path d="M-46 -26 C-36 -42 -20 -50 -6 -52" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`);
      }
      case 'horns':
      case 'bighorns': {
        const k = a.top === 'bighorns' ? 1.35 : 1;
        const horn = `<path d="M-22 8 Q-32 -8 -28 -24 Q-18 -12 -12 4 Z" fill="${c3}" stroke="${line}" stroke-width="${OUT / k}" stroke-linejoin="round"/>`;
        return at(x, y + 10, 0, H.k * k, pair2(horn));
      }
      case 'crest':
        return at(x, y + 6, 0, H.k, `<path d="M-14 4 Q-22 -12 -14 -24 Q-8 -10 -4 0 Z M14 4 Q22 -12 14 -24 Q8 -10 4 0 Z" fill="${c3}" ${s}/><path d="M-6 4 Q-10 -18 0 -34 Q10 -18 6 4 Z" fill="${c3}" ${s}/>`);
      case 'cloud':
      case 'bigcloud': {
        const k = a.top === 'bigcloud' ? 1.35 : 1;
        let out = `<g stroke="${line}" stroke-width="${OUT / k}"><circle cx="-14" cy="-4" r="11" fill="#fff"/><circle cx="14" cy="-4" r="11" fill="#fff"/><circle cx="0" cy="-12" r="14" fill="#fff"/></g><circle cx="-14" cy="-4" r="9" fill="#fff"/><circle cx="14" cy="-4" r="9" fill="#fff"/><circle cx="0" cy="-12" r="12" fill="#fff"/>`;
        if (k > 1) out += `<path d="M18 -26 L20 -21 L25 -20 L21 -17 L22 -12 L18 -15 L14 -12 L15 -17 L11 -20 L16 -21 Z" fill="#FFD23F" stroke="${line}" stroke-width="1.6"/>`;
        return at(x, y + 8, 0, H.k * k, out);
      }
      case 'wool':
      case 'moonwool': {
        let out = `<g fill="${c}" stroke="${line}" stroke-width="${OUT}"><circle cx="-16" cy="-2" r="11"/><circle cx="16" cy="-2" r="11"/><circle cx="-6" cy="-12" r="12"/><circle cx="8" cy="-12" r="12"/></g><g fill="${c}"><circle cx="-16" cy="-2" r="9"/><circle cx="16" cy="-2" r="9"/><circle cx="-6" cy="-12" r="10"/><circle cx="8" cy="-12" r="10"/><rect x="-20" y="-6" width="40" height="12"/></g>`;
        if (a.top === 'moonwool') out += `<path d="M4 -40 A11 11 0 1 0 4 -18 A8.5 8.5 0 1 1 4 -40 Z" fill="${c3}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>`;
        return at(x, y + 10, 0, H.k, out);
      }
      case 'bud':
        return at(x, y + 4, 0, H.k,
          `<path d="M0 2 L0 -8" stroke="${line}" stroke-width="3.4"/>` +
          `<path d="M0 -6 C-14 -10 -14 -30 0 -42 C14 -30 14 -10 0 -6 Z" fill="url(#${id}a)" ${s}/>` +
          leaf('#5DBB4A', line, 'M0 -6 C-6 -8 -14 -6 -16 -14 C-8 -16 -3 -12 0 -6 Z') +
          leaf('#5DBB4A', line, 'M0 -6 C6 -8 14 -6 16 -14 C8 -16 3 -12 0 -6 Z') +
          `<path d="M-4 -30 C-6 -22 -4 -14 -2 -10" stroke="#fff" stroke-width="2.2" fill="none" opacity=".6" stroke-linecap="round"/>`);
      case 'appleleaf':
        return at(x, y + 6, 0, H.k, `<path d="M0 2 Q2 -10 -2 -18" stroke="#7A4A2A" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
          leaf(`url(#${id}a)`, line, 'M-1 -12 C6 -24 22 -26 26 -16 C18 -8 6 -8 -1 -12 Z'));
      case 'wisp':
        return flame(id, H.k * 0.8, x, y + 4, true);
      case 'lamp':
        return at(x, y + 6, 0, 1, `<ellipse cx="0" cy="-2" rx="22" ry="7" fill="#2E2357" stroke="${line}" stroke-width="${OUT}"/>`) + flame(id, H.k * 1.5, x, y - 2, true);
      case 'moonmark':
        return '';
      case 'drill':
        return at(x, y + 10, 0, H.k * 1.1,
          `<path d="M-18 6 L0 -42 L18 6 Z" fill="url(#${id}a)" ${s}/><path d="M-13 -6 L13 -12 M-9 -18 L9 -23 M-5 -30 L5 -33" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/><path d="M-6 -10 L-1 -34" stroke="#fff" stroke-width="2.2" opacity=".7" stroke-linecap="round"/>`);
      case 'pebble':
        return at(x + 6, y + 6, 0, H.k, `<path d="M-10 4 L-13 -6 L-4 -13 L8 -11 L12 -1 L6 5 Z" fill="${U.shade(c, -0.08)}" ${s}/>`);
      case 'rockspikes':
        return at(x, y + 8, 0, H.k, pair2(`<path d="M-26 6 L-22 -16 L-12 2 Z" fill="${c3}" ${s}/>`) + `<path d="M-8 6 L0 -24 L8 6 Z" fill="${c3}" ${s}/>`);
      case 'fin':
        return at(x - 4, y + 10, 0, H.k, `<path d="M-24 8 C-18 -16 4 -30 20 -26 C10 -16 12 -2 22 8 Z" fill="${c3}" ${s}/><path d="M-10 0 C-6 -10 2 -16 10 -18" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`);
      case 'bigfin':
        return at(x - 2, y + 12, 0, H.k, `<path d="M-20 10 C-12 -22 10 -46 28 -48 C18 -28 18 -6 26 10 Z" fill="${U.shade(c, -0.15)}" ${s}/><path d="M-6 0 C0 -18 10 -30 20 -36" stroke="#fff" stroke-width="2" fill="none" opacity=".45"/>`);
      case 'bubbles':
        return at(x, y + 2, 0, H.k,
          [[-16, -10, 7], [4, -22, 9], [20, -8, 5.5]].map(([bx, by, r]) =>
            `<circle cx="${bx}" cy="${by}" r="${r}" fill="${c2}" stroke="${line}" stroke-width="2.6"/><circle cx="${bx - r * 0.35}" cy="${by - r * 0.35}" r="${r * 0.28}" fill="#fff"/>`).join(''));
      case 'tree':
        return at(x, y + 6, 0, H.k,
          `<rect x="-4" y="-16" width="8" height="20" rx="3" fill="#8A5A35" stroke="${line}" stroke-width="3"/>` +
          `<g fill="#4FA83D" stroke="${line}" stroke-width="${OUT}"><circle cx="-14" cy="-22" r="12"/><circle cx="14" cy="-22" r="12"/><circle cx="0" cy="-34" r="15"/></g><g fill="#4FA83D"><circle cx="-14" cy="-22" r="10"/><circle cx="14" cy="-22" r="10"/><circle cx="0" cy="-34" r="13"/></g><circle cx="-5" cy="-40" r="4" fill="#fff" opacity=".35"/><circle cx="12" cy="-26" r="2.8" fill="#FF6B6B"/>`);
      case 'mane':
      case 'bigmane': {
        const k = a.top === 'bigmane' ? 1.2 : 0.95;
        return flame(id, H.k * k * 0.8, x - 16, y + 12) + flame(id, H.k * k * 0.8, x + 16, y + 12) + flame(id, H.k * k, x, y + 8);
      }
      default:
        return '';
    }
  }
  // 中線對稱（局部座標 x=0 為中線）
  const pair2 = (svg) => svg + `<g transform="scale(-1 1)">${svg}</g>`;

  // ───────── 部件：尾巴（畫在身體後面，往右邊長） ─────────
  function tail(a, T, P, id) {
    const { line, c, c2, c3 } = P;
    const s = `stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"`;
    const thick = (d, w, col) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w + OUT * 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    switch (a.tail) {
      case 'flame':
        return at(T.x, T.y, 0, T.k, thick('M-4 2 Q24 6 30 -22', 9, c) + flame(id, 0.95, 31, -26));
      case 'puff':
        return at(T.x - 4, T.y + 2, 0, T.k, `<circle cx="6" cy="0" r="12" fill="${c2}" ${s}/><circle cx="3" cy="-3" r="4" fill="#fff" opacity=".7"/>`);
      case 'otter':
        return at(T.x, T.y, 0, T.k, `<path d="M-6 -8 C18 -16 40 -12 48 -28 C54 -6 32 12 -4 10 Z" fill="url(#${id}g)" ${s}/>`);
      case 'thin':
        return at(T.x, T.y, 0, T.k, `<path d="M-4 0 C18 8 36 -4 30 -20 C26 -30 36 -36 44 -30" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/><path d="M-4 0 C18 8 36 -4 30 -20 C26 -30 36 -36 44 -30" fill="none" stroke="#FFB4C4" stroke-width="3.4" stroke-linecap="round"/>`);
      case 'bolt':
        return at(T.x, T.y, 0, T.k, `<path d="M-6 -2 L18 -12 L13 -22 L40 -38 L31 -20 L38 -18 L8 8 Z" fill="#FFE14D" stroke="#8A5A00" stroke-width="${OUT}" stroke-linejoin="round"/><path d="M-6 -2 L8 8 L3 1 Z" fill="#B57A1F"/>`);
      case 'leaf':
        return at(T.x, T.y, 0, T.k, thick('M-4 0 Q14 4 22 -8', 5, c) + `<g transform="translate(22 -8) rotate(-40)">${leaf(`url(#${id}a)`, line, 'M0 0 C6 -14 22 -18 30 -10 C22 0 8 4 0 0 Z')}<path d="M2 -1 L24 -10" stroke="#fff" stroke-width="1.8" opacity=".6"/></g>`);
      case 'curl':
        return at(T.x, T.y, 0, T.k, thick('M-4 0 C22 8 40 -10 34 -26 C30 -38 14 -36 16 -26 C18 -18 27 -20 27 -26', 6.5, c));
      case 'dragon':
      case 'dragonfish': {
        let out = `<path d="M-8 -12 C16 -10 38 -4 54 -20 C50 2 30 16 -6 12 Z" fill="url(#${id}g)" ${s}/>`;
        if (a.tail === 'dragon') out = pair0(`<path d="M14 -10 L18 -22 L24 -9 Z M30 -10 L37 -22 L40 -10 Z" fill="${c3}" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/>`) + out;
        else out += `<path d="M50 -18 C58 -34 72 -32 74 -24 C66 -22 62 -14 66 -2 C58 -4 52 -10 50 -18 Z" fill="${c3}" ${s}/>`;
        return at(T.x, T.y, 0, T.k, out);
      }
      case 'foxtail':
        return at(T.x, T.y, 0, T.k, foxtail(P, s));
      case 'foxtails':
        return at(T.x - 6, T.y + 2, 0, T.k * 0.95,
          `<g transform="rotate(-36)">${foxtail(P, s)}</g><g transform="rotate(-14)">${foxtail(P, s)}</g><g transform="rotate(10)">${foxtail(P, s)}</g>`);
      default:
        return '';
    }
  }
  const pair0 = (s) => s;
  const foxtail = (P, s) =>
    `<path d="M-6 -2 C6 -30 36 -52 56 -40 C68 -30 58 -10 44 -6 C30 -2 12 8 -6 8 Z" fill="${P.c}" ${s}/><path d="M42 -44 C56 -48 66 -36 60 -24 C54 -20 46 -24 42 -30 Z" fill="${P.c3 || '#fff'}" opacity=".9"/>`;

  // ───────── 部件：翅膀 ─────────
  function wings(a, W, P, id) {
    const { line, c, c3 } = P;
    const s = `stroke="${line}" stroke-width="${OUT}" stroke-linejoin="round"`;
    switch (a.wings) {
      case 'fairy':
        return pair(at(W.x - 16, W.y, 0, W.k,
          `<ellipse cx="-24" cy="-16" rx="26" ry="15" transform="rotate(-30 -24 -16)" fill="#fff" fill-opacity=".8" stroke="${c3 || line}" stroke-width="3"/>` +
          `<ellipse cx="-18" cy="10" rx="17" ry="10" transform="rotate(25 -18 10)" fill="#fff" fill-opacity=".8" stroke="${c3 || line}" stroke-width="3"/>` +
          `<ellipse cx="-28" cy="-20" rx="10" ry="4" transform="rotate(-30 -28 -20)" fill="#fff"/>`));
      case 'butterfly':
        return pair(at(W.x - 10, W.y - 6, 0, W.k,
          `<path d="M0 0 C-20 -50 -70 -58 -76 -26 C-78 -2 -42 8 0 4 Z" fill="url(#${id}w)" ${s}/>` +
          `<path d="M0 6 C-30 10 -58 30 -46 52 C-32 62 -8 42 0 12 Z" fill="url(#${id}w)" ${s}/>` +
          `<circle cx="-46" cy="-24" r="9" fill="#fff" opacity=".85"/><circle cx="-26" cy="-34" r="5" fill="#fff" opacity=".8"/><circle cx="-30" cy="32" r="6" fill="#fff" opacity=".8"/><circle cx="-46" cy="-24" r="4" fill="#FFD23F"/>`));
      case 'tiny':
        return pair(at(W.x - 22, W.y - 14, -10, W.k, `<path d="M0 6 L-22 -16 L-18 -4 L-30 -4 L-16 8 Z" fill="${c3}" ${s}/>`));
      case 'dragon':
      case 'bigdragon': {
        const k = a.wings === 'bigdragon' ? 1.3 : 1;
        return pair(at(W.x - 20, W.y - 10, 0, W.k * k,
          `<path d="M0 0 C-18 -22 -38 -42 -66 -48 C-58 -34 -62 -22 -70 -14 C-58 -12 -52 -4 -56 8 C-42 2 -24 6 -6 12 Z" fill="${U.shade(c, -0.12)}" stroke="${line}" stroke-width="${OUT / k}" stroke-linejoin="round"/>` +
          `<path d="M-6 6 C-24 -6 -40 -24 -62 -42 M-8 8 C-28 0 -46 -10 -64 -14" stroke="${line}" stroke-width="2" fill="none" opacity=".6"/>` +
          `<path d="M-4 4 C-20 -2 -34 -8 -52 2 C-40 -16 -28 -24 -12 -10 Z" fill="${P.c2}" opacity=".55"/>`));
      }
      default:
        return '';
    }
  }

  // ───────── 部件：眼睛 / 嘴巴 / 臉頰 ─────────
  function eye(type, x, y, k, P, side) {
    const pupil = P.pupil, iris = P.iris;
    const blink = `class="eye${type === 'happy' || type === 'sleepy' ? '' : ' blink'}"`;
    let g = '';
    switch (type) {
      case 'big':
      case 'star':
        g = `<ellipse cx="${x}" cy="${y}" rx="${9 * k}" ry="${11 * k}" fill="${pupil}"/>` +
          `<ellipse cx="${x}" cy="${y + 3.5 * k}" rx="${6.6 * k}" ry="${5.6 * k}" fill="${iris}" opacity=".95"/>` +
          (type === 'star'
            ? `<path transform="translate(${x - 3 * k} ${y - 4 * k}) scale(${k})" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#fff"/>`
            : `<circle cx="${x - 3.2 * k}" cy="${y - 4.2 * k}" r="${3.6 * k}" fill="#fff"/>`) +
          `<circle cx="${x + 3 * k}" cy="${y + 3.4 * k}" r="${1.7 * k}" fill="#fff" opacity=".9"/>`;
        break;
      case 'fierce': {
        const sx = side < 0 ? 1 : -1; // 內側往下
        g = `<ellipse cx="${x}" cy="${y}" rx="${7 * k}" ry="${8.8 * k}" fill="${pupil}"/>` +
          (iris ? `<ellipse cx="${x}" cy="${y + 3 * k}" rx="${5 * k}" ry="${4.2 * k}" fill="${iris}"/>` : '') +
          `<circle cx="${x - 2.3 * k}" cy="${y - 2.6 * k}" r="${2.6 * k}" fill="#fff"/>` +
          `<path d="M${x - 10 * k} ${y - 12 * k} L${x + 10 * k} ${y - 12 * k} L${x + 10 * k * sx} ${y - 4 * k} Z" fill="${P.skin}"/>` +
          `<path d="M${x - 9 * k * sx} ${y - 10.5 * k} L${x + 8 * k * sx} ${y - 5.5 * k}" stroke="${P.line}" stroke-width="${3 * k}" stroke-linecap="round"/>`;
        break;
      }
      case 'sleepy':
        g = `<path d="M${x - 7.5 * k} ${y} A${7.5 * k} ${6.5 * k} 0 0 0 ${x + 7.5 * k} ${y} Z" fill="${pupil}"/>` +
          `<circle cx="${x - 2 * k}" cy="${y + 2 * k}" r="${1.8 * k}" fill="#fff"/>` +
          `<path d="M${x - 9 * k} ${y - 0.5 * k} L${x + 9 * k} ${y - 0.5 * k}" stroke="${P.line}" stroke-width="${2.8 * k}" stroke-linecap="round"/>`;
        break;
      case 'happy':
        g = `<path d="M${x - 7 * k} ${y + 3 * k} Q${x} ${y - 8 * k} ${x + 7 * k} ${y + 3 * k}" fill="none" stroke="${pupil}" stroke-width="${3.6 * k}" stroke-linecap="round"/>`;
        break;
      case 'glow':
        g = `<ellipse cx="${x}" cy="${y}" rx="${11 * k}" ry="${13 * k}" fill="#FFE873" opacity=".35"/>` +
          `<ellipse cx="${x}" cy="${y}" rx="${7.5 * k}" ry="${9.5 * k}" fill="#FFE873" stroke="#E0A800" stroke-width="${2 * k}"/>` +
          `<ellipse cx="${x}" cy="${y + 1 * k}" rx="${3 * k}" ry="${5 * k}" fill="#7A4A00"/>` +
          `<circle cx="${x - 2.5 * k}" cy="${y - 3.5 * k}" r="${2.2 * k}" fill="#fff"/>`;
        break;
      default: // round
        g = `<ellipse cx="${x}" cy="${y}" rx="${6.6 * k}" ry="${8.6 * k}" fill="${pupil}"/>` +
          (P.irisRound ? `<ellipse cx="${x}" cy="${y + 3 * k}" rx="${4.6 * k}" ry="${4 * k}" fill="${iris}" opacity=".9"/>` : '') +
          `<circle cx="${x - 2.3 * k}" cy="${y - 3.2 * k}" r="${2.7 * k}" fill="#fff"/>` +
          `<circle cx="${x + 2.2 * k}" cy="${y + 3 * k}" r="${1.2 * k}" fill="#fff" opacity=".9"/>`;
    }
    return `<g ${blink}>${g}</g>`;
  }

  function face(a, F, P) {
    const k = F.k, dx = F.dx;
    let out = '';
    // 熊貓眼圈
    if (a.pattern === 'panda') {
      out += `<ellipse cx="${F.x - dx}" cy="${F.y + 1}" rx="${12 * k}" ry="${9.5 * k}" transform="rotate(-22 ${F.x - dx} ${F.y})" fill="${P.c3}"/>`;
      out += `<ellipse cx="${F.x + dx}" cy="${F.y + 1}" rx="${12 * k}" ry="${9.5 * k}" transform="rotate(22 ${F.x + dx} ${F.y})" fill="${P.c3}"/>`;
    }
    const eyeP = a.pattern === 'panda' ? Object.assign({}, P, { pupil: '#fff', skin: P.c3 }) : P;
    if (a.pattern === 'panda') {
      out += `<path d="M${F.x - dx - 7 * k} ${F.y} A${7 * k} ${6 * k} 0 0 0 ${F.x - dx + 7 * k} ${F.y}" fill="none" stroke="#fff" stroke-width="${2.8 * k}" stroke-linecap="round"/>`;
      out += `<path d="M${F.x + dx - 7 * k} ${F.y} A${7 * k} ${6 * k} 0 0 0 ${F.x + dx + 7 * k} ${F.y}" fill="none" stroke="#fff" stroke-width="${2.8 * k}" stroke-linecap="round"/>`;
    } else {
      out += eye(a.eyes || 'round', F.x - dx, F.y, k, eyeP, -1) + eye(a.eyes || 'round', F.x + dx, F.y, k, eyeP, 1);
    }
    // 臉頰
    if (a.cheek) {
      const cy = F.y + 11 * k, cx = dx + 12 * k;
      out += `<ellipse cx="${F.x - cx}" cy="${cy}" rx="${7 * k}" ry="${4.4 * k}" fill="${a.cheek}" opacity=".7"/>`;
      out += `<ellipse cx="${F.x + cx}" cy="${cy}" rx="${7 * k}" ry="${4.4 * k}" fill="${a.cheek}" opacity=".7"/>`;
    }
    // 鼻子
    if ((a.extra || []).includes('nose')) {
      out += `<ellipse cx="${F.x}" cy="${F.y + 8 * k}" rx="${8 * k}" ry="${6 * k}" fill="#FF8FA3" stroke="${P.line}" stroke-width="2.4"/><ellipse cx="${F.x - 2.5 * k}" cy="${F.y + 6 * k}" rx="${2.5 * k}" ry="${1.6 * k}" fill="#fff" opacity=".8"/>`;
    }
    // 鬍鬚
    if ((a.extra || []).includes('whiskers')) {
      const wx = dx + 16 * k, wy = F.y + 9 * k;
      out += pair(`<path d="M${F.x - wx} ${wy} l${-12 * k} ${-3 * k} M${F.x - wx} ${wy + 4 * k} l${-12 * k} ${2 * k}" stroke="${P.line}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`);
    }
    out += mouth(a.mouth || 'smile', F.x, F.y + (a.mouth === 'beak' ? 13 : 15) * k + ((a.extra || []).includes('nose') ? 6 : 0), k, P);
    return out;
  }

  function mouth(type, x, y, k, P) {
    const ln = P.pupil;
    const sw = `stroke="${ln}" stroke-width="${2.8 * k}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    switch (type) {
      case 'cat':
        return `<path d="M${x - 7 * k} ${y - 1} Q${x - 3.5 * k} ${y + 4 * k} ${x} ${y - 1} Q${x + 3.5 * k} ${y + 4 * k} ${x + 7 * k} ${y - 1}" ${sw}/>`;
      case 'open':
        return `<path d="M${x - 6.5 * k} ${y - 2 * k} Q${x} ${y - 0.5 * k} ${x + 6.5 * k} ${y - 2 * k} Q${x + 5 * k} ${y + 9 * k} ${x} ${y + 9 * k} Q${x - 5 * k} ${y + 9 * k} ${x - 6.5 * k} ${y - 2 * k} Z" fill="#7A2E3A" stroke="${ln}" stroke-width="${2.2 * k}" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y + 6 * k}" rx="${3.6 * k}" ry="${2.4 * k}" fill="#FF8FA3"/>`;
      case 'fang':
        return `<path d="M${x - 7 * k} ${y - 1} Q${x} ${y + 5 * k} ${x + 7 * k} ${y - 1}" ${sw}/><path d="M${x + 2.5 * k} ${y + 1.6 * k} L${x + 4.5 * k} ${y + 6 * k} L${x + 6 * k} ${y + 0.6 * k} Z" fill="#fff" stroke="${ln}" stroke-width="1.4" stroke-linejoin="round"/>`;
      case 'buck':
        return `<path d="M${x - 6 * k} ${y - 1} Q${x} ${y + 4 * k} ${x + 6 * k} ${y - 1}" ${sw}/><rect x="${x - 3.6 * k}" y="${y + 1.4 * k}" width="${7.2 * k}" height="${5.6 * k}" rx="1.4" fill="#fff" stroke="${ln}" stroke-width="1.6"/><path d="M${x} ${y + 1.6 * k} L${x} ${y + 6.8 * k}" stroke="${ln}" stroke-width="1.2"/>`;
      case 'beak':
        return `<path d="M${x - 8 * k} ${y - 3 * k} L${x + 8 * k} ${y - 3 * k} L${x} ${y + 7 * k} Z" fill="${P.c3}" stroke="${P.line}" stroke-width="${2.6 * k}" stroke-linejoin="round"/><path d="M${x - 8 * k} ${y - 3 * k} L${x + 8 * k} ${y - 3 * k}" stroke="${P.line}" stroke-width="1.4"/>`;
      case 'shark':
        return `<path d="M${x - 13 * k} ${y - 3 * k} Q${x} ${y + 9 * k} ${x + 13 * k} ${y - 3 * k} Z" fill="#fff" stroke="${ln}" stroke-width="${2.4 * k}" stroke-linejoin="round"/><path d="M${x - 9 * k} ${y - 1 * k} l${3 * k} ${4 * k} l${3 * k} ${-3.5 * k} l${3 * k} ${4.5 * k} l${3 * k} ${-4.5 * k} l${3 * k} ${3.5 * k}" ${sw} stroke-width="1.6"/>`;
      case 'o':
        return `<ellipse cx="${x}" cy="${y + 1}" rx="${4.4 * k}" ry="${5 * k}" fill="#7A2E3A" stroke="${ln}" stroke-width="${2.2 * k}"/>`;
      default: // smile
        return `<path d="M${x - 6 * k} ${y - 1} Q${x} ${y + 5 * k} ${x + 6 * k} ${y - 1}" ${sw}/>`;
    }
  }

  // ───────── 主體模板 ─────────
  // 每個模板回傳：頭 H、臉 F、尾巴錨點 T、翅膀錨點 W 與各層 SVG
  function blobPath(cx, top, bottom, hw, flat = 0.9) {
    const mid = top + (bottom - top) * 0.55;
    return `M${cx} ${top} C${cx + hw * 0.72} ${top} ${cx + hw} ${top + (mid - top) * 0.45} ${cx + hw} ${mid} C${cx + hw} ${bottom - 4} ${cx + hw * 0.62} ${bottom} ${cx} ${bottom} C${cx - hw * 0.62} ${bottom} ${cx - hw} ${bottom - 4} ${cx - hw} ${mid} C${cx - hw} ${top + (mid - top) * 0.45} ${cx - hw * 0.72} ${top} ${cx} ${top} Z`;
  }

  function build(a, P, id) {
    const bw = a.bw || 1;
    const s = `stroke="${P.line}" stroke-width="${OUT}" stroke-linejoin="round"`;
    const body = `fill="url(#${id}g)" ${s}`;
    const ex = a.extra || [];
    const L = { back: '', body: '', head: '', front: '' };
    let H, F, T, W;

    if (a.b === 'chibi' || a.b === 'quad') {
      const quad = a.b === 'quad';
      H = { x: 100, y: quad ? 86 : 84, rx: quad ? 43 : 46, ry: quad ? 39 : 41, k: 1 };
      F = { x: 100, y: H.y + 5, k: 1, dx: 18.5 };
      T = { x: 100 + (quad ? 44 : 26) * bw, y: quad ? 134 : 150, k: 1 };
      W = { x: 100, y: 128, k: 1 };
      const bx = 100, by = quad ? 142 : 141, brx = (quad ? 48 : 30) * bw, bry = quad ? 27 : 27;
      if (quad) {
        L.back += `<g fill="url(#${id}g)" ${s}><ellipse cx="${100 - 40 * bw}" cy="160" rx="12" ry="14"/><ellipse cx="${100 + 40 * bw}" cy="160" rx="12" ry="14"/></g>`;
        if (ex.includes('shell')) {
          L.back += `<ellipse cx="100" cy="124" rx="${64 * bw}" ry="46" fill="url(#${id}s)" ${s}/>` +
            `<path d="M${100 - 40 * bw} 110 L${100 - 16 * bw} 96 L${100 + 16 * bw} 96 L${100 + 40 * bw} 110 M${100 - 52 * bw} 134 L${100 - 40 * bw} 110 M${100 + 52 * bw} 134 L${100 + 40 * bw} 110" stroke="${U.shade(P.c3, -0.35)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
        }
        L.body += `<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" ${body}/>`;
        L.body += `<ellipse cx="${bx}" cy="${by + 5}" rx="${brx * 0.56}" ry="${bry * 0.6}" fill="${P.c2}" opacity=".9"/>`;
        L.body += `<g fill="url(#${id}g)" ${s}><rect x="${100 - 22 * bw - 10}" y="150" width="21" height="24" rx="9"/><rect x="${100 + 22 * bw - 11}" y="150" width="21" height="24" rx="9"/></g>`;
        L.body += `<g fill="${U.shade(P.c, -0.12)}"><rect x="${100 - 22 * bw - 7}" y="168" width="15" height="4" rx="2"/><rect x="${100 + 22 * bw - 8}" y="168" width="15" height="4" rx="2"/></g>`;
      } else {
        // 腳
        L.body += `<g fill="url(#${id}g)" ${s}><ellipse cx="${100 - 16 * bw}" cy="166" rx="13" ry="9"/><ellipse cx="${100 + 16 * bw}" cy="166" rx="13" ry="9"/></g>`;
        L.body += `<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" ${body}/>`;
        L.body += `<ellipse cx="${bx}" cy="${by + 5}" rx="${brx * 0.64}" ry="${bry * 0.66}" fill="${P.c2}" opacity=".95"/>`;
        // 手
        const armX = 100 - brx + 2;
        if (ex.includes('gloves')) {
          const gc = a.glove || '#FF4D5E';
          L.front += pair(`<circle cx="${armX - 2}" cy="140" r="13.5" fill="${gc}" ${s}/><rect x="${armX - 9}" y="148" width="14" height="7" rx="3" fill="#fff" stroke="${P.line}" stroke-width="2.6"/><ellipse cx="${armX - 6}" cy="135" rx="4" ry="3" fill="#fff" opacity=".6"/>`);
        } else if (ex.includes('bamboo')) {
          L.front += `<g transform="rotate(-28 ${armX + 2 * brx - 6} 140)"><rect x="${armX + 2 * brx - 10}" y="104" width="10" height="62" rx="4" fill="#7BCB5A" ${s}/><path d="M${armX + 2 * brx - 10} 122 h10 M${armX + 2 * brx - 10} 142 h10" stroke="${P.line}" stroke-width="2.4"/><path d="M${armX + 2 * brx} 112 C${armX + 2 * brx + 14} 104 ${armX + 2 * brx + 22} 108 ${armX + 2 * brx + 24} 116 C${armX + 2 * brx + 14} 118 ${armX + 2 * brx + 6} 116 ${armX + 2 * brx} 112 Z" fill="#5DBB4A" stroke="${P.line}" stroke-width="2.4"/></g>`;
          L.front += pair(`<ellipse cx="${armX}" cy="140" rx="10" ry="12.5" transform="rotate(25 ${armX} 140)" fill="${P.c3 && a.pattern === 'panda' ? P.c3 : `url(#${id}g)`}" ${s}/>`);
        } else {
          const armFill = a.pattern === 'panda' ? P.c3 : `url(#${id}g)`;
          L.front += pair(`<ellipse cx="${armX}" cy="140" rx="9.5" ry="12.5" transform="rotate(25 ${armX} 140)" fill="${armFill}" ${s}/>` +
            (ex.includes('claws') ? `<path d="M${armX - 7} 149 l-3 6 M${armX - 2} 151 l-1 6 M${armX + 3} 151 l1 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M${armX - 7} 149 l-3 6 M${armX - 2} 151 l-1 6 M${armX + 3} 151 l1 6" stroke="${P.line}" stroke-width="1" stroke-linecap="round" opacity=".5"/>` : ''));
        }
        if (ex.includes('belt')) L.body += `<rect x="${100 - brx + 3}" y="146" width="${2 * brx - 6}" height="8" rx="4" fill="#3B3355" stroke="${P.line}" stroke-width="2"/><rect x="94" y="144" width="12" height="12" rx="2.5" fill="#FFD23F" stroke="${P.line}" stroke-width="2"/>`;
        if (ex.includes('armor')) L.body += `<path d="M80 126 L120 126 L116 154 Q100 162 84 154 Z" fill="url(#${id}m)" ${s}/>`;
      }
      if (ex.includes('rockarmor')) L.front += pair(`<path d="M${100 - 36 * bw} 132 L${100 - 46 * bw} 118 L${100 - 32 * bw} 108 L${100 - 20 * bw} 116 L${100 - 22 * bw} 130 Z" fill="${P.c3}" ${s}/>`);
      if (ex.includes('cape')) L.back += `<path d="M66 112 L134 112 L152 174 Q100 186 48 174 Z" fill="${a.cape || P.c3}" ${s}/>`;
      if (ex.includes('scarf')) {
        const sc = a.scarf || P.c3;
        L.head = `<path d="M${100 - 34} 118 Q100 134 ${100 + 34} 118 L${100 + 35} 128 Q100 146 ${100 - 35} 128 Z" fill="${sc}" ${s}/><path d="M118 128 L130 154 L119 156 L110 132 Z" fill="${sc}" ${s}/>` + L.head;
      }
      // 頭
      if (ex.includes('petalring')) {
        let pet = '';
        for (let i = 0; i < 14; i++) {
          const ang = i * (360 / 14);
          pet += `<ellipse cx="0" cy="${-H.ry - 10}" rx="9" ry="16" transform="rotate(${ang})" fill="url(#${id}a)" stroke="${P.line}" stroke-width="3"/>`;
        }
        L.head += at(H.x, H.y, 0, 1, pet);
      }
      if (ex.includes('spikes')) L.head += pair(at(H.x - H.rx * 0.6, H.y - H.ry * 0.7, -40, 1, `<path d="M-10 8 L0 -20 L10 8 Z" fill="${P.c3}" ${s}/>`) + at(H.x - H.rx * 0.95, H.y - H.ry * 0.15, -75, 1, `<path d="M-8 8 L0 -16 L8 8 Z" fill="${P.c3}" ${s}/>`));
      if (ex.includes('curlhorns')) L.head += pair(`<path d="M${H.x - H.rx * 0.78} ${H.y - 18} C${H.x - H.rx - 20} ${H.y - 26} ${H.x - H.rx - 22} ${H.y + 6} ${H.x - H.rx - 4} ${H.y + 4} C${H.x - H.rx + 6} ${H.y + 2} ${H.x - H.rx + 4} ${H.y - 8} ${H.x - H.rx - 4} ${H.y - 6}" fill="none" stroke="${P.line}" stroke-width="12" stroke-linecap="round"/><path d="M${H.x - H.rx * 0.78} ${H.y - 18} C${H.x - H.rx - 20} ${H.y - 26} ${H.x - H.rx - 22} ${H.y + 6} ${H.x - H.rx - 4} ${H.y + 4} C${H.x - H.rx + 6} ${H.y + 2} ${H.x - H.rx + 4} ${H.y - 8} ${H.x - H.rx - 4} ${H.y - 6}" fill="none" stroke="#FFE7A8" stroke-width="6" stroke-linecap="round"/>`);
      L.head += ears(a, H, P);
      L.head += `<ellipse cx="${H.x}" cy="${H.y}" rx="${H.rx}" ry="${H.ry}" ${body}/>`;
      // 下巴的淺色
      if (a.c2 && a.pattern !== 'panda' && a.top !== 'mushroom') L.head += `<ellipse cx="${H.x}" cy="${H.y + H.ry * 0.42}" rx="${H.rx * 0.62}" ry="${H.ry * 0.42}" fill="${P.c2}" opacity=".55"/>`;
    } else if (a.b === 'bird') {
      const r = 54;
      H = { x: 100, y: 112, rx: r * bw, ry: r - 2, k: 1 };
      F = { x: 100, y: 102, k: 1, dx: 19 };
      T = { x: 100, y: 160, k: 1 };
      W = { x: 100, y: 120, k: 1 };
      L.back += `<g fill="url(#${id}g)" ${s}><path d="M84 150 L70 182 L90 168 Z"/><path d="M116 150 L130 182 L110 168 Z"/><path d="M96 154 L100 186 L104 154 Z"/></g>`;
      L.body += `<g stroke="${U.shade(P.c3, -0.3)}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M88 160 v12 M88 172 l-6 4 M88 172 l6 4"/><path d="M112 160 v12 M112 172 l-6 4 M112 172 l6 4"/></g>`;
      L.head += ears(a, H, P);
      L.head += `<ellipse cx="${H.x}" cy="${H.y}" rx="${H.rx}" ry="${H.ry}" ${body}/>`;
      L.head += `<ellipse cx="100" cy="134" rx="${32 * bw}" ry="26" fill="${P.c2}" opacity=".95"/>`;
      L.head += `<path d="M110 132 q4 4 8 0 M92 140 q4 4 8 0 M102 148 q4 4 8 0" stroke="${U.shade(P.c2, -0.25)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      L.front += pair(`<path d="M${100 - H.rx + 8} 104 Q${100 - H.rx - 22} 118 ${100 - H.rx - 12} 148 Q${100 - H.rx + 4} 140 ${100 - H.rx + 14} 130 Z" fill="${U.shade(P.c, -0.1)}" ${s}/>`);
      if (ex.includes('armor')) L.front += `<path d="M82 120 L118 120 L114 146 Q100 154 86 146 Z" fill="url(#${id}m)" ${s}/>`;
    } else if (a.b === 'fish') {
      H = { x: 100, y: 114, rx: 60 * bw, ry: 50, k: 1 };
      F = { x: 100, y: 108, k: 1, dx: 21 };
      T = { x: 132, y: 92, k: 1 };
      W = { x: 100, y: 120, k: 1 };
      L.back += `<path d="M138 120 C154 96 176 92 184 100 C174 112 174 128 184 142 C170 148 152 140 138 128 Z" fill="${P.c3}" ${s}/>`;
      L.head += `<ellipse cx="${H.x}" cy="${H.y}" rx="${H.rx}" ry="${H.ry}" ${body}/>`;
      L.head += `<ellipse cx="100" cy="138" rx="${40 * bw}" ry="22" fill="${P.c2}" opacity=".9"/>`;
      L.front += pair(`<path d="M${100 - H.rx + 10} 128 Q${100 - H.rx - 14} 132 ${100 - H.rx - 10} 152 Q${100 - H.rx + 6} 146 ${100 - H.rx + 18} 138 Z" fill="${P.c3}" ${s}/>`);
      L.head += `<path d="M64 96 q6 -6 12 0 M124 96 q6 -6 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>`;
    } else if (a.b === 'jelly') {
      H = { x: 100, y: 100, rx: 54 * bw, ry: 46, k: 1 };
      F = { x: 100, y: 102, k: 1, dx: 19 };
      T = { x: 140, y: 150, k: 1 };
      W = { x: 100, y: 112, k: 1 };
      let ten = '';
      [-36, -18, 0, 18, 36].forEach((dx, i) => {
        const d = `M${100 + dx} 128 q${i % 2 ? 8 : -8} 14 0 26 q${i % 2 ? -8 : 8} 10 ${i % 2 ? 4 : -4} 20`;
        ten += `<path d="${d}" fill="none" stroke="${P.line}" stroke-width="${8 + OUT * 2 - 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${P.c3}" stroke-width="7" stroke-linecap="round"/>`;
      });
      L.back += ten;
      L.head += `<path d="M${100 - H.rx} 128 C${100 - H.rx} 76 ${100 - H.rx * 0.6} 54 100 54 C${100 + H.rx * 0.6} 54 ${100 + H.rx} 76 ${100 + H.rx} 128 Q${100 + H.rx} 136 ${100 + H.rx - 10} 136 L${100 - H.rx + 10} 136 Q${100 - H.rx} 136 ${100 - H.rx} 128 Z" ${body} fill-opacity=".95"/>`;
      L.head += `<path d="M${100 - H.rx + 8} 128 Q100 138 ${100 + H.rx - 8} 128" stroke="${P.c2}" stroke-width="4" fill="none" opacity=".8"/>`;
      H.y = 96; H.ry = 42;
    } else if (a.b === 'ghost') {
      const w = 56 * bw;
      H = { x: 100, y: 96, rx: w, ry: 44, k: 1 };
      F = { x: 100, y: 100, k: 1, dx: 19 };
      T = { x: 140, y: 140, k: 1 };
      W = { x: 100, y: 112, k: 1 };
      L.head += `<path d="M100 52 C${100 + w * 0.76} 52 ${100 + w} 82 ${100 + w} 110 L${100 + w} 146 Q${100 + w - 10} 166 ${100 + w * 0.58} 150 Q${100 + w * 0.36} 170 ${100 + w * 0.18} 152 Q100 172 ${100 - w * 0.18} 152 Q${100 - w * 0.36} 170 ${100 - w * 0.58} 150 Q${100 - w + 10} 166 ${100 - w} 146 L${100 - w} 110 C${100 - w} 82 ${100 - w * 0.76} 52 100 52 Z" ${body}/>`;
      L.front += pair(`<ellipse cx="${100 - w - 2}" cy="118" rx="9" ry="12" transform="rotate(-30 ${100 - w - 2} 118)" fill="url(#${id}g)" ${s}/>`);
      H.y = 92;
    } else if (a.b === 'rock') {
      H = { x: 100, y: 118, rx: 54, ry: 50, k: 1 };
      F = { x: 100, y: 118, k: 1, dx: 19 };
      T = { x: 146, y: 150, k: 1 };
      W = { x: 100, y: 120, k: 1 };
      L.head += `<path d="M54 152 L46 112 L64 80 L100 66 L136 76 L156 108 L150 152 L122 172 L78 172 Z" ${body}/>`;
      L.head += `<path d="M64 92 L74 100 M138 92 L130 104 L136 112" stroke="${P.line}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>`;
      L.head += `<path d="M70 84 L96 74" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`;
      H.y = 116; H.ry = 50;
    } else if (a.b === 'crab') {
      H = { x: 100, y: 128, rx: 54 * bw, ry: 38, k: 1 };
      F = { x: 100, y: 128, k: 1, dx: 18 };
      T = { x: 150, y: 150, k: 1 };
      W = { x: 100, y: 130, k: 1 };
      // 腳
      L.back += pair(`<g stroke="${P.line}" stroke-width="${OUT}" fill="url(#${id}g)"><path d="M62 150 L44 168 L52 172 L70 156 Z"/><path d="M72 158 L62 178 L70 180 L80 162 Z"/></g>`);
      // 眼柄
      L.back += pair(`<path d="M86 104 L80 78" stroke="${P.line}" stroke-width="10" stroke-linecap="round"/><path d="M86 104 L80 78" stroke="${P.c}" stroke-width="4.5" stroke-linecap="round"/>`);
      L.head += `<ellipse cx="100" cy="${H.y}" rx="${H.rx}" ry="${H.ry}" ${body}/>`;
      L.head += `<ellipse cx="100" cy="${H.y + 14}" rx="${H.rx * 0.6}" ry="${H.ry * 0.45}" fill="${P.c2}" opacity=".8"/>`;
      if (ex.includes('armor')) L.head += `<path d="M66 110 Q100 92 134 110 L130 120 Q100 106 70 120 Z" fill="url(#${id}m)" ${s}/>`;
      // 大鉗子
      const claw = `<g transform="translate(${100 - H.rx - 6} 112) rotate(-20)"><path d="M0 18 C-22 18 -28 -6 -18 -20 C-10 -30 6 -28 10 -16 L-2 -10 L12 -4 C14 8 10 18 0 18 Z" fill="url(#${id}g)" ${s}/><ellipse cx="-12" cy="-12" rx="4" ry="3" fill="#fff" opacity=".6"/></g>`;
      L.front += pair(claw);
      // 眼睛在眼柄上
      F = { x: 100, y: 76, k: 0.9, dx: 21, stalk: true };
      L.head += pair(`<circle cx="79" cy="76" r="13" fill="${P.c2}" ${s}/>`);
      H.y = 118;
    } else if (a.b === 'apple') {
      H = { x: 100, y: 116, rx: 58, ry: 52, k: 1 };
      F = { x: 100, y: 116, k: 1, dx: 20 };
      T = { x: 146, y: 150, k: 0.9 };
      W = { x: 100, y: 120, k: 1 };
      L.body += `<g fill="url(#${id}g)" ${s}><ellipse cx="80" cy="168" rx="12" ry="7"/><ellipse cx="120" cy="168" rx="12" ry="7"/></g>`;
      L.head += `<path d="M100 72 C112 60 154 58 160 102 C166 144 136 172 100 168 C64 172 34 144 40 102 C46 58 88 60 100 72 Z" ${body}/>`;
      L.head += `<ellipse cx="100" cy="146" rx="30" ry="16" fill="${P.c2}" opacity=".9"/>`;
      L.head += `<path d="M58 92 C62 80 72 74 82 72" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`;
      H.y = 118; H.ry = 50;
    } else {
      // blob
      const top = 68, bottom = 170, hw = 60 * bw;
      H = { x: 100, y: 120, rx: hw, ry: 52, k: 1 };
      F = { x: 100, y: 116, k: 1, dx: 20 };
      T = { x: 100 + hw - 8, y: 146, k: 1 };
      W = { x: 100, y: 116, k: 1 };
      const bp = blobPath(100, top, bottom, hw);
      L.body += `<g fill="url(#${id}g)" ${s}><ellipse cx="${100 - 22 * bw}" cy="169" rx="12" ry="7"/><ellipse cx="${100 + 22 * bw}" cy="169" rx="12" ry="7"/></g>`;
      if (ex.includes('sideleaves')) L.back += pair(`<path d="M${100 - hw + 6} 130 C${100 - hw - 18} 120 ${100 - hw - 30} 132 ${100 - hw - 32} 144 C${100 - hw - 16} 148 ${100 - hw - 4} 142 ${100 - hw + 8} 138 Z" fill="url(#${id}l)" ${s}/>`);
      L.head += ears(a, { x: 100, y: 118, rx: hw, ry: 50, k: 1 }, P);
      L.head += `<path d="${bp}" ${body}/>`;
      if (a.pattern === 'stripes') {
        L.head += `<clipPath id="${id}clip"><path d="${bp}"/></clipPath><g clip-path="url(#${id}clip)" fill="${P.c2}" opacity=".9"><rect x="30" y="134" width="140" height="9"/><rect x="30" y="152" width="140" height="9"/></g><path d="${bp}" fill="none" ${s}/>`;
      } else if (a.c2) {
        L.head += `<ellipse cx="100" cy="146" rx="${hw * 0.52}" ry="20" fill="${P.c2}" opacity=".85"/>`;
      }
      if (ex.includes('drips')) L.head += pair(`<path d="M${100 - hw * 0.6} 160 q-2 10 3 12 q5 -2 3 -12 Z" fill="${U.shade(P.c, -0.05)}" stroke="${P.line}" stroke-width="2.4"/>`);
      if (!ex.includes('sideleaves')) L.front += pair(`<ellipse cx="${100 - hw + 4}" cy="134" rx="8" ry="11" transform="rotate(30 ${100 - hw + 4} 134)" fill="url(#${id}g)" ${s}/>`);
      H = { x: 100, y: 118, rx: hw, ry: 50, k: 1 };
      if (a.top === 'mushroom') F = { x: 100, y: 124, k: 1, dx: 20 };
    }
    // 光澤
    L.gloss = `<ellipse cx="${H.x - H.rx * 0.42}" cy="${H.y - H.ry * 0.52}" rx="${H.rx * 0.24}" ry="${H.ry * 0.13}" transform="rotate(-28 ${H.x - H.rx * 0.42} ${H.y - H.ry * 0.52})" fill="#fff" opacity=".5"/>`;
    return { L, H, F, T, W };
  }

  // ───────── 萌獸 SVG ─────────
  A.mon = function (key, opts = {}) {
    const sp = G.SPECIES[key];
    if (!sp) return '';
    const a = sp.art;
    const id = 'm' + ++uidc;
    const c = a.c, c2 = a.c2 || U.shade(c, 0.6), c3 = a.c3 || U.shade(c, -0.2);
    const line = a.line || U.shade(c, -0.62);
    const P = {
      c, c2, c3, line,
      pupil: '#2A2140',
      iris: a.iris || U.shade(c, -0.25),
      irisRound: !!a.iris,
      skin: c,
      inner: a.earIn || U.mix(c, '#FFB8C8', 0.5),
      tip: a.b === 'chibi' && (a.ears === 'leafbunny') ? U.shade(c, -0.3) : (a.ears === 'antenna' ? (a.c3 || '#FF8A5B') : (a.ears === 'fin' ? c3 : (a.earTip || U.shade(c, -0.25)))),
      fill: a.earC || `url(#${id}g)`,
    };
    P.fill = a.earC || `url(#${id}g)`;
    const S = a.s || 1;
    const { L, H, F, T, W } = build(a, P, id);
    const ex = a.extra || [];

    let parts = '';
    parts += wings(a, W, P, id);
    parts += tail(a, T, P, id);
    parts += L.back + L.body + L.head + L.front;
    if (a.pattern === 'spots') parts += `<g fill="${c2}" opacity=".8"><circle cx="70" cy="70" r="6"/><circle cx="128" cy="78" r="5"/></g>`;
    parts += L.gloss;
    parts += topper(a, H, P, id);
    if (a.top === 'moonmark') parts += `<path transform="translate(${H.x + 3} ${H.y - H.ry * 0.62})" d="M3 -9 A9 9 0 1 0 3 9 A7 7 0 1 1 3 -9 Z" fill="${c3}" stroke="${line}" stroke-width="2"/>`;
    if (ex.includes('headband')) {
      const by = H.y - H.ry * 0.52, bc = a.band || '#FF4D5E';
      parts += `<path d="M${H.x - H.rx * 0.86} ${by + 4} Q${H.x} ${by - 10} ${H.x + H.rx * 0.86} ${by + 4}" fill="none" stroke="${line}" stroke-width="13" stroke-linecap="round"/><path d="M${H.x - H.rx * 0.86} ${by + 4} Q${H.x} ${by - 10} ${H.x + H.rx * 0.86} ${by + 4}" fill="none" stroke="${bc}" stroke-width="7" stroke-linecap="round"/><path d="M${H.x + H.rx * 0.84} ${by + 4} l16 -10 l2 10 Z M${H.x + H.rx * 0.84} ${by + 4} l18 6 l-8 6 Z" fill="${bc}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>`;
    }
    if (ex.includes('horn')) parts += `<path transform="translate(${H.x} ${H.y - H.ry + 10})" d="M-6 2 L0 -28 L6 2 Z" fill="#FFE07A" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>`;
    if (ex.includes('gem')) parts += `<path transform="translate(${H.x} ${H.y - H.ry * 0.5})" d="M0 -7 L6 0 L0 7 L-6 0 Z" fill="#FF7AB8" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="${H.x - 1.5}" cy="${H.y - H.ry * 0.5 - 2}" r="1.6" fill="#fff"/>`;
    parts += face(a, F, P);
    if (ex.includes('crown')) {
      const cy = a.top === 'mushroom' ? H.y - H.ry - 30 : H.y - H.ry + 2;
      parts += at(H.x, cy, 0, 1, `<path d="M-15 4 L-17 -12 L-7 -4 L0 -17 L7 -4 L17 -12 L15 4 Z" fill="#FFD23F" stroke="${line}" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-2" r="3" fill="#FF5D8F"/>`);
    }
    if (ex.includes('sparkles')) parts += [[40, 70, 1], [160, 84, 0.8], [150, 54, 0.6]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#FFF3A0" stroke="#E8A800" stroke-width="1.2"/>`).join('');

    const flame = `<linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF4D2E"/><stop offset=".55" stop-color="#FF9A2E"/><stop offset="1" stop-color="#FFE14D"/></linearGradient>` +
      `<linearGradient id="${id}fp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6A3CF5"/><stop offset=".6" stop-color="#A87BFF"/><stop offset="1" stop-color="#E7D6FF"/></linearGradient>`;
    const defs = `<defs>
      <radialGradient id="${id}g" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="${U.shade(c, 0.42)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${U.shade(c, -0.16)}"/></radialGradient>
      <radialGradient id="${id}a" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${U.shade(c3, 0.4)}"/><stop offset=".6" stop-color="${c3}"/><stop offset="1" stop-color="${U.shade(c3, -0.18)}"/></radialGradient>
      <radialGradient id="${id}s" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="${U.shade(c3, 0.3)}"/><stop offset="1" stop-color="${U.shade(c3, -0.15)}"/></radialGradient>
      <radialGradient id="${id}l" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#9BE07A"/><stop offset="1" stop-color="#4FAE3F"/></radialGradient>
      <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF2FA"/><stop offset="1" stop-color="#A9B4CC"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3E0"/><stop offset=".35" stop-color="#FFE38A"/><stop offset=".7" stop-color="#9FE6C8"/><stop offset="1" stop-color="#A9B8FF"/></linearGradient>
      ${flame}
    </defs>`;
    const floaty = a.b === 'ghost' || a.b === 'jelly';
    const shadow = `<ellipse cx="100" cy="184" rx="${(floaty ? 34 : 50) * (a.bw || 1)}" ry="${floaty ? 6 : 8}" fill="#1b1530" opacity="${floaty ? 0.12 : 0.18}"/>`;
    const tr = `translate(100 182) scale(${S}) translate(-100 -182)`;
    const cls = 'mon-svg' + (floaty ? ' floaty' : '') + (opts.cls ? ' ' + opts.cls : '');
    const delay = (Math.random() * 4).toFixed(2);
    return `<svg class="${cls}" viewBox="-15 -30 230 230" style="--blink-delay:${delay}s" aria-label="${sp.name}" role="img">${defs}${shadow}<g class="mon-body" transform="${tr}">${parts}</g></svg>`;
  };

  // ───────── 萌萌球 ─────────
  A.ball = function (kind = 'ball1', size = 28) {
    const col = { ball1: ['#FF7AA8', '#D94F82'], ball2: ['#5BB4FF', '#2F7FD1'], ball3: ['#B27BFF', '#7A4FD8'] }[kind] || ['#FF7AA8', '#D94F82'];
    const rainbow = kind === 'ball3';
    const id = 'b' + ++uidc;
    return `<svg class="ball-svg" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">
      <defs><linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF7AA8"/><stop offset=".33" stop-color="#FFD23F"/><stop offset=".66" stop-color="#5DD6A0"/><stop offset="1" stop-color="#7A9CFF"/></linearGradient></defs>
      <circle cx="20" cy="20" r="17" fill="#fff" stroke="#23305E" stroke-width="2.6"/>
      <path d="M3 20 A17 17 0 0 1 37 20 Z" fill="${rainbow ? `url(#${id}r)` : col[0]}" stroke="#23305E" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M3 20 H37" stroke="#23305E" stroke-width="3"/>
      <circle cx="20" cy="20" r="5.5" fill="#fff" stroke="#23305E" stroke-width="2.6"/>
      ${kind === 'ball2' ? '<path d="M20 8 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4z" fill="#FFE14D" stroke="#23305E" stroke-width=".9"/>' : ''}
      ${kind === 'ball1' ? '<path d="M20 15.5 c-1.2 -2 -4.2 -1 -3.4 1.4 .5 1.4 3.4 3.2 3.4 3.2 s2.9 -1.8 3.4 -3.2 c.8 -2.4 -2.2 -3.4 -3.4 -1.4z" fill="#fff" opacity=".9" transform="translate(0 -6)"/>' : ''}
      <ellipse cx="13" cy="11" rx="4" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-30 13 11)"/>
    </svg>`;
  };

  // ───────── 人物頭像 ─────────
  A.person = function (look = {}) {
    const skin = look.skin || '#FFE0C7';
    const hc = look.hc || '#5B3A29';
    const out = look.outfit || '#4FA3F7';
    const ln = '#3A2A3E';
    const s = `stroke="${ln}" stroke-width="3" stroke-linejoin="round"`;
    let back = '', front = '';
    switch (look.hair) {
      case 'long':
        back = `<path d="M24 56 C20 20 100 20 96 56 L100 104 Q60 112 20 104 Z" fill="${hc}" ${s}/>`;
        front = `<path d="M26 54 C26 26 94 26 94 54 C80 40 60 46 44 38 C40 46 34 50 26 54 Z" fill="${hc}" ${s}/>`;
        break;
      case 'pony':
        back = `<path d="M84 34 C110 30 112 70 98 86 C100 64 92 50 84 46 Z" fill="${hc}" ${s}/>`;
        front = `<path d="M26 54 C24 24 96 22 94 54 C84 38 64 36 50 42 C44 44 36 48 26 54 Z" fill="${hc}" ${s}/><circle cx="86" cy="36" r="5" fill="${look.acc || '#FF5D8F'}" ${s}/>`;
        break;
      case 'bun':
        back = `<circle cx="60" cy="16" r="13" fill="${hc}" ${s}/>`;
        front = `<path d="M26 54 C24 24 96 22 94 54 C82 42 70 36 60 36 C50 36 38 42 26 54 Z" fill="${hc}" ${s}/>`;
        break;
      case 'spiky':
        front = `<path d="M24 56 L22 34 L34 38 L36 18 L48 30 L58 12 L66 28 L80 16 L82 34 L96 30 L96 56 C84 40 36 40 24 56 Z" fill="${hc}" ${s}/>`;
        break;
      case 'cap':
        front = `<path d="M26 50 C26 22 94 22 94 50 Z" fill="${look.acc || '#FF5D5D'}" ${s}/><path d="M60 46 L104 46 Q106 54 96 54 L60 54 Z" fill="${look.acc || '#FF5D5D'}" ${s}/><circle cx="60" cy="30" r="5" fill="#fff" ${s}/>`;
        break;
      case 'old':
        front = `<path d="M24 50 C22 40 30 34 36 38 C40 30 50 28 56 32 M96 50 C98 40 90 34 84 38" fill="none" stroke="#E8E8EE" stroke-width="9" stroke-linecap="round"/>`;
        break;
      default: // short
        front = `<path d="M26 54 C22 22 98 22 94 54 C88 42 74 38 62 40 C50 36 34 44 26 54 Z" fill="${hc}" ${s}/>`;
    }
    const glasses = look.glasses ? `<g fill="#fff" fill-opacity=".35" stroke="${ln}" stroke-width="2.6"><circle cx="46" cy="62" r="9"/><circle cx="74" cy="62" r="9"/></g><path d="M55 62 h10" stroke="${ln}" stroke-width="2.6"/>` : '';
    const beard = look.beard ? `<path d="M40 76 Q60 104 80 76 Q70 88 60 86 Q50 88 40 76Z" fill="#E8E8EE" ${s}/>` : '';
    return `<svg viewBox="0 0 120 130" class="person-svg" aria-hidden="true">
      ${back}
      <path d="M14 130 C14 104 34 94 60 94 C86 94 106 104 106 130 Z" fill="${out}" ${s}/>
      <path d="M48 94 L60 108 L72 94" fill="#fff" ${s}/>
      ${look.coat ? `<path d="M14 130 C14 104 34 94 50 94 L54 130 Z M106 130 C106 104 86 94 70 94 L66 130 Z" fill="#fff" ${s}/>` : ''}
      <circle cx="60" cy="60" r="34" fill="${skin}" ${s}/>
      <ellipse cx="46" cy="64" rx="3.6" ry="4.6" fill="${ln}"/><ellipse cx="74" cy="64" rx="3.6" ry="4.6" fill="${ln}"/>
      <circle cx="44.8" cy="62.4" r="1.3" fill="#fff"/><circle cx="72.8" cy="62.4" r="1.3" fill="#fff"/>
      <ellipse cx="38" cy="74" rx="5" ry="3" fill="#FF9BB5" opacity=".7"/><ellipse cx="82" cy="74" rx="5" ry="3" fill="#FF9BB5" opacity=".7"/>
      <path d="M53 77 Q60 ${look.frown ? 73 : 83} 67 77" fill="none" stroke="${ln}" stroke-width="2.8" stroke-linecap="round"/>
      ${beard}${front}${glasses}
    </svg>`;
  };

  // ───────── 對戰場景 ─────────
  A.SCENES = {
    meadow: { sky: ['#8FD3FF', '#E8F8FF'], far: '#A7DD86', near: '#86CC62', ground: '#B3E58A', deco: 'flowers', sun: true },
    forest: { sky: ['#9FE6CF', '#EDFFF6'], far: '#5EB86A', near: '#4AA35A', ground: '#9ED97A', deco: 'trees', sun: true },
    beach: { sky: ['#7FCBFF', '#DFF4FF'], far: '#4AB0EA', near: '#2F96D8', ground: '#FFE4A8', deco: 'sea', sun: true },
    volcano: { sky: ['#FFB08A', '#FFE7CF'], far: '#9A5A48', near: '#7A4436', ground: '#E3AC80', deco: 'volcano', sun: false },
    city: { sky: ['#9AD2FF', '#F0F8FF'], far: '#B8C7E8', near: '#9FB2DA', ground: '#E8DCC8', deco: 'city', sun: true },
    candy: { sky: ['#FFC4E3', '#FFF2FA'], far: '#FFB3D6', near: '#9FE3D0', ground: '#FFE0EF', deco: 'candy', sun: true },
    mountain: { sky: ['#BFE0FF', '#F4FAFF'], far: '#A99B8A', near: '#8D7E6C', ground: '#D9C7A0', deco: 'mountain', sun: true },
    night: { sky: ['#2D2A66', '#6A5BB0'], far: '#40398A', near: '#2F2A6B', ground: '#5D55A8', deco: 'night', sun: false },
    dragon: { sky: ['#B9A4FF', '#FFE2F1'], far: '#8E7BD6', near: '#6F5CC0', ground: '#C7B8F2', deco: 'peaks', sun: false },
    arena: { sky: ['#4B5DB8', '#9DB0FF'], far: '#3A4796', near: '#2C3778', ground: '#E8EEF8', deco: 'arena', sun: false },
    champion: { sky: ['#3A2A7A', '#E0A6FF'], far: '#4A3796', near: '#38287A', ground: '#FFF1D0', deco: 'arena', sun: false, gold: true },
  };

  A.scene = function (theme, accent) {
    const T = A.SCENES[theme] || A.SCENES.meadow;
    const id = 's' + ++uidc;
    let deco = '';
    const cloud = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="34" ry="16"/><ellipse cx="-22" cy="6" rx="22" ry="12"/><ellipse cx="24" cy="6" rx="24" ry="12"/><ellipse cx="4" cy="-10" rx="20" ry="14"/></g>`;
    const hills = (y, col, amp, seed) => {
      let d = `M0 ${y}`;
      for (let x = 0; x <= 800; x += 100) d += ` Q${x + 50} ${y - amp * (((x / 100 + seed) % 3) + 1) / 2} ${x + 100} ${y}`;
      return `<path d="${d} L800 450 L0 450 Z" fill="${col}"/>`;
    };
    let mid = '';
    switch (T.deco) {
      case 'flowers':
        mid = hills(250, T.far, 60, 0) + hills(285, T.near, 40, 1);
        for (let i = 0; i < 26; i++) {
          const x = (i * 97) % 800, y = 320 + ((i * 53) % 120);
          deco += `<circle cx="${x}" cy="${y}" r="4" fill="${['#FF8FB8', '#FFE14D', '#fff'][i % 3]}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#FFB347"/>`;
        }
        break;
      case 'trees':
        mid = hills(240, T.far, 50, 2);
        for (let i = 0; i < 12; i++) {
          const x = i * 72 + 10, y = 250 + (i % 3) * 10;
          mid += `<rect x="${x - 5}" y="${y}" width="10" height="34" fill="#7A5236"/><circle cx="${x}" cy="${y - 10}" r="${26 + (i % 3) * 6}" fill="${i % 2 ? '#3F9A52' : '#52AE5E'}"/><circle cx="${x - 8}" cy="${y - 20}" r="8" fill="#fff" opacity=".15"/>`;
        }
        mid += hills(300, T.near, 24, 0);
        break;
      case 'sea':
        mid = `<rect x="0" y="230" width="800" height="90" fill="${T.far}"/><rect x="0" y="230" width="800" height="14" fill="#9FDCFF" opacity=".6"/>`;
        for (let i = 0; i < 10; i++) mid += `<path d="M${i * 90} ${260 + (i % 3) * 16} q12 -8 24 0 q12 8 24 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`;
        mid += `<path d="M0 312 Q200 296 400 310 T800 304 L800 450 L0 450 Z" fill="${T.ground}"/>`;
        mid += `<g transform="translate(700 210)"><path d="M0 110 Q6 60 0 0" stroke="#9A6A3A" stroke-width="10" fill="none"/><path d="M0 0 Q-40 -10 -60 20 Q-30 0 0 0 Q-20 -40 -50 -40 Q-14 -24 0 0 Q30 -40 60 -30 Q20 -20 0 0 Q40 -4 56 30 Q30 4 0 0" fill="#4FB05A"/></g>`;
        break;
      case 'volcano':
        mid = `<path d="M260 260 L360 110 Q400 96 440 110 L540 260 Z" fill="${T.far}"/><path d="M360 110 Q400 96 440 110 L420 140 Q400 126 380 140 Z" fill="#FF6A3D"/><path d="M392 120 Q380 170 360 210 M410 124 Q420 180 440 220" stroke="#FF8A3D" stroke-width="7" fill="none" stroke-linecap="round"/>`;
        mid += `<g fill="#B8A8A0" opacity=".7"><circle cx="400" cy="80" r="22"/><circle cx="426" cy="58" r="18"/><circle cx="410" cy="34" r="14"/></g>`;
        mid += hills(270, T.near, 30, 1);
        break;
      case 'city':
        for (let i = 0; i < 11; i++) {
          const w = 50 + (i % 3) * 14, h = 80 + ((i * 37) % 90), x = i * 74;
          mid += `<rect x="${x}" y="${270 - h}" width="${w}" height="${h}" rx="6" fill="${['#C9D6F2', '#B8C8EC', '#D7E1F7'][i % 3]}"/>`;
          for (let r = 0; r < 3; r++) mid += `<rect x="${x + 10}" y="${270 - h + 14 + r * 22}" width="${w - 20}" height="8" rx="3" fill="#fff" opacity=".7"/>`;
        }
        mid += hills(280, T.near, 10, 0);
        break;
      case 'candy':
        mid = hills(250, T.far, 70, 0) + hills(290, T.near, 40, 2);
        for (let i = 0; i < 6; i++) {
          const x = 60 + i * 140, y = 240 + (i % 2) * 20;
          mid += `<rect x="${x - 3}" y="${y}" width="6" height="60" fill="#fff"/><circle cx="${x}" cy="${y}" r="22" fill="${['#FF8FC0', '#8FD6FF', '#FFE14D'][i % 3]}"/><path d="M${x} ${y} m-14 0 a14 14 0 1 1 28 0 a10 10 0 1 1 -20 0 a6 6 0 1 1 12 0" stroke="#fff" stroke-width="3.5" fill="none"/>`;
        }
        break;
      case 'mountain':
        mid = `<path d="M-20 270 L120 120 L220 230 L340 90 L470 240 L600 110 L760 260 L820 270 Z" fill="${T.far}"/><path d="M120 120 L96 146 L120 140 L140 150 Z M340 90 L312 122 L340 114 L366 124 Z M600 110 L574 140 L600 132 L626 142 Z" fill="#fff"/>`;
        mid += hills(285, T.near, 26, 0);
        break;
      case 'night':
        mid = hills(255, T.far, 60, 1) + hills(290, T.near, 34, 0);
        for (let i = 0; i < 40; i++) deco += `<circle cx="${(i * 131) % 800}" cy="${(i * 47) % 200}" r="${(i % 3) + 1}" fill="#fff" opacity="${0.4 + (i % 3) * 0.2}"/>`;
        deco += `<circle cx="640" cy="70" r="34" fill="#FFF3B0"/><circle cx="626" cy="60" r="34" fill="${T.sky[0]}"/>`;
        break;
      case 'peaks':
        mid = `<path d="M40 280 L120 90 L200 280 Z M560 280 L660 60 L760 280 Z" fill="${T.far}"/><path d="M300 280 L380 150 L460 280 Z" fill="${T.near}"/>`;
        mid += `<g fill="${T.near}"><ellipse cx="240" cy="120" rx="40" ry="12"/><ellipse cx="520" cy="150" rx="30" ry="10"/></g>`;
        mid += hills(290, T.near, 20, 0);
        break;
      case 'arena': {
        const acc = accent || (T.gold ? '#FFD23F' : '#FF5D8F');
        mid = `<rect x="0" y="120" width="800" height="170" fill="${T.far}"/>`;
        for (let r = 0; r < 4; r++) for (let i = 0; i < 40; i++) mid += `<circle cx="${i * 20 + (r % 2) * 10 + 5}" cy="${140 + r * 30}" r="6" fill="${['#FF8FB8', '#8FD6FF', '#FFE14D', '#B9F28A', '#fff'][(i + r * 3) % 5]}" opacity=".55"/>`;
        mid += `<rect x="0" y="262" width="800" height="28" fill="${acc}"/><rect x="0" y="262" width="800" height="6" fill="#fff" opacity=".5"/>`;
        deco += `<g opacity=".5"><path d="M60 0 L140 120 L0 120 Z" fill="#fff" opacity=".25"/><path d="M740 0 L800 120 L660 120 Z" fill="#fff" opacity=".25"/></g>`;
        deco += `<ellipse cx="400" cy="380" rx="230" ry="50" fill="none" stroke="${acc}" stroke-width="6" opacity=".55"/><path d="M400 290 V450" stroke="${acc}" stroke-width="5" opacity=".4"/>`;
        break;
      }
    }
    const sun = T.sun ? `<circle cx="680" cy="70" r="36" fill="#FFE98A"/><circle cx="680" cy="70" r="52" fill="#FFE98A" opacity=".35"/>` : '';
    const clouds = T.deco === 'night' || T.deco === 'arena' ? '' : cloud(140, 70, 1) + cloud(470, 50, 0.8) + cloud(300, 120, 0.6);
    return `<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" class="scene-svg" aria-hidden="true">
      <defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.sky[0]}"/><stop offset="1" stop-color="${T.sky[1]}"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#${id}sky)"/>${sun}${clouds}${mid}
      <rect x="0" y="${T.deco === 'sea' ? 312 : 290}" width="800" height="200" fill="${T.ground}"/>
      <rect x="0" y="${T.deco === 'sea' ? 312 : 290}" width="800" height="10" fill="#fff" opacity=".18"/>
      ${deco}
    </svg>`;
  };

  // 屬性徽章
  A.typeBadge = (t, small) => {
    const ti = G.TYPE_INFO[t];
    return `<span class="tbadge${small ? ' sm' : ''}" style="--tc:${ti.color}"><i>${ti.icon}</i>${ti.name}</span>`;
  };
})();
