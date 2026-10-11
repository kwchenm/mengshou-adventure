// 音效與背景音樂（全部用 WebAudio 即時合成，旋律為原創）
(function () {
  const S = (G.Sound = { ctx: null, master: null, sfxOn: true, musicOn: true, cur: null, timer: null });
  const NOTE = (n) => {
    if (!n || n === '-') return 0;
    const m = /^([A-G])(#?)(\d)$/.exec(n);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    const midi = (+m[3] + 1) * 12 + base;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  S.init = () => {
    if (S.ctx) { if (S.ctx.state === 'suspended') S.ctx.resume(); return; }
    const want = S.want;
    try {
      S.ctx = new (window.AudioContext || window.webkitAudioContext)();
      S.master = S.ctx.createGain();
      S.master.gain.value = 0.5;
      S.master.connect(S.ctx.destination);
    } catch (e) { S.ctx = null; }
    if (want) S.music(want);
  };

  const tone = (freq, t0, dur, type = 'square', vol = 0.12, slideTo = 0, dest) => {
    const c = S.ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g).connect(dest || S.master);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  };
  const noise = (t0, dur, vol = 0.2, hp = 800) => {
    const c = S.ctx;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    src.buffer = buf;
    g.gain.value = vol;
    src.connect(f).connect(g).connect(S.master);
    src.start(t0);
  };

  S.sfx = (name) => {
    if (!S.sfxOn || !S.ctx) return;
    const t = S.ctx.currentTime;
    switch (name) {
      case 'click': tone(880, t, 0.06, 'square', 0.06); break;
      case 'select': tone(660, t, 0.06, 'square', 0.07); tone(990, t + 0.06, 0.08, 'square', 0.07); break;
      case 'back': tone(520, t, 0.07, 'square', 0.06); tone(390, t + 0.06, 0.08, 'square', 0.06); break;
      case 'hit': noise(t, 0.16, 0.25, 600); tone(180, t, 0.12, 'square', 0.1, 90); break;
      case 'super': noise(t, 0.22, 0.32, 400); tone(300, t, 0.1, 'square', 0.12, 600); tone(600, t + 0.1, 0.14, 'square', 0.1, 900); break;
      case 'weak': noise(t, 0.1, 0.15, 1500); tone(220, t, 0.12, 'triangle', 0.08, 160); break;
      case 'miss': tone(500, t, 0.15, 'sine', 0.08, 200); break;
      case 'faint': tone(520, t, 0.5, 'square', 0.08, 90); break;
      case 'heal': [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.12, 'triangle', 0.09)); break;
      case 'up': [440, 554, 659].forEach((f, i) => tone(f, t + i * 0.06, 0.1, 'square', 0.06)); break;
      case 'down': [659, 554, 440].forEach((f, i) => tone(f, t + i * 0.06, 0.1, 'square', 0.06)); break;
      case 'status': tone(300, t, 0.25, 'sawtooth', 0.05, 150); break;
      case 'levelup': ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach((n, i) => tone(NOTE(n), t + i * 0.09, 0.14, 'square', 0.08)); break;
      case 'throw': tone(400, t, 0.3, 'sine', 0.08, 900); break;
      case 'shake': tone(200, t, 0.08, 'square', 0.08); tone(160, t + 0.09, 0.08, 'square', 0.07); break;
      case 'catch': ['G5', 'C6', 'E6', 'G6'].forEach((n, i) => tone(NOTE(n), t + i * 0.1, 0.2, 'square', 0.08)); break;
      case 'send': tone(300, t, 0.18, 'sine', 0.1, 900); noise(t + 0.1, 0.1, 0.12, 2000); break;
      case 'dmax': for (let i = 0; i < 8; i++) tone(200 + i * 80, t + i * 0.06, 0.2, 'sawtooth', 0.05); break;
      case 'win': ['C5', 'C5', 'C5', 'G5', '-', 'E5', 'G5', 'C6'].forEach((n, i) => n !== '-' && tone(NOTE(n), t + i * 0.12, 0.2, 'square', 0.08)); break;
      case 'buy': tone(1200, t, 0.06, 'square', 0.06); tone(1600, t + 0.07, 0.12, 'square', 0.06); break;
      case 'pet': tone(880, t, 0.1, 'sine', 0.1, 1320); break;
      case 'evo': for (let i = 0; i < 12; i++) tone(400 + i * 60, t + i * 0.08, 0.12, 'triangle', 0.06); break;
    }
  };

  // ── 背景音樂：簡單的步進音序器 ──
  const SONGS = {
    title: { bpm: 112, mel: 'E5 - G5 - C6 - B5 A5 G5 - E5 - D5 E5 F5 - E5 - C5 - D5 - E5 G5 A5 - G5 - E5 D5 C5 - D5 - - -', bass: 'C3 G3 A2 E3 F2 C3 G2 G3' },
    map: { bpm: 120, mel: 'C5 E5 G5 E5 F5 A5 G5 - E5 G5 C6 B5 A5 G5 E5 - D5 F5 A5 F5 E5 G5 C6 - B5 A5 G5 F5 E5 D5 C5 -', bass: 'C3 F3 C3 G2 D3 C3 F2 G2' },
    battle: { bpm: 156, mel: 'A4 C5 E5 A5 G5 E5 C5 E5 F5 E5 D5 C5 B4 C5 D5 E5 A4 C5 E5 A5 B5 A5 G5 E5 F5 G5 A5 G5 E5 D5 C5 B4', bass: 'A2 A2 E2 E2 F2 F2 G2 G2' },
    gym: { bpm: 164, mel: 'D5 F5 A5 D6 C6 A5 F5 A5 G5 F5 E5 D5 E5 F5 G5 A5 D5 F5 A5 D6 E6 D6 C6 A5 A#5 A5 G5 F5 E5 C5 D5 -', bass: 'D2 D2 A2 A2 A#2 A#2 C3 A2' },
  };
  S.music = (name) => {
    S.want = name;
    if (S.cur === name) return;
    S.stopMusic();
    if (!S.musicOn || !S.ctx || !SONGS[name]) return;
    S.cur = name;
    const song = SONGS[name];
    const mel = song.mel.split(' '), bass = song.bass.split(' ');
    const step = 60 / song.bpm / 2;
    let i = 0, next = S.ctx.currentTime + 0.1;
    const bus = S.ctx.createGain();
    bus.gain.value = 0.32;
    bus.connect(S.master);
    S.bus = bus;
    const tick = () => {
      if (!S.ctx) return;
      while (next < S.ctx.currentTime + 0.25) {
        const n = mel[i % mel.length];
        if (n !== '-') tone(NOTE(n), next, step * 0.9, 'square', 0.05, 0, bus);
        if (i % 4 === 0) tone(NOTE(bass[Math.floor(i / 4) % bass.length]), next, step * 3.6, 'triangle', 0.12, 0, bus);
        if (name === 'battle' || name === 'gym') if (i % 2 === 1) tone(NOTE(bass[Math.floor(i / 4) % bass.length]) * 2, next, step * 0.5, 'triangle', 0.05, 0, bus);
        next += step;
        i++;
      }
    };
    tick();
    S.timer = setInterval(tick, 100);
  };
  S.stopMusic = () => {
    if (S.timer) clearInterval(S.timer);
    S.timer = null;
    if (S.bus) {
      try { S.bus.gain.setTargetAtTime(0, S.ctx.currentTime, 0.05); } catch (e) {}
      const b = S.bus;
      setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 400);
      S.bus = null;
    }
    S.cur = null;
  };
  S.setMusic = (on) => {
    S.musicOn = on;
    if (!on) S.stopMusic();
    else if (S.want) S.music(S.want);
  };
})();
