// ========================================
// BIOHAZARD RENI - Base Creature Class
// ========================================

import { CREATURE_ARRIVE_X, COLORS } from '../utils/constants.js';

export class Creature {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.speed = config.speed;           // pixels per second
    this.word = config.word;             // hiragana word
    this.romaji = config.romaji;         // romaji display
    this.bounty = config.bounty;         // $ reward
    this.type = config.type;             // creature type info
    this.matcher = config.matcher;       // RomajiMatcher instance

    this.alive = true;
    this.arrived = false;               // reached player position
    this.dying = false;
    this.deathTimer = 0;
    this.deathDuration = 0.6;
    this.targeted = false;              // currently being typed at
    this.hitFlash = 0;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 2 + Math.random() * 3;
    this.baseY = this.y;

    // Visual
    this.width = 50;
    this.height = 60;
    this.glowPulse = 0;
  }

  update(dt) {
    if (this.dying) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathDuration) {
        this.alive = false;
      }
      return;
    }

    // Move towards player
    this.x -= this.speed * dt;

    // Wobble movement
    this.wobblePhase += this.wobbleSpeed * dt;
    this.y = this.baseY + Math.sin(this.wobblePhase) * 8;

    // Glow pulse
    this.glowPulse += dt * 3;

    // Hit flash decay
    if (this.hitFlash > 0) {
      this.hitFlash -= dt * 5;
    }

    // Check if arrived at player position
    if (this.x <= CREATURE_ARRIVE_X) {
      this.arrived = true;
    }
  }

  onHit() {
    this.hitFlash = 1.0;
  }

  kill() {
    this.dying = true;
    this.deathTimer = 0;
  }

  render(ctx) {
    // Override in subclasses
  }

  renderWord(ctx) {
    if (this.dying) return;

    const progress = this.matcher.getProgress();
    const y = this.y - this.height / 2 - 30;

    // Word background
    ctx.save();
    const padding = 8;
    const fontSize = 16;
    ctx.font = `bold ${fontSize}px 'Share Tech Mono', monospace`;

    const romajiText = this.romaji;
    const textWidth = ctx.measureText(romajiText).width;
    const bgWidth = textWidth + padding * 2;

    // Background box
    ctx.fillStyle = this.targeted
      ? 'rgba(0, 255, 65, 0.15)'
      : 'rgba(0, 0, 0, 0.75)';
    ctx.strokeStyle = this.targeted
      ? COLORS.NEON_GREEN
      : 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 1;

    const boxX = this.x - bgWidth / 2;
    ctx.beginPath();
    ctx.roundRect(boxX, y - fontSize - padding, bgWidth, fontSize + padding * 2, 4);
    ctx.fill();
    ctx.stroke();

    // Japanese word (above romaji)
    ctx.font = `bold 13px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(this.word, this.x, y - fontSize - padding - 6);

    // Romaji - completed portion
    ctx.font = `bold ${fontSize}px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'left';
    const startX = boxX + padding;

    const completed = progress.completedRomaji + progress.currentPartial;
    const remaining = romajiText.substring(completed.length);

    // Completed text (green)
    if (completed.length > 0) {
      ctx.fillStyle = COLORS.NEON_GREEN;
      ctx.fillText(completed, startX, y);
    }

    // Remaining text (dim)
    if (remaining.length > 0) {
      const completedWidth = ctx.measureText(completed).width;
      ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
      ctx.fillText(remaining, startX + completedWidth, y);
    }

    // Bounty display
    ctx.font = `10px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.AMBER;
    ctx.textAlign = 'center';
    ctx.fillText(`$${this.bounty}`, this.x, y + padding + 4);

    ctx.restore();
  }

  isAlive() {
    return this.alive;
  }

  hasArrived() {
    return this.arrived;
  }
}
