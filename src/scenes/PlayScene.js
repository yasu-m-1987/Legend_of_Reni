import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, WORLDS, ITEMS, TILES, DUNGEONS, WORLD_INFO, BOSS_NAMES,
  BOSS_ROOMS, DUNGEON_START, DUNGEON_EXITS, DUNGEON_DOOR, OVERWORLD_START, DEPTH,
  GAME_WIDTH, GAME_HEIGHT
} from '../config/constants.js';
import { buildAllTextures } from '../config/assets/textures.js';
import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';
import { mapManager } from '../maps/mapManager.js';
import { uiManager } from '../ui/UIManager.js';
import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';
import { DropItem } from '../entities/DropItem.js';
import { Octorok } from '../entities/enemies/Octorok.js';
import { Agahnim } from '../entities/enemies/Agahnim.js';
import { Lanmola } from '../entities/enemies/Lanmola.js';
import { Moldorm } from '../entities/enemies/Moldorm.js';
import { Ganon } from '../entities/enemies/Ganon.js';

const BOSS_CLASSES = { lanmola: Lanmola, agahnim: Agahnim, moldorm: Moldorm, ganon: Ganon };

const FIELD_ENEMIES = {
  [WORLDS.LIGHT]: [[28, 10], [12, 22], [32, 18], [24, 26]],
  [WORLDS.DARK]: [[15, 10], [25, 22], [8, 18], [30, 8], [36, 14]]
};

const ARROW_ANGLE = { up: 0, right: 90, down: 180, left: -90 };
const FIREROD_COST = 15;

const tileCenter = (n) => n * TILE_SIZE + TILE_SIZE / 2;

/**
 * メインゲームシーン (PlayScene)
 * マップ・プレイヤー・敵・当たり判定・エリア遷移・イベント進行を統括
 */
export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.spawnData = data || {};
  }

  preload() {
    buildAllTextures(this);
  }

  create() {
    uiManager.setScene(this);
    mapManager.ensureGenerated();

    this.transitioning = false;
    this.dying = false;
    this.portalArmed = false;
    this.boss = null;
    this.lowHealthTimer = 0;

    this.physics.resume();
    this.physics.world.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // スペース・矢印キーのブラウザスクロールを無効化
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);

    // 物理静的グループ
    this.walls = this.physics.add.staticGroup();
    this.waters = this.physics.add.staticGroup(); // 水・溶岩（弾は飛び越える）
    this.portals = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();
    this.pedestals = this.physics.add.staticGroup();
    this.iceBlocks = this.physics.add.staticGroup();
    this.bushes = this.physics.add.staticGroup();

    // 動的グループ
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.drops = this.physics.add.group();

    mapManager.buildMapPhysics(this, gameState.currentWorld);

    // プレイヤー生成
    const spawn = this.resolveSpawn();
    this.player = new Player(this, tileCenter(spawn.c), tileCenter(spawn.r));

    // カメラ設定
    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.fadeIn(400, 0, 0, 0);

    // 闇の世界・神殿の周辺減光
    this.vignette = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette')
      .setScrollFactor(0).setScale(2).setDepth(DEPTH.OVERHEAD).setVisible(false);

    this.setupColliders();
    this.setupKeys();

    // HUD を重ねて起動（PlayScene 終了時に一緒に止める）
    this.scene.launch('HUDScene');
    this.hud = this.scene.get('HUDScene');
    this.events.once('shutdown', () => {
      this.scene.stop('HUDScene');
      this.scene.stop('PauseScene');
    });

    this.spawnEntities();
    this.applyAreaAtmosphere();
    this.time.delayedCall(50, () => this.onAreaEntered());

    // はじめから: テレパシーによる導入
    if (this.spawnData.intro) {
      this.time.delayedCall(1500, () => this.showBanner('…れに…きこえますか…？ 闇に覆われるハイラルを…どうか救ってください…'));
      this.time.delayedCall(6500, () => this.showBanner('まずは南西にある「砂漠の神殿」を目指そう。（Esc/P でメニュー）'));
    }

    uiManager.update();
  }

  /** セーブデータ・遷移元に応じた初期位置 */
  resolveSpawn() {
    const world = gameState.currentWorld;
    let tile = this.spawnData.spawn;
    if (!tile) tile = DUNGEONS.includes(world) ? DUNGEON_START : OVERWORLD_START;
    return mapManager.findSafeSpot(world, tile.c, tile.r);
  }

  setupColliders() {
    const p = this.player;
    this.physics.add.collider(p, this.walls);
    this.physics.add.collider(p, this.waters);
    this.physics.add.collider(p, this.iceBlocks);
    this.physics.add.collider(p, this.bushes);
    this.physics.add.collider(p, this.chests, (pl, chest) => this.openChest(chest));
    this.physics.add.collider(p, this.pedestals, (pl, ped) => this.drawMasterSword(ped));

    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.waters);
    this.physics.add.collider(this.enemies, this.iceBlocks);

    // 弾 vs 壁・氷
    this.physics.add.collider(this.projectiles, this.walls, (proj) => {
      this.createSpark(proj.x, proj.y, 0xfff3c0, 3);
      proj.destroy();
    });
    this.physics.add.collider(this.projectiles, this.iceBlocks, (proj, ice) => {
      if (proj.type === 'fireball' && proj.owner === 'player') this.meltIceBlock(ice);
      proj.destroy();
    });

    this.physics.add.overlap(p, this.drops, this.collectDrop, null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemyWithProjectile, null, this);
    this.physics.add.overlap(p, this.enemies, this.hitPlayerByEnemy, null, this);
    this.physics.add.overlap(p, this.projectiles, this.hitPlayerByProjectile, null, this);
    this.physics.add.overlap(p, this.portals, (pl, portal) => this.enterPortal(portal));
  }

  setupKeys() {
    const kb = this.input.keyboard;
    const select = (item) => {
      if (this.dying) return;
      if (gameState.selectItem(item)) audioSynth.playCursor();
      else audioSynth.playError();
    };
    kb.on('keydown-ONE', () => select(ITEMS.SWORD));
    kb.on('keydown-TWO', () => select(ITEMS.FIREROD));
    kb.on('keydown-THREE', () => select(ITEMS.BOW));
    kb.on('keydown-FOUR', () => select(ITEMS.MIRROR));
    kb.on('keydown-ESC', () => this.openPause());
    kb.on('keydown-P', () => this.openPause());
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    gameState.playTime += delta / 1000;
    this.player.update(time, delta);

    if (this.transitioning || this.dying) return;

    // 剣以外のアイテム使用
    if (!this.player.isHolding && !this.player.isAttacking && gameState.selectedItem !== ITEMS.SWORD) {
      if (this.player.attackJustPressed()) this.useActiveItem();
    }

    // ポータルから一度離れたら再び使えるようにする
    if (!this.portalArmed && !this.physics.overlap(this.player, this.portals)) {
      this.portalArmed = true;
    }

    // 残りライフ 1 以下で警告音（神トラ風）
    if (gameState.playerHealth <= 2) {
      this.lowHealthTimer -= delta;
      if (this.lowHealthTimer <= 0) {
        audioSynth.playTone(1568, 'square', 0.06, 0.035);
        this.lowHealthTimer = 1400;
      }
    }

    this.checkAreaTransition();
  }

  // ================= メニュー =================

  openPause() {
    if (this.transitioning || this.dying || this.player.isHolding) return;
    if (this.scene.isActive('PauseScene')) return;
    this.player.cancelCharge();
    audioSynth.playConfirm();
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  // ================= アイテム =================

  useActiveItem() {
    const item = gameState.selectedItem;

    // ウサギの姿ではミラー以外のアイテムは使えない
    if (gameState.isBunny && item !== ITEMS.MIRROR) {
      audioSynth.playError();
      this.showBanner('この姿では道具が使えない…');
      return;
    }

    if (item === ITEMS.FIREROD) {
      if (gameState.consumeMagic(FIREROD_COST)) {
        audioSynth.playFireball();
        this.firePlayerProjectile('fireball');
      } else {
        audioSynth.playError();
        this.showBanner('魔力が足りない！');
      }
    } else if (item === ITEMS.BOW) {
      if (gameState.consumeArrow()) {
        audioSynth.playArrow();
        this.firePlayerProjectile('arrow');
      } else {
        audioSynth.playError();
        this.showBanner('矢がない！');
      }
    } else if (item === ITEMS.MIRROR) {
      this.useMirror();
    }
  }

  firePlayerProjectile(type) {
    const speed = type === 'arrow' ? 320 : 260;
    const dir = this.player.direction;
    const vec = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir];
    const proj = new Projectile(
      this,
      this.player.x + vec[0] * 16,
      this.player.y + vec[1] * 16,
      type,
      vec[0] * speed,
      vec[1] * speed,
      type,
      'player'
    );
    if (type === 'arrow') proj.setAngle(ARROW_ANGLE[dir]);
  }

  /** マジックミラー: 闇→光の世界へ / ダンジョンからは入口へ脱出 */
  useMirror() {
    if (this.transitioning || this.dying) return;
    const world = gameState.currentWorld;
    const c = Math.floor(this.player.x / TILE_SIZE);
    const r = Math.floor(this.player.y / TILE_SIZE);

    if (world === WORLDS.DARK) {
      // 光の世界の同じ場所に帰還用ポータルを残す
      if (mapManager.tileAt(WORLDS.LIGHT, r, c) === TILES.FLOOR && !mapManager.entranceAt(WORLDS.LIGHT, r, c)) {
        gameState.activePortal = { x: c, y: r };
      }
      this.changeArea(WORLDS.LIGHT, { c, r }, { warp: true, message: '光の世界へ戻った！' });
    } else if (DUNGEONS.includes(world)) {
      const exit = DUNGEON_EXITS[world];
      this.changeArea(exit.world, exit, { warp: true, message: 'ダンジョンの入口へ戻った' });
    } else {
      audioSynth.playError();
      this.showBanner('ここでは不思議な光が揺らめくだけだ...');
    }
  }

  // ================= エリア遷移 =================

  enterPortal() {
    if (!this.portalArmed || this.transitioning || this.dying) return;
    if (gameState.currentWorld !== WORLDS.LIGHT) return;
    const c = Math.floor(this.player.x / TILE_SIZE);
    const r = Math.floor(this.player.y / TILE_SIZE);
    this.changeArea(WORLDS.DARK, { c, r }, {
      warp: true,
      message: gameState.hasMoonPearl ? '闇の世界へ引きずり込まれた！' : '闇の世界へ…！ れにの姿がウサギに変わってしまった！'
    });
  }

  checkAreaTransition() {
    const world = gameState.currentWorld;
    const c = Math.floor(this.player.x / TILE_SIZE);
    const r = Math.floor(this.player.y / TILE_SIZE);

    // ダンジョン南端の扉から脱出
    if (DUNGEONS.includes(world) && r >= DUNGEON_DOOR.r) {
      const exit = DUNGEON_EXITS[world];
      this.changeArea(exit.world, exit);
      return;
    }

    // 地上からダンジョンへ
    const entrance = mapManager.entranceAt(world, r, c);
    if (entrance && (!entrance.requires || gameState[entrance.requires])) {
      this.changeArea(entrance.target, DUNGEON_START);
    }
  }

  /**
   * エリアを切り替える（フェードアウト → 再構築 → フェードイン → オートセーブ）
   * @param {object} tile 到着地点（タイル座標）。壁の場合は近くの床を探す
   */
  changeArea(world, tile, { warp = false, message = null } = {}) {
    if (this.transitioning || this.dying) return;
    this.transitioning = true;
    this.player.frozen = true;
    this.player.cancelCharge();
    this.player.body.setVelocity(0, 0);

    const cam = this.cameras.main;
    // force=true: 直前のフェードイン中でも確実にフェードアウトを開始する
    if (warp) {
      audioSynth.playWarp();
      cam.fade(380, 255, 255, 255, true);
    } else {
      cam.fade(220, 0, 0, 0, true);
    }

    cam.once('camerafadeoutcomplete', () => {
      gameState.currentWorld = world;
      const spot = mapManager.findSafeSpot(world, tile.c, tile.r);
      this.player.body.reset(tileCenter(spot.c), tileCenter(spot.r));
      this.portalArmed = false;

      this.rebuildScene();
      cam.fadeIn(warp ? 500 : 260, warp ? 255 : 0, warp ? 255 : 0, warp ? 255 : 0);

      this.time.delayedCall(warp ? 300 : 120, () => {
        this.player.frozen = false;
        this.transitioning = false;
      });

      this.onAreaEntered();
      if (message) this.time.delayedCall(400, () => this.showBanner(message));
      this.autoSave();
    });
  }

  rebuildScene() {
    mapManager.buildMapPhysics(this, gameState.currentWorld);
    this.spawnEntities();
    this.applyAreaAtmosphere();
    uiManager.update();
  }

  applyAreaAtmosphere() {
    const info = WORLD_INFO[gameState.currentWorld];
    this.vignette.setVisible(!!(info && info.dark));
    this.cameras.main.setBackgroundColor(info && info.dark ? '#0d0a18' : '#0d1017');
  }

  /** エリア到着時の演出（エリア名表示・BGM・ボス登場） */
  onAreaEntered() {
    const world = gameState.currentWorld;
    const info = WORLD_INFO[world];
    if (this.hud && this.hud.showArea) this.hud.showArea(info.name, info.color);

    if (this.boss && this.boss.active) {
      audioSynth.startBGM('boss');
      this.time.delayedCall(1300, () => {
        if (this.boss && this.boss.active && this.hud) {
          this.hud.showArea(BOSS_NAMES[this.boss.type], '#ff6b6b', 'BOSS');
        }
      });
    } else {
      audioSynth.startBGM(info.bgm);
    }
  }

  autoSave() {
    if (gameState.save() && this.hud && this.hud.flashSaved) this.hud.flashSaved();
  }

  // ================= 敵・オブジェクト配置 =================

  spawnEntities() {
    this.enemies.clear(true, true);
    this.projectiles.clear(true, true);
    this.drops.clear(true, true);
    this.boss = null;

    const world = gameState.currentWorld;

    (FIELD_ENEMIES[world] || []).forEach(([c, r]) => {
      const spot = mapManager.findSafeSpot(world, c, r);
      new Octorok(this, tileCenter(spot.c), tileCenter(spot.r));
    });

    const room = BOSS_ROOMS[world];
    if (room) {
      if (!gameState.defeatedBosses.has(room.boss)) {
        const BossClass = BOSS_CLASSES[room.boss];
        this.boss = new BossClass(this, tileCenter(room.c), tileCenter(room.r));
      } else {
        this.spawnHeartContainer(world);
      }
    }
  }

  /** ボス撃破報酬のハートのうつわ（未回収なら再入場時にも出現） */
  spawnHeartContainer(world) {
    const room = BOSS_ROOMS[world];
    const id = `${world}_boss`;
    if (!room || room.boss === 'ganon' || gameState.collectedContainers.has(id)) return;
    new DropItem(this, tileCenter(room.c), tileCenter(room.r + 2), 'heart-container', 'container', { persistent: true, id });
  }

  // ================= 宝箱・台座・氷 =================

  openChest(chest) {
    if (!chest || !chest.active || chest.opened || this.player.isHolding) return;
    if (gameState.openedChests.has(chest.chestId)) return;

    gameState.openedChests.add(chest.chestId);
    chest.opened = true;
    chest.setTint(0x6b6b6b);
    this.player.body.setVelocity(0, 0);

    const type = chest.chestType;
    if (type === TILES.CHEST_PEARL) {
      gameState.hasMoonPearl = true;
      this.player.holdItem('portal', () => {
        this.showBanner('ムーンパールを手に入れた！ 闇の世界でも元の姿を保てる！');
      });
    } else if (type === TILES.CHEST_FIREROD) {
      gameState.hasFireRod = true;
      gameState.selectItem(ITEMS.FIREROD);
      this.player.holdItem('item-firerod', () => {
        this.showBanner('ファイアロッドを手に入れた！ [2]で装備、氷を溶かせる！');
      });
    } else if (type === TILES.CHEST_BOW) {
      gameState.hasBow = true;
      gameState.selectItem(ITEMS.BOW);
      this.player.holdItem('item-bow', () => {
        this.showBanner('弓矢を手に入れた！ [3]で装備、遠くの敵を射抜ける！');
      });
    }
    uiManager.update();
    this.autoSave();
  }

  drawMasterSword(ped) {
    if (!ped || !ped.active || gameState.hasMasterSword || this.player.isHolding) return;

    ped.destroy();
    gameState.hasMasterSword = true;
    gameState.selectItem(ITEMS.SWORD);
    gameState.heal(gameState.playerMaxHealth);
    this.cameras.main.flash(600, 255, 255, 255);

    this.player.holdItem('item-sword-master', () => {
      this.showBanner('伝説の退魔の剣『マスターソード』を引き抜いた！');
    });

    uiManager.update();
    this.autoSave();
  }

  meltIceBlock(ice) {
    if (!ice || !ice.active) return;
    gameState.meltedIce.add(ice.iceId);
    this.createSteam(ice.x, ice.y);
    ice.destroy();
    audioSynth.playPuzzleSolved();
    this.showBanner('氷が溶けて道が開いた！');

    // 入口を塞いでいた氷なら階段を出す
    const c = Math.floor(ice.x / TILE_SIZE);
    const r = Math.floor(ice.y / TILE_SIZE);
    if (mapManager.entranceAt(gameState.currentWorld, r, c)) {
      this.mapDecor.push(this.add.image(tileCenter(c), tileCenter(r), 'stairs').setDepth(DEPTH.DECOR));
    }
  }

  // ================= 回収・ダメージ =================

  collectDrop(player, drop) {
    if (!drop.active || player.isHolding) return;

    if (drop.type === 'heart') {
      gameState.heal(2);
      audioSynth.playPickup('heart');
    } else if (drop.type === 'magic') {
      gameState.restoreMagic(25);
      audioSynth.playPickup('magic');
    } else if (drop.type === 'arrow') {
      gameState.addArrows(5);
      audioSynth.playPickup('arrow');
    } else if (drop.type === 'container') {
      const id = drop.itemId;
      drop.destroy();
      gameState.addHeartContainer(id);
      player.holdItem('heart-container', () => {
        this.showBanner('ハートのうつわを手に入れた！ ライフの最大値が増えた！');
      });
      this.autoSave();
      return;
    }

    this.createSpark(drop.x, drop.y, 0xffffff, 4);
    drop.destroy();
  }

  /** プレイヤーへのダメージ（ノックバック・無敵時間・死亡判定） */
  damagePlayer(amount, fromX, fromY) {
    const p = this.player;
    if (p.invulnerable || p.isHolding || this.transitioning || this.dying) return;

    p.invulnerable = true;
    p.cancelCharge();
    audioSynth.playHurt();
    this.cameras.main.shake(120, 0.004);

    const isDead = gameState.takeDamage(amount);

    const angle = Phaser.Math.Angle.Between(fromX, fromY, p.x, p.y);
    p.body.setVelocity(Math.cos(angle) * 240, Math.sin(angle) * 240);
    p.knockbackUntil = this.time.now + 160;

    if (isDead) {
      this.playerDied();
      return;
    }

    p.setTint(0xff6060);
    this.tweens.add({
      targets: p,
      alpha: 0.25,
      duration: 70,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (!p.active) return;
        p.setAlpha(1);
        p.clearTint();
        p.invulnerable = false;
      }
    });
  }

  playerDied() {
    this.dying = true;
    const p = this.player;
    p.frozen = true;
    p.body.setVelocity(0, 0);
    gameState.deathCount++;

    audioSynth.fadeOutBGM(0.4);
    this.enemies.getChildren().forEach(e => { if (e.body) e.body.setVelocity(0, 0); });
    this.physics.pause();
    this.time.removeAllEvents();
    this.enemies.getChildren().forEach(e => { e.timerEvents = []; });

    // くるくる回って倒れる
    const order = ['down', 'left', 'up', 'right'];
    let step = 0;
    p.setTint(0xff4040);
    const spin = this.time.addEvent({
      delay: 90,
      repeat: 11,
      callback: () => {
        p.direction = order[step++ % 4];
        p.faceIdle();
      }
    });

    this.time.delayedCall(1200, () => {
      spin.remove(false);
      this.cameras.main.fade(600, 0, 0, 0, true);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameOverScene'));
    });
  }

  hitPlayerByEnemy(player, enemy) {
    if (!enemy.active || !enemy.visible || !enemy.body || !enemy.body.enable) return;
    this.damagePlayer(enemy.isBoss ? 2 : 1, enemy.x, enemy.y);
  }

  hitPlayerByProjectile(player, proj) {
    if (!proj.active || proj.owner === 'player' || this.dying) return;

    // 剣を振っている最中に魔法弾が触れたら打ち返し！
    if (player.isAttacking && proj.canReflect) {
      this.reflectProjectile(proj);
      return;
    }

    // 盾オートガード判定
    if (player.canBlockProjectile(proj) && proj.type !== 'magic-ball') {
      audioSynth.playShieldBlock();
      this.createSpark(proj.x, proj.y, 0xffeb3b);
      proj.destroy();
      return;
    }

    if (player.invulnerable) return;
    const fx = proj.x;
    const fy = proj.y;
    proj.destroy();
    this.damagePlayer(1, fx, fy);
  }

  reflectProjectile(proj) {
    const agahnim = this.enemies.getChildren().find(e => e.type === 'agahnim' && e.active);
    const tx = agahnim ? agahnim.x : this.player.x;
    const ty = agahnim ? agahnim.y : this.player.y - 200;
    if (proj.reflect(tx, ty)) {
      this.createSpark(proj.x, proj.y, 0xfff176, 8);
      this.showBanner('魔法弾を跳ね返した！');
    }
  }

  hitEnemyWithProjectile(proj, enemy) {
    if (!proj.active || !enemy.active || proj.owner !== 'player') return;

    let damage = 1;
    if (proj.type === 'fireball') damage = 2;
    if (proj.type === 'beam') damage = 2;

    const isReflected = proj.isReflected;
    const projType = proj.type;
    const angle = Math.atan2(proj.body.velocity.y, proj.body.velocity.x);
    proj.destroy();

    this.createSpark(enemy.x, enemy.y, 0xffaa00);

    // ガノンにはマスターソードのビーム以外の飛び道具が効かない
    if (enemy.type === 'ganon' && projType !== 'beam') {
      audioSynth.playShieldBlock();
      return;
    }

    const isDead = enemy.takeDamage(damage, Math.cos(angle) * 120, Math.sin(angle) * 120, isReflected);
    if (isDead) this.onEnemyDefeated(enemy);
  }

  // 敵撃破イベント一元化（剣・回転斬り・矢・魔法共通）
  onEnemyDefeated(enemy) {
    if (!enemy.isBoss) return;
    const type = enemy.type;
    const world = gameState.currentWorld;
    gameState.defeatedBosses.add(type);
    this.boss = null;

    // 残った敵弾を消す
    this.projectiles.getChildren().slice().forEach(pj => { if (pj.owner === 'enemy') pj.destroy(); });

    audioSynth.fadeOutBGM(0.3);

    if (type === 'ganon') {
      gameState.finalBossDefeated = true;
      this.autoSave();
      this.player.frozen = true;
      this.time.delayedCall(900, () => audioSynth.playVictory());
      this.time.delayedCall(3200, () => {
        this.cameras.main.fade(1200, 255, 255, 255, true);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('ClearScene'));
      });
      return;
    }

    if (type === 'agahnim') gameState.bossDefeated = true;

    const messages = {
      lanmola: 'デグサードを倒した！ 祭壇に宝箱が現れた！',
      agahnim: 'アグニムを倒した！ 光の世界・迷いの森の結界が消えた！',
      moldorm: 'デグテールを倒した！ 伝説の剣の台座が現れた！'
    };

    this.time.delayedCall(900, () => {
      audioSynth.playVictory();
      mapManager.buildMapPhysics(this, world); // 報酬（宝箱・台座）を出現させる
      this.spawnHeartContainer(world);
      this.showBanner(messages[type]);
      this.autoSave();
    });
    this.time.delayedCall(4000, () => {
      if (gameState.currentWorld === world) audioSynth.startBGM(WORLD_INFO[world].bgm);
    });
  }

  // ================= 演出 =================

  showBanner(message) {
    if (this.hud && this.hud.showMessage) this.hud.showMessage(message);
  }

  /** 角ばった火花 */
  createSpark(x, y, color = 0xffd700, count = 6) {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(x, y, 'px-spark').setTint(color).setDepth(DEPTH.EFFECT);
      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 20;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.5,
        duration: 220 + Math.random() * 120,
        onComplete: () => p.destroy()
      });
    }
  }

  /** 煙のポフッ（撃破エフェクト） */
  createSmoke(x, y, tint = 0xffffff, count = 4, spread = 14) {
    for (let i = 0; i < count; i++) {
      const s = this.add.image(
        x + (Math.random() - 0.5) * spread,
        y + (Math.random() - 0.5) * spread,
        'smoke'
      ).setTint(tint).setDepth(DEPTH.EFFECT).setScale(0.6);
      this.tweens.add({
        targets: s,
        scale: 1.6 + Math.random() * 0.6,
        alpha: 0,
        y: s.y - 10,
        duration: 420 + Math.random() * 200,
        delay: i * 40,
        onComplete: () => s.destroy()
      });
    }
  }

  createExplosion(x, y) {
    this.createSmoke(x, y);
    this.createSpark(x, y, 0xffffff, 8);
  }

  createBossExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 140, () => {
        const ox = x + (Math.random() - 0.5) * 60;
        const oy = y + (Math.random() - 0.5) * 60;
        this.createSmoke(ox, oy, i % 2 ? 0xffd0a0 : 0xffffff, 3, 20);
        this.createSpark(ox, oy, 0xffaa00, 6);
      });
    }
    this.time.delayedCall(1100, () => this.cameras.main.flash(300, 255, 255, 255));
  }

  createLeafBurst(x, y) {
    const colors = [0x58d068, 0x34b04c, 0x248838, 0x78e888];
    for (let i = 0; i < 8; i++) {
      const leaf = this.add.image(x, y, 'px-spark').setTint(colors[i % colors.length]).setDepth(DEPTH.EFFECT);
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 18;
      this.tweens.add({
        targets: leaf,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist + 8,
        angle: 180,
        alpha: 0,
        duration: 380,
        onComplete: () => leaf.destroy()
      });
    }
  }

  createDust(x, y) {
    this.createSmoke(x, y, 0xd8b870, 3, 18);
  }

  createSteam(x, y) {
    this.createSmoke(x, y, 0xa8f8f8, 5, 20);
    this.createSpark(x, y, 0xa8f8f8, 8);
  }
}
