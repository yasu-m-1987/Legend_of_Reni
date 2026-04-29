// ========================================
// BIOHAZARD RENI - Neon Glow Effect
// ========================================

export class NeonGlow {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.signs = [];
    this.time = 0;

    // Create neon signs in the background
    this._createSigns();
  }

  _createSigns() {
    const colors = [
      { r: 255, g: 0, b: 80 },   // Pink
      { r: 0, g: 255, b: 65 },   // Green (biohazard)
      { r: 0, g: 120, b: 255 },  // Blue
      { r: 255, g: 150, b: 0 },  // Orange
    ];

    for (let i = 0; i < 5; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.signs.push({
        x: 200 + Math.random() * (this.width - 400),
        y: 30 + Math.random() * 120,
        width: 40 + Math.random() * 80,
        height: 15 + Math.random() * 30,
        color,
        flickerSpeed: 2 + Math.random() * 5,
        flickerPhase: Math.random() * Math.PI * 2,
        baseIntensity: 0.3 + Math.random() * 0.4,
        broken: Math.random() < 0.3, // some signs flicker erratically
      });
    }
  }

  update(dt) {
    this.time += dt;
  }

  render(ctx) {
    ctx.save();

    for (const sign of this.signs) {
      let intensity;

      if (sign.broken) {
        // Erratic flickering
        intensity = sign.baseIntensity *
          (Math.sin(this.time * sign.flickerSpeed * 7) > 0.3 ? 1 : 0.1) *
          (Math.sin(this.time * 3.7 + sign.flickerPhase) * 0.5 + 0.5);
      } else {
        // Gentle pulse
        intensity = sign.baseIntensity *
          (0.7 + 0.3 * Math.sin(this.time * sign.flickerSpeed + sign.flickerPhase));
      }

      const { r, g, b } = sign.color;

      // Glow
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${intensity})`;
      ctx.shadowBlur = 30;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.5})`;
      ctx.fillRect(sign.x, sign.y, sign.width, sign.height);

      // Reflection on ground (subtle)
      const reflGradient = ctx.createLinearGradient(
        sign.x + sign.width / 2, this.height - 60,
        sign.x + sign.width / 2, this.height
      );
      reflGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.03})`);
      reflGradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.shadowBlur = 0;
      ctx.fillStyle = reflGradient;
      ctx.fillRect(sign.x - 20, this.height - 60, sign.width + 40, 60);
    }

    ctx.restore();
  }
}
