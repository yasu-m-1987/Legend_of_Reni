// ========================================
// BIOHAZARD RENI - Character Select Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, CHARACTERS, COLORS } from '../utils/constants.js';
import { Rain } from '../effects/Rain.js';

const charList = Object.values(CHARACTERS);

export class CharacterSelectScene extends Scene {
  constructor() {
    super();
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.selectedIndex = 0;
    this.hoverAlpha = charList.map(() => 0);
    this.time = 0;
    this.mode = null;
    this.previewAnim = 0;
  }

  async enter(data) {
    this.mode = data.mode;
    this.selectedIndex = 0;
    this.time = 0;
    this.previewAnim = 0;

    this._keyUnsub = this.game.input.onKey((e) => {
      const count = charList.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + count) % count;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % count;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.game.audio.playGunshot();
        this.game.switchScene('loading', {
          mode: this.mode,
          character: charList[this.selectedIndex],
        });
      } else if (e.key === 'Escape') {
        this.game.switchScene('modeSelect');
      } else if (e.key >= '1' && e.key <= String(count)) {
        this.selectedIndex = parseInt(e.key) - 1;
        this.game.audio.playGunshot();
        this.game.switchScene('loading', {
          mode: this.mode,
          character: charList[this.selectedIndex],
        });
      }
    });
  }

  exit() { super.exit(); }

  update(dt) {
    this.time += dt;
    this.previewAnim += dt;
    this.rain.update(dt);

    for (let i = 0; i < charList.length; i++) {
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

    ctx.save();

    // Header
    ctx.textAlign = 'center';
    ctx.font = `bold 28px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.TEXT_PRIMARY;
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 8;
    ctx.fillText('SELECT AGENT', W / 2, 60);
    ctx.shadowBlur = 0;

    ctx.font = `13px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.fillText(`${this.mode.name} CLASS // CHOOSE YOUR OPERATIVE`, W / 2, 88);

    // Character cards
    const count = charList.length;
    const cardW = 220, cardH = 320, gap = 24;
    const totalW = cardW * count + gap * (count - 1);
    const startX = (W - totalW) / 2;
    const cardY = 120;

    for (let i = 0; i < count; i++) {
      const char = charList[i];
      const x = startX + i * (cardW + gap);
      const selected = i === this.selectedIndex;
      const alpha = this.hoverAlpha[i];
      const color = char.accentColor;

      // Card background
      ctx.fillStyle = `rgba(10, 15, 25, ${0.85 + alpha * 0.1})`;
      ctx.strokeStyle = selected ? color : `rgba(80, 80, 80, 0.25)`;
      ctx.lineWidth = selected ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(x, cardY, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      // Glow
      if (selected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, cardY, cardW, cardH, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Character preview (cat silhouette)
      const cx = x + cardW / 2;
      const cy = cardY + 100;
      this._renderCharPreview(ctx, cx, cy, char, selected, alpha);

      // Name
      ctx.textAlign = 'center';
      ctx.font = `bold 18px 'Orbitron', sans-serif`;
      ctx.fillStyle = selected ? color : `rgba(200,200,200,${0.4 + alpha * 0.4})`;
      ctx.fillText(char.name, cx, cardY + 185);

      // Title
      ctx.font = `11px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = `rgba(200,200,200,${0.3 + alpha * 0.4})`;
      ctx.fillText(char.title, cx, cardY + 205);

      // Description
      ctx.font = `10px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = `rgba(180,180,180,${0.25 + alpha * 0.3})`;
      const desc = char.description;
      // Simple word wrap
      if (desc.length > 14) {
        ctx.fillText(desc.substring(0, 14), cx, cardY + 230);
        ctx.fillText(desc.substring(14), cx, cardY + 245);
      } else {
        ctx.fillText(desc, cx, cardY + 235);
      }

      // Ability box
      if (selected || alpha > 0.3) {
        const boxY = cardY + 260;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.1})`;
        ctx.strokeStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 15, boxY, cardW - 30, 36, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = `8px 'Orbitron', sans-serif`;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.6})`;
        ctx.fillText('ABILITY', cx, boxY + 12);

        ctx.font = `bold 10px 'Noto Sans JP', sans-serif`;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.9})`;
        ctx.fillText(char.ability, cx, boxY + 28);
      }

      // Number hint
      ctx.font = `10px 'Share Tech Mono', monospace`;
      ctx.fillStyle = `rgba(150,150,150,0.3)`;
      ctx.fillText(`[${i + 1}]`, cx, cardY + cardH - 8);
    }

    // Selected character spotlight line
    const selChar = charList[this.selectedIndex];
    const selX = startX + this.selectedIndex * (cardW + gap) + cardW / 2;
    ctx.strokeStyle = `rgba(${this._hexToRgb(selChar.accentColor)}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(selX, cardY + cardH + 10);
    ctx.lineTo(selX, H - 60);
    ctx.stroke();

    // Bottom hints
    ctx.textAlign = 'center';
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = `rgba(0, 255, 65, ${0.4 + Math.sin(this.time * 3) * 0.15})`;
    ctx.fillText('← → SELECT  //  ENTER DEPLOY', W / 2, H - 50);
    ctx.fillStyle = 'rgba(100,100,100,0.35)';
    ctx.fillText('[ESC] BACK TO MISSION SELECT', W / 2, H - 28);

    ctx.restore();
  }

  _renderCharPreview(ctx, cx, cy, char, selected, alpha) {
    ctx.save();
    ctx.translate(cx, cy);

    const breathe = selected ? Math.sin(this.previewAnim * 2) * 2 : 0;
    const scale = 1.6 + alpha * 0.15;
    ctx.scale(scale, scale);
    ctx.translate(0, breathe);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Tail (behind body) ===
    ctx.strokeStyle = char.bodyColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (char.tailStyle === 'long') {
      ctx.moveTo(-8, 18);
      ctx.quadraticCurveTo(-22, 6 + Math.sin(this.previewAnim * 1.5) * 5, -24, -4);
    } else if (char.tailStyle === 'short') {
      ctx.moveTo(-8, 18);
      ctx.quadraticCurveTo(-14, 14, -12, 10);
    } else if (char.tailStyle === 'fluffy') {
      ctx.lineWidth = 5;
      ctx.moveTo(-8, 18);
      ctx.quadraticCurveTo(-18, 6, -14, -2 + Math.sin(this.previewAnim * 1.5) * 3);
    } else { // curled
      ctx.moveTo(-8, 18);
      ctx.bezierCurveTo(-16, 10, -22, 2, -14, 5 + Math.sin(this.previewAnim) * 2);
    }
    ctx.stroke();
    // Tail stripes
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.lineCap = 'butt';

    // === Body (キジトラ) ===
    ctx.fillStyle = char.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter)
    ctx.fillStyle = char.bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, 14, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body stripes (キジトラ模様)
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.5;
    for (let s = -2; s <= 2; s++) {
      ctx.beginPath();
      ctx.moveTo(-10, -2 + s * 6);
      ctx.quadraticCurveTo(0, -5 + s * 6, 10, -2 + s * 6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === Head ===
    ctx.fillStyle = char.headColor || char.bodyColor;
    ctx.beginPath();
    ctx.arc(0, -20, 11, 0, Math.PI * 2);
    ctx.fill();

    // Head stripes (forehead M mark)
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.5;
    // M pattern on forehead
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(-4, -28);
    ctx.lineTo(-1, -25);
    ctx.lineTo(1, -28);
    ctx.lineTo(4, -28);
    ctx.lineTo(6, -26);
    ctx.stroke();
    // Side stripes
    ctx.beginPath();
    ctx.moveTo(-8, -22); ctx.lineTo(-10, -20); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -22); ctx.lineTo(10, -20); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // === Ears ===
    // Outer ear (same as body)
    ctx.fillStyle = char.headColor || char.bodyColor;
    ctx.beginPath();
    ctx.moveTo(-7, -28); ctx.lineTo(-11, -40); ctx.lineTo(-2, -29); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -28); ctx.lineTo(11, -40); ctx.lineTo(2, -29); ctx.closePath(); ctx.fill();

    // Inner ear (pink)
    ctx.fillStyle = char.earInner;
    ctx.beginPath();
    ctx.moveTo(-6, -29); ctx.lineTo(-9, -37); ctx.lineTo(-3, -30); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -29); ctx.lineTo(9, -37); ctx.lineTo(3, -30); ctx.closePath(); ctx.fill();

    // === Eyes ===
    // Eye whites
    ctx.fillStyle = '#eeeedd';
    ctx.beginPath(); ctx.ellipse(-4, -21, 2.8, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -21, 2.8, 2.8, 0, 0, Math.PI * 2); ctx.fill();

    // Pupils (colored, glowing)
    ctx.fillStyle = char.eyeColor;
    ctx.shadowColor = char.eyeGlow;
    ctx.shadowBlur = selected ? 10 : 5;
    ctx.beginPath(); ctx.ellipse(-4, -21, 1.5, 2.0, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -21, 1.5, 2.0, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Pupil slit highlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(-4.5, -22, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, -22, 0.6, 0, Math.PI * 2); ctx.fill();

    // === Nose ===
    ctx.fillStyle = char.noseColor;
    ctx.beginPath();
    ctx.moveTo(0, -16.5); ctx.lineTo(-2, -14.5); ctx.lineTo(2, -14.5);
    ctx.closePath(); ctx.fill();

    // === Mouth ===
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -14.5); ctx.lineTo(0, -13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, -12.5); ctx.quadraticCurveTo(0, -11, 3, -12.5);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = 'rgba(200,180,150,0.4)';
    ctx.lineWidth = 0.5;
    // Left
    ctx.beginPath(); ctx.moveTo(-6, -15); ctx.lineTo(-16, -17); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(-16, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -13); ctx.lineTo(-15, -11); ctx.stroke();
    // Right
    ctx.beginPath(); ctx.moveTo(6, -15); ctx.lineTo(16, -17); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -14); ctx.lineTo(16, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -13); ctx.lineTo(15, -11); ctx.stroke();

    // === Front paws ===
    ctx.fillStyle = char.bellyColor;
    ctx.beginPath(); ctx.ellipse(-5, 28, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, 28, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Paw pads
    ctx.fillStyle = char.noseColor;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(-5, 29, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 29, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;

    // === Gun (held in right paw) ===
    ctx.fillStyle = '#444';
    ctx.fillRect(10, -6, 12, 4);
    ctx.fillRect(12, -3, 3, 6);

    // Gun muzzle detail
    ctx.fillStyle = '#333';
    ctx.fillRect(20, -7, 3, 6);

    ctx.restore();
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
