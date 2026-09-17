import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { audioSynth } from '../../core/audioSynth.js';
import { TILE_SIZE } from '../../config/constants.js';

/**
 * 司祭アグニム（Agahnim）
 * 神々のトライフォース名物：魔法弾の剣打ち返しギミック
 * 通常時はバリアを纏い直接攻撃が無効。打ち返した黄金弾のみがダメージを与える！
 */
export class Agahnim extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss-agahnim', {
      type: 'agahnim',
      health: 4,
      speed: 70,
      isBoss: true
    });

    this.hasBarrier = true; // 魔法バリア
    this.timerEvents = [];

    // バリアオーラ（青紫の光）
    this.barrierGlow = scene.add.circle(x, y, 22, 0x9b59b6, 0.35);
    scene.physics.add.existing(this.barrierGlow);

    // テレポート＆魔法弾AI
    const teleportTimer = scene.time.addEvent({
      delay: 3500,
      callback: () => {
        if (!this.active) return;
        const player = scene.player;
        if (!player) return;

        // 指定エリア（城・神殿の祭壇）内をランダムテレポート
        const tc = 17 + Math.floor(Math.random() * 7); // c=17..23
        const tr = 3 + Math.floor(Math.random() * 3);  // r=3..5
        this.x = tc * TILE_SIZE + 16;
        this.y = tr * TILE_SIZE + 16;
        this.body.setVelocity(0, 0);

        if (this.barrierGlow) {
          this.barrierGlow.setPosition(this.x, this.y);
        }

        scene.cameras.main.flash(200, 156, 39, 176, true);

        // テレポート後に大魔法弾を発射（打ち返し可能）
        scene.time.delayedCall(800, () => {
          if (!this.active) return;
          audioSynth.playFireball();

          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          const speed = 120;
          const dx = Math.cos(angle) * speed;
          const dy = Math.sin(angle) * speed;

          const ball = new Projectile(
            scene,
            this.x,
            this.y,
            'magic-ball',
            dx,
            dy,
            'magic-ball',
            'enemy'
          );
          ball.setTint(0xba68c8);
        });
      },
      loop: true
    });

    this.timerEvents.push(teleportTimer);
  }

  // プレイヤーの直接攻撃に対するバリア判定
  takeDamage(amount, knockbackDx = 0, knockbackDy = 0, isReflected = false) {
    if (!isReflected && this.hasBarrier) {
      // 剣で直接斬りかかった場合はバリアで弾かれる演出
      audioSynth.playShieldBlock();
      if (this.scene.createSpark) {
        this.scene.createSpark(this.x, this.y, 0x9b59b6);
      }
      this.scene.showBanner("直接攻撃は効かない！魔法弾を跳ね返せ！");
      return false;
    }

    // 打ち返された魔法弾が直撃した時
    return super.takeDamage(amount, knockbackDx, knockbackDy);
  }

  die() {
    if (this.barrierGlow) {
      this.barrierGlow.destroy();
    }
    super.die();
  }

  destroy(fromScene) {
    if (this.barrierGlow) {
      this.barrierGlow.destroy();
    }
    super.destroy(fromScene);
  }
}
