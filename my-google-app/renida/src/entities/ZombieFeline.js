// ========================================
// BIOHAZARD RENI - Zombie Feline (ゾンビキャット)
// ========================================

import { Creature } from './Creature.js';
import { COLORS } from '../utils/constants.js';

export class ZombieFeline extends Creature {
  constructor(config) {
    super(config);
    this.width = 45;
    this.height = 40;
    this.legPhase = Math.random() * Math.PI * 2;
    this.jawOpen = 0;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.legPhase += dt * this.speed * 0.05;
      this.jawOpen = Math.sin(this.legPhase * 0.5) * 0.3 + 0.3;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const deathAlpha = this.dying ? 1 - (this.deathTimer / this.deathDuration) : 1;
    const deathScale = this.dying ? 1 + this.deathTimer * 0.5 : 1;

    if (this.dying) {
      ctx.scale(deathScale, deathScale);
      ctx.globalAlpha = deathAlpha;
    }

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 20 * this.hitFlash;
    }

    const baseColor = this.dying ? '#1a0a0a' : this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;

    // Body
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Toxic glow
    ctx.shadowColor = this.type.glowColor;
    ctx.shadowBlur = 8 * glowAmt;

    // Head
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(-18, -8, 12, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ears (pointed, torn)
    ctx.beginPath();
    ctx.moveTo(-24, -16);
    ctx.lineTo(-30, -28);
    ctx.lineTo(-20, -18);
    ctx.fillStyle = baseColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-14, -16);
    ctx.lineTo(-10, -26);
    ctx.lineTo(-12, -15);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Eyes (glowing)
    ctx.fillStyle = this.type.glowColor;
    ctx.shadowColor = this.type.glowColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(-22, -10, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-14, -10, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupils (slit)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(-22, -10, 0.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-14, -10, 0.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (open with teeth)
    ctx.fillStyle = '#2a0a0a';
    ctx.beginPath();
    ctx.ellipse(-18, -1 + this.jawOpen * 3, 5, 2 + this.jawOpen * 3, 0, 0, Math.PI);
    ctx.fill();

    // Fangs
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(-21, -1);
    ctx.lineTo(-20, 3 + this.jawOpen * 2);
    ctx.lineTo(-19, -1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-17, -1);
    ctx.lineTo(-16, 3 + this.jawOpen * 2);
    ctx.lineTo(-15, -1);
    ctx.fill();

    // Legs (animated)
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 3;
    const legAnim = Math.sin(this.legPhase);

    // Front legs
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(-12 + legAnim * 4, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(-3 - legAnim * 4, 22);
    ctx.stroke();

    // Back legs
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(16 - legAnim * 4, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, 10);
    ctx.lineTo(20 + legAnim * 4, 22);
    ctx.stroke();

    // Tail (twitching)
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(22, -2);
    ctx.quadraticCurveTo(
      32 + Math.sin(this.glowPulse) * 5,
      -10 + Math.cos(this.glowPulse * 1.3) * 8,
      38 + Math.sin(this.glowPulse * 0.7) * 3,
      -15
    );
    ctx.stroke();

    // Death effect - blood splatter
    if (this.dying) {
      ctx.globalAlpha = deathAlpha;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = this.deathTimer * 80;
        ctx.fillStyle = `rgba(139, 0, 0, ${deathAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * dist,
          Math.sin(angle) * dist,
          3 + Math.random() * 4,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();

    // Render word above creature
    if (!this.dying) {
      this.renderWord(ctx);
    }
  }
}
