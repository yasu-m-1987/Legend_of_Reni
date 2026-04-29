// ========================================
// BIOHAZARD RENI - Lightning Effect
// ========================================

export class Lightning {
  constructor(width, height, audioManager) {
    this.width = width;
    this.height = height;
    this.audio = audioManager;
    this.active = false;
    this.flashIntensity = 0;
    this.bolts = [];
    this.timer = 5 + Math.random() * 10; // first lightning
    this.cooldown = 0;
  }

  update(dt) {
    this.timer -= dt;
    this.cooldown -= dt;

    if (this.timer <= 0 && this.cooldown <= 0) {
      this.trigger();
      this.timer = 8 + Math.random() * 15;
    }

    if (this.active) {
      this.flashIntensity -= dt * 3;
      if (this.flashIntensity <= 0) {
        this.flashIntensity = 0;
        this.active = false;
        this.bolts = [];
      }
    }
  }

  trigger() {
    this.active = true;
    this.flashIntensity = 1.0;
    this.cooldown = 3;
    this.bolts = [];

    // Generate bolt paths
    const numBolts = 1 + Math.floor(Math.random() * 2);
    for (let b = 0; b < numBolts; b++) {
      const bolt = [];
      let x = this.width * (0.2 + Math.random() * 0.6);
      let y = 0;
      const targetX = x + (Math.random() - 0.5) * 200;
      const segments = 8 + Math.floor(Math.random() * 8);

      for (let i = 0; i <= segments; i++) {
        bolt.push({ x, y });
        const t = i / segments;
        x += (targetX - x) * 0.1 + (Math.random() - 0.5) * 60;
        y += (this.height * 0.7) / segments;
      }
      this.bolts.push(bolt);
    }

    // Play thunder with delay
    setTimeout(() => {
      if (this.audio) this.audio.playThunder();
    }, 200 + Math.random() * 800);
  }

  render(ctx) {
    if (!this.active) return;

    // Screen flash
    ctx.save();
    ctx.fillStyle = `rgba(200, 210, 255, ${this.flashIntensity * 0.15})`;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw bolts
    for (const bolt of this.bolts) {
      // Glow
      ctx.shadowColor = '#aaccff';
      ctx.shadowBlur = 20 * this.flashIntensity;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(200, 220, 255, ${this.flashIntensity * 0.9})`;
      ctx.lineWidth = 3;
      ctx.moveTo(bolt[0].x, bolt[0].y);
      for (let i = 1; i < bolt.length; i++) {
        ctx.lineTo(bolt[i].x, bolt[i].y);
      }
      ctx.stroke();

      // Inner bright line
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
      ctx.lineWidth = 1;
      ctx.moveTo(bolt[0].x, bolt[0].y);
      for (let i = 1; i < bolt.length; i++) {
        ctx.lineTo(bolt[i].x, bolt[i].y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  getFlashIntensity() {
    return this.flashIntensity;
  }
}
