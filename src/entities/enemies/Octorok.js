import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { audioSynth } from '../../core/audioSynth.js';

/**
 * オクタロック（通常敵）
 * 歩き回り、時々プレイヤーに向かって岩石弾を吐く（盾で防御可能）
 */
export class Octorok extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy-octorok', {
      type: 'octorok',
      health: 2,
      speed: 55
    });

    this.timerEvents = [];

    // 移動AI
    const moveTimer = scene.time.addEvent({
      delay: 1200,
      callback: () => {
        if (!this.active) return;
        const player = scene.player;
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 260) {
          this.body.setVelocity((dx / dist) * this.speed, (dy / dist) * this.speed);
        } else {
          const angle = Math.random() * Math.PI * 2;
          this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        }
      },
      loop: true
    });
    this.timerEvents.push(moveTimer);

    // 岩石発射AI (3秒に1回)
    const shootTimer = scene.time.addEvent({
      delay: 3000 + Math.random() * 1000,
      callback: () => {
        if (!this.active) return;
        const player = scene.player;
        if (!player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist < 320) {
          audioSynth.playArrow();
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          const rockSpeed = 130;
          const rock = new Projectile(
            scene,
            this.x,
            this.y,
            'rock-proj',
            Math.cos(angle) * rockSpeed,
            Math.sin(angle) * rockSpeed,
            'rock-proj',
            'enemy'
          );
          rock.setTint(0xcd853f);
        }
      },
      loop: true
    });
    this.timerEvents.push(shootTimer);
  }
}
