// ========================================
// BIOHAZARD RENI - Title Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { Rain } from '../effects/Rain.js';
import { Lightning } from '../effects/Lightning.js';
import { NeonGlow } from '../effects/NeonGlow.js';
import { VolumeControl } from '../ui/VolumeControl.js';

export class TitleScene extends Scene {
  constructor() {
    super();
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.lightning = null;
    this.neon = new NeonGlow(GAME_WIDTH, GAME_HEIGHT);
    this.time = 0;
    this.glitchTimer = 0;
    this.glitchActive = false;
    this.promptAlpha = 0;
    this.promptDir = 1;
    this.volumeControl = new VolumeControl();
  }

  async enter() {
    this.time = 0;
    this.lightning = new Lightning(GAME_WIDTH, GAME_HEIGHT, this.game.audio);
    this.game.audio.init();
    this.game.audio.resume();
    this.game.audio.startRain();
    this.game.audio.startBGM(false);

    const hud = document.getElementById('hud-overlay');
    hud.style.display = 'none';

    this._keyUnsub = this.game.input.onKey((e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.volumeControl.toggle();
        return;
      }
      if (this.volumeControl.isVisible()) {
        this.volumeControl.handleKey(e, this.game.audio);
        return;
      }
      this.game.audio.playMenuSelect();
      this.game.switchScene('modeSelect');
    });
  }

  exit() {
    super.exit();
  }

  update(dt) {
    this.time += dt;
    this.rain.update(dt);
    this.lightning.update(dt);
    this.neon.update(dt);

    // Glitch effect timer
    this.glitchTimer -= dt;
    if (this.glitchTimer <= 0) {
      this.glitchActive = Math.random() < 0.3;
      this.glitchTimer = 0.05 + Math.random() * 0.2;
    }

    // Prompt blink
    this.promptAlpha += this.promptDir * dt * 2;
    if (this.promptAlpha >= 1) { this.promptAlpha = 1; this.promptDir = -1; }
    if (this.promptAlpha <= 0.2) { this.promptAlpha = 0.2; this.promptDir = 1; }
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Dark background with gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#050510');
    bgGrad.addColorStop(0.5, '#0a0a1a');
    bgGrad.addColorStop(1, '#0a0510');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#0f0a15';
    ctx.fillRect(0, H * 0.85, W, H * 0.15);
    ctx.strokeStyle = 'rgba(100, 80, 120, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H * 0.85); ctx.lineTo(W, H * 0.85); ctx.stroke();

    // Neon signs
    this.neon.render(ctx);

    // Rain
    this.rain.render(ctx);

    // Lightning
    this.lightning.render(ctx);

    // Biohazard symbol
    this._drawBiohazardSymbol(ctx, W / 2, H * 0.32, 60 + Math.sin(this.time) * 3);

    // Title - BIOHAZARD
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `900 54px 'Orbitron', sans-serif`;

    // Glitch offset
    let gx = 0, gy = 0;
    if (this.glitchActive) {
      gx = (Math.random() - 0.5) * 6;
      gy = (Math.random() - 0.5) * 4;
      // RGB split
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillText('BIOHAZARD', W / 2 + gx + 2, H * 0.5 + gy);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.fillText('BIOHAZARD', W / 2 + gx - 2, H * 0.5 + gy);
    }

    // Main title
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.TEXT_PRIMARY;
    ctx.fillText('BIOHAZARD', W / 2, H * 0.5);
    ctx.shadowBlur = 0;

    // Subtitle - RENI
    ctx.font = `700 72px 'Orbitron', sans-serif`;
    ctx.shadowColor = COLORS.BLOOD_RED_BRIGHT;
    ctx.shadowBlur = 20;
    ctx.fillStyle = COLORS.BLOOD_RED_BRIGHT;
    ctx.fillText('RENI', W / 2, H * 0.58 + 10);
    ctx.shadowBlur = 0;

    // Tagline
    ctx.font = `14px 'Share Tech Mono', monospace`;
    ctx.fillStyle = `rgba(200, 200, 200, 0.5)`;
    ctx.fillText('TYPING SURVIVAL HORROR', W / 2, H * 0.65);

    // Separator line
    ctx.strokeStyle = `rgba(0, 255, 65, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, H * 0.68);
    ctx.lineTo(W * 0.7, H * 0.68);
    ctx.stroke();

    // Press any key prompt
    ctx.font = `16px 'Share Tech Mono', monospace`;
    ctx.fillStyle = `rgba(0, 255, 65, ${this.promptAlpha})`;
    ctx.fillText('>>> PRESS ANY KEY TO START <<<', W / 2, H * 0.78);

    // Version / copyright
    ctx.font = `11px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.fillText('v1.0 // AGENT NORA DEPLOYMENT', W / 2, H * 0.95);

    // Sound hint
    ctx.fillStyle = 'rgba(100,100,100,0.35)';
    ctx.fillText('[M] SOUND SETTINGS', W / 2, H * 0.88);

    ctx.restore();

    // Volume overlay
    this.volumeControl.render(ctx, this.game.audio);
  }

  _drawBiohazardSymbol(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = COLORS.NEON_GREEN;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + Math.sin(this.time * 2) * 0.1;
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 10;

    // Three interlocking circles
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.35;
      const y = Math.sin(angle) * size * 0.35;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
