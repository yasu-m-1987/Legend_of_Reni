// ========================================
// BIOHAZARD RENI - Tyrant "RENI" (最強の生物兵器)
// ========================================
import { Creature } from './Creature.js';

export class Tyrant extends Creature {
  constructor(config) {
    super(config);
    this.width = 80;
    this.height = 100;
    this.armPhase = 0;
    this.breathPhase = 0;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.armPhase += dt * 2;
      this.breathPhase += dt * 1.5;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const deathAlpha = this.dying ? 1 - (this.deathTimer / this.deathDuration) : 1;
    if (this.dying) {
      ctx.scale(1 + this.deathTimer * 0.3, 1 + this.deathTimer * 0.3);
      ctx.globalAlpha = deathAlpha;
    }
    if (this.hitFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 25 * this.hitFlash; }

    const bc = this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;
    const breathScale = 1 + Math.sin(this.breathPhase) * 0.02;

    ctx.scale(breathScale, breathScale);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 50, 35, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Legs
    ctx.fillStyle = bc;
    ctx.fillRect(-18, 20, 12, 35);
    ctx.fillRect(6, 20, 12, 35);

    // Torso
    ctx.shadowColor = this.type.glowColor; ctx.shadowBlur = 10 * glowAmt;
    ctx.fillStyle = bc;
    ctx.beginPath(); ctx.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Exposed muscle/veins
    ctx.strokeStyle = `rgba(180, 40, 40, 0.4)`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-15 + i * 7, -20);
      ctx.quadraticCurveTo(-10 + i * 7, 0, -15 + i * 7, 20);
      ctx.stroke();
    }

    // Arms
    const armSwing = Math.sin(this.armPhase) * 8;
    ctx.fillStyle = bc; ctx.strokeStyle = bc; ctx.lineWidth = 8;
    // Left arm
    ctx.beginPath(); ctx.moveTo(-25, -10); ctx.lineTo(-35 - armSwing, 15); ctx.stroke();
    // Right arm (mutated, larger)
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(25, -10); ctx.lineTo(40 + armSwing, 20); ctx.stroke();
    // Claw on right arm
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(40 + armSwing, 18 + i * 4);
      ctx.lineTo(50 + armSwing, 14 + i * 4);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = bc;
    ctx.beginPath(); ctx.ellipse(0, -35, 14, 12, 0, 0, Math.PI * 2); ctx.fill();

    // Eyes (intense glow)
    ctx.fillStyle = this.type.glowColor; ctx.shadowColor = this.type.glowColor; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.ellipse(-6, -37, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -37, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Mouth
    ctx.fillStyle = '#1a0505';
    ctx.fillRect(-8, -30, 16, 4);
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-7+i*2.5, -30);
      ctx.lineTo(-6+i*2.5, -27);
      ctx.lineTo(-5+i*2.5, -30);
      ctx.fill();
    }

    // TYRANT label
    ctx.font = `bold 10px 'Orbitron', sans-serif`;
    ctx.fillStyle = `rgba(170, 58, 255, ${glowAmt * 0.7})`;
    ctx.textAlign = 'center';
    ctx.fillText('▼ TYRANT ▼', 0, -52);

    if (this.dying) {
      for (let i = 0; i < 15; i++) {
        const a = (i/15)*Math.PI*2, d = this.deathTimer*120;
        ctx.fillStyle = `rgba(90,0,120,${deathAlpha*0.6})`;
        ctx.beginPath(); ctx.arc(Math.cos(a)*d, Math.sin(a)*d, 3+Math.random()*6, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
    if (!this.dying) this.renderWord(ctx);
  }
}
