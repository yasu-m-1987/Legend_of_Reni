import { audioSynth } from '../../core/audioSynth.js';
import { DEPTH } from '../../config/constants.js';
import { DropItem } from '../DropItem.js';

/**
 * 敵キャラクター基底クラス
 * HP管理・被弾・ノックバック・撃破時爆発エフェクト・ドロップ抽選・足元の影を担当
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, config = {}) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(config.boxWidth || 20, config.boxHeight || 20);
    this.body.setOffset(config.offsetX || 6, config.offsetY || 6);

    this.type = config.type || 'enemy';
    this.health = config.health || 2;
    this.maxHealth = this.health;
    this.speed = config.speed || 60;
    this.isBoss = config.isBoss || false;
    this.invulnerable = false;
    this.timerEvents = [];

    this.shadow = scene.add.image(x, y + 14, 'shadow').setDepth(DEPTH.SHADOW);
    if (this.isBoss) this.shadow.setScale(1.6, 1.4);

    scene.enemies.add(this);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + this.displayHeight / 2 - 2);
      this.shadow.setVisible(this.visible);
    }
    this.setDepth(DEPTH.ENTITY + this.y / 100);
  }

  // ダメージ処理
  takeDamage(amount, knockbackDx = 0, knockbackDy = 0) {
    if (this.invulnerable || !this.active) return false;

    this.health -= amount;
    this.invulnerable = true;

    // 白く点滅
    this.setTintFill(0xffffff);

    // ノックバック
    if (knockbackDx !== 0 || knockbackDy !== 0) {
      this.body.setVelocity(knockbackDx, knockbackDy);
    }

    this.scene.time.delayedCall(this.isBoss ? 260 : 160, () => {
      if (this.active) {
        this.clearTint();
        this.invulnerable = false;
      }
    });

    audioSynth.playEnemyHit();

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  // 撃破処理
  die() {
    const scene = this.scene;
    if (this.isBoss) {
      audioSynth.playBossExplode();
      scene.cameras.main.shake(500, 0.01);
      if (scene.createBossExplosion) scene.createBossExplosion(this.x, this.y);
    } else {
      audioSynth.playEnemyExplode();
      if (scene.createExplosion) scene.createExplosion(this.x, this.y);
      this.dropLoot();
    }
    this.destroy();
  }

  dropLoot() {
    const roll = Math.random();
    if (roll < 0.35) {
      new DropItem(this.scene, this.x, this.y, 'drop-heart', 'heart');
    } else if (roll < 0.55) {
      new DropItem(this.scene, this.x, this.y, 'drop-magic', 'magic');
    } else if (roll < 0.75) {
      new DropItem(this.scene, this.x, this.y, 'drop-arrow', 'arrow');
    }
  }

  destroy(fromScene) {
    if (this.timerEvents) {
      this.timerEvents.forEach(t => t.remove(false));
      this.timerEvents = [];
    }
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    super.destroy(fromScene);
  }
}
