import { TILE_SIZE, MAP_COLS, MAP_ROWS, STATES, WORLDS, ITEMS } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';
import { mapManager } from '../maps/mapManager.js';
import { uiManager } from '../ui/UIManager.js';
import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';
import { Octorok } from '../entities/enemies/Octorok.js';
import { Agahnim } from '../entities/enemies/Agahnim.js';
import { Lanmola } from '../entities/enemies/Lanmola.js';
import { Moldorm } from '../entities/enemies/Moldorm.js';
import { Ganon } from '../entities/enemies/Ganon.js';

/**
 * メインゲームシーン (PlayScene)
 */
export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    uiManager.setScene(this);
    audioSynth.startBGM(gameState.currentWorld);

    this.physics.world.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // スペースキーのブラウザスクロールを無効化
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);

    // 物理静的グループ
    this.walls = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();
    this.pedestals = this.physics.add.staticGroup();
    this.iceBlocks = this.physics.add.staticGroup();
    this.pyramids = this.physics.add.staticGroup();
    this.bushes = this.physics.add.staticGroup();

    // 動的グループ
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.drops = this.physics.add.group();

    // マップ構築
    mapManager.buildMapPhysics(this, gameState.currentWorld);

    // プレイヤー生成（デフォルト位置）
    this.player = new Player(this, 10 * TILE_SIZE, 15 * TILE_SIZE);

    // カメラ設定
    this.cameras.main.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // コライダー設定
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.chests, (p, chest) => this.openChest(chest));
    this.physics.add.collider(this.player, this.pedestals, (p, ped) => this.drawMasterSword(ped));
    this.physics.add.collider(this.player, this.iceBlocks);
    this.physics.add.collider(this.player, this.bushes);
    this.physics.add.collider(this.player, this.pyramids);
    this.physics.add.collider(this.enemies, this.walls);

    // オーバーラップ設定
    this.physics.add.overlap(this.player, this.drops, this.collectDrop, null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemyWithProjectile, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayerByEnemy, null, this);
    this.physics.add.overlap(this.player, this.projectiles, this.hitPlayerByProjectile, null, this);
    this.physics.add.overlap(this.player, this.portals, (p, portal) => this.enterPortal(portal));

    // 敵スポーン
    this.spawnEntities();

    // キー入力（アイテム選択）
    this.input.keyboard.on('keydown-ONE', () => gameState.selectItem(ITEMS.SWORD));
    this.input.keyboard.on('keydown-TWO', () => gameState.selectItem(ITEMS.FIREROD));
    this.input.keyboard.on('keydown-THREE', () => gameState.selectItem(ITEMS.BOW));
    this.input.keyboard.on('keydown-FOUR', () => gameState.selectItem(ITEMS.MIRROR));

    // 画面中央通知バナー
    this.splashText = this.add.text(400, 240, '', {
      fontFamily: '"DotGothic16", sans-serif',
      fontSize: '22px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: { x: 14, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);

    uiManager.update();
  }

  update(time, delta) {
    if (this.player && this.player.active) {
      this.player.update(time, delta);
    }

    // アイテム（2, 3, 4）の使用キー判定（剣以外のアイテムを使用時）
    if (this.player && !this.player.isHolding && !this.player.isAttacking) {
      if (Phaser.Input.Keyboard.JustDown(this.player.spaceKey) || Phaser.Input.Keyboard.JustDown(this.player.jKey)) {
        if (gameState.selectedItem !== ITEMS.SWORD) {
          this.useActiveItem();
        }
      }
    }

    // ダンジョン出入り判定
    this.checkAreaTransition();
  }

  useActiveItem() {
    const isBunny = (gameState.currentWorld === WORLDS.DARK && !gameState.hasMoonPearl);
    if (isBunny) return;

    if (gameState.selectedItem === ITEMS.FIREROD) {
      if (gameState.consumeMagic(15)) {
        audioSynth.playFireball();
        this.firePlayerProjectile('fireball');
      } else {
        this.showBanner("魔力が足りない！");
      }
    } else if (gameState.selectedItem === ITEMS.BOW) {
      if (gameState.consumeArrow()) {
        audioSynth.playArrow();
        this.firePlayerProjectile('arrow');
      } else {
        this.showBanner("矢がない！");
      }
    } else if (gameState.selectedItem === ITEMS.MIRROR) {
      this.useMirror();
    }
  }

  firePlayerProjectile(type) {
    let dx = 0;
    let dy = 0;
    const speed = 260;
    let sx = this.player.x;
    let sy = this.player.y;

    if (this.player.direction === 'left') { dx = -speed; sx -= 16; }
    else if (this.player.direction === 'right') { dx = speed; sx += 16; }
    else if (this.player.direction === 'up') { dy = -speed; sy -= 16; }
    else if (this.player.direction === 'down') { dy = speed; sy += 16; }

    new Projectile(this, sx, sy, type, dx, dy, type, 'player');
  }

  useMirror() {
    if (gameState.currentWorld === WORLDS.DARK) {
      audioSynth.playWarp();
      this.cameras.main.flash(400, 255, 255, 255);

      const px = Math.floor(this.player.x / TILE_SIZE);
      const py = Math.floor(this.player.y / TILE_SIZE);
      if (mapManager.maps[WORLDS.LIGHT][py][px] === 0) {
        mapManager.maps[WORLDS.LIGHT][py][px] = 3;
        gameState.activePortal = { x: px, y: py };
      }

      gameState.currentWorld = WORLDS.LIGHT;
      this.rebuildScene();
      this.showBanner("光の世界へ戻った！");
    } else {
      this.showBanner("ここでは不思議な光が揺らめくだけだ...");
    }
  }

  enterPortal(portal) {
    if (this.isWarping) return;
    this.isWarping = true;

    audioSynth.playWarp();
    this.cameras.main.flash(400, 255, 255, 255);

    if (gameState.currentWorld === WORLDS.LIGHT) {
      gameState.currentWorld = WORLDS.DARK;
      this.player.x += 32; // ポータルからずらす
      this.showBanner("闇の世界へ引きずり込まれた！");
    } else if (gameState.currentWorld === WORLDS.DARK) {
      gameState.currentWorld = WORLDS.LIGHT;
      this.player.x += 32;
      this.showBanner("光の世界へ戻った！");
    }

    this.rebuildScene();

    this.time.delayedCall(800, () => {
      this.isWarping = false;
    });
  }

  openChest(chest) {
    if (!chest || !chest.active) return;
    const type = chest.chestType;
    const cid = chest.chestId;
    if (gameState.openedChests.has(cid)) return;

    gameState.openedChests.add(cid);
    chest.destroy();

    if (type === 4) { // ムーンパール
      gameState.hasMoonPearl = true;
      this.player.holdItem('portal', () => {
        this.showBanner("ムーンパールを手に入れた！姿を保てる！");
      });
    } else if (type === 6) { // ファイアロッド
      gameState.hasFireRod = true;
      gameState.selectItem(ITEMS.FIREROD);
      this.player.holdItem('item-firerod', () => {
        this.showBanner("ファイアロッドを手に入れた！氷を溶かせる！");
      });
    } else if (type === 7) { // 弓矢
      gameState.hasBow = true;
      gameState.selectItem(ITEMS.BOW);
      this.player.holdItem('item-bow', () => {
        this.showBanner("弓矢を手に入れた！遠距離攻撃が可能！");
      });
    }
    uiManager.update();
  }

  drawMasterSword(ped) {
    if (!ped || !ped.active || gameState.hasMasterSword) return;

    ped.destroy();
    gameState.hasMasterSword = true;
    gameState.playerHealth = gameState.playerMaxHealth;

    this.player.holdItem('item-sword-master', () => {
      this.showBanner("伝説の退魔の剣『マスターソード』を引き抜いた！");
    });

    uiManager.update();
  }

  collectDrop(player, drop) {
    if (!drop.active) return;

    if (drop.type === 'heart') {
      gameState.heal(2);
      audioSynth.playTone(880, 'sine', 0.1, 0.2);
    } else if (drop.type === 'magic') {
      gameState.restoreMagic(25);
      audioSynth.playTone(660, 'triangle', 0.1, 0.2);
    } else if (drop.type === 'arrow') {
      gameState.addArrows(5);
      audioSynth.playTone(770, 'square', 0.1, 0.2);
    }

    drop.destroy();
    uiManager.update();
  }

  hitPlayerByEnemy(player, enemy) {
    if (player.invulnerable || !enemy.active || player.isHolding) return;

    player.invulnerable = true;
    audioSynth.playHurt();

    const isDead = gameState.takeDamage(1);

    player.setTint(0xff3333);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.body.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);

    this.time.delayedCall(450, () => {
      if (player.active) {
        player.clearTint();
        player.invulnerable = false;
      }
    });

    if (isDead) {
      this.scene.start('GameOverScene');
    }
  }

  hitPlayerByProjectile(player, proj) {
    if (!proj.active || proj.owner === 'player') return;

    // 剣攻撃中（振り終わりまでの間）に魔法弾が接触した場合は打ち返し！
    if (player.isAttacking && proj.canReflect) {
      const agahnim = this.enemies.getChildren().find(e => e.type === 'agahnim' && e.active);
      const tx = agahnim ? agahnim.x : player.x;
      const ty = agahnim ? agahnim.y : player.y - 200;
      proj.reflect(tx, ty);
      this.showBanner("魔法弾を跳ね返した！");
      return;
    }

    // 盾オートガード判定
    if (player.canBlockProjectile(proj)) {
      audioSynth.playShieldBlock();
      this.createSpark(proj.x, proj.y, 0xffeb3b);
      proj.destroy();
      return;
    }

    if (player.invulnerable) {
      proj.destroy();
      return;
    }

    player.invulnerable = true;
    audioSynth.playHurt();
    const isDead = gameState.takeDamage(1);
    proj.destroy();

    player.setTint(0xff3333);
    this.time.delayedCall(450, () => {
      if (player.active) {
        player.clearTint();
        player.invulnerable = false;
      }
    });

    if (isDead) {
      this.scene.start('GameOverScene');
    }
  }

  hitEnemyWithProjectile(proj, enemy) {
    if (!proj.active || !enemy.active || proj.owner !== 'player') return;

    let damage = 1;
    if (proj.type === 'fireball') damage = 2;
    if (proj.type === 'beam') damage = 2;

    const isReflected = proj.isReflected;
    proj.destroy();

    this.createSpark(enemy.x, enemy.y, 0xffaa00);
    const isDead = enemy.takeDamage(damage, 0, 0, isReflected);

    if (isDead) {
      this.onEnemyDefeated(enemy);
    }
  }

  // 敵撃破イベント一元化（剣・回転斬り・矢・魔法共通）
  onEnemyDefeated(enemy) {
    if (enemy.type === 'agahnim') {
      gameState.bossDefeated = true;
      mapManager.maps[WORLDS.LIGHT][6][4] = 0; // 結界解除
      mapManager.buildMapPhysics(this, gameState.currentWorld);
      audioSynth.playFanfare();
      this.showBanner("アグニムを倒した！森の結界が消滅！");
    } else if (enemy.type === 'lanmola') {
      mapManager.maps[WORLDS.DESERT][5][20] = 6; // ファイアロッド宝箱出現
      mapManager.buildMapPhysics(this, gameState.currentWorld);
      audioSynth.playFanfare();
      this.showBanner("デグサードを倒した！宝箱が出現！");
    } else if (enemy.type === 'moldorm') {
      mapManager.maps[WORLDS.LOST_WOODS][3][20] = 5; // マスターソード台座出現
      mapManager.buildMapPhysics(this, gameState.currentWorld);
      audioSynth.playFanfare();
      this.showBanner("デグテールを倒した！台座が出現！");
    } else if (enemy.type === 'ganon') {
      gameState.finalBossDefeated = true;
      this.scene.start('ClearScene');
    }
  }

  checkAreaTransition() {
    const px = Math.floor(this.player.x / TILE_SIZE);
    const py = Math.floor(this.player.y / TILE_SIZE);
    const isDungeon = [WORLDS.DESERT, WORLDS.DARK_TEMPLE, WORLDS.LOST_WOODS, WORLDS.PYRAMID].includes(gameState.currentWorld);

    // ダンジョン南端からの脱出
    if (isDungeon && py === 29) {
      audioSynth.playWarp();
      this.cameras.main.flash(400, 255, 255, 255);

      if (gameState.currentWorld === WORLDS.DESERT) {
        gameState.currentWorld = WORLDS.LIGHT;
        this.player.setPosition(8 * TILE_SIZE + 16, 24 * TILE_SIZE + 16);
      } else if (gameState.currentWorld === WORLDS.DARK_TEMPLE) {
        gameState.currentWorld = WORLDS.DARK;
        this.player.setPosition(4 * TILE_SIZE + 16, 7 * TILE_SIZE + 16);
      } else if (gameState.currentWorld === WORLDS.LOST_WOODS) {
        gameState.currentWorld = WORLDS.LIGHT;
        this.player.setPosition(4 * TILE_SIZE + 16, 7 * TILE_SIZE + 16);
      } else if (gameState.currentWorld === WORLDS.PYRAMID) {
        gameState.currentWorld = WORLDS.DARK;
        this.player.setPosition(18 * TILE_SIZE + 16, 15 * TILE_SIZE + 16);
      }

      this.rebuildScene();
      return;
    }

    // 通常世界からダンジョンへ
    if (gameState.currentWorld === WORLDS.LIGHT) {
      if (py === 24 && px === 6) {
        this.warpToDungeon(WORLDS.DESERT, 20 * TILE_SIZE + 16, 28 * TILE_SIZE + 16);
      } else if (py === 6 && px === 4 && gameState.bossDefeated) {
        this.warpToDungeon(WORLDS.LOST_WOODS, 20 * TILE_SIZE + 16, 28 * TILE_SIZE + 16);
      }
    } else if (gameState.currentWorld === WORLDS.DARK) {
      if (py === 6 && px === 4) {
        this.warpToDungeon(WORLDS.DARK_TEMPLE, 20 * TILE_SIZE + 16, 28 * TILE_SIZE + 16);
      } else if (py === 14 && px === 18) {
        this.warpToDungeon(WORLDS.PYRAMID, 20 * TILE_SIZE + 16, 28 * TILE_SIZE + 16);
      }
    }
  }

  warpToDungeon(targetWorld, x, y) {
    audioSynth.playWarp();
    this.cameras.main.flash(400, 255, 255, 255);
    gameState.currentWorld = targetWorld;
    this.player.setPosition(x, y);
    this.rebuildScene();
  }

  rebuildScene() {
    audioSynth.startBGM(gameState.currentWorld);
    mapManager.buildMapPhysics(this, gameState.currentWorld);
    this.spawnEntities();
    uiManager.update();
  }

  // 敵の配置（撃破済みのボスは再出現させない）
  spawnEntities() {
    this.enemies.clear(true, true);
    this.projectiles.clear(true, true);
    this.drops.clear(true, true);

    const world = gameState.currentWorld;

    if (world === WORLDS.LIGHT) {
      new Octorok(this, 28 * TILE_SIZE, 10 * TILE_SIZE);
      new Octorok(this, 12 * TILE_SIZE, 22 * TILE_SIZE);
      new Octorok(this, 32 * TILE_SIZE, 18 * TILE_SIZE);
    } else if (world === WORLDS.DARK) {
      new Octorok(this, 15 * TILE_SIZE, 10 * TILE_SIZE);
      new Octorok(this, 25 * TILE_SIZE, 22 * TILE_SIZE);
      new Octorok(this, 8 * TILE_SIZE, 18 * TILE_SIZE);
    } else if (world === WORLDS.DESERT) {
      if (!gameState.hasFireRod) {
        new Lanmola(this, 20 * TILE_SIZE, 5 * TILE_SIZE);
      }
    } else if (world === WORLDS.DARK_TEMPLE) {
      if (!gameState.bossDefeated) {
        new Agahnim(this, 20 * TILE_SIZE, 4 * TILE_SIZE);
      }
    } else if (world === WORLDS.LOST_WOODS) {
      if (!gameState.hasMasterSword) {
        new Moldorm(this, 20 * TILE_SIZE, 4 * TILE_SIZE);
      }
    } else if (world === WORLDS.PYRAMID) {
      if (!gameState.finalBossDefeated) {
        new Ganon(this, 20 * TILE_SIZE, 4 * TILE_SIZE);
      }
    }
  }

  showBanner(message) {
    if (!this.splashText) return;
    this.splashText.setText(message);
    this.splashText.setVisible(true);
    this.splashText.setAlpha(1);

    this.time.delayedCall(2400, () => {
      this.tweens.add({
        targets: this.splashText,
        alpha: 0,
        duration: 350,
        onComplete: () => this.splashText.setVisible(false)
      });
    });
  }

  createSpark(x, y, color = 0xffd700) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y, 3, color).setDepth(30);
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 20;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 200,
        onComplete: () => p.destroy()
      });
    }
  }

  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(x, y, 5, 0xffffff).setDepth(30);
      const angle = Math.random() * Math.PI * 2;
      const dist = 24 + Math.random() * 24;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0.2,
        alpha: 0,
        duration: 320,
        onComplete: () => p.destroy()
      });
    }
  }

  createLeafBurst(x, y) {
    for (let i = 0; i < 8; i++) {
      const leaf = this.add.circle(x, y, 3, 0x4cc76e).setDepth(30);
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 18;
      this.tweens.add({
        targets: leaf,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 250,
        onComplete: () => leaf.destroy()
      });
    }
  }
}
