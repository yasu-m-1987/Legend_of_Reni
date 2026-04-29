// ========================================
// BIOHAZARD RENI - Stage Backgrounds (Canvas)
// ========================================
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

// --- Base class ---
class StageBase {
  constructor() { this.time = 0; }
  update(dt) { this.time += dt; }
  render(ctx) {}
}

// --- 1. Mansion (洋館) ---
export class MansionBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Dark wood gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0c0808'); bg.addColorStop(0.5, '#140e0a'); bg.addColorStop(1, '#0a0604');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Wall panels
    ctx.strokeStyle = 'rgba(80, 50, 30, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 160) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.82); ctx.stroke();
    }
    // Wainscoting
    ctx.fillStyle = 'rgba(60, 35, 20, 0.15)';
    ctx.fillRect(0, H * 0.55, W, 4);

    // Windows (2 dark windows with moonlight)
    for (const wx of [W * 0.35, W * 0.65]) {
      // Window frame
      ctx.fillStyle = 'rgba(20, 15, 10, 0.8)';
      ctx.fillRect(wx - 40, 60, 80, 120);
      // Moonlight glow
      const a = 0.06 + Math.sin(this.time * 0.5) * 0.02;
      const grd = ctx.createRadialGradient(wx, 120, 10, wx, 120, 100);
      grd.addColorStop(0, `rgba(140, 160, 200, ${a})`);
      grd.addColorStop(1, 'rgba(140, 160, 200, 0)');
      ctx.fillStyle = grd; ctx.fillRect(wx - 100, 20, 200, 200);
      // Window panes
      ctx.strokeStyle = 'rgba(100, 70, 40, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx - 35, 65, 70, 110);
      ctx.beginPath(); ctx.moveTo(wx, 65); ctx.lineTo(wx, 175); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx - 35, 120); ctx.lineTo(wx + 35, 120); ctx.stroke();
    }

    // Chandelier shadow
    ctx.strokeStyle = 'rgba(100, 80, 50, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, 40); ctx.stroke();
    ctx.beginPath(); ctx.arc(W * 0.5, 45, 30, 0, Math.PI * 2); ctx.stroke();
    // Faint candle flicker
    const fl = 0.04 + Math.sin(this.time * 8) * 0.015;
    const cg = ctx.createRadialGradient(W * 0.5, 45, 5, W * 0.5, 45, 80);
    cg.addColorStop(0, `rgba(255, 180, 80, ${fl})`); cg.addColorStop(1, 'rgba(255, 180, 80, 0)');
    ctx.fillStyle = cg; ctx.fillRect(W * 0.5 - 80, 0, 160, 130);

    // Floor tiles
    ctx.fillStyle = '#0e0907';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.strokeStyle = 'rgba(80, 55, 35, 0.1)';
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, H * 0.82); ctx.lineTo(x, H); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, H * 0.9); ctx.lineTo(W, H * 0.9); ctx.stroke();
  }
}

// --- 2. Village (スペインの寒村) ---
export class VillageBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Night sky
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#040812'); bg.addColorStop(0.4, '#0a1020'); bg.addColorStop(1, '#080610');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Moon
    const moonGlow = ctx.createRadialGradient(W * 0.8, 80, 15, W * 0.8, 80, 120);
    moonGlow.addColorStop(0, 'rgba(200, 210, 230, 0.12)');
    moonGlow.addColorStop(1, 'rgba(200, 210, 230, 0)');
    ctx.fillStyle = moonGlow; ctx.fillRect(W * 0.65, 0, 300, 250);
    ctx.fillStyle = 'rgba(200, 210, 230, 0.15)';
    ctx.beginPath(); ctx.arc(W * 0.8, 80, 20, 0, Math.PI * 2); ctx.fill();

    // Mountain silhouette
    ctx.fillStyle = '#0c1018';
    ctx.beginPath(); ctx.moveTo(0, 280);
    ctx.lineTo(200, 180); ctx.lineTo(400, 230); ctx.lineTo(550, 150);
    ctx.lineTo(700, 200); ctx.lineTo(900, 170); ctx.lineTo(1100, 220);
    ctx.lineTo(W, 260); ctx.lineTo(W, 400); ctx.lineTo(0, 400); ctx.fill();

    // House silhouettes
    const houses = [[100, 0.7], [300, 0.65], [500, 0.72], [800, 0.62], [1050, 0.68]];
    for (const [hx, ht] of houses) {
      const hy = H * ht;
      const hw = 50 + Math.sin(hx) * 15;
      const hh = 50 + Math.cos(hx) * 15;
      ctx.fillStyle = '#0a0e16';
      ctx.fillRect(hx, hy - hh, hw, hh);
      // Roof
      ctx.beginPath(); ctx.moveTo(hx - 5, hy - hh);
      ctx.lineTo(hx + hw / 2, hy - hh - 20); ctx.lineTo(hx + hw + 5, hy - hh); ctx.fill();
      // Window (dim light)
      if (Math.sin(hx * 3) > 0) {
        ctx.fillStyle = `rgba(200, 150, 50, ${0.04 + Math.sin(this.time * 2 + hx) * 0.015})`;
        ctx.fillRect(hx + hw * 0.3, hy - hh + 10, 10, 12);
      }
    }

    // Fog layers
    for (let i = 0; i < 3; i++) {
      const fy = H * (0.55 + i * 0.1);
      const fa = 0.03 + Math.sin(this.time * 0.3 + i) * 0.01;
      ctx.fillStyle = `rgba(120, 130, 150, ${fa})`;
      ctx.fillRect(0, fy, W, 40);
    }

    // Ground (dirt road)
    ctx.fillStyle = '#0a0810';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    // Path stones
    ctx.fillStyle = 'rgba(60, 50, 40, 0.08)';
    for (let x = 30; x < W; x += 70 + Math.sin(x) * 20) {
      ctx.beginPath();
      ctx.ellipse(x, H * 0.88, 15 + Math.sin(x) * 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- 3. Lab (研究所) ---
export class LabBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Cold metallic
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#080a10'); bg.addColorStop(0.5, '#0a0c14'); bg.addColorStop(1, '#060810');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Metal wall panels
    ctx.strokeStyle = 'rgba(60, 80, 100, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 200) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.82); ctx.stroke();
      // Rivets
      for (let y = 30; y < H * 0.8; y += 80) {
        ctx.fillStyle = 'rgba(80, 100, 120, 0.08)';
        ctx.beginPath(); ctx.arc(x + 5, y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - 5, y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Warning stripe
    ctx.fillStyle = 'rgba(200, 180, 0, 0.06)';
    ctx.fillRect(0, H * 0.78, W, 6);

    // Alert light (pulsing red)
    const ra = 0.03 + Math.sin(this.time * 3) * 0.02;
    const rl = ctx.createRadialGradient(W * 0.15, 30, 5, W * 0.15, 30, 100);
    rl.addColorStop(0, `rgba(255, 40, 40, ${ra})`); rl.addColorStop(1, 'rgba(255, 40, 40, 0)');
    ctx.fillStyle = rl; ctx.fillRect(0, 0, W * 0.3, 150);
    ctx.fillStyle = `rgba(255, 50, 50, ${0.1 + Math.sin(this.time * 3) * 0.06})`;
    ctx.beginPath(); ctx.arc(W * 0.15, 30, 6, 0, Math.PI * 2); ctx.fill();

    // Monitor screens
    for (const mx of [W * 0.5, W * 0.7]) {
      ctx.fillStyle = 'rgba(10, 15, 20, 0.9)';
      ctx.fillRect(mx - 25, 80, 50, 35);
      ctx.strokeStyle = 'rgba(0, 200, 100, 0.15)';
      ctx.strokeRect(mx - 25, 80, 50, 35);
      // Scanline noise
      const sa = 0.08 + Math.sin(this.time * 10 + mx) * 0.04;
      ctx.fillStyle = `rgba(0, 255, 100, ${sa})`;
      for (let sy = 82; sy < 113; sy += 3) {
        const sw = 20 + Math.sin(this.time * 5 + sy + mx) * 15;
        ctx.fillRect(mx - sw / 2, sy, sw, 1);
      }
    }

    // Floor (metal grating)
    ctx.fillStyle = '#080a0e';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.strokeStyle = 'rgba(60, 80, 100, 0.08)';
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, H * 0.82); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = H * 0.82; y < H; y += 15) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }
}

// --- 4. Castle (城) ---
export class CastleBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Dark stone
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0808'); bg.addColorStop(0.5, '#0e0a0a'); bg.addColorStop(1, '#080606');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Stone wall blocks
    ctx.strokeStyle = 'rgba(70, 60, 50, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H * 0.82; y += 40) {
      const off = (Math.floor(y / 40) % 2) * 50;
      for (let x = off; x < W; x += 100) {
        ctx.strokeRect(x, y, 100, 40);
      }
    }

    // Gothic arches
    for (const ax of [W * 0.25, W * 0.55, W * 0.85]) {
      ctx.strokeStyle = 'rgba(80, 60, 50, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax - 40, H * 0.6);
      ctx.quadraticCurveTo(ax - 40, 100, ax, 60);
      ctx.quadraticCurveTo(ax + 40, 100, ax + 40, H * 0.6);
      ctx.stroke();
    }

    // Torches
    for (const tx of [W * 0.2, W * 0.5, W * 0.8]) {
      // Bracket
      ctx.fillStyle = 'rgba(80, 60, 40, 0.2)';
      ctx.fillRect(tx - 3, 200, 6, 20);
      // Flame
      const fi = 0.08 + Math.sin(this.time * 6 + tx) * 0.03;
      const fg = ctx.createRadialGradient(tx, 195, 3, tx, 195, 50);
      fg.addColorStop(0, `rgba(255, 150, 40, ${fi})`);
      fg.addColorStop(0.4, `rgba(255, 80, 20, ${fi * 0.5})`);
      fg.addColorStop(1, 'rgba(255, 50, 10, 0)');
      ctx.fillStyle = fg;
      ctx.fillRect(tx - 50, 150, 100, 100);
      // Flame shape
      ctx.fillStyle = `rgba(255, 180, 50, ${fi * 1.5})`;
      ctx.beginPath();
      ctx.moveTo(tx - 4, 200);
      ctx.quadraticCurveTo(tx - 6, 185 + Math.sin(this.time * 8 + tx) * 3, tx, 178 + Math.sin(this.time * 10 + tx) * 2);
      ctx.quadraticCurveTo(tx + 6, 185 + Math.cos(this.time * 8 + tx) * 3, tx + 4, 200);
      ctx.fill();
    }

    // Banner
    ctx.fillStyle = 'rgba(120, 20, 20, 0.1)';
    ctx.fillRect(W * 0.45, 40, 40, 80);
    ctx.fillStyle = 'rgba(180, 150, 50, 0.06)';
    ctx.beginPath(); ctx.arc(W * 0.45 + 20, 70, 10, 0, Math.PI * 2); ctx.fill();

    // Floor (stone)
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.strokeStyle = 'rgba(70, 55, 45, 0.08)';
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, H * 0.82); ctx.lineTo(x, H); ctx.stroke();
    }
  }
}

// Factory
export function createStageBackground(stageId) {
  switch (stageId) {
    case 'mansion': return new MansionBackground();
    case 'village': return new VillageBackground();
    case 'lab': return new LabBackground();
    case 'castle': return new CastleBackground();
    default: return new MansionBackground();
  }
}
