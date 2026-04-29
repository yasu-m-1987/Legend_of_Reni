// ========================================
// BIOHAZARD RENI - Muzzle Flash Effect
// ========================================

export class MuzzleFlash {
  constructor() {
    this.flashes = [];
  }

  trigger(x, y) {
    this.flashes.push({
      x,
      y,
      life: 0.08,
      maxLife: 0.08,
      size: 15 + Math.random() * 10,
      angle: Math.random() * Math.PI * 2,
    });
  }

  update(dt) {
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life -= dt;
      if (this.flashes[i].life <= 0) {
        this.flashes.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const flash of this.flashes) {
      const t = flash.life / flash.maxLife;
      const size = flash.size * (0.5 + t * 0.5);

      ctx.save();
      ctx.translate(flash.x, flash.y);
      ctx.rotate(flash.angle);

      // Outer glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
      gradient.addColorStop(0, `rgba(255, 200, 50, ${t * 0.8})`);
      gradient.addColorStop(0.3, `rgba(255, 120, 20, ${t * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core flash (star shape)
      ctx.fillStyle = `rgba(255, 255, 200, ${t})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = i % 2 === 0 ? size : size * 0.3;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  isActive() {
    return this.flashes.length > 0;
  }
}
