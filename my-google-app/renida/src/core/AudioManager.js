// ========================================
// BIOHAZARD RENI - Audio Manager (Web Audio API)
// All sounds are synthesized - no external files needed
// ========================================

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.rainNode = null;
    this.bgmOscillators = [];
    this.isDangerMode = false;
    this.bgmInterval = null;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.masterGain);

    // Load saved volumes
    this._loadVolumes();
    this.initialized = true;
  }

  _loadVolumes() {
    try {
      const saved = JSON.parse(localStorage.getItem('breni_volumes') || '{}');
      this.masterGain.gain.value = saved.master ?? 0.6;
      this.bgmGain.gain.value = saved.bgm ?? 0.12;
      this.sfxGain.gain.value = saved.sfx ?? 0.5;
      this.ambientGain.gain.value = saved.ambient ?? 0.15;
    } catch { this._setDefaults(); }
  }

  _setDefaults() {
    this.masterGain.gain.value = 0.6;
    this.bgmGain.gain.value = 0.12;
    this.sfxGain.gain.value = 0.5;
    this.ambientGain.gain.value = 0.15;
  }

  _saveVolumes() {
    try {
      localStorage.setItem('breni_volumes', JSON.stringify({
        master: this.masterGain.gain.value,
        bgm: this.bgmGain.gain.value,
        sfx: this.sfxGain.gain.value,
        ambient: this.ambientGain.gain.value,
      }));
    } catch {}
  }

  getMasterVolume() { return this.masterGain ? this.masterGain.gain.value : 0.6; }
  getBGMVolume() { return this.bgmGain ? this.bgmGain.gain.value : 0.12; }
  getSFXVolume() { return this.sfxGain ? this.sfxGain.gain.value : 0.5; }

  setMasterVolume(v) { if (this.masterGain) { this.masterGain.gain.value = v; this._saveVolumes(); } }
  setBGMVolume(v) { if (this.bgmGain) { this.bgmGain.gain.value = v; this._saveVolumes(); } }
  setSFXVolume(v) { if (this.sfxGain) { this.sfxGain.gain.value = v; this._saveVolumes(); } }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // === Weapon Sound Effects ===

  playHandgun() {
    this.playGunshot(); // existing gunshot
  }

  playGunshot() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    noise.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    noise.start(now); noise.stop(now + 0.12);
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(oscGain); oscGain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.1);
  }

  playShotgun() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Heavy blast
    const bufSz = this.ctx.sampleRate * 0.15;
    const buf = this.ctx.createBuffer(1, bufSz, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSz * 0.08));
    const n = this.ctx.createBufferSource(); n.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(1.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    n.connect(f); f.connect(g); g.connect(this.sfxGain); n.start(now); n.stop(now + 0.2);
    // Low boom
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(80, now); o.frequency.exponentialRampToValueAtTime(20, now + 0.12);
    const og = this.ctx.createGain(); og.gain.setValueAtTime(0.8, now); og.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    o.connect(og); og.connect(this.sfxGain); o.start(now); o.stop(now + 0.18);
    // Pellet scatter
    for (let i = 0; i < 4; i++) {
      const t = now + 0.02 + i * 0.01;
      const p = this.ctx.createOscillator(); p.type = 'triangle';
      p.frequency.setValueAtTime(3000 + Math.random() * 2000, t);
      const pg = this.ctx.createGain(); pg.gain.setValueAtTime(0.08, t); pg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      p.connect(pg); pg.connect(this.sfxGain); p.start(t); p.stop(t + 0.04);
    }
  }

  playMachineGun() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.04;
      const bufSz = this.ctx.sampleRate * 0.04;
      const buf = this.ctx.createBuffer(1, bufSz, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < bufSz; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufSz * 0.12));
      const n = this.ctx.createBufferSource(); n.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2500;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      n.connect(f); f.connect(g); g.connect(this.sfxGain); n.start(t); n.stop(t + 0.06);
    }
  }

  playMagnum() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Massive blast
    const bufSz = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufSz, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSz * 0.06));
    const n = this.ctx.createBufferSource(); n.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(1.4, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    n.connect(f); f.connect(g); g.connect(this.sfxGain); n.start(now); n.stop(now + 0.3);
    // Deep resonance
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(60, now); o.frequency.exponentialRampToValueAtTime(15, now + 0.2);
    const og = this.ctx.createGain(); og.gain.setValueAtTime(1.0, now); og.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    o.connect(og); og.connect(this.sfxGain); o.start(now); o.stop(now + 0.3);
    // Reverb tail
    const r = this.ctx.createOscillator(); r.type = 'sine';
    r.frequency.setValueAtTime(200, now + 0.1); r.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    const rg = this.ctx.createGain(); rg.gain.setValueAtTime(0.15, now + 0.1); rg.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    r.connect(rg); rg.connect(this.sfxGain); r.start(now + 0.1); r.stop(now + 0.55);
  }

  playRocketLauncher() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Whoosh launch
    const bufSz = this.ctx.sampleRate * 0.15;
    const buf = this.ctx.createBuffer(1, bufSz, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) d[i] = (Math.random() * 2 - 1) * (i / bufSz) * 0.5;
    const n = this.ctx.createBufferSource(); n.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 1;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    n.connect(f); f.connect(g); g.connect(this.sfxGain); n.start(now); n.stop(now + 0.18);
    // Explosion
    const eSz = this.ctx.sampleRate * 0.4;
    const eB = this.ctx.createBuffer(1, eSz, this.ctx.sampleRate);
    const eD = eB.getChannelData(0);
    for (let i = 0; i < eSz; i++) eD[i] = (Math.random() * 2 - 1) * Math.exp(-i / (eSz * 0.08));
    const en = this.ctx.createBufferSource(); en.buffer = eB;
    const ef = this.ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 600;
    const eg = this.ctx.createGain(); eg.gain.setValueAtTime(1.5, now + 0.12); eg.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    en.connect(ef); ef.connect(eg); eg.connect(this.sfxGain); en.start(now + 0.12); en.stop(now + 0.55);
    // Sub bass impact
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(40, now + 0.12); o.frequency.exponentialRampToValueAtTime(10, now + 0.5);
    const og = this.ctx.createGain(); og.gain.setValueAtTime(1.2, now + 0.12); og.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    o.connect(og); og.connect(this.sfxGain); o.start(now + 0.12); o.stop(now + 0.55);
  }

  playWeaponUpgrade() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [392, 523, 659, 784, 1047]; // G4,C5,E5,G5,C6
    notes.forEach((freq, i) => {
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.2, now + i * 0.06); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.15);
      o.connect(g); g.connect(this.sfxGain); o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.2);
    });
  }

  playDryFire() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);

    // Metallic click
    const click = this.ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(2500, now);
    click.frequency.exponentialRampToValueAtTime(1200, now + 0.02);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    click.connect(clickGain);
    clickGain.connect(this.sfxGain);
    click.start(now);
    click.stop(now + 0.04);
  }

  playKill() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Splatter sound
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15)) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.25);

    // Rising tone for "kill confirmed"
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.15);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playBite() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Crunch / bite sound
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120 + i * 50, now + i * 0.03);
      osc.frequency.exponentialRampToValueAtTime(40, now + i * 0.03 + 0.06);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.1);
    }
  }

  playComboBonus() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  }

  playMenuSelect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // === Ambient Rain ===

  startRain() {
    if (!this.ctx || this.rainNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        // Filtered noise that sounds like rain
        data[i] = (Math.random() * 2 - 1) * 0.3;
        // Add occasional "drops"
        if (Math.random() < 0.001) {
          data[i] *= 3;
        }
      }
    }

    this.rainNode = this.ctx.createBufferSource();
    this.rainNode.buffer = buffer;
    this.rainNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 8000;

    this.rainNode.connect(filter);
    filter.connect(filter2);
    filter2.connect(this.ambientGain);
    this.rainNode.start();
  }

  stopRain() {
    if (this.rainNode) {
      this.rainNode.stop();
      this.rainNode = null;
    }
  }

  // === Thunder ===

  playThunder() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.ctx.sampleRate;
      // Multiple rumble waves
      data[i] = (Math.random() * 2 - 1) *
        (Math.exp(-t * 1.5) * 0.7 + Math.exp(-t * 0.5) * 0.3) *
        (0.5 + 0.5 * Math.sin(t * 20));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    noise.start(now);
    noise.stop(now + 1.8);
  }

  // === BGM ===

  startBGM(danger = false) {
    this.stopBGM();
    if (!this.ctx) return;

    this.isDangerMode = danger;
    this._playBGMLoop();
  }

  _playBGMLoop() {
    if (!this.ctx) return;

    const tempo = this.isDangerMode ? 140 : 80;
    const beatDuration = 60 / tempo;

    // Dark minor chord progression
    const chords = this.isDangerMode
      ? [[130.81, 155.56, 196.00], [116.54, 138.59, 174.61], [123.47, 146.83, 185.00], [110.00, 130.81, 164.81]]
      : [[65.41, 77.78, 98.00], [58.27, 69.30, 87.31], [61.74, 73.42, 92.50], [55.00, 65.41, 82.41]];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIndex % chords.length];

      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = this.isDangerMode ? 'sawtooth' : 'triangle';
        osc.frequency.value = freq;

        const gain = this.ctx.createGain();
        const vol = this.isDangerMode ? 0.08 : 0.05;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration * 1.8);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + beatDuration * 2);

        this.bgmOscillators.push({ osc, gain });
      });

      // Bass note
      const bass = this.ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.value = chord[0] / 2;

      const bassGain = this.ctx.createGain();
      bassGain.gain.setValueAtTime(this.isDangerMode ? 0.15 : 0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration * 1.5);

      bass.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bass.start(now);
      bass.stop(now + beatDuration * 2);

      chordIndex++;
    };

    playChord();
    this.bgmInterval = setInterval(playChord, beatDuration * 2 * 1000);
  }

  setDangerMode(danger) {
    if (this.isDangerMode !== danger) {
      this.startBGM(danger);
    }
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmOscillators.forEach(({ osc }) => {
      try { osc.stop(); } catch {}
    });
    this.bgmOscillators = [];
  }

  // === Cleanup ===

  stopAll() {
    this.stopBGM();
    this.stopRain();
  }
}
