/**
 * SFC『ゼルダの伝説 神々のトライフォース』風 Web Audio API シンセサイザーエンジン
 * 外部音声ファイル不要（CORS完全フリー）で、8-bit/16-bit風の効果音・ジングル・BGMをリアルタイム合成
 */
class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.bgmInterval = null;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
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

  playTone(freq, type, duration, volume = 0.2) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // ホワイトノイズ生成（爆発音・風切り音用）
  playNoise(duration = 0.2, volume = 0.25, isLowPass = true) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const bufferSize = this.ctx.sampleRate * duration;
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
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
    } else {
      noise.connect(gain);
    }

    gain.connect(this.ctx.destination);
    noise.start();
  }

  // ================= 効果音 (SE) =================

  // 剣攻撃
  playSlash() {
    this.playTone(550, 'triangle', 0.08, 0.25);
    setTimeout(() => this.playTone(280, 'sawtooth', 0.1, 0.15), 30);
  }

  // 回転斬りチャージ音（ピロピロピロ…）
  playSpinCharge(pitchStep = 0) {
    const baseFreq = 440 + (pitchStep % 8) * 60;
    this.playTone(baseFreq, 'sine', 0.06, 0.15);
  }

  // 回転斬り解放音（疾風の旋回）
  playSpinRelease() {
    this.playNoise(0.25, 0.35, false);
    this.playTone(880, 'triangle', 0.2, 0.3);
    setTimeout(() => this.playTone(660, 'triangle', 0.2, 0.25), 50);
    setTimeout(() => this.playTone(440, 'triangle', 0.25, 0.2), 100);
  }

  // 盾ガード音（カンッ！）
  playShieldBlock() {
    this.playTone(1200, 'square', 0.05, 0.3);
    setTimeout(() => this.playTone(900, 'sine', 0.08, 0.2), 20);
  }

  // 草刈り音（サクッ）
  playGrassCut() {
    this.playNoise(0.1, 0.2, false);
    this.playTone(350, 'triangle', 0.08, 0.15);
  }

  // アグニム魔法弾打ち返し音（ピキーーン！）
  playReflect() {
    this.playTone(1800, 'sine', 0.15, 0.35);
    setTimeout(() => this.playTone(2400, 'triangle', 0.2, 0.3), 30);
    setTimeout(() => this.playTone(3200, 'sine', 0.25, 0.25), 60);
  }

  // ファイアボール
  playFireball() {
    this.playTone(400, 'sawtooth', 0.25, 0.2);
    this.playTone(300, 'sine', 0.25, 0.2);
  }

  // 弓矢
  playArrow() {
    this.playTone(880, 'sine', 0.08, 0.25);
    setTimeout(() => this.playTone(660, 'sine', 0.08, 0.2), 30);
  }

  // 被弾
  playHurt() {
    this.playTone(180, 'sawtooth', 0.2, 0.3);
  }

  // 敵撃破（ボンッ！）
  playEnemyExplode() {
    this.playNoise(0.3, 0.4, true);
    this.playTone(120, 'square', 0.2, 0.3);
  }

  // ワープ
  playWarp() {
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(440 + i * 110, 'sine', 0.15, 0.15);
      }, i * 60);
    }
  }

  // ================= ジングル =================

  // 謎解き音（神トラの「テレレレレレッ♪」）
  // 音階: G4, F#4, D#4, A3, G#3, E4, G#4, C5
  playPuzzleSolved() {
    const melody = [
      { f: 392.00, d: 0.1 },  // G4
      { f: 369.99, d: 0.1 },  // F#4
      { f: 311.13, d: 0.1 },  // D#4
      { f: 220.00, d: 0.1 },  // A3
      { f: 207.65, d: 0.1 },  // G#3
      { f: 329.63, d: 0.1 },  // E4
      { f: 415.30, d: 0.1 },  // G#4
      { f: 523.25, d: 0.35 }  // C5
    ];
    let time = 0;
    melody.forEach(m => {
      setTimeout(() => {
        this.playTone(m.f, 'triangle', m.d, 0.28);
      }, time);
      time += m.d * 850;
    });
  }

  // 宝箱ファンファーレ（「テレレレ〜レレー♪」）
  // 音階: C4, E4, G4, C5, G4, C5
  playFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.45];
    let time = 0;
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 'triangle', durations[i], 0.28);
      }, time);
      time += durations[i] * 800;
    });
  }

  // ================= BGM シーケンサー =================

  startBGM(world = 'light') {
    this.stopBGM();
    this.resume();

    // 8-bit/16-bit ゼルダメロディ
    const lightMelody = [
      { f: 440, d: 2 }, { f: 330, d: 2 }, // A4, E4
      { f: 440, d: 1 }, { f: 494, d: 1 }, { f: 523, d: 1 }, { f: 587, d: 1 }, // A, B, C, D
      { f: 659, d: 4 }, // E5
      { f: 0, d: 2 },   // Rest
      { f: 659, d: 1 }, { f: 698, d: 1 }, { f: 784, d: 2 }, // E, F, G5
      { f: 880, d: 4 }  // A5
    ];

    const darkMelody = [
      { f: 220, d: 2 }, { f: 196, d: 2 }, // A3, G3
      { f: 220, d: 1 }, { f: 233, d: 1 }, { f: 220, d: 2 }, // A, Bb, A
      { f: 165, d: 4 }, // E3
      { f: 0, d: 2 },   // Rest
      { f: 165, d: 1 }, { f: 174, d: 1 }, { f: 196, d: 2 }, // E, F, G
      { f: 220, d: 4 }  // A3
    ];

    const dungeonMelody = [
      { f: 130, d: 2 }, { f: 146, d: 2 }, { f: 138, d: 2 }, { f: 123, d: 2 },
      { f: 116, d: 4 }, { f: 0, d: 2 },   { f: 130, d: 4 }
    ];

    const bossMelody = [
      { f: 220, d: 1 }, { f: 220, d: 1 }, { f: 246, d: 1 }, { f: 261, d: 1 },
      { f: 293, d: 2 }, { f: 261, d: 1 }, { f: 246, d: 1 },
      { f: 220, d: 2 }, { f: 196, d: 2 }, { f: 220, d: 4 }
    ];

    let melody = lightMelody;
    let type = 'triangle';
    let volume = 0.08;

    if (world === 'dark') {
      melody = darkMelody;
      type = 'sawtooth';
      volume = 0.05;
    } else if (['desert', 'dark_temple', 'lost_woods'].includes(world)) {
      melody = dungeonMelody;
      type = 'sawtooth';
      volume = 0.05;
    } else if (world === 'pyramid' || world === 'boss') {
      melody = bossMelody;
      type = 'square';
      volume = 0.06;
    }

    let index = 0;
    const beatDuration = 220;

    this.bgmInterval = setInterval(() => {
      const note = melody[index];
      if (note && note.f > 0) {
        this.playTone(note.f, type, (note.d * beatDuration) / 1000, volume);
      }
      index = (index + 1) % melody.length;
    }, beatDuration);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audioSynth = new AudioSynthEngine();
