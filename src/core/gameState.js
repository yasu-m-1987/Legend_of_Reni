import { WORLDS, ITEMS } from '../config/constants.js';

/**
 * ゲームステート管理クラス (シングルトン)
 * プレイヤーの能力値・所持品・進行フラグを一元管理し、LocalStorageセーブ＆ロードをサポート
 */
class GameStateManager {
  constructor() {
    this.reset();
    this.listeners = [];
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
    this.bossDefeated = false;
    this.finalBossDefeated = false;

    this.selectedItem = ITEMS.SWORD;
    this.activePortal = null;
    this.openedChests = new Set();
  }

  // 状態変更通知リスナー登録
  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
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
    if (slot === ITEMS.FIREROD && !this.hasFireRod) return;
    if (slot === ITEMS.BOW && !this.hasBow) return;
    this.selectedItem = slot;
    this.notify();
  }

  // LocalStorageへのセーブ
  save() {
    try {
      const data = {
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
        openedChests: Array.from(this.openedChests)
      };
      localStorage.setItem('legend_of_reni_save', JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  // LocalStorageからのロード
  load() {
    try {
      const json = localStorage.getItem('legend_of_reni_save');
      if (!json) return false;
      const data = JSON.parse(json);
      Object.assign(this, data);
      this.openedChests = new Set(data.openedChests || []);
      this.notify();
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }
}

export const gameState = new GameStateManager();
