import { audioSynth } from '../core/audioSynth.js';
import { gameState } from '../core/gameState.js';
import { ITEMS, WORLDS } from '../config/constants.js';
import { Projectile } from './Projectile.js';
import { DropItem } from './DropItem.js';

/**
 * プレイヤー（れに）クラス
 * 即時剣攻撃、長押しチャージ回転斬り、盾オートガード、アイテム掲げ演出
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'reni-walk', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(16, 16);
    this.body.setOffset(8, 8);

    this.direction = 'down';
    this.isAttacking = false;
    this.isSpinning = false;
    this.isHolding = false;
    this.invulnerable = false;
    this.speed = 130;

    // 回転斬り（Spin Attack）用チャージ状態
    this.isCharging = false;
    this.chargeTime = 0;
    this.chargeThreshold = 500; // チャージに必要な時間 (ms)
    this.chargeSoundTimer = 0;

    // チャージエフェクト（刀身のきらめき）
    this.chargeGlow = scene.add.circle(x, y, 12, 0xffeb3b, 0).setDepth(20);

    // 入力キー
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    this.initAnimations(scene);
  }

  initAnimations(scene) {
    if (scene.anims.exists('walk-down')) return;

    scene.anims.create({
      key: 'walk-down',
      frames: [{ key: 'reni-walk', frame: 0 }, { key: 'reni-walk', frame: 1 }],
      frameRate: 6,
      repeat: -1
    });
    scene.anims.create({
      key: 'walk-up',
      frames: [{ key: 'reni-walk', frame: 2 }, { key: 'reni-walk', frame: 3 }],
      frameRate: 6,
      repeat: -1
    });
    scene.anims.create({
      key: 'walk-right',
      frames: [{ key: 'reni-walk', frame: 4 }, { key: 'reni-walk', frame: 5 }],
      frameRate: 6,
      repeat: -1
    });
  }

  update(time, delta) {
    if (this.isHolding) {
      this.body.setVelocity(0, 0);
      return;
    }

    this.handleMovement();
    this.handleAttackCharge(delta);

    // チャージオーラの追従
    if (this.chargeGlow) {
      this.chargeGlow.setPosition(this.x, this.y);
    }
  }

  // 移動処理
  handleMovement() {
    if (this.isAttacking && !this.isSpinning) {
      this.body.setVelocity(0, 0);
      return;
    }

    const isBunny = (gameState.currentWorld === WORLDS.DARK && !gameState.hasMoonPearl);
    if (isBunny) {
      this.setTexture('reni-bunny');
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= this.speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += this.speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= this.speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += this.speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.body.setVelocity(vx, vy);

    if (!isBunny) {
      if (vx < 0) {
        this.direction = 'left';
        this.setFlipX(true);
        this.play('walk-right', true);
      } else if (vx > 0) {
        this.direction = 'right';
        this.setFlipX(false);
        this.play('walk-right', true);
      } else if (vy < 0) {
        this.direction = 'up';
        this.setFlipX(false);
        this.play('walk-up', true);
      } else if (vy > 0) {
        this.direction = 'down';
        this.setFlipX(false);
        this.play('walk-down', true);
      } else {
        this.stop();
        if (this.direction === 'down') this.setTexture('reni-walk', 0);
        else if (this.direction === 'up') this.setTexture('reni-walk', 2);
        else if (this.direction === 'right') { this.setFlipX(false); this.setTexture('reni-walk', 4); }
        else if (this.direction === 'left') { this.setFlipX(true); this.setTexture('reni-walk', 4); }
      }
    }
  }

  // 攻撃ボタンの操作処理（押した瞬間に通常斬り、長押しでチャージ、離して回転斬り！）
  handleAttackCharge(delta) {
    const isBunny = (gameState.currentWorld === WORLDS.DARK && !gameState.hasMoonPearl);
    if (isBunny) return;

    // 剣を選択している時のみチャージ攻撃可能
    if (gameState.selectedItem !== ITEMS.SWORD) return;

    const justPressed = (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.jKey));
    const isDown = (this.spaceKey.isDown || this.jKey.isDown);

    // 1. ボタンを押した瞬間：即座に通常攻撃を発動し、チャージを開始！
    if (justPressed && !this.isAttacking && !this.isCharging) {
      this.executeSlash();
      this.isCharging = true;
      this.chargeTime = 0;
      this.chargeSoundTimer = 0;
    }

    // 2. ボタンを押し続けている間：チャージカウント
    if (this.isCharging && isDown) {
      this.chargeTime += delta;
      this.chargeSoundTimer += delta;

      if (this.chargeTime >= this.chargeThreshold) {
        this.chargeGlow.setAlpha(0.6 + 0.3 * Math.sin(Date.now() / 80));
        if (this.chargeSoundTimer > 180) {
          audioSynth.playSpinCharge(Math.floor(this.chargeTime / 100));
          this.chargeSoundTimer = 0;
        }
      }
    }

    // 3. ボタンを離した時：チャージ完了していれば回転斬り発動！
    if (this.isCharging && !isDown) {
      if (this.chargeTime >= this.chargeThreshold) {
        this.executeSpinAttack();
      }
      this.isCharging = false;
      this.chargeTime = 0;
      this.chargeGlow.setAlpha(0);
    }
  }

  // 通常の剣撃
  executeSlash() {
    if (this.isAttacking) return;
    this.isAttacking = true;

    audioSynth.playSlash();
    this.showSlashEffect();
    this.checkMeleeHits(false);

    // 体力満タン＋マスターソードでビーム
    if (gameState.hasMasterSword && gameState.playerHealth >= gameState.playerMaxHealth) {
      this.fireBeam();
    }

    this.scene.time.delayedCall(220, () => {
      this.isAttacking = false;
    });
  }

  // 回転斬り（Spin Attack）
  executeSpinAttack() {
    this.isAttacking = true;
    this.isSpinning = true;

    audioSynth.playSpinRelease();

    const ring = this.scene.add.sprite(this.x, this.y, 'spin-ring');
    ring.setScale(1.8).setDepth(25);
    this.scene.tweens.add({
      targets: ring,
      angle: 360,
      scale: 2.4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy()
    });

    let rot = 0;
    const spinInterval = setInterval(() => {
      rot += 90;
      this.setAngle(rot);
    }, 40);

    this.checkMeleeHits(true);

    this.scene.time.delayedCall(360, () => {
      clearInterval(spinInterval);
      this.setAngle(0);
      this.isAttacking = false;
      this.isSpinning = false;
    });
  }

  // 近接ヒット判定（敵・魔法弾・草刈り）
  checkMeleeHits(isSpin = false) {
    const range = isSpin ? 46 : 28;
    let hitBox;

    if (isSpin) {
      hitBox = new Phaser.Geom.Circle(this.x, this.y, range);
    } else {
      let ax = this.x;
      let ay = this.y;
      if (this.direction === 'down') ay += range;
      else if (this.direction === 'up') ay -= range;
      else if (this.direction === 'right') ax += range;
      else if (this.direction === 'left') ax -= range;
      hitBox = new Phaser.Geom.Rectangle(ax - 16, ay - 16, 32, 32);
    }

    // 1. 草刈り判定
    if (this.scene.bushes) {
      this.scene.bushes.getChildren().forEach(bush => {
        if (!bush || !bush.active) return;
        const inRange = isSpin ?
          Phaser.Geom.Intersects.CircleToRectangle(hitBox, bush.getBounds()) :
          Phaser.Geom.Intersects.RectangleToRectangle(hitBox, bush.getBounds());

        if (inRange) {
          this.cutBush(bush);
        }
      });
    }

    // 2. 敵の魔法弾打ち返し判定
    if (this.scene.projectiles) {
      this.scene.projectiles.getChildren().forEach(proj => {
        if (!proj || !proj.active || proj.owner !== 'enemy') return;
        const inRange = isSpin ?
          Phaser.Geom.Intersects.CircleToRectangle(hitBox, proj.getBounds()) :
          Phaser.Geom.Intersects.RectangleToRectangle(hitBox, proj.getBounds());

        if (inRange && proj.canReflect) {
          const agahnim = this.scene.enemies.getChildren().find(e => e.type === 'agahnim' && e.active);
          const tx = agahnim ? agahnim.x : this.x;
          const ty = agahnim ? agahnim.y : this.y - 200;
          proj.reflect(tx, ty);
          this.scene.showBanner("魔法弾を跳ね返した！");
        }
      });
    }

    // 3. 敵へのダメージ判定
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().forEach(enemy => {
        if (!enemy || !enemy.active || !enemy.body) return;
        const inRange = isSpin ?
          Phaser.Geom.Intersects.CircleToRectangle(hitBox, enemy.getBounds()) :
          Phaser.Geom.Intersects.RectangleToRectangle(hitBox, enemy.getBounds());

        if (inRange) {
          let baseDamage = gameState.hasMasterSword ? 3 : 1;
          if (isSpin) baseDamage *= 2;

          let isDead = false;

          if (enemy.type === 'agahnim') {
            enemy.takeDamage(0, 0, 0, false);
          } else if (enemy.type === 'ganon') {
            if (!gameState.hasMasterSword) {
              this.scene.showBanner("マスターソードでないと効かない！");
            } else {
              const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
              isDead = enemy.takeDamage(baseDamage, Math.cos(kbAngle) * 200, Math.sin(kbAngle) * 200);
            }
          } else if (enemy.type === 'moldorm') {
            const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.x, this.y);
            const moveAngle = Math.atan2(enemy.body.velocity.y, enemy.body.velocity.x);
            const diff = Phaser.Math.Angle.Wrap(angleToPlayer - moveAngle);
            if (Math.abs(diff) > Math.PI * 0.45) {
              this.scene.showBanner("弱点にヒット！");
              isDead = enemy.takeDamage(baseDamage);
            } else {
              this.scene.showBanner("頭部は硬い！後ろから狙え！");
              audioSynth.playShieldBlock();
            }
          } else {
            const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            isDead = enemy.takeDamage(baseDamage, Math.cos(kbAngle) * 180, Math.sin(kbAngle) * 180);
          }

          // ボス撃破時の処理を確実に発火
          if (isDead && this.scene.onEnemyDefeated) {
            this.scene.onEnemyDefeated(enemy);
          }
        }
      });
    }
  }

  cutBush(bush) {
    audioSynth.playGrassCut();

    if (this.scene.createLeafBurst) {
      this.scene.createLeafBurst(bush.x, bush.y);
    }

    const roll = Math.random();
    if (roll < 0.25) {
      new DropItem(this.scene, bush.x, bush.y, 'drop-heart', 'heart');
    } else if (roll < 0.45) {
      new DropItem(this.scene, bush.x, bush.y, 'drop-magic', 'magic');
    } else if (roll < 0.60) {
      new DropItem(this.scene, bush.x, bush.y, 'drop-arrow', 'arrow');
    }

    bush.destroy();
  }

  canBlockProjectile(proj) {
    const angleToProj = Phaser.Math.Angle.Between(this.x, this.y, proj.x, proj.y);
    let facingAngle = 0;
    if (this.direction === 'right') facingAngle = 0;
    else if (this.direction === 'down') facingAngle = Math.PI / 2;
    else if (this.direction === 'left') facingAngle = Math.PI;
    else if (this.direction === 'up') facingAngle = -Math.PI / 2;

    const diff = Phaser.Math.Angle.Wrap(angleToProj - facingAngle);
    return Math.abs(diff) < Math.PI * 0.4;
  }

  fireBeam() {
    let dx = 0;
    let dy = 0;
    const speed = 280;
    if (this.direction === 'left') dx = -speed;
    else if (this.direction === 'right') dx = speed;
    else if (this.direction === 'up') dy = -speed;
    else if (this.direction === 'down') dy = speed;

    new Projectile(this.scene, this.x, this.y, 'beam', dx, dy, 'beam', 'player');
    audioSynth.playArrow();
  }

  showSlashEffect() {
    let sx = this.x;
    let sy = this.y;
    let frame = 0;
    let flipX = false;
    let flipY = false;

    if (this.direction === 'right') { sx += 22; frame = 0; }
    else if (this.direction === 'left') { sx -= 22; frame = 0; flipX = true; }
    else if (this.direction === 'down') { sy += 22; frame = 1; }
    else if (this.direction === 'up') { sy -= 22; frame = 1; flipY = true; }

    const slash = this.scene.add.sprite(sx, sy, 'slash-effect', frame);
    slash.setFlip(flipX, flipY);
    slash.setDepth(20);

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.4,
      duration: 160,
      onComplete: () => slash.destroy()
    });
  }

  holdItem(itemTextureKey, callback) {
    this.isHolding = true;
    this.setTexture('reni-hold');
    this.body.setVelocity(0, 0);

    const itemSprite = this.scene.add.sprite(this.x, this.y - 24, itemTextureKey);
    itemSprite.setScale(1.5).setDepth(50);

    audioSynth.playFanfare();

    this.scene.time.delayedCall(2200, () => {
      itemSprite.destroy();
      this.setTexture('reni-walk', 0);
      this.isHolding = false;
      if (callback) callback();
    });
  }
}
