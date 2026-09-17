import { MAP_ROWS, MAP_COLS, TILE_SIZE, WORLDS } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';

/**
 * マップ生成およびレイヤー構築マネージャー
 * 各世界・ダンジョンの地形配列を生成し、Phaser物理グループへ展開
 */
class MapManager {
  constructor() {
    this.maps = {
      [WORLDS.LIGHT]: [],
      [WORLDS.DARK]: [],
      [WORLDS.DESERT]: [],
      [WORLDS.DARK_TEMPLE]: [],
      [WORLDS.LOST_WOODS]: [],
      [WORLDS.PYRAMID]: []
    };
    this.generateMaps();
  }

  generateMaps() {
    Object.keys(this.maps).forEach(world => {
      this.maps[world] = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
    });

    // 光・闇の世界の基本地形（外周壁・中央の川）
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
          this.maps[WORLDS.LIGHT][r][c] = 1;
          this.maps[WORLDS.DARK][r][c] = 1;
          continue;
        }

        // 中央を流れる川
        if (c === 20 && r > 4 && r < 25) {
          this.maps[WORLDS.LIGHT][r][c] = 2;
          this.maps[WORLDS.DARK][r][c] = 2;
          continue;
        }

        // 光の世界の橋（闇の世界では壊れている）
        if (c === 20 && r === 15) {
          this.maps[WORLDS.LIGHT][r][c] = 0;
          this.maps[WORLDS.DARK][r][c] = 2;
          continue;
        }

        // 障害物
        const isPathRow = [4, 6, 15, 24].includes(r);
        const isPathCol = [4, 6, 10, 30, 34].includes(c);
        if (Math.random() < 0.08 && !isPathRow && !isPathCol) {
          this.maps[WORLDS.LIGHT][r][c] = 1;
        }
        if (Math.random() < 0.10 && !isPathRow && !isPathCol) {
          this.maps[WORLDS.DARK][r][c] = 1;
        }
      }
    }

    // スポーン地点（れにの家周辺）の確保
    for (let r = 13; r <= 17; r++) {
      for (let c = 8; c <= 12; c++) {
        this.maps[WORLDS.LIGHT][r][c] = 0;
        this.maps[WORLDS.DARK][r][c] = 0;
      }
    }

    // --- 光の世界の設定 ---
    this.maps[WORLDS.LIGHT][14][12] = 3; // スポーン近傍ポータル
    this.maps[WORLDS.LIGHT][4][34] = 7;  // 弓矢の宝箱 (北東)
    this.maps[WORLDS.LIGHT][3][34] = 1;
    this.maps[WORLDS.LIGHT][5][34] = 1;
    this.maps[WORLDS.LIGHT][4][33] = 1;

    // 砂漠の神殿＆ファイアロッド宝箱 (南西)
    this.maps[WORLDS.LIGHT][24][5] = 6;
    for (let r = 22; r <= 26; r++) {
      for (let c = 3; c <= 7; c++) {
        if (r !== 24 || (c !== 5 && c !== 6 && c !== 7)) {
          this.maps[WORLDS.LIGHT][r][c] = 1;
        }
        this.maps[WORLDS.DARK][r][c] = 0; // 闇の世界では開いておりミラーで侵入可能
      }
    }

    // マスターソードの台座 (北西の森)
    this.maps[WORLDS.LIGHT][4][4] = 5;
    for (let r = 2; r < 7; r++) {
      for (let c = 2; c < 7; c++) {
        if ((r !== 4 || c !== 4) && (r !== 5 || c !== 4)) {
          this.maps[WORLDS.LIGHT][r][c] = 1;
        }
      }
    }
    this.maps[WORLDS.LIGHT][6][4] = 1;

    // --- 闇の世界の設定 ---
    // ムーンパール宝箱 (南東)
    this.maps[WORLDS.DARK][24][34] = 4;
    for (let r = 22; r <= 26; r++) {
      for (let c = 32; c <= 36; c++) {
        if (r !== 24 || (c !== 34 && c !== 33 && c !== 32)) {
          this.maps[WORLDS.DARK][r][c] = 1;
        }
        this.maps[WORLDS.LIGHT][r][c] = 0;
      }
    }
    this.maps[WORLDS.LIGHT][24][32] = 3; // 光の世界ポータル

    // 闇の神殿 (北西) - 氷ブロックで保護
    for (let r = 2; r < 7; r++) {
      for (let c = 2; c < 7; c++) {
        if (r === 6 && c === 4) {
          this.maps[WORLDS.DARK][r][c] = 8; // 氷ブロック
        } else if ((r !== 4 || c !== 4) && (r !== 5 || c !== 4)) {
          this.maps[WORLDS.DARK][r][c] = 1;
        }
      }
    }

    // ピラミッド (中央)
    this.maps[WORLDS.DARK][14][18] = 9;
    this.maps[WORLDS.DARK][13][18] = 1;
    this.maps[WORLDS.DARK][15][18] = 1;
    this.maps[WORLDS.DARK][14][17] = 1;

    // 各ダンジョンの外周壁
    [WORLDS.DESERT, WORLDS.DARK_TEMPLE, WORLDS.LOST_WOODS, WORLDS.PYRAMID].forEach(dWorld => {
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
            this.maps[dWorld][r][c] = 1;
          }
        }
      }
    });

    // 1. 砂漠の神殿
    for (let r = 4; r < 25; r++) {
      this.maps[WORLDS.DESERT][r][10] = 1;
      this.maps[WORLDS.DESERT][r][30] = 1;
    }
    for (let c = 10; c <= 30; c++) {
      if (c !== 20) {
        this.maps[WORLDS.DESERT][12][c] = 1;
        this.maps[WORLDS.DESERT][20][c] = 1;
      }
    }
    for (let c = 15; c <= 25; c++) this.maps[WORLDS.DESERT][8][c] = 1;
    this.maps[WORLDS.DESERT][8][20] = 0;

    // 2. 闇の神殿 (氷ブロック通路)
    for (let r = 5; r < 25; r += 5) {
      for (let c = 5; c < 35; c++) {
        this.maps[WORLDS.DARK_TEMPLE][r][c] = 1;
      }
      this.maps[WORLDS.DARK_TEMPLE][r][10] = 8;
      this.maps[WORLDS.DARK_TEMPLE][r][20] = 8;
      this.maps[WORLDS.DARK_TEMPLE][r][30] = 8;
    }
    for (let c = 15; c <= 25; c++) this.maps[WORLDS.DARK_TEMPLE][4][c] = 1;
    this.maps[WORLDS.DARK_TEMPLE][4][20] = 8;

    // 3. 迷いの森
    let lseed = 12345;
    const lrand = () => {
      lseed = (lseed * 9301 + 49297) % 233280;
      return lseed / 233280;
    };
    for (let r = 3; r < 26; r++) {
      for (let c = 3; c < 37; c++) {
        if (lrand() < 0.22 && (r > 8 || c !== 20)) {
          this.maps[WORLDS.LOST_WOODS][r][c] = 1;
        }
      }
    }
    for (let c = 15; c <= 25; c++) this.maps[WORLDS.LOST_WOODS][7][c] = 1;
    this.maps[WORLDS.LOST_WOODS][7][20] = 0;

    // 4. ピラミッド内部 (溶岩の川)
    for (let r = 5; r < 25; r++) {
      this.maps[WORLDS.PYRAMID][r][15] = 10;
      this.maps[WORLDS.PYRAMID][r][25] = 10;
    }
    this.maps[WORLDS.PYRAMID][12][15] = 0;
    this.maps[WORLDS.PYRAMID][18][25] = 0;
    for (let c = 15; c <= 25; c++) this.maps[WORLDS.PYRAMID][6][c] = 1;
    this.maps[WORLDS.PYRAMID][6][20] = 0;
  }

  // シーン上にマップのスプライトと物理グループを配置
  buildMapPhysics(scene, world) {
    const mapGrid = this.maps[world];

    // 既存グループのクリア
    ['walls', 'portals', 'chests', 'pedestals', 'iceBlocks', 'pyramids', 'bushes'].forEach(grp => {
      if (scene[grp]) scene[grp].clear(true, true);
    });

    // 床スプライトの描画
    let floorTexture = 'tile-grass-light';
    let wallTexture = 'tile-wall-light';
    let waterTexture = 'tile-water-light';

    if (world === WORLDS.DARK) {
      floorTexture = 'tile-grass-dark';
      wallTexture = 'tile-wall-dark';
      waterTexture = 'tile-water-dark';
    } else if (world === WORLDS.DESERT) {
      floorTexture = 'tile-floor-desert';
      wallTexture = 'tile-wall-desert';
    } else if (world === WORLDS.DARK_TEMPLE) {
      floorTexture = 'tile-floor-darktemple';
      wallTexture = 'tile-wall-darktemple';
    } else if (world === WORLDS.LOST_WOODS) {
      floorTexture = 'tile-grass-light';
      wallTexture = 'tile-wall-light';
    } else if (world === WORLDS.PYRAMID) {
      floorTexture = 'tile-floor-pyramid';
      wallTexture = 'tile-wall-pyramid';
    }

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const x = c * TILE_SIZE + 16;
        const y = r * TILE_SIZE + 16;
        const val = mapGrid[r][c];

        // 床を描画
        scene.add.sprite(x, y, floorTexture).setDepth(0);

        if (val === 1) {
          // 壁
          const wall = scene.walls.create(x, y, wallTexture);
          wall.refreshBody();
        } else if (val === 2) {
          // 水
          const water = scene.walls.create(x, y, waterTexture);
          water.refreshBody();
        } else if (val === 10) {
          // 溶岩
          const lava = scene.walls.create(x, y, 'tile-lava');
          lava.refreshBody();
        } else if (val === 3) {
          // ポータル
          scene.portals.create(x, y, 'portal');
        } else if ([4, 6, 7].includes(val)) {
          // 宝箱
          const chestId = `${world}_${r}_${c}`;
          if (!gameState.openedChests.has(chestId)) {
            const chest = scene.chests.create(x, y, 'chest');
            chest.chestType = val;
            chest.chestId = chestId;
            chest.refreshBody();
          }
        } else if (val === 5) {
          // マスターソード台座
          if (!gameState.hasMasterSword) {
            const ped = scene.pedestals.create(x, y, 'item-sword-master');
            ped.refreshBody();
          }
        } else if (val === 8) {
          // 氷ブロック
          const ice = scene.iceBlocks.create(x, y, 'tile-wall-darktemple');
          ice.gridX = c;
          ice.gridY = r;
          ice.setTint(0x80d8ff);
          ice.refreshBody();
        } else if (val === 9) {
          // ピラミッド
          const pyr = scene.pyramids.create(x, y, 'tile-wall-pyramid');
          pyr.refreshBody();
        }
      }
    }

    // 草むら（刈れるオブジェクト）の配置（光の世界と迷いの森）
    if (world === WORLDS.LIGHT || world === WORLDS.LOST_WOODS) {
      this.spawnBushes(scene, world);
    }
  }

  // 刈れる草むらの生成（通路やスポーン地点を避ける）
  spawnBushes(scene, world) {
    const mapGrid = this.maps[world];
    const pathRows = [4, 6, 15, 24];
    const pathCols = [4, 6, 10, 20, 30, 34];

    for (let r = 2; r < MAP_ROWS - 2; r++) {
      for (let c = 2; c < MAP_COLS - 2; c++) {
        // 通路やスポーン地点は除外
        if (pathRows.includes(r) || pathCols.includes(c)) continue;
        if (r >= 12 && r <= 18 && c >= 7 && c <= 13) continue;

        if (mapGrid[r][c] === 0 && Math.random() < 0.12) {
          const x = c * TILE_SIZE + 16;
          const y = r * TILE_SIZE + 16;
          const bush = scene.bushes.create(x, y, 'cut-bush');
          bush.setDepth(5);
          bush.refreshBody();
        }
      }
    }
  }

  // 氷ブロックをファイアロッドで溶かす
  meltIceBlock(scene, iceBlock) {
    const gx = iceBlock.gridX;
    const gy = iceBlock.gridY;
    this.maps[gameState.currentWorld][gy][gx] = 0;
    iceBlock.destroy();
    audioSynth.playPuzzleSolved();
    scene.showBanner("氷が溶けて道が開いた！");
  }
}

export const mapManager = new MapManager();
