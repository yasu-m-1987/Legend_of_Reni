import { DEPTH } from '../config/constants.js';

/**
 * 回収アイテムクラス（ハート・魔力・矢・ハートのうつわ）
 */
export class DropItem extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {object} [options]
   * @param {boolean} [options.persistent] true なら時間で消えない（ハートのうつわ等）
   * @param {string} [options.id] 一度きりのアイテムの識別子
   */
  constructor(scene, x, y, texture, type, options = {}) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type; // 'heart', 'magic', 'arrow', 'container'
    this.itemId = options.id || null;
    this.body.setSize(16, 16);
    this.setDepth(DEPTH.OBJECT);
    scene.drops.add(this);

    this.shadow = scene.add.image(x, y + 10, 'shadow').setDepth(DEPTH.SHADOW).setScale(0.6);

    // ゆっくりフワフワ浮くエフェクト
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    if (options.persistent) {
      // きらめき
      scene.tweens.add({ targets: this, scale: { from: 1, to: 1.12 }, duration: 700, yoyo: true, repeat: -1 });
      return;
    }

    // 5秒後に点滅、8秒後に消滅
    scene.time.delayedCall(5000, () => {
      if (this.active) {
        scene.tweens.add({
          targets: this,
          alpha: 0.2,
          duration: 150,
          yoyo: true,
          repeat: 10
        });
      }
    });

    scene.time.delayedCall(8000, () => {
      if (this.active) this.destroy();
    });
  }

  destroy(fromScene) {
    if (this.scene) this.scene.tweens.killTweensOf(this);
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    super.destroy(fromScene);
  }
}
