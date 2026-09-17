/**
 * 回収アイテムクラス（ハート・魔力・矢）
 */
export class DropItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type; // 'heart', 'magic', 'arrow'
    this.body.setSize(16, 16);
    scene.drops.add(this);

    // ゆっくりフワフワ浮くエフェクト
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

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
}
