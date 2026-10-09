/**
 * SFC『ゼルダの伝説 神々のトライフォース』風 Web Audio API シンセサイザーエンジン
 * 外部音声ファイル不要（CORS完全フリー）で、8-bit/16-bit風の効果音・ジングル・BGMをリアルタイム合成
 *
 * - マスター音量 / ミュート（localStorage に保存）
 * - 先読みスケジューラによる正確なテンポの多声 BGM（メロディ＋ベース＋アルペジオ）
 * - ジングル再生中は BGM を自動的に絞る（ダッキング）
 */

// ---------- 音名ヘルパー ----------
const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function noteToFreq(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) return 0;
  let semi = NOTE_INDEX[m[1]];
  if (m[2] === '#') semi += 1;
  if (m[2] === 'b') semi -= 1;
  const midi = (parseInt(m[3], 10) + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** "C5:2 -:1 E5:1" 形式の譜面をパース（数値は 8 分音符単位） */
function parseTrack(str) {
  return str.trim().split(/\s+/).map(tok => {
    const [n, d] = tok.split(':');
    return { f: n === '-' ? 0 : noteToFreq(n), d: parseFloat(d || '1') };
  });
}

/** コード進行をアルペジオ譜面に展開 */
function arpeggio(chords, pattern = [0, 1, 2, 1, 0, 1, 2, 1]) {
  return chords.map(ch => pattern.map(i => `${ch[i]}:1`).join(' ')).join(' ');
}

// ---------- BGM 定義（すべてオリジナル曲） ----------
const SONGS = {
  title: {
    bpm: 84,
    tracks: [
      { wave: 'triangle', vol: 0.11, notes: 'G4:4 C5:4 B4:2 A4:2 G4:4 E4:4 F4:2 G4:2 D4:8 G4:4 C5:4 D5:2 E5:2 F5:4 E5:2 D5:2 B4:2 G4:2 C5:8' },
      { wave: 'sine', vol: 0.06, notes: arpeggio([
        ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'],
        ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']
      ]) },
      { wave: 'triangle', vol: 0.09, notes: 'C3:8 A2:8 F2:8 G2:8 C3:8 F2:8 G2:8 C3:8' }
    ]
  },
  field: {
    bpm: 132,
    tracks: [
      { wave: 'square', vol: 0.045, notes: 'C5:2 G4:2 C5:1 D5:1 E5:2 F5:2 E5:1 D5:1 E5:4 D5:2 B4:2 G4:1 A4:1 B4:2 C5:6 -:2 E5:2 E5:1 F5:1 G5:4 A5:2 G5:1 F5:1 E5:4 F5:2 D5:2 B4:1 C5:1 D5:2 C5:8' },
      { wave: 'triangle', vol: 0.05, notes: arpeggio([
        ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4'],
        ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']
      ]) },
      { wave: 'triangle', vol: 0.11, notes: 'C3:4 G2:4 F2:4 C3:4 G2:4 D3:4 C3:4 G2:4 C3:4 E3:4 F2:4 A2:4 G2:4 G2:4 C3:8' }
    ]
  },
  dark: {
    bpm: 100,
    tracks: [
      { wave: 'square', vol: 0.04, notes: 'D5:3 A4:1 F4:2 G4:2 A4:4 -:2 C5:2 Bb4:3 A4:1 G4:2 F4:2 E4:6 -:2 D5:3 A4:1 F4:2 G4:2 A4:2 C5:2 D5:4 E5:2 D5:2 C5:2 Bb4:2 A4:8' },
      { wave: 'sine', vol: 0.05, notes: arpeggio([
        ['D4', 'F4', 'A4'], ['F4', 'A4', 'C5'], ['Bb3', 'D4', 'F4'], ['A3', 'C#4', 'E4'],
        ['D4', 'F4', 'A4'], ['F4', 'A4', 'C5'], ['G3', 'Bb3', 'D4'], ['A3', 'C#4', 'E4']
      ]) },
      { wave: 'triangle', vol: 0.11, notes: 'D3:8 F2:8 Bb2:8 A2:8 D3:8 F2:8 G2:8 A2:8' }
    ]
  },
  dungeon: {
    bpm: 112,
    tracks: [
      { wave: 'triangle', vol: 0.09, notes: 'A4:2 -:1 C5:1 B4:2 G#4:2 A4:4 -:4 E4:2 -:1 G4:1 F#4:2 D#4:2 E4:4 -:4 A4:2 -:1 C5:1 D5:2 C5:2 B4:4 -:4 G#4:2 F4:2 E4:2 D4:2 E4:8' },
      { wave: 'triangle', vol: 0.1, notes: 'A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 F2:2 F2:2 F2:2 F2:2 F2:2 F2:2 F2:2 F2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 E2:2' }
    ]
  },
  boss: {
    bpm: 152,
    tracks: [
      { wave: 'square', vol: 0.045, notes: 'E5:1 E5:1 -:1 E5:1 D5:1 E5:1 -:1 G5:1 F#5:2 E5:2 D5:2 B4:2 C5:1 C5:1 -:1 C5:1 B4:1 C5:1 -:1 E5:1 D#5:4 B4:4 E5:1 E5:1 -:1 E5:1 D5:1 E5:1 -:1 G5:1 A5:2 G5:2 F#5:2 E5:2 F5:2 E5:2 D#5:2 C5:2 B4:8' },
      { wave: 'triangle', vol: 0.12, notes: [
        'E2', 'D2', 'C2', 'B1', 'E2', 'A1', 'F2', 'B1'
      ].map(r => {
        const up = r.replace(/(\d)$/, (d) => String(parseInt(d, 10) + 1));
        return `${r}:1 ${up}:1 ${r}:1 ${up}:1 ${r}:1 ${up}:1 ${r}:1 ${up}:1`;
      }).join(' ') }
    ]
  }
};
SONGS.ending = { ...SONGS.title, bpm: 96 };

// 各トラックをパースし、ループ長を揃える
Object.values(SONGS).forEach(song => {
  song.parsed = song.tracks.map(t => ({ ...t, seq: parseTrack(t.notes) }));
  const lengths = song.parsed.map(t => t.seq.reduce((s, n) => s + n.d, 0));
  const loop = Math.max(...lengths);
  song.parsed.forEach((t, i) => {
    if (lengths[i] < loop) t.seq.push({ f: 0, d: loop - lengths[i] });
  });
});

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.bgmBus = null;
    this.isMuted = false;
    this.currentSong = null;
    this.schedulerId = null;
    this.trackStates = [];

    try {
      this.isMuted = localStorage.getItem('legend_of_reni_muted') === '1';
    } catch (e) { /* noop */ }
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      // 全体を少しだけ丸める LPF（矩形波の耳障りな高域を抑える）
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 6500;

      this.master = this.ctx.createGain();
      this.master.gain.value = this.isMuted ? 0 : 0.9;
      this.sfxBus = this.ctx.createGain();
      this.bgmBus = this.ctx.createGain();
      this.bgmBus.gain.value = 1;

      this.sfxBus.connect(this.master);
      this.bgmBus.connect(this.master);
      this.master.connect(lpf);
      lpf.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser.');
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ---------- ミュート ----------
  setMuted(muted) {
    this.isMuted = muted;
    try { localStorage.setItem('legend_of_reni_muted', muted ? '1' : '0'); } catch (e) { /* noop */ }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.03);
    }
    window.dispatchEvent(new CustomEvent('reni:mute', { detail: muted }));
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // ---------- 基本発音 ----------
  playTone(freq, type, duration, volume = 0.2, when = 0, bus = null) {
    if (!this.ctx) this.init();
    if (!this.ctx || freq <= 0) return;

    const t = Math.max(this.ctx.currentTime, when || this.ctx.currentTime);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(bus || this.sfxBus);

    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  /** 周波数スライド付きの音（レーザー・ワープ等） */
  playSweep(from, to, type, duration, volume = 0.2) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // ホワイトノイズ生成（爆発音・風切り音用）
  playNoise(duration = 0.2, volume = 0.25, isLowPass = true) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    if (isLowPass) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
    } else {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1500;
      noise.connect(filter);
      filter.connect(gain);
    }

    gain.connect(this.sfxBus);
    noise.start();
  }

  /** 音符列をまとめて予約再生（ジングル用） */
  playSequence(notes, type = 'triangle', unit = 0.12, volume = 0.25) {
    if (!this.ctx) this.init();
    if (!this.ctx) return 0;
    let t = this.ctx.currentTime + 0.02;
    notes.forEach(([name, beats]) => {
      const f = typeof name === 'number' ? name : noteToFreq(name);
      if (f > 0) this.playTone(f, type, beats * unit * 1.1, volume, t);
      t += beats * unit;
    });
    return t - this.ctx.currentTime;
  }

  /** BGM を一時的に小さくする */
  duck(seconds = 1.5, level = 0.15) {
    if (!this.ctx || !this.bgmBus) return;
    const g = this.bgmBus.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(level, t, 0.03);
    g.setTargetAtTime(1, t + seconds, 0.25);
  }

  // ================= 効果音 (SE) =================

  // 剣攻撃
  playSlash() {
    this.playNoise(0.07, 0.18, false);
    this.playSweep(900, 350, 'triangle', 0.09, 0.18);
  }

  // 回転斬りチャージ音（ピロピロピロ…）
  playSpinCharge(pitchStep = 0) {
    const baseFreq = 520 + (pitchStep % 6) * 70;
    this.playTone(baseFreq, 'square', 0.05, 0.06);
  }

  // チャージ完了音
  playChargeReady() {
    this.playTone(1320, 'square', 0.06, 0.08);
    setTimeout(() => this.playTone(1760, 'square', 0.1, 0.08), 50);
  }

  // 回転斬り解放音（疾風の旋回）
  playSpinRelease() {
    this.playNoise(0.3, 0.3, false);
    this.playSweep(400, 1400, 'triangle', 0.25, 0.22);
  }

  // 盾ガード音（カンッ！）
  playShieldBlock() {
    this.playTone(1500, 'square', 0.04, 0.16);
    setTimeout(() => this.playTone(1100, 'triangle', 0.08, 0.16), 20);
  }

  // 草刈り音（サクッ）
  playGrassCut() {
    this.playNoise(0.12, 0.22, false);
    this.playTone(260, 'triangle', 0.06, 0.12);
  }

  // アグニム魔法弾打ち返し音（ピキーーン！）
  playReflect() {
    this.playTone(1800, 'sine', 0.15, 0.25);
    setTimeout(() => this.playTone(2400, 'triangle', 0.2, 0.2), 30);
    setTimeout(() => this.playTone(3200, 'sine', 0.25, 0.15), 60);
  }

  // ファイアボール
  playFireball() {
    this.playNoise(0.25, 0.18, true);
    this.playSweep(500, 120, 'sawtooth', 0.25, 0.12);
  }

  // 弓矢
  playArrow() {
    this.playSweep(1400, 500, 'sine', 0.1, 0.16);
  }

  // 敵の投擲（オクタロックの岩）
  playEnemyShoot() {
    this.playSweep(300, 160, 'square', 0.08, 0.08);
  }

  // 被弾（プレイヤー）
  playHurt() {
    this.playSweep(420, 110, 'square', 0.22, 0.16);
  }

  // 敵へのヒット
  playEnemyHit() {
    this.playTone(220, 'square', 0.05, 0.14);
    this.playNoise(0.06, 0.15, true);
  }

  // 敵撃破（ボンッ！）
  playEnemyExplode() {
    this.playNoise(0.35, 0.32, true);
    this.playSweep(200, 50, 'square', 0.25, 0.16);
  }

  // ボス撃破（大爆発）
  playBossExplode() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playEnemyExplode(), i * 160);
    }
  }

  // アイテム取得（小）
  playPickup(kind = 'heart') {
    if (kind === 'heart') {
      this.playTone(1046, 'square', 0.06, 0.08);
      setTimeout(() => this.playTone(1568, 'square', 0.1, 0.08), 60);
    } else if (kind === 'magic') {
      this.playSweep(600, 1200, 'triangle', 0.15, 0.15);
    } else {
      this.playTone(880, 'triangle', 0.06, 0.15);
      setTimeout(() => this.playTone(1175, 'triangle', 0.08, 0.15), 50);
    }
  }

  // メッセージ文字送り
  playText() {
    this.playTone(1400, 'square', 0.015, 0.025);
  }

  // カーソル移動・決定
  playCursor() {
    this.playTone(988, 'square', 0.04, 0.06);
  }

  playConfirm() {
    this.playTone(784, 'square', 0.06, 0.08);
    setTimeout(() => this.playTone(1175, 'square', 0.12, 0.08), 60);
  }

  playError() {
    this.playTone(180, 'square', 0.12, 0.1);
  }

  // ワープ
  playWarp() {
    this.playSweep(200, 1600, 'sine', 0.45, 0.14);
    setTimeout(() => this.playSweep(300, 2400, 'triangle', 0.35, 0.08), 80);
  }

  // ================= ジングル =================

  // 謎解き音
  // 音階: G4, F#4, D#4, A3, G#3, E4, G#4, C5
  playPuzzleSolved() {
    this.duck(1.4);
    this.playSequence([
      ['G4', 1], ['F#4', 1], ['D#4', 1], ['A3', 1], ['G#3', 1], ['E4', 1], ['G#4', 1], ['C5', 3]
    ], 'triangle', 0.09, 0.25);
  }

  // 宝箱ファンファーレ
  playFanfare() {
    this.duck(1.8);
    this.playSequence([
      ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 3], ['G5', 1], ['C6', 4]
    ], 'square', 0.11, 0.09);
    this.playSequence([
      ['C4', 3], ['G4', 3], ['C4', 5]
    ], 'triangle', 0.11, 0.16);
  }

  // ボス撃破ジングル
  playVictory() {
    this.duck(2.6);
    this.playSequence([
      ['G4', 1], ['C5', 1], ['E5', 1], ['G5', 2], ['E5', 1], ['G5', 2], ['A5', 1], ['B5', 1], ['C6', 6]
    ], 'square', 0.12, 0.09);
    this.playSequence([
      ['C3', 4], ['F3', 2], ['G3', 3], ['C4', 7]
    ], 'triangle', 0.12, 0.16);
  }

  // ゲームオーバー
  playGameOver() {
    this.playSequence([
      ['E5', 2], ['D#5', 2], ['D5', 2], ['C#5', 6], ['-', 2], ['A4', 2], ['E4', 8]
    ].map(([n, d]) => [n === '-' ? 0 : n, d]), 'triangle', 0.14, 0.22);
  }

  // ================= BGM シーケンサー =================

  /**
   * BGM 再生。world 名（light / dark / desert ...）か曲名（title / boss ...）を受け付ける
   */
  startBGM(name = 'field') {
    const map = { light: 'field', dark: 'dark', desert: 'dungeon', dark_temple: 'dungeon', lost_woods: 'dungeon', pyramid: 'boss' };
    const songKey = SONGS[name] ? name : (map[name] || 'field');
    if (this.currentSong === songKey && this.schedulerId) return;

    this.stopBGM();
    this.resume();
    if (!this.ctx) return;

    const song = SONGS[songKey];
    this.currentSong = songKey;
    this.unit = 60 / song.bpm / 2; // 8 分音符の長さ（秒）
    const start = this.ctx.currentTime + 0.08;
    this.trackStates = song.parsed.map(t => ({ track: t, index: 0, nextTime: start }));

    // BGM バスの音量を戻す（フェードイン）
    this.bgmBus.gain.cancelScheduledValues(this.ctx.currentTime);
    this.bgmBus.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.bgmBus.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.4);

    const tick = () => {
      if (!this.ctx) return;
      const horizon = this.ctx.currentTime + 0.15;
      this.trackStates.forEach(st => {
        // タブ非表示などで大きく遅れた場合は追いつく
        if (st.nextTime < this.ctx.currentTime - 0.25) st.nextTime = this.ctx.currentTime + 0.02;
        while (st.nextTime < horizon) {
          const note = st.track.seq[st.index];
          const dur = note.d * this.unit;
          if (note.f > 0) {
            this.playTone(note.f, st.track.wave, Math.max(0.06, dur * 0.92), st.track.vol, st.nextTime, this.bgmBus);
          }
          st.nextTime += dur;
          st.index = (st.index + 1) % st.track.seq.length;
        }
      });
    };
    tick();
    this.schedulerId = setInterval(tick, 30);
  }

  stopBGM() {
    if (this.schedulerId) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.currentSong = null;
  }

  /** BGM をフェードアウトして停止 */
  fadeOutBGM(seconds = 0.6) {
    if (!this.ctx || !this.bgmBus) { this.stopBGM(); return; }
    const t = this.ctx.currentTime;
    this.bgmBus.gain.cancelScheduledValues(t);
    this.bgmBus.gain.setTargetAtTime(0.0001, t, seconds / 4);
    setTimeout(() => this.stopBGM(), seconds * 1000);
  }
}

export const audioSynth = new AudioSynthEngine();
