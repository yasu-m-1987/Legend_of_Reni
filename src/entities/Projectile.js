import { audioSynth } from '../core/audioSynth.js';

/**
 * 弾・投擲物クラス（魔法弾・矢・ビーム・岩石弾）
 * アグニムの魔法弾打ち返しギミック、氷壁融解ギミックを内蔵
 */
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, dx, dy, type, owner = 'player') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(16, 16);
    this.body.setOffset(8, 8);

    this.type = type; // 'fireball', 'arrow', 'beam', 'magic-ball', 'rock-proj'
    this.owner = owner; // 'player' or 'enemy'
    this.canReflect = (type === 'magic-ball'); // アグニムの魔法弾は剣で打ち返し可能
    this.isReflected = false;

    // 壁との衝突で消滅
    scene.physics.add.collider(this, scene.walls, () => this.destroy());

    // 氷ブロックとの衝突（ファイアボールで溶かすギミック）
    if (scene.iceBlocks) {
      scene.physics.add.collider(this, scene.iceBlocks, (p, ice) => {
        if (this.type === 'fireball' && scene.meltIceBlock) {
          scene.meltIceBlock(ice);
        }
        this.destroy();
      });
    }

    scene.projectiles.add(this);
    this.body.setVelocity(dx, dy);
  }

  // 剣攻撃で打ち返す（神トラ名物ギミック）
  reflect(targetX, targetY) {
    if (!this.canReflect || this.isReflected) return false;

    this.isReflected = true;
    this.owner = 'player';
    this.setTexture('magic-ball-reflected');

    // ターゲット（アグニム等）に向かって高速反射
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const speed = 360;
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    audioSynth.playReflect();
    return true;
  }
}
