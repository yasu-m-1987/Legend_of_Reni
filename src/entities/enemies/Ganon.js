import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { audioSynth } from '../../core/audioSynth.js';
import { TILE_SIZE } from '../../config/constants.js';

/**
 * 大魔王ガノン（Ganon）- 最終決戦ボス
 * ピラミッド最深部で待ち受ける魔王。炎の鳥と突進、テレポートを駆使する
 */
export class Ganon extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss-ganon', {
      type: 'ganon',
      health: 12,
      speed: 95,
      isBoss: true
    });

    this.timerEvents = [];

    const attackTimer = scene.time.addEvent({
      delay: 3500,
      callback: () => {
        if (!this.active) return;
        const player = scene.player;
        if (!player) return;

        // ピラミッド部屋の中央付近へテレポート
        const tc = 16 + Math.floor(Math.random() * 9);
        const tr = 8 + Math.floor(Math.random() * 8);
        this.x = tc * TILE_SIZE + 16;
        this.y = tr * TILE_SIZE + 16;
        this.body.setVelocity(0, 0);

        audioSynth.playFireball();

        // 6方向炎の弾幕
        const speed = 160;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          const finalAngle = angle + targetAngle;
          const fball = new Projectile(
            scene,
            this.x,
            this.y,
            'fireball',
            Math.cos(finalAngle) * speed,
            Math.sin(finalAngle) * speed,
            'fireball',
            'enemy'
          );
          fball.setTint(0xff3333);
        }

        // 突進攻撃
        scene.time.delayedCall(800, () => {
          if (!this.active) return;
          const pAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          this.body.setVelocity(Math.cos(pAngle) * this.speed * 1.5, Math.sin(pAngle) * this.speed * 1.5);
        });
      },
      loop: true
    });

    this.timerEvents.push(attackTimer);
  }
}
