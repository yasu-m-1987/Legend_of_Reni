import { WORLDS, ITEMS } from '../config/constants.js';

const SAVE_KEY = 'legend_of_reni_save';
const SAVE_VERSION = 2;

/**
 * ゲームステート管理クラス (シングルトン)
 * プレイヤーの能力値・所持品・進行フラグを一元管理し、LocalStorageセーブ＆ロードをサポート
 */
class GameStateManager {
  constructor() {
    this.listeners = [];
    this.reset();
  }

  reset() {
    this.currentWorld = WORLDS.LIGHT;
    this.playerHealth = 6;
    this.playerMaxHealth = 6;
    this.playerMagic = 100;
    this.playerMaxMagic = 100;
    this.playerArrows = 15;
    this.playerMaxArrows = 30;

    this.hasMoonPearl = false;
    this.hasMasterSword = false;
    this.hasFireRod = false;
    this.hasBow = false;
    this.bossDefeated = false;       // アグニム撃破（森の結界解除）
    this.finalBossDefeated = false;  // ガノン撃破

    this.selectedItem = ITEMS.SWORD;
    this.activePortal = null;
    this.openedChests = new Set();
    this.defeatedBosses = new Set();
    this.meltedIce = new Set();
    this.collectedContainers = new Set();

    // マップ生成用シード（セーブすると同じ地形が再現される）
    this.mapSeed = Math.floor(Math.random() * 1e9);

    // プレイ記録
    this.playTime = 0;
    this.deathCount = 0;
  }

  // 状態変更通知リスナー登録（解除関数を返す）
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  get isBunny() {
    return this.currentWorld === WORLDS.DARK && !this.hasMoonPearl;
  }

  // ダメージを受ける
  takeDamage(amount) {
    this.playerHealth = Math.max(0, this.playerHealth - amount);
    this.notify();
    return this.playerHealth <= 0;
  }

  // 回復
  heal(amount) {
    this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + amount);
    this.notify();
  }

  // ハートのうつわ（最大ライフ +1 ハート）
  addHeartContainer(id) {
    if (id && this.collectedContainers.has(id)) return false;
    if (id) this.collectedContainers.add(id);
    this.playerMaxHealth = Math.min(20, this.playerMaxHealth + 2);
    this.playerHealth = this.playerMaxHealth;
    this.notify();
    return true;
  }

  // 魔力消費
  consumeMagic(amount) {
    if (this.playerMagic >= amount) {
      this.playerMagic -= amount;
      this.notify();
      return true;
    }
    return false;
  }

  // 魔力回復
  restoreMagic(amount) {
    this.playerMagic = Math.min(this.playerMaxMagic, this.playerMagic + amount);
    this.notify();
  }

  // 矢消費
  consumeArrow() {
    if (this.playerArrows > 0) {
      this.playerArrows--;
      this.notify();
      return true;
    }
    return false;
  }

  // 矢補給
  addArrows(amount) {
    this.playerArrows = Math.min(this.playerMaxArrows, this.playerArrows + amount);
    this.notify();
  }

  // アイテム選択
  selectItem(slot) {
    if (slot === ITEMS.FIREROD && !this.hasFireRod) return false;
    if (slot === ITEMS.BOW && !this.hasBow) return false;
    this.selectedItem = slot;
    this.notify();
    return true;
  }

  // ---------- セーブ / ロード ----------

  hasSave() {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch (e) {
      return false;
    }
  }

  /** 現在の状態を変えずにセーブデータの中身を読む（タイトル画面の表示用） */
  peekSave() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      return data && data.version === SAVE_VERSION ? data : null;
    } catch (e) {
      return null;
    }
  }

  // LocalStorageへのセーブ
  save() {
    try {
      const data = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        currentWorld: this.currentWorld,
        playerHealth: this.playerHealth,
        playerMaxHealth: this.playerMaxHealth,
        playerMagic: this.playerMagic,
        playerArrows: this.playerArrows,
        hasMoonPearl: this.hasMoonPearl,
        hasMasterSword: this.hasMasterSword,
        hasFireRod: this.hasFireRod,
        hasBow: this.hasBow,
        bossDefeated: this.bossDefeated,
        finalBossDefeated: this.finalBossDefeated,
        selectedItem: this.selectedItem,
        activePortal: this.activePortal,
        openedChests: Array.from(this.openedChests),
        defeatedBosses: Array.from(this.defeatedBosses),
        meltedIce: Array.from(this.meltedIce),
        collectedContainers: Array.from(this.collectedContainers),
        mapSeed: this.mapSeed,
        playTime: this.playTime,
        deathCount: this.deathCount
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  // LocalStorageからのロード
  load() {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) return false;
      const data = JSON.parse(json);
      if (data.version !== SAVE_VERSION) return false;

      this.reset();
      const sets = ['openedChests', 'defeatedBosses', 'meltedIce', 'collectedContainers'];
      Object.keys(data).forEach(k => {
        if (k === 'version' || k === 'savedAt') return;
        if (sets.includes(k)) this[k] = new Set(data[k] || []);
        else this[k] = data[k];
      });
      this.notify();
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }

  deleteSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* noop */ }
  }
}

export const gameState = new GameStateManager();
