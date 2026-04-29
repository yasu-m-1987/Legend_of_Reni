// ========================================
// BIOHAZARD RENI - Screen Shake Effect
// ========================================

export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.maxDuration = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  trigger(intensity = 8, duration = 0.3) {
    this.intensity = intensity;
    this.duration = duration;
    this.maxDuration = duration;
  }

  update(dt) {
    if (this.duration > 0) {
      this.duration -= dt;
      const t = this.duration / this.maxDuration;
      const currentIntensity = this.intensity * t;
      this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
      this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  apply(ctx) {
    if (this.offsetX !== 0 || this.offsetY !== 0) {
      ctx.translate(this.offsetX, this.offsetY);
    }
  }

  isActive() {
    return this.duration > 0;
  }
}
