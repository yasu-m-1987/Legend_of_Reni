import { audioSynth } from '../core/audioSynth.js';
import { gameState } from '../core/gameState.js';
import { ITEMS, DEPTH } from '../config/constants.js';
import { Projectile } from './Projectile.js';
import { DropItem } from './DropItem.js';

const DIR_ANGLE = { right: 0, down: 90, left: 180, up: -90 };

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
    this.body.setOffset(8, 12);

    this.direction = 'down';
    this.isAttacking = false;
    this.isSpinning = false;
    this.isHolding = false;
    this.invulnerable = false;
    this.frozen = false; // 画面遷移・死亡演出中は操作不可
    this.speed = 130;

    // 回転斬り（Spin Attack）用チャージ状態
    this.isCharging = false;
    this.chargeTime = 0;
    this.chargeThreshold = 500; // チャージに必要な時間 (ms)
    this.chargeSoundTimer = 0;
    this.chargeReadyPlayed = false;

    // 足元の影
    this.shadow = scene.add.image(x, y + 14, 'shadow').setDepth(DEPTH.SHADOW);

    // チャージエフェクト（刀身のきらめき）
    this.chargeGlow = scene.add.image(x, y, 'px-glow')
      .setTint(0xffeb3b).setScale(2.4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.EFFECT);

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

  /** 攻撃ボタンが今押されたか（剣・アイテム共通） */
  attackJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.jKey);
  }

  update(time, delta) {
    this.shadow.setPosition(this.x, this.y + 14);
    this.chargeGlow.setPosition(this.x, this.y);
    this.setDepth(DEPTH.ENTITY + this.y / 100);

    if (this.isHolding || this.frozen) {
      this.body.setVelocity(0, 0);
      this.stop();
      return;
    }

    this.handleMovement();
    this.handleAttackCharge(delta);
  }

  // 移動処理
  handleMovement() {
    // ノックバック中は操作を受け付けない
    if (this.knockbackUntil && this.scene.time.now < this.knockbackUntil) return;

    if (this.isAttacking && !this.isSpinning) {
      this.body.setVelocity(0, 0);
      return;
    }

    const isBunny = gameState.isBunny;
    const speed = this.isCharging ? this.speed * 0.6 : this.speed;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.body.setVelocity(vx, vy);

    if (isBunny) {
      this.stop();
      this.setTexture('reni-bunny');
      if (vx < 0) { this.direction = 'left'; this.setFlipX(true); }
      else if (vx > 0) { this.direction = 'right'; this.setFlipX(false); }
      else if (vy < 0) this.direction = 'up';
      else if (vy > 0) this.direction = 'down';
      // ぴょこぴょこ跳ねる
      this.setOrigin(0.5, (vx || vy) ? 0.5 + Math.abs(Math.sin(this.scene.time.now / 90)) * 0.08 : 0.5);
      return;
    }
    this.setOrigin(0.5, 0.5);

    // チャージ中は向きを固定したまま移動（神トラと同じ）
    if (this.isCharging && this.chargeTime > 120) {
      if (vx === 0 && vy === 0) this.stop();
      return;
    }

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
      this.faceIdle();
    }
  }

  faceIdle() {
    this.stop();
    if (gameState.isBunny) {
      this.setTexture('reni-bunny');
      return;
    }
    if (this.direction === 'down') this.setTexture('reni-walk', 0);
    else if (this.direction === 'up') this.setTexture('reni-walk', 2);
    else if (this.direction === 'right') { this.setFlipX(false); this.setTexture('reni-walk', 4); }
    else if (this.direction === 'left') { this.setFlipX(true); this.setTexture('reni-walk', 4); }
  }

  // 攻撃ボタンの操作処理（押した瞬間に通常斬り、長押しでチャージ、離して回転斬り！）
  handleAttackCharge(delta) {
    if (gameState.isBunny) return;

    // 剣を選択している時のみチャージ攻撃可能
    if (gameState.selectedItem !== ITEMS.SWORD) return;

    const justPressed = this.attackJustPressed();
    const isDown = (this.spaceKey.isDown || this.jKey.isDown);

    // 1. ボタンを押した瞬間：即座に通常攻撃を発動し、チャージを開始！
    if (justPressed && !this.isAttacking && !this.isCharging) {
      this.executeSlash();
      this.isCharging = true;
      this.chargeTime = 0;
      this.chargeSoundTimer = 0;
      this.chargeReadyPlayed = false;
    }

    // 2. ボタンを押し続けている間：チャージカウント
    if (this.isCharging && isDown) {
      this.chargeTime += delta;
      this.chargeSoundTimer += delta;

      if (this.chargeTime >= this.chargeThreshold) {
        if (!this.chargeReadyPlayed) {
          this.chargeReadyPlayed = true;
          audioSynth.playChargeReady();
        }
        this.chargeGlow.setAlpha(0.55 + 0.3 * Math.sin(this.scene.time.now / 70));
        if (this.chargeSoundTimer > 180) {
          audioSynth.playSpinCharge(Math.floor(this.chargeTime / 100));
          this.chargeSoundTimer = 0;
        }
      } else {
        this.chargeGlow.setAlpha((this.chargeTime / this.chargeThreshold) * 0.25);
      }
    }

    // 3. ボタンを離した時：チャージ完了していれば回転斬り発動！
    if (this.isCharging && !isDown) {
      if (this.chargeTime >= this.chargeThreshold) {
        this.executeSpinAttack();
      }
      this.cancelCharge();
    }
  }

  cancelCharge() {
    this.isCharging = false;
    this.chargeTime = 0;
    this.chargeReadyPlayed = false;
    this.chargeGlow.setAlpha(0);
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
    ring.setScale(1.8).setDepth(DEPTH.EFFECT);
    this.scene.tweens.add({
      targets: ring,
      angle: 360,
      scale: 2.4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy()
    });

    // 4方向に向きを切り替えて回転を表現
    const order = ['down', 'left', 'up', 'right'];
    let step = order.indexOf(this.direction);
    this.scene.time.addEvent({
      delay: 45,
      repeat: 7,
      callback: () => {
        step = (step + 1) % 4;
        this.direction = order[step];
        this.faceIdle();
      }
    });

    this.checkMeleeHits(true);

    this.scene.time.delayedCall(380, () => {
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
    const hits = (obj) => (isSpin
      ? Phaser.Geom.Intersects.CircleToRectangle(hitBox, obj.getBounds())
      : Phaser.Geom.Intersects.RectangleToRectangle(hitBox, obj.getBounds()));

    // 1. 草刈り判定
    if (this.scene.bushes) {
      this.scene.bushes.getChildren().slice().forEach(bush => {
        if (bush && bush.active && hits(bush)) this.cutBush(bush);
      });
    }

    // 2. 敵の魔法弾打ち返し判定
    if (this.scene.projectiles) {
      this.scene.projectiles.getChildren().slice().forEach(proj => {
        if (!proj || !proj.active || proj.owner !== 'enemy' || !proj.canReflect) return;
        if (hits(proj)) this.scene.reflectProjectile(proj);
      });
    }

    // 3. 敵へのダメージ判定
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().slice().forEach(enemy => {
        if (!enemy || !enemy.active || !enemy.body || !enemy.body.enable || !enemy.visible) return;
        if (!hits(enemy)) return;

        let baseDamage = gameState.hasMasterSword ? 3 : 1;
        if (isSpin) baseDamage *= 2;

        let isDead = false;
        const kbAngle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);

        if (enemy.type === 'agahnim') {
          enemy.takeDamage(0, 0, 0, false);
        } else if (enemy.type === 'ganon') {
          if (!gameState.hasMasterSword) {
            this.scene.showBanner('マスターソードでないと効かない！');
            audioSynth.playShieldBlock();
          } else {
            isDead = enemy.takeDamage(baseDamage, Math.cos(kbAngle) * 200, Math.sin(kbAngle) * 200);
          }
        } else if (enemy.type === 'moldorm') {
          const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.x, this.y);
          const moveAngle = Math.atan2(enemy.body.velocity.y, enemy.body.velocity.x);
          const diff = Phaser.Math.Angle.Wrap(angleToPlayer - moveAngle);
          if (Math.abs(diff) > Math.PI * 0.45) {
            this.scene.showBanner('弱点にヒット！');
            isDead = enemy.takeDamage(baseDamage);
          } else {
            this.scene.showBanner('頭部は硬い！後ろから狙え！');
            audioSynth.playShieldBlock();
          }
        } else {
          isDead = enemy.takeDamage(baseDamage, Math.cos(kbAngle) * 180, Math.sin(kbAngle) * 180);
        }

        if (this.scene.createSpark) this.scene.createSpark(enemy.x, enemy.y, 0xffffff);

        // ボス撃破時の処理を確実に発火
        if (isDead && this.scene.onEnemyDefeated) {
          this.scene.onEnemyDefeated(enemy);
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
    if (gameState.isBunny || this.isHolding) return false;
    const angleToProj = Phaser.Math.Angle.Between(this.x, this.y, proj.x, proj.y);
    const facingAngle = Phaser.Math.DegToRad(DIR_ANGLE[this.direction]);
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
    const slash = this.scene.add.image(this.x, this.y, 'slash-arc')
      .setAngle(DIR_ANGLE[this.direction] - 50)
      .setDepth(DEPTH.EFFECT)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: slash,
      angle: DIR_ANGLE[this.direction] + 30,
      alpha: 0,
      scale: 1.15,
      duration: 170,
      ease: 'Quad.easeOut',
      onComplete: () => slash.destroy()
    });
  }

  holdItem(itemTextureKey, callback) {
    this.isHolding = true;
    this.cancelCharge();
    this.stop();
    this.setFlipX(false);
    this.setTexture('reni-hold');
    this.body.setVelocity(0, 0);

    const itemSprite = this.scene.add.sprite(this.x, this.y - 18, itemTextureKey);
    itemSprite.setScale(1.5).setDepth(DEPTH.EFFECT);
    this.scene.tweens.add({ targets: itemSprite, y: this.y - 30, duration: 300, ease: 'Back.easeOut' });

    // 後光
    const glow = this.scene.add.image(this.x, this.y - 30, 'px-glow')
      .setScale(4).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.EFFECT - 1);
    this.scene.tweens.add({ targets: glow, scale: 5, alpha: 0.3, duration: 500, yoyo: true, repeat: 1 });

    audioSynth.playFanfare();

    this.scene.time.delayedCall(2200, () => {
      itemSprite.destroy();
      glow.destroy();
      this.direction = 'down';
      this.faceIdle();
      this.isHolding = false;
      if (callback) callback();
    });
  }

  destroy(fromScene) {
    if (this.shadow) { this.shadow.destroy(); this.shadow = null; }
    if (this.chargeGlow) { this.chargeGlow.destroy(); this.chargeGlow = null; }
    super.destroy(fromScene);
  }
}
