import {
  MAP_ROWS, MAP_COLS, TILE_SIZE, WORLDS, TILES, DUNGEONS, ENTRANCES,
  DUNGEON_START, DUNGEON_EXITS, DUNGEON_DOOR, OVERWORLD_START, BOSS_ROOMS, DEPTH
} from '../config/constants.js';
import { gameState } from '../core/gameState.js';

/** シード付き疑似乱数（mulberry32） */
function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 文字列から 32bit ハッシュ（ワールド毎に乱数系列をずらす用） */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TEXTURE_SETS = {
  [WORLDS.LIGHT]:       { floor: 'tile-grass-light',      wall: 'tile-wall-light',      water: 'tile-water-light' },
  [WORLDS.DARK]:        { floor: 'tile-grass-dark',       wall: 'tile-wall-dark',       water: 'tile-water-dark' },
  [WORLDS.DESERT]:      { floor: 'tile-floor-desert',     wall: 'tile-wall-desert',     water: 'tile-water-light' },
  [WORLDS.DARK_TEMPLE]: { floor: 'tile-floor-darktemple', wall: 'tile-wall-darktemple', water: 'tile-water-dark' },
  [WORLDS.LOST_WOODS]:  { floor: 'tile-grass-light',      wall: 'tile-wall-light',      water: 'tile-water-light' },
  [WORLDS.PYRAMID]:     { floor: 'tile-floor-pyramid',    wall: 'tile-wall-pyramid',    water: 'tile-water-dark' }
};

// 地上の通路（障害物を置かない行・列）
const PATH_ROWS = [4, 6, 15, 24];
const PATH_COLS = [4, 6, 10, 30, 34];

/**
 * マップ生成およびレイヤー構築マネージャー
 * - 地形はセーブデータのシードから決定的に生成（ロードしても同じ地形）
 * - 宝箱・氷・結界などの可変要素は gameState から都度解決し、地形配列は書き換えない
 */
class MapManager {
  constructor() {
    this.maps = {};
    this.seed = null;
  }

  /** gameState のシードが変わっていれば地形を作り直す */
  ensureGenerated() {
    if (this.seed !== gameState.mapSeed) {
      this.generateMaps(gameState.mapSeed);
    }
  }

  generateMaps(seed) {
    this.seed = seed;
    const rand = createRng(seed);
    const L = WORLDS.LIGHT;
    const D = WORLDS.DARK;

    Object.values(WORLDS).forEach(world => {
      this.maps[world] = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(TILES.FLOOR));
    });
    const set = (world, r, c, tile) => { this.maps[world][r][c] = tile; };
    const fillRect = (world, r0, c0, r1, c1, tile) => {
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(world, r, c, tile);
    };

    // ---------- 光・闇の世界の基本地形（外周壁・中央の川・障害物） ----------
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
          set(L, r, c, TILES.WALL);
          set(D, r, c, TILES.WALL);
          continue;
        }
        if (c === 20 && r > 4 && r < 25) {
          // 光の世界には橋が架かっているが、闇の世界では崩れている
          set(L, r, c, r === 15 ? TILES.FLOOR : TILES.WATER);
          set(D, r, c, TILES.WATER);
          continue;
        }
        const onPath = PATH_ROWS.includes(r) || PATH_COLS.includes(c);
        if (!onPath && rand() < 0.08) set(L, r, c, TILES.WALL);
        if (!onPath && rand() < 0.10) set(D, r, c, TILES.WALL);
      }
    }

    // スポーン地点（れにの家周辺）の確保
    fillRect(L, 13, 8, 17, 12, TILES.FLOOR);
    fillRect(D, 13, 8, 17, 12, TILES.FLOOR);

    // ---------- 光の世界 ----------
    set(L, 14, 12, TILES.PORTAL); // スポーン近傍ポータル

    // 弓矢の宝箱（北東の岩陰）
    set(L, 4, 34, TILES.CHEST_BOW);
    set(L, 3, 34, TILES.WALL);
    set(L, 5, 34, TILES.WALL);
    set(L, 4, 33, TILES.WALL);

    // 砂漠の神殿の入口（南西）: 東側から回り込んで入る
    fillRect(L, 22, 3, 26, 7, TILES.WALL);
    set(L, 24, 6, TILES.FLOOR);
    set(L, 24, 7, TILES.FLOOR);
    fillRect(D, 22, 3, 26, 7, TILES.FLOOR);

    // 迷いの森の入口（北西）: アグニム撃破まで結界で塞がれている
    fillRect(L, 2, 2, 6, 6, TILES.WALL);

    // ムーンパールのある岩場への抜け道ポータル（南東）
    fillRect(L, 22, 32, 26, 36, TILES.FLOOR);
    set(L, 24, 32, TILES.PORTAL);

    // ---------- 闇の世界 ----------
    // ムーンパールの宝箱（南東の岩場）
    fillRect(D, 22, 32, 26, 36, TILES.WALL);
    set(D, 24, 32, TILES.FLOOR);
    set(D, 24, 33, TILES.FLOOR);
    set(D, 24, 34, TILES.CHEST_PEARL);

    // 闇の神殿（北西）: 入口を氷が塞いでいる
    fillRect(D, 2, 2, 6, 6, TILES.WALL);
    set(D, 6, 4, TILES.ICE);

    // ピラミッド（中央）
    set(D, 14, 18, TILES.PYRAMID);
    set(D, 13, 18, TILES.WALL);
    set(D, 15, 18, TILES.WALL);
    set(D, 14, 17, TILES.WALL);

    // 入口そのもの・入口の手前・ダンジョンからの帰還地点は必ず歩けるようにする
    // （結界などで塞ぐ処理は tileAt() が状態を見て行う）
    ENTRANCES.forEach(e => {
      if (this.maps[e.world][e.r][e.c] === TILES.WALL) set(e.world, e.r, e.c, TILES.FLOOR);
      const below = this.maps[e.world][e.r + 1];
      if (below && below[e.c] === TILES.WALL) below[e.c] = TILES.FLOOR;
    });
    Object.values(DUNGEON_EXITS).forEach(x => set(x.world, x.r, x.c, TILES.FLOOR));
    set(D, 15, 19, TILES.FLOOR);

    // ---------- ダンジョン共通（外周壁・南の出口） ----------
    DUNGEONS.forEach(dw => {
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) set(dw, r, c, TILES.WALL);
        }
      }
      set(dw, DUNGEON_DOOR.r, DUNGEON_DOOR.c, TILES.FLOOR);
    });

    // 1. 砂漠の神殿
    const DS = WORLDS.DESERT;
    for (let r = 4; r < 25; r++) {
      set(DS, r, 10, TILES.WALL);
      set(DS, r, 30, TILES.WALL);
    }
    for (let c = 10; c <= 30; c++) {
      if (c !== 20) {
        set(DS, 12, c, TILES.WALL);
        set(DS, 20, c, TILES.WALL);
      }
    }
    for (let c = 15; c <= 25; c++) set(DS, 8, c, TILES.WALL);
    set(DS, 8, 20, TILES.FLOOR);

    // 2. 闇の神殿（氷ブロックを溶かさないと先へ進めない）
    const DT = WORLDS.DARK_TEMPLE;
    for (let r = 5; r < 25; r += 5) {
      for (let c = 1; c < MAP_COLS - 1; c++) set(DT, r, c, TILES.WALL);
      set(DT, r, 10, TILES.ICE);
      set(DT, r, 20, TILES.ICE);
      set(DT, r, 30, TILES.ICE);
    }

    // 3. 迷いの森（ランダムな木立。中央の道は必ず確保）
    const LW = WORLDS.LOST_WOODS;
    for (let r = 3; r < 26; r++) {
      for (let c = 3; c < 37; c++) {
        if (rand() < 0.22 && c !== 20) set(LW, r, c, TILES.WALL);
      }
    }
    for (let c = 15; c <= 25; c++) set(LW, 7, c, TILES.WALL);
    set(LW, 7, 20, TILES.FLOOR);

    // 4. ピラミッド内部（溶岩の川）
    const PY = WORLDS.PYRAMID;
    for (let r = 5; r < 25; r++) {
      set(PY, r, 15, TILES.LAVA);
      set(PY, r, 25, TILES.LAVA);
    }
    set(PY, 12, 15, TILES.FLOOR);
    set(PY, 18, 25, TILES.FLOOR);
    for (let c = 15; c <= 25; c++) set(PY, 6, c, TILES.WALL);
    set(PY, 6, 20, TILES.FLOOR);

    // 各ダンジョンのスタート地点〜ボス部屋は必ず通れるようにする
    DUNGEONS.forEach(dw => {
      fillRect(dw, DUNGEON_START.r, DUNGEON_START.c - 1, DUNGEON_DOOR.r - 1, DUNGEON_START.c + 1, TILES.FLOOR);
      const room = BOSS_ROOMS[dw];
      if (room) set(dw, room.r, room.c, TILES.FLOOR);
    });
  }

  // ---------- 状態を反映したタイル解決 ----------

  /** 宝箱・氷・結界・ボス報酬・ミラーのポータルなどを反映したタイル値 */
  tileAt(world, r, c) {
    const row = this.maps[world] && this.maps[world][r];
    if (!row || row[c] === undefined) return TILES.WALL;
    let tile = row[c];

    if (tile === TILES.ICE && gameState.meltedIce.has(`${world}_${r}_${c}`)) tile = TILES.FLOOR;

    const room = BOSS_ROOMS[world];
    if (room && room.reward && room.reward.r === r && room.reward.c === c && gameState.defeatedBosses.has(room.boss)) {
      tile = room.reward.tile;
    }

    const entrance = this.entranceAt(world, r, c);
    if (entrance && entrance.requires && !gameState[entrance.requires]) tile = TILES.WALL; // 結界

    const portal = gameState.activePortal;
    if (world === WORLDS.LIGHT && portal && portal.y === r && portal.x === c && tile === TILES.FLOOR) {
      tile = TILES.PORTAL;
    }
    return tile;
  }

  entranceAt(world, r, c) {
    return ENTRANCES.find(e => e.world === world && e.r === r && e.c === c) || null;
  }

  /**
   * 指定タイルに最も近い「安全に立てる床」を探す（壁の中へのワープ防止）
   * ポータルや入口の上は避ける
   */
  findSafeSpot(world, c, r) {
    this.ensureGenerated();
    const ok = (cc, rr) => this.tileAt(world, rr, cc) === TILES.FLOOR
      && !this.entranceAt(world, rr, cc)
      && rr > 0 && rr < MAP_ROWS - 1 && cc > 0 && cc < MAP_COLS - 1;

    for (let radius = 0; radius < Math.max(MAP_COLS, MAP_ROWS); radius++) {
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
          if (ok(c + dc, r + dr)) return { c: c + dc, r: r + dr };
        }
      }
    }
    return { c: OVERWORLD_START.c, r: OVERWORLD_START.r };
  }

  // ---------- シーンへの展開 ----------

  /** シーン上にマップのスプライトと物理グループを配置 */
  buildMapPhysics(scene, world) {
    this.ensureGenerated();

    ['walls', 'waters', 'portals', 'chests', 'pedestals', 'iceBlocks', 'bushes'].forEach(grp => {
      if (scene[grp]) scene[grp].clear(true, true);
    });
    if (scene.mapDecor) scene.mapDecor.forEach(o => o.destroy());
    scene.mapDecor = [];

    const tex = TEXTURE_SETS[world] || TEXTURE_SETS[WORLDS.LIGHT];
    const W = MAP_COLS * TILE_SIZE;
    const H = MAP_ROWS * TILE_SIZE;
    const decor = (obj) => { scene.mapDecor.push(obj); return obj; };

    // 床は 1 枚のタイルスプライトで描画（再構築のたびにスプライトが増えないように）
    decor(scene.add.tileSprite(0, 0, W, H, tex.floor).setOrigin(0).setDepth(DEPTH.FLOOR));

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const x = c * TILE_SIZE + TILE_SIZE / 2;
        const y = r * TILE_SIZE + TILE_SIZE / 2;
        const tile = this.tileAt(world, r, c);
        const entrance = this.entranceAt(world, r, c);

        switch (tile) {
          case TILES.WALL: {
            const wall = scene.walls.create(x, y, entrance ? 'tile-entrance' : tex.wall).setDepth(DEPTH.WALL);
            if (entrance) wall.setTint(0xb57bff); // 結界
            wall.refreshBody();
            break;
          }
          case TILES.WATER:
            scene.waters.create(x, y, tex.water).setDepth(DEPTH.WALL).refreshBody();
            break;
          case TILES.LAVA:
            scene.waters.create(x, y, 'tile-lava').setDepth(DEPTH.WALL).refreshBody();
            break;
          case TILES.PORTAL: {
            const portal = scene.portals.create(x, y, 'portal').setDepth(DEPTH.DECOR);
            portal.body.setSize(16, 16);
            scene.tweens.add({ targets: portal, angle: 360, duration: 3000, repeat: -1 });
            break;
          }
          case TILES.CHEST_PEARL:
          case TILES.CHEST_FIREROD:
          case TILES.CHEST_BOW: {
            const chestId = `${world}_${r}_${c}`;
            const chest = scene.chests.create(x, y, 'chest').setDepth(DEPTH.OBJECT);
            chest.chestType = tile;
            chest.chestId = chestId;
            chest.opened = gameState.openedChests.has(chestId);
            if (chest.opened) chest.setTint(0x6b6b6b);
            chest.refreshBody();
            break;
          }
          case TILES.PEDESTAL:
            if (!gameState.hasMasterSword) {
              scene.pedestals.create(x, y, 'item-sword-master').setDepth(DEPTH.OBJECT).refreshBody();
            }
            break;
          case TILES.ICE: {
            const ice = scene.iceBlocks.create(x, y, 'tile-wall-darktemple').setDepth(DEPTH.WALL);
            ice.iceId = `${world}_${r}_${c}`;
            ice.setTint(0x80d8ff);
            ice.refreshBody();
            break;
          }
          case TILES.PYRAMID:
            decor(scene.add.image(x, y, 'tile-floor-pyramid').setDepth(DEPTH.DECOR));
            break;
          default:
            break;
        }

        // 入口の階段（結界・氷で塞がれていない時）
        if (entrance && (tile === TILES.FLOOR || tile === TILES.PYRAMID)) {
          decor(scene.add.image(x, y, 'stairs').setDepth(DEPTH.DECOR));
        }
      }
    }

    // ダンジョンの出口（南の扉）
    if (DUNGEONS.includes(world)) {
      decor(scene.add.image(
        DUNGEON_DOOR.c * TILE_SIZE + TILE_SIZE / 2,
        DUNGEON_DOOR.r * TILE_SIZE + TILE_SIZE / 2,
        'door-exit'
      ).setDepth(DEPTH.DECOR));
    }

    if (world === WORLDS.LIGHT || world === WORLDS.LOST_WOODS) {
      this.spawnBushes(scene, world);
    }
  }

  /** 刈れる草むら（通路・スポーン地点・入口付近を避けて配置。入るたびに生え直す） */
  spawnBushes(scene, world) {
    const rand = createRng(this.seed ^ hashString(world));
    const pathCols = PATH_COLS.concat([20]);
    const nearEntrance = (r, c) => ENTRANCES.some(e => e.world === world && Math.abs(e.r - r) <= 1 && Math.abs(e.c - c) <= 1)
      || Object.values(DUNGEON_EXITS).some(x => x.world === world && Math.abs(x.r - r) <= 1 && Math.abs(x.c - c) <= 1);

    for (let r = 2; r < MAP_ROWS - 2; r++) {
      for (let c = 2; c < MAP_COLS - 2; c++) {
        const roll = rand();
        if (PATH_ROWS.includes(r) || pathCols.includes(c)) continue;
        if (r >= 12 && r <= 18 && c >= 7 && c <= 13) continue;
        if (DUNGEONS.includes(world) && r >= DUNGEON_START.r - 2) continue;
        if (nearEntrance(r, c)) continue;

        if (this.tileAt(world, r, c) === TILES.FLOOR && roll < 0.12) {
          const bush = scene.bushes.create(c * TILE_SIZE + 16, r * TILE_SIZE + 16, 'cut-bush');
          bush.setDepth(DEPTH.OBJECT);
          bush.refreshBody();
        }
      }
    }
  }
}

export const mapManager = new MapManager();
