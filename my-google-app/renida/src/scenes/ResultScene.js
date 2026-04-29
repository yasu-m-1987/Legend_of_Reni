// ========================================
// BIOHAZARD RENI - Result Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RANKS } from '../utils/constants.js';
import { saveScore } from '../utils/storage.js';

export class ResultScene extends Scene {
  constructor() {
    super();
    this.data = null;
    this.rank = null;
    this.revealPhase = 0;
    this.time = 0;
    this.scanlineOffset = 0;
    this.statsRevealed = 0;
  }

  async enter(data) {
    this.data = data;
    this.time = 0;
    this.revealPhase = 0;
    this.statsRevealed = 0;

    // Calculate rank
    const surplus = data.score - data.mode.cost;
    if (surplus >= RANKS.S.minSurplus) this.rank = RANKS.S;
    else if (surplus >= RANKS.A.minSurplus) this.rank = RANKS.A;
    else if (surplus >= RANKS.B.minSurplus) this.rank = RANKS.B;
    else this.rank = RANKS.FAIL;

    // Save score
    saveScore(data.mode.id, {
      score: data.score,
      kills: data.kills,
      accuracy: data.accuracy,
      maxCombo: data.combo,
      rank: this.rank.label,
    });

    const hud = document.getElementById('hud-overlay');
    hud.style.display = 'none';

    this._keyUnsub = this.game.input.onKey((e) => {
      if (this.time < 2) return; // Prevent accidental skip
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        this.game.audio.playMenuSelect();
        this.game.switchScene('loading', { mode: this.data.mode, character: this.data.character });
      } else if (e.key === 'Escape' || e.key === 't' || e.key === 'T') {
        this.game.audio.playMenuSelect();
        this.game.switchScene('title');
      }
    });
  }

  exit() { super.exit(); }

  update(dt) {
    this.time += dt;
    this.scanlineOffset += dt * 20;
    this.revealPhase = Math.min(1, this.time / 2.5);
    this.statsRevealed = Math.min(8, Math.floor(this.time / 0.25));
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const d = this.data;
    const surplus = d.score - d.mode.cost;

    // Background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Scanlines
    ctx.fillStyle = 'rgba(0,255,65,0.015)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    ctx.save();
    ctx.textAlign = 'center';

    // Header
    ctx.font = `bold 16px 'Orbitron', sans-serif`;
    ctx.fillStyle = 'rgba(200,200,200,0.4)';
    ctx.fillText('MISSION REPORT', W / 2, 50);

    ctx.font = `bold 12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(200,200,200,0.3)';
    const charName = d.character ? d.character.name : 'NORA';
    ctx.fillText(`${d.mode.name} CLASS // AGENT ${charName}`, W / 2, 72);

    // Rank display (large, centered)
    if (this.revealPhase > 0.3) {
      const rankAlpha = Math.min(1, (this.revealPhase - 0.3) / 0.3);
      const rankColor = this.rank === RANKS.S ? '#ffd700'
        : this.rank === RANKS.A ? COLORS.NEON_GREEN
        : this.rank === RANKS.B ? COLORS.AMBER
        : COLORS.BLOOD_RED_BRIGHT;

      // Rank letter
      ctx.font = `900 100px 'Orbitron', sans-serif`;
      ctx.fillStyle = `rgba(${this._hexToRgb(rankColor)}, ${rankAlpha})`;
      ctx.shadowColor = rankColor;
      ctx.shadowBlur = 30 * rankAlpha;
      ctx.fillText(this.rank.label === '-' ? '✕' : this.rank.label, W / 2, 190);
      ctx.shadowBlur = 0;

      // Rank title
      ctx.font = `bold 18px 'Orbitron', sans-serif`;
      ctx.fillStyle = `rgba(${this._hexToRgb(rankColor)}, ${rankAlpha * 0.8})`;
      ctx.fillText(this.rank.title, W / 2, 225);

      // Reward
      if (this.rank !== RANKS.FAIL) {
        ctx.font = `12px 'Share Tech Mono', monospace`;
        ctx.fillStyle = `rgba(200,200,200,${rankAlpha * 0.5})`;
        ctx.fillText(`REWARD: ${this.rank.reward}`, W / 2, 248);
      }
    }

    // Stats panel
    if (this.revealPhase > 0.5) {
      const panelAlpha = Math.min(1, (this.revealPhase - 0.5) / 0.3);
      const panelX = W / 2 - 250;
      const panelY = 275;
      const panelW = 500;
      const panelH = 240;

      ctx.fillStyle = `rgba(10, 15, 25, ${panelAlpha * 0.8})`;
      ctx.strokeStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 6);
      ctx.fill();
      ctx.stroke();

      const stats = [
        { label: 'SCORE', value: `$${d.score.toLocaleString()}`, color: COLORS.NEON_GREEN },
        { label: 'COST', value: `-$${d.mode.cost.toLocaleString()}`, color: COLORS.DANGER },
        { label: 'BALANCE', value: `$${surplus.toLocaleString()}`, color: surplus >= 0 ? COLORS.NEON_GREEN : COLORS.DANGER },
        { label: 'KILLS', value: `${d.kills}`, color: COLORS.TEXT_PRIMARY },
        { label: 'ACCURACY', value: `${d.accuracy}%`, color: d.accuracy >= 90 ? COLORS.NEON_GREEN : d.accuracy >= 70 ? COLORS.AMBER : COLORS.DANGER },
        { label: 'MAX COMBO', value: `${d.combo}`, color: COLORS.AMBER },
        { label: 'KEY/SEC', value: d.mode.timeLimit > 0 ? (d.hits / d.mode.timeLimit).toFixed(1) : '0', color: COLORS.TEXT_PRIMARY },
      ];

      ctx.textAlign = 'left';
      const statStartY = panelY + 35;

      for (let i = 0; i < Math.min(stats.length, this.statsRevealed); i++) {
        const s = stats[i];
        const sy = statStartY + i * 28;

        // Label
        ctx.font = `13px 'Share Tech Mono', monospace`;
        ctx.fillStyle = `rgba(150,150,150,${panelAlpha})`;
        ctx.fillText(s.label, panelX + 30, sy);

        // Separator dots
        ctx.fillStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
        const dotsX = panelX + 160;
        for (let dx = 0; dx < 180; dx += 6) {
          ctx.fillRect(dotsX + dx, sy - 3, 2, 1);
        }

        // Value
        ctx.textAlign = 'right';
        ctx.fillStyle = s.color;
        ctx.font = `bold 14px 'Share Tech Mono', monospace`;
        ctx.fillText(s.value, panelX + panelW - 30, sy);
        ctx.textAlign = 'left';
      }

      // Divider before balance
      if (this.statsRevealed >= 3) {
        ctx.strokeStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(panelX + 20, statStartY + 48);
        ctx.lineTo(panelX + panelW - 20, statStartY + 48);
        ctx.stroke();
      }
    }

    // Actions
    if (this.time > 2.5) {
      const actAlpha = Math.min(1, (this.time - 2.5) / 0.5);
      ctx.textAlign = 'center';
      ctx.font = `13px 'Share Tech Mono', monospace`;
      ctx.fillStyle = `rgba(0, 255, 65, ${actAlpha * (0.5 + Math.sin(this.time * 3) * 0.2)})`;
      ctx.fillText('[ENTER / R] RETRY MISSION', W / 2, H - 70);
      ctx.fillStyle = `rgba(150,150,150,${actAlpha * 0.4})`;
      ctx.fillText('[ESC / T] RETURN TO TITLE', W / 2, H - 45);
    }

    ctx.restore();
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
