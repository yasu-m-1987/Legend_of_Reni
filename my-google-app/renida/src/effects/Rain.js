// ========================================
// BIOHAZARD RENI - Rain Particle System
// ========================================

export class Rain {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.drops = [];
    this.splashes = [];
    this.windAngle = 0.15; // slight wind
    this.intensity = 1.0;

    // Initialize drops
    for (let i = 0; i < 300; i++) {
      this.drops.push(this._createDrop());
    }
  }

  _createDrop() {
    return {
      x: Math.random() * (this.width + 200) - 100,
      y: Math.random() * this.height - this.height,
      length: 8 + Math.random() * 18,
      speed: 600 + Math.random() * 400,
      opacity: 0.1 + Math.random() * 0.25,
      thickness: 0.5 + Math.random() * 1,
    };
  }

  update(dt) {
    for (const drop of this.drops) {
      drop.y += drop.speed * dt;
      drop.x += drop.speed * this.windAngle * dt;

      if (drop.y > this.height) {
        // Create splash
        if (Math.random() < 0.3) {
          this.splashes.push({
            x: drop.x,
            y: this.height - 5 + Math.random() * 10,
            radius: 1 + Math.random() * 2,
            life: 0.15,
            maxLife: 0.15,
          });
        }
        Object.assign(drop, this._createDrop());
        drop.y = -drop.length;
      }
    }

    // Update splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      this.splashes[i].life -= dt;
      this.splashes[i].radius += dt * 8;
      if (this.splashes[i].life <= 0) {
        this.splashes.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Rain drops
    for (const drop of this.drops) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(150, 170, 200, ${drop.opacity * this.intensity})`;
      ctx.lineWidth = drop.thickness;
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(
        drop.x + this.windAngle * drop.length,
        drop.y + drop.length
      );
      ctx.stroke();
    }

    // Splashes
    for (const splash of this.splashes) {
      const alpha = (splash.life / splash.maxLife) * 0.3;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(150, 170, 200, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
