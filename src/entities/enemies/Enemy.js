import { audioSynth } from '../../core/audioSynth.js';
import { DropItem } from '../DropItem.js';

/**
 * 敵キャラクター基底クラス
 * HP管理・被弾・ノックバック・撃破時爆発エフェクト・ドロップ抽選を担当
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

    scene.enemies.add(this);
  }

  // ダメージ処理
  takeDamage(amount, knockbackDx = 0, knockbackDy = 0) {
    if (this.invulnerable || !this.active) return false;

    this.health -= amount;
    this.invulnerable = true;

    // 白く点滅
    this.setTint(0xffffff);

    // ノックバック
    if (knockbackDx !== 0 || knockbackDy !== 0) {
      this.body.setVelocity(knockbackDx, knockbackDy);
    }

    this.scene.time.delayedCall(160, () => {
      if (this.active) {
        this.clearTint();
        this.invulnerable = false;
      }
    });

    audioSynth.playHurt();

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  // 撃破処理
  die() {
    audioSynth.playEnemyExplode();

    // 煙爆発エフェクト（キラキラパーティクル）
    if (this.scene.createExplosion) {
      this.scene.createExplosion(this.x, this.y);
    }

    // アイテムドロップ抽選
    this.dropLoot();
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
    }
    super.destroy(fromScene);
  }
}
