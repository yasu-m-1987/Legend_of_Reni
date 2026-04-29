// ========================================
// BIOHAZARD RENI - Mode Select Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, MODES, COLORS } from '../utils/constants.js';
import { Rain } from '../effects/Rain.js';

export class ModeSelectScene extends Scene {
  constructor() {
    super();
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.selectedIndex = 0;
    this.modes = [MODES.CIVILIAN, MODES.SOLDIER, MODES.PROFESSIONAL];
    this.hoverAlpha = [0, 0, 0];
    this.time = 0;
    this.scanlineOffset = 0;
  }

  async enter() {
    this.selectedIndex = 0;
    this.time = 0;

    this._keyUnsub = this.game.input.onKey((e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        this.selectedIndex = (this.selectedIndex - 1 + 3) % 3;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.selectedIndex = (this.selectedIndex + 1) % 3;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.game.audio.playGunshot();
        this.game.switchScene('characterSelect', { mode: this.modes[this.selectedIndex] });
      } else if (e.key === 'Escape') {
        this.game.switchScene('title');
      } else if (e.key === '1') { this.selectedIndex = 0; this._confirm(); }
      else if (e.key === '2') { this.selectedIndex = 1; this._confirm(); }
      else if (e.key === '3') { this.selectedIndex = 2; this._confirm(); }
    });
  }

  _confirm() {
    this.game.audio.playGunshot();
    this.game.switchScene('characterSelect', { mode: this.modes[this.selectedIndex] });
  }

  exit() { super.exit(); }

  update(dt) {
    this.time += dt;
    this.rain.update(dt);
    this.scanlineOffset += dt * 30;

    for (let i = 0; i < 3; i++) {
      const target = i === this.selectedIndex ? 1 : 0;
      this.hoverAlpha[i] += (target - this.hoverAlpha[i]) * dt * 8;
    }
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
    this.rain.render(ctx);

    // Header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `bold 28px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.TEXT_PRIMARY;
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 8;
    ctx.fillText('SELECT MISSION', W / 2, 70);
    ctx.shadowBlur = 0;

    ctx.font = `13px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.fillText('CHOOSE YOUR DIFFICULTY // USE ↑↓ + ENTER', W / 2, 100);

    // Mode cards
    const cardW = 340, cardH = 150, gap = 30;
    const startX = (W - (cardW * 3 + gap * 2)) / 2;
    const cardY = (H - cardH) / 2;

    const modeColors = [COLORS.NEON_GREEN, COLORS.AMBER, COLORS.BLOOD_RED_BRIGHT];
    const modeIcons = ['☣', '⚔', '💀'];

    for (let i = 0; i < 3; i++) {
      const mode = this.modes[i];
      const x = startX + i * (cardW + gap);
      const y = cardY;
      const selected = i === this.selectedIndex;
      const alpha = this.hoverAlpha[i];
      const color = modeColors[i];

      // Card background
      ctx.fillStyle = `rgba(10, 15, 25, ${0.8 + alpha * 0.15})`;
      ctx.strokeStyle = selected
        ? color
        : `rgba(80, 80, 80, 0.3)`;
      ctx.lineWidth = selected ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      // Glow effect when selected
      if (selected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Icon
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(modeIcons[i], x + cardW / 2, y + 40);

      // Mode name
      ctx.font = `bold 20px 'Orbitron', sans-serif`;
      ctx.fillStyle = selected ? color : 'rgba(200,200,200,0.6)';
      ctx.fillText(mode.name, x + cardW / 2, y + 68);

      // Subtitle
      ctx.font = `12px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = `rgba(200,200,200,${0.4 + alpha * 0.3})`;
      ctx.fillText(mode.subtitle, x + cardW / 2, y + 88);

      // Stats
      ctx.font = `11px 'Share Tech Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillStyle = `rgba(200,200,200,${0.5 + alpha * 0.3})`;
      const statsX = x + 30;
      ctx.fillText(`TIME: ${mode.timeLimit}s`, statsX, y + 110);
      ctx.fillText(`WORDS: ${mode.wordLengthMin}-${mode.wordLengthMax} chars`, statsX, y + 125);

      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.AMBER;
      ctx.fillText(`TARGET: $${mode.targetScore.toLocaleString()}`, x + cardW - 30, y + 110);
      ctx.fillStyle = `rgba(200,200,200,0.4)`;
      ctx.fillText(`COST: $${mode.cost.toLocaleString()}`, x + cardW - 30, y + 125);

      // Number key hint
      ctx.textAlign = 'center';
      ctx.font = `10px 'Share Tech Mono', monospace`;
      ctx.fillStyle = `rgba(150,150,150,0.4)`;
      ctx.fillText(`[${i + 1}]`, x + cardW / 2, y + cardH - 8);
    }

    // Back hint
    ctx.textAlign = 'center';
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(100,100,100,0.4)';
    ctx.fillText('[ESC] BACK TO TITLE', W / 2, H - 40);

    ctx.restore();
  }
}
