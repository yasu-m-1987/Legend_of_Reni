import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { audioSynth } from '../../core/audioSynth.js';
import { TILE_SIZE } from '../../config/constants.js';

/**
 * デグサード（Lanmola）- 砂漠のボス
 * 砂中に潜行し、プレイヤーの足元から急浮上して岩石を撒き散らす
 */
export class Lanmola extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss-lanmola', {
      type: 'lanmola',
      health: 6,
      speed: 110,
      isBoss: true
    });

    this.isSubmerged = false;
    this.timerEvents = [];

    const actionTimer = scene.time.addEvent({
      delay: 3000,
      callback: () => {
        if (!this.active) return;
        const player = scene.player;
        if (!player) return;

        if (!this.isSubmerged) {
          // 潜行
          this.isSubmerged = true;
          this.setVisible(false);
          this.body.enable = false;
          this.body.setVelocity(0, 0);
        } else {
          // 浮上
          this.isSubmerged = false;
          this.setVisible(true);
          this.body.enable = true;

          const angle = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * 60;
          this.x = Phaser.Math.Clamp(player.x + Math.cos(angle) * dist, 11 * TILE_SIZE, 29 * TILE_SIZE);
          this.y = Phaser.Math.Clamp(player.y + Math.sin(angle) * dist, 9 * TILE_SIZE, 23 * TILE_SIZE);

          const pAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          this.body.setVelocity(Math.cos(pAngle) * this.speed, Math.sin(pAngle) * this.speed);

          audioSynth.playHurt();

          // 8方向に岩石弾を飛散
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const rdx = Math.cos(a) * 150;
            const rdy = Math.sin(a) * 150;
            const rock = new Projectile(scene, this.x, this.y, 'rock-proj', rdx, rdy, 'rock-proj', 'enemy');
            rock.setTint(0xcd853f);
          }
        }
      },
      loop: true
    });

    this.timerEvents.push(actionTimer);
  }
}
