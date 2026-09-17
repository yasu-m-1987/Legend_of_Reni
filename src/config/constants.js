/**
 * ゲーム全体で使用する定数定義
 */
export const TILE_SIZE = 32;
export const MAP_COLS = 40;
export const MAP_ROWS = 30;

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
