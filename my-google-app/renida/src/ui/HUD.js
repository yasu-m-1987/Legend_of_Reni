// ========================================
// BIOHAZARD RENI - HUD Manager
// ========================================
import { COLORS, AUDIO } from '../utils/constants.js';

export class HUD {
  constructor() {
    this.timerEl = document.getElementById('timer-value');
    this.scoreEl = document.getElementById('score-value');
    this.comboEl = document.getElementById('combo-value');
    this.wordJpEl = document.getElementById('word-japanese');
    this.wordRomajiEl = document.getElementById('word-romaji');
    this.feedbackEl = document.getElementById('input-feedback');
    this.overlay = document.getElementById('hud-overlay');
    this.heartCanvas = document.getElementById('heart-canvas');
    this.heartCtx = this.heartCanvas ? this.heartCanvas.getContext('2d') : null;
    this.weaponEl = document.getElementById('weapon-name');
    this.heartData = [];
    this.heartTime = 0;
    this.heartBPM = 72;
  }

  show() { this.overlay.style.display = 'block'; }
  hide() { this.overlay.style.display = 'none'; }

  updateTimer(seconds, totalTime) {
    this.timerEl.textContent = Math.ceil(seconds);
    const ratio = seconds / totalTime;
    if (ratio < 0.3) {
      this.timerEl.style.color = COLORS.DANGER;
      this.timerEl.style.animation = 'pulse-danger 0.5s infinite';
    } else if (ratio < 0.5) {
      this.timerEl.style.color = COLORS.AMBER;
      this.timerEl.style.animation = 'none';
    } else {
      this.timerEl.style.color = COLORS.NEON_GREEN;
      this.timerEl.style.animation = 'none';
    }
  }

  updateScore(score, cost) {
    const balance = score - cost;
    this.scoreEl.textContent = `$${score.toLocaleString()}`;
    this.scoreEl.style.color = balance >= 0 ? COLORS.NEON_GREEN : COLORS.DANGER;
  }

  updateCombo(combo) {
    this.comboEl.textContent = combo;
    if (combo > 30) {
      this.comboEl.style.color = COLORS.AMBER;
    } else if (combo > 10) {
      this.comboEl.style.color = COLORS.NEON_GREEN;
    } else {
      this.comboEl.style.color = COLORS.TEXT_PRIMARY;
    }
  }

  updateWeapon(name, color) {
    if (!this.weaponEl) return;
    this.weaponEl.textContent = name;
    this.weaponEl.style.color = color;
    this.weaponEl.style.textShadow = `0 0 8px ${color}`;
  }

  updateWord(japanese, romaji, completedRomaji, currentPartial) {
    this.wordJpEl.textContent = japanese || '';
    if (!romaji) {
      this.wordRomajiEl.innerHTML = '';
      return;
    }
    const completed = completedRomaji + currentPartial;
    const remaining = romaji.substring(completed.length);
    this.wordRomajiEl.innerHTML =
      `<span class="typed">${completed}</span><span class="untyped">${remaining}</span>`;
  }

  showFeedback(text, type) {
    this.feedbackEl.textContent = text;
    this.feedbackEl.className = `feedback-${type}`;
    this.feedbackEl.style.opacity = '1';
    setTimeout(() => { this.feedbackEl.style.opacity = '0'; }, 600);
  }

  updateHeartMonitor(dt, combo, timeRatio) {
    if (!this.heartCtx) return;
    this.heartTime += dt;

    // BPM increases with combo and danger
    this.heartBPM = 72 + combo * 0.5 + (1 - timeRatio) * 60;
    const beatInterval = 60 / this.heartBPM;

    // Generate heart signal
    const t = this.heartTime % beatInterval;
    const phase = t / beatInterval;
    let value = 0;
    if (phase < 0.1) value = Math.sin(phase / 0.1 * Math.PI) * 0.3;
    else if (phase < 0.15) value = -0.2;
    else if (phase < 0.2) value = 1.0;
    else if (phase < 0.25) value = -0.5;
    else if (phase < 0.35) value = Math.sin((phase - 0.25) / 0.1 * Math.PI) * 0.2;
    else value = 0;

    this.heartData.push(value);
    if (this.heartData.length > 240) this.heartData.shift();

    // Draw
    const c = this.heartCtx;
    const w = this.heartCanvas.width;
    const h = this.heartCanvas.height;
    c.clearRect(0, 0, w, h);

    // Grid
    c.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    c.lineWidth = 0.5;
    for (let y = 0; y < h; y += 15) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    for (let x = 0; x < w; x += 15) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
    }

    // Heart line
    const color = timeRatio < 0.3 ? COLORS.DANGER : COLORS.NEON_GREEN;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.shadowColor = color;
    c.shadowBlur = 4;
    c.beginPath();
    for (let i = 0; i < this.heartData.length; i++) {
      const x = (i / 240) * w;
      const y = h / 2 - this.heartData[i] * (h * 0.4);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    c.shadowBlur = 0;
  }

  flashScreen(color = 'rgba(255, 0, 0, 0.3)') {
    const flash = document.getElementById('screen-flash');
    flash.style.backgroundColor = color;
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 150);
  }
}
