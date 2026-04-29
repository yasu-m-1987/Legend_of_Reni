// ========================================
// BIOHAZARD RENI - Cerberus (高速変異犬)
// ========================================
import { Creature } from './Creature.js';

export class Cerberus extends Creature {
  constructor(config) {
    super(config);
    this.width = 55;
    this.height = 45;
    this.legPhase = Math.random() * Math.PI * 2;
    this.snarling = false;
    this.snarlTimer = 0;
    this.zigzagPhase = Math.random() * Math.PI * 2;
    this.zigzagAmplitude = 30;
    this.wobbleSpeed = 4;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.legPhase += dt * this.speed * 0.08;
      this.zigzagPhase += dt * 2.5;
      this.baseY += Math.cos(this.zigzagPhase) * this.zigzagAmplitude * dt;
      this.baseY = Math.max(200, Math.min(550, this.baseY));
      this.snarlTimer += dt;
      this.snarling = Math.sin(this.snarlTimer * 5) > 0.5;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const deathAlpha = this.dying ? 1 - (this.deathTimer / this.deathDuration) : 1;
    if (this.dying) {
      ctx.scale(1 + this.deathTimer * 0.5, 1 + this.deathTimer * 0.5);
      ctx.globalAlpha = deathAlpha;
    }
    if (this.hitFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20 * this.hitFlash; }

    const baseColor = this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;

    // Body
    ctx.fillStyle = baseColor;
    ctx.beginPath(); ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.shadowColor = this.type.glowColor; ctx.shadowBlur = 6 * glowAmt;
    ctx.beginPath(); ctx.ellipse(-24, -4, 14, 9, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-36, -2, 8, 5, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Ears
    ctx.beginPath(); ctx.moveTo(-20, -12); ctx.lineTo(-18, -24); ctx.lineTo(-14, -10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-28, -10); ctx.lineTo(-30, -22); ctx.lineTo(-24, -10); ctx.fill();

    // Eyes
    ctx.fillStyle = this.type.glowColor; ctx.shadowColor = this.type.glowColor; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(-26, -6, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-20, -6, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Mouth
    const mouthOpen = this.snarling ? 4 : 1;
    ctx.fillStyle = '#1a0505';
    ctx.beginPath(); ctx.ellipse(-36, 1 + mouthOpen, 7, 2 + mouthOpen, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-40+i*3,1); ctx.lineTo(-39+i*3, 3+mouthOpen*0.7); ctx.lineTo(-38+i*3,1); ctx.fill();
    }

    // Legs
    ctx.strokeStyle = baseColor; ctx.lineWidth = 3;
    const la = Math.sin(this.legPhase), la2 = Math.cos(this.legPhase);
    ctx.beginPath(); ctx.moveTo(-14,8); ctx.lineTo(-18+la*8,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8,8); ctx.lineTo(-4-la*8,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18,8); ctx.lineTo(14+la2*8,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24,8); ctx.lineTo(28-la2*8,22); ctx.stroke();

    // Tail
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(28,-4); ctx.quadraticCurveTo(38,-14,42+Math.sin(this.glowPulse)*3,-8); ctx.stroke();

    if (this.dying) {
      for (let i = 0; i < 10; i++) {
        const a = (i/10)*Math.PI*2, d = this.deathTimer*100;
        ctx.fillStyle = `rgba(139,0,0,${deathAlpha*0.7})`;
        ctx.beginPath(); ctx.arc(Math.cos(a)*d, Math.sin(a)*d, 2+Math.random()*5, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
    if (!this.dying) this.renderWord(ctx);
  }
}
