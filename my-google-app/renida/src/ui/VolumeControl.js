// ========================================
// BIOHAZARD RENI - Volume Control (Canvas overlay)
// ========================================
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';

export class VolumeControl {
  constructor() {
    this.visible = false;
    this.selectedIndex = 0;
    this.sliders = [
      { label: 'MASTER', key: 'master', get: 'getMasterVolume', set: 'setMasterVolume', max: 1.0 },
      { label: 'SFX', key: 'sfx', get: 'getSFXVolume', set: 'setSFXVolume', max: 1.0 },
      { label: 'BGM', key: 'bgm', get: 'getBGMVolume', set: 'setBGMVolume', max: 0.3 },
    ];
  }

  toggle() { this.visible = !this.visible; }
  isVisible() { return this.visible; }

  handleKey(e, audio) {
    if (!this.visible) return false;
    if (e.key === 'm' || e.key === 'M' || e.key === 'Escape') {
      this.visible = false; return true;
    }
    if (e.key === 'ArrowUp') { this.selectedIndex = Math.max(0, this.selectedIndex - 1); return true; }
    if (e.key === 'ArrowDown') { this.selectedIndex = Math.min(this.sliders.length - 1, this.selectedIndex + 1); return true; }
    const s = this.sliders[this.selectedIndex];
    const step = s.max * 0.05;
    if (e.key === 'ArrowLeft') {
      const cur = audio[s.get]();
      audio[s.set](Math.max(0, cur - step));
      return true;
    }
    if (e.key === 'ArrowRight') {
      const cur = audio[s.get]();
      audio[s.set](Math.min(s.max, cur + step));
      return true;
    }
    return true; // consume all keys while open
  }

  render(ctx, audio) {
    if (!this.visible) return;
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);

    const panelW = 400, panelH = 200;
    const px = (W - panelW) / 2, py = (H - panelH) / 2;

    // Panel
    ctx.fillStyle = 'rgba(10, 15, 25, 0.95)';
    ctx.strokeStyle = COLORS.NEON_GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 8); ctx.fill(); ctx.stroke();

    // Title
    ctx.textAlign = 'center';
    ctx.font = `bold 18px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.shadowColor = COLORS.NEON_GREEN; ctx.shadowBlur = 6;
    ctx.fillText('SOUND SETTINGS', W / 2, py + 32);
    ctx.shadowBlur = 0;

    // Sliders
    const sliderX = px + 130, sliderW = 200, sliderY0 = py + 60;
    for (let i = 0; i < this.sliders.length; i++) {
      const s = this.sliders[i];
      const y = sliderY0 + i * 42;
      const selected = i === this.selectedIndex;
      const val = audio[s.get]() / s.max;

      // Label
      ctx.textAlign = 'right';
      ctx.font = `12px 'Orbitron', sans-serif`;
      ctx.fillStyle = selected ? COLORS.NEON_GREEN : COLORS.TEXT_DIM;
      ctx.fillText(s.label, sliderX - 15, y + 4);

      // Track
      ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      ctx.fillRect(sliderX, y - 4, sliderW, 8);
      ctx.strokeStyle = selected ? COLORS.NEON_GREEN : 'rgba(80,80,80,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sliderX, y - 4, sliderW, 8);

      // Fill
      ctx.fillStyle = selected ? COLORS.NEON_GREEN : 'rgba(0, 200, 60, 0.4)';
      ctx.fillRect(sliderX, y - 4, sliderW * val, 8);

      // Knob
      const kx = sliderX + sliderW * val;
      ctx.fillStyle = selected ? '#fff' : '#aaa';
      ctx.beginPath(); ctx.arc(kx, y, selected ? 7 : 5, 0, Math.PI * 2); ctx.fill();

      // Value
      ctx.textAlign = 'left';
      ctx.font = `10px 'Share Tech Mono', monospace`;
      ctx.fillStyle = COLORS.TEXT_DIM;
      ctx.fillText(`${Math.round(val * 100)}%`, sliderX + sliderW + 12, y + 4);
    }

    // Hint
    ctx.textAlign = 'center';
    ctx.font = `10px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(150,150,150,0.5)';
    ctx.fillText('↑↓ SELECT  ←→ ADJUST  [M/ESC] CLOSE', W / 2, py + panelH - 16);
  }
}
