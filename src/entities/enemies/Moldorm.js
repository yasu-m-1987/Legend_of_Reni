import { Enemy } from './Enemy.js';

/**
 * デグテール（Moldorm）- 闇の神殿のボス
 * 高速かつ予測不能にうねりながら突進する大型ボス
 */
export class Moldorm extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss-moldorm', {
      type: 'moldorm',
      health: 6,
      speed: 120,
      isBoss: true
    });

    this.timerEvents = [];

    // 頻繁に方向転換しながら高速移動
    const moveTimer = scene.time.addEvent({
      delay: 400,
      callback: () => {
        if (!this.active) return;
        const angle = Math.random() * Math.PI * 2;
        this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
      },
      loop: true
    });

    this.timerEvents.push(moveTimer);
  }
}
