import { gameState } from '../core/gameState.js';
import { WORLDS, STATES, ITEMS } from '../config/constants.js';

/**
 * UIマネージャー
 * GameStateの変更通知を購読し、DOM上のステータス・アイテムスロット・HUDを更新
 */
export class UIManager {
  constructor() {
    this.currentScene = null;
    this.setupListeners();
    gameState.subscribe(() => this.update());
  }

  setScene(scene) {
    this.currentScene = scene;
    this.update();
  }

  setupListeners() {
    const setupSlotClick = (id, itemIdx) => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = () => {
          gameState.selectItem(itemIdx);
        };
        el.style.cursor = 'pointer';
      }
    };

    setupSlotClick('slot-1', ITEMS.SWORD);
    setupSlotClick('slot-2', ITEMS.FIREROD);
    setupSlotClick('slot-3', ITEMS.BOW);
    setupSlotClick('slot-4', ITEMS.MIRROR);
  }

  update(currentGameState = STATES.PLAYING) {
    const startScreen = document.getElementById('start-overlay');
    const gameOverScreen = document.getElementById('gameover-overlay');
    const clearScreen = document.getElementById('clear-overlay');
    const worldLabel = document.getElementById('world-status');
    const pearlLabel = document.getElementById('pearl-status');
    const magicBar = document.getElementById('magic-bar');
    const arrowCount = document.getElementById('arrow-count');

    // オーバーレイ
    if (startScreen) startScreen.classList.toggle('hidden', currentGameState !== STATES.TITLE);
    if (gameOverScreen) gameOverScreen.classList.toggle('hidden', currentGameState !== STATES.GAMEOVER);
    if (clearScreen) clearScreen.classList.toggle('hidden', currentGameState !== STATES.CLEAR);

    // 世界名とカラーテーマ
    const root = document.documentElement;
    if (worldLabel) {
      const w = gameState.currentWorld;
      if (w === WORLDS.LIGHT) {
        worldLabel.textContent = "光の世界";
        worldLabel.className = "value world-val light-world";
        root.style.setProperty('--theme-color', '#2ecc71');
        root.style.setProperty('--theme-glow', 'rgba(46, 204, 113, 0.35)');
      } else if (w === WORLDS.DARK) {
        worldLabel.textContent = "闇の世界";
        worldLabel.className = "value world-val dark-world";
        root.style.setProperty('--theme-color', '#9b59b6');
        root.style.setProperty('--theme-glow', 'rgba(155, 89, 182, 0.35)');
      } else if (w === WORLDS.DESERT) {
        worldLabel.textContent = "砂漠の神殿";
        worldLabel.className = "value world-val light-world";
        root.style.setProperty('--theme-color', '#f1c40f');
        root.style.setProperty('--theme-glow', 'rgba(241, 196, 15, 0.35)');
      } else if (w === WORLDS.DARK_TEMPLE) {
        worldLabel.textContent = "闇の神殿";
        worldLabel.className = "value world-val dark-world";
        root.style.setProperty('--theme-color', '#3498db');
        root.style.setProperty('--theme-glow', 'rgba(52, 152, 219, 0.35)');
      } else if (w === WORLDS.LOST_WOODS) {
        worldLabel.textContent = "迷いの森";
        worldLabel.className = "value world-val light-world";
        root.style.setProperty('--theme-color', '#2ecc71');
        root.style.setProperty('--theme-glow', 'rgba(46, 204, 113, 0.35)');
      } else if (w === WORLDS.PYRAMID) {
        worldLabel.textContent = "ピラミッド内部";
        worldLabel.className = "value world-val dark-world";
        root.style.setProperty('--theme-color', '#e74c3c');
        root.style.setProperty('--theme-glow', 'rgba(231, 76, 60, 0.35)');
      }
    }

    // ムーンパール
    if (pearlLabel) {
      if (gameState.hasMoonPearl) {
        pearlLabel.textContent = "所持";
        pearlLabel.className = "value status-on";
      } else {
        pearlLabel.textContent = "未所持";
        pearlLabel.className = "value status-off";
      }
    }

    // 魔力ゲージ・矢の残数
    if (magicBar) {
      magicBar.style.width = `${(gameState.playerMagic / gameState.playerMaxMagic) * 100}%`;
    }
    if (arrowCount) {
      arrowCount.textContent = gameState.playerArrows;
    }

    // アイテムスロット
    const slot2 = document.getElementById('slot-2');
    const slot3 = document.getElementById('slot-3');
    if (slot2) {
      if (gameState.hasFireRod) {
        slot2.classList.remove('locked');
        const nameEl = slot2.querySelector('.slot-name');
        if (nameEl) nameEl.textContent = "ファイア";
      } else {
        slot2.classList.add('locked');
        const nameEl = slot2.querySelector('.slot-name');
        if (nameEl) nameEl.textContent = "ファイア(未)";
      }
    }
    if (slot3) {
      if (gameState.hasBow) {
        slot3.classList.remove('locked');
        const nameEl = slot3.querySelector('.slot-name');
        if (nameEl) nameEl.textContent = "弓矢";
      } else {
        slot3.classList.add('locked');
        const nameEl = slot3.querySelector('.slot-name');
        if (nameEl) nameEl.textContent = "弓矢(未)";
      }
    }

    // スロットアクティブ状態
    for (let i = 1; i <= 4; i++) {
      const slot = document.getElementById(`slot-${i}`);
      if (slot) {
        slot.classList.toggle('active', gameState.selectedItem === i);
      }
    }

    // アイコン描画
    if (this.currentScene) {
      this.updateSlotIcon(1, gameState.hasMasterSword ? 'item-sword-master' : 'item-sword-normal');
      this.updateSlotIcon(2, 'item-firerod');
      this.updateSlotIcon(3, 'item-bow');
      this.updateSlotIcon(4, 'item-mirror');
    }
  }

  updateSlotIcon(slotIdx, textureKey) {
    const iconContainer = document.getElementById(`slot-icon-${slotIdx}`);
    if (iconContainer && this.currentScene) {
      if (iconContainer.dataset.currentTexture === textureKey) return;
      iconContainer.dataset.currentTexture = textureKey;
      iconContainer.innerHTML = '';

      const texture = this.currentScene.textures.get(textureKey);
      if (texture) {
        const srcCanvas = texture.getSourceImage();
        if (srcCanvas) {
          const destCanvas = document.createElement('canvas');
          destCanvas.width = 32;
          destCanvas.height = 32;
          const ctx = destCanvas.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(srcCanvas, 0, 0, 32, 32);
          destCanvas.style.width = '32px';
          destCanvas.style.height = '32px';
          iconContainer.appendChild(destCanvas);
        }
      }
    }
  }
}

export const uiManager = new UIManager();
