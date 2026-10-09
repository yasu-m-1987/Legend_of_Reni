/**
 * ゲーム全体で使用する定数定義
 */
export const TILE_SIZE = 32;
export const MAP_COLS = 40;
export const MAP_ROWS = 30;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;

export const STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  CUTSCENE: 'cutscene',
  GAMEOVER: 'gameover',
  CLEAR: 'clear'
};

export const WORLDS = {
  LIGHT: 'light',
  DARK: 'dark',
  DESERT: 'desert',
  DARK_TEMPLE: 'dark_temple',
  LOST_WOODS: 'lost_woods',
  PYRAMID: 'pyramid'
};

export const ITEMS = {
  SWORD: 1,
  FIREROD: 2,
  BOW: 3,
  MIRROR: 4
};

/**
 * マップタイル種別
 */
export const TILES = {
  FLOOR: 0,
  WALL: 1,
  WATER: 2,
  PORTAL: 3,
  CHEST_PEARL: 4,
  PEDESTAL: 5,
  CHEST_FIREROD: 6,
  CHEST_BOW: 7,
  ICE: 8,
  PYRAMID: 9,
  LAVA: 10
};

export const DUNGEONS = [WORLDS.DESERT, WORLDS.DARK_TEMPLE, WORLDS.LOST_WOODS, WORLDS.PYRAMID];

/**
 * 各エリアの表示名・テーマカラー・BGM・ボス情報
 */
export const WORLD_INFO = {
  [WORLDS.LIGHT]:       { name: '光の世界',       color: '#3ddc84', glow: 'rgba(61, 220, 132, 0.35)', bgm: 'field',   dark: false },
  [WORLDS.DARK]:        { name: '闇の世界',       color: '#b57bff', glow: 'rgba(181, 123, 255, 0.35)', bgm: 'dark',    dark: true },
  [WORLDS.DESERT]:      { name: '砂漠の神殿',     color: '#f5c542', glow: 'rgba(245, 197, 66, 0.35)', bgm: 'dungeon', dark: false, boss: 'lanmola' },
  [WORLDS.DARK_TEMPLE]: { name: '闇の神殿',       color: '#4fa9ff', glow: 'rgba(79, 169, 255, 0.35)', bgm: 'dungeon', dark: true,  boss: 'agahnim' },
  [WORLDS.LOST_WOODS]:  { name: '迷いの森',       color: '#3ddc84', glow: 'rgba(61, 220, 132, 0.35)', bgm: 'dungeon', dark: false, boss: 'moldorm' },
  [WORLDS.PYRAMID]:     { name: 'ピラミッド内部', color: '#ff5a4f', glow: 'rgba(255, 90, 79, 0.35)', bgm: 'boss',    dark: true,  boss: 'ganon' }
};

export const BOSS_NAMES = {
  lanmola: 'デグサード',
  agahnim: '魔術師アグニム',
  moldorm: 'デグテール',
  ganon: '魔王ガノン'
};

/**
 * 地上のダンジョン入口（タイル座標）
 */
export const ENTRANCES = [
  { world: WORLDS.LIGHT, c: 6,  r: 24, target: WORLDS.DESERT },
  { world: WORLDS.LIGHT, c: 4,  r: 6,  target: WORLDS.LOST_WOODS, requires: 'bossDefeated' },
  { world: WORLDS.DARK,  c: 4,  r: 6,  target: WORLDS.DARK_TEMPLE },
  { world: WORLDS.DARK,  c: 18, r: 14, target: WORLDS.PYRAMID }
];

/**
 * ダンジョンの開始位置と、脱出時の戻り先（タイル座標）
 */
export const DUNGEON_START = { c: 20, r: 27 };
export const DUNGEON_EXITS = {
  [WORLDS.DESERT]:      { world: WORLDS.LIGHT, c: 8,  r: 24 },
  [WORLDS.DARK_TEMPLE]: { world: WORLDS.DARK,  c: 4,  r: 8 },
  [WORLDS.LOST_WOODS]:  { world: WORLDS.LIGHT, c: 4,  r: 8 },
  [WORLDS.PYRAMID]:     { world: WORLDS.DARK,  c: 19, r: 14 }
};

/** 地上世界の初期スポーン位置（タイル座標） */
export const OVERWORLD_START = { c: 10, r: 15 };

/** 描画の重なり順 */
export const DEPTH = {
  FLOOR: -10,
  DECOR: -5,
  WALL: 1,
  OBJECT: 2,
  SHADOW: 4,
  ENTITY: 10,
  EFFECT: 1000,
  OVERHEAD: 2000
};
