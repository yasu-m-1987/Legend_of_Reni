// ========================================
// BIOHAZARD RENI - Loading Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';

export class LoadingScene extends Scene {
  constructor() {
    super();
    this.progress = 0;
    this.targetProgress = 0;
    this.lines = [];
    this.lineTimer = 0;
    this.mode = null;
    this.words = null;
    this.ready = false;
    this.readyTimer = 0;
  }

  async enter(data) {
    this.mode = data.mode;
    this.character = data.character;
    this.progress = 0;
    this.targetProgress = 0;
    this.lines = [];
    this.lineTimer = 0;
    this.ready = false;
    this.readyTimer = 0;

    const agentName = this.character ? this.character.name : 'NORA';
    // Briefing lines
    this.briefingLines = [
      `> MISSION BRIEFING // ${this.mode.name} CLASS`,
      `> AGENT: ${agentName} // STATUS: ACTIVE`,
      `> LOCATION: RACCOON CITY // SECTOR 7`,
      `> THREAT LEVEL: ${this.mode.name === 'CIVILIAN' ? 'MODERATE' : this.mode.name === 'SOLDIER' ? 'HIGH' : 'CRITICAL'}`,
      `> LOADING WORD DATABASE [${this.mode.dataFile}.json]...`,
      `> INITIALIZING WEAPON SYSTEMS...`,
      `> CALIBRATING TARGETING AI...`,
      `> DEPLOYING AGENT ${agentName}...`,
    ];

    // Load word data
    this._loadWords();
  }

  async _loadWords() {
    try {
      const module = await import(`../data/words_${this.mode.dataFile}.json`);
      this.words = module.default;
      this.targetProgress = 1.0;
    } catch (e) {
      console.error('Failed to load words:', e);
      this.words = ['てすと', 'でーた', 'えらー'];
      this.targetProgress = 1.0;
    }
  }

  exit() { super.exit(); }

  update(dt) {
    // Smooth progress
    this.progress += (this.targetProgress - this.progress) * dt * 3;

    // Add briefing lines gradually
    this.lineTimer += dt;
    const lineIndex = Math.floor(this.lineTimer / 0.3);
    if (lineIndex < this.briefingLines.length && this.lines.length <= lineIndex) {
      this.lines.push(this.briefingLines[lineIndex]);
    }

    // Check ready
    if (this.progress > 0.95 && !this.ready) {
      this.ready = true;
      this.lines.push('> ALL SYSTEMS NOMINAL');
      this.lines.push('> ████ MISSION START ████');
    }

    if (this.ready) {
      this.readyTimer += dt;
      if (this.readyTimer > 1.5) {
        this.game.switchScene('game', { mode: this.mode, words: this.words, character: this.character });
      }
    }
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 255, 65, 0.02)';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }

    ctx.save();
    ctx.textAlign = 'left';

    // Terminal-style text
    const startX = 60, startY = 80;
    ctx.font = `14px 'Share Tech Mono', monospace`;

    for (let i = 0; i < this.lines.length; i++) {
      const alpha = Math.min(1, (this.lines.length - i) * 0.15 + 0.5);
      const isLast = i === this.lines.length - 1;
      ctx.fillStyle = isLast
        ? COLORS.NEON_GREEN
        : `rgba(0, 255, 65, ${alpha * 0.6})`;
      ctx.fillText(this.lines[i], startX, startY + i * 24);
    }

    // Cursor blink
    if (this.lines.length > 0) {
      const cursorY = startY + this.lines.length * 24;
      if (Math.sin(Date.now() / 200) > 0) {
        ctx.fillStyle = COLORS.NEON_GREEN;
        ctx.fillRect(startX, cursorY - 12, 8, 16);
      }
    }

    // Progress bar
    const barX = 60, barY = H - 100, barW = W - 120, barH = 8;
    ctx.fillStyle = 'rgba(30, 30, 50, 0.8)';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 6;
    ctx.fillRect(barX, barY, barW * Math.min(1, this.progress), barH);
    ctx.shadowBlur = 0;

    // Progress text
    ctx.textAlign = 'right';
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.fillText(`${Math.floor(this.progress * 100)}%`, barX + barW, barY + barH + 20);

    // Mode name
    ctx.textAlign = 'center';
    ctx.font = `bold 12px 'Orbitron', sans-serif`;
    ctx.fillStyle = 'rgba(200,200,200,0.3)';
    ctx.fillText(`${this.mode.name} // TARGET: $${this.mode.targetScore.toLocaleString()}`, W / 2, barY + barH + 20);

    ctx.restore();
  }
}
