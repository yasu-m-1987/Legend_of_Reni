import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';
import { STATES, ITEMS, WORLD_INFO } from '../config/constants.js';

/**
 * UIマネージャー
 * GameStateの変更通知を購読し、DOM上のサイドバー（ステータス・アイテムスロット・サウンド）を更新
 */
export class UIManager {
  constructor() {
    this.currentScene = null;
    this.setupListeners();
    gameState.subscribe(() => this.update());
    window.addEventListener('reni:mute', () => this.updateMuteButton());
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
          if (gameState.selectItem(itemIdx)) audioSynth.playCursor();
          else audioSynth.playError();
        };
        el.style.cursor = 'pointer';
      }
    };

    setupSlotClick('slot-1', ITEMS.SWORD);
    setupSlotClick('slot-2', ITEMS.FIREROD);
    setupSlotClick('slot-3', ITEMS.BOW);
    setupSlotClick('slot-4', ITEMS.MIRROR);

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.onclick = () => {
        audioSynth.resume();
        audioSynth.toggleMute();
        muteBtn.blur(); // フォーカスが残るとスペースキーでボタンが押されてしまう
      };
    }
    this.updateMuteButton();
  }

  updateMuteButton() {
    const muteBtn = document.getElementById('mute-btn');
    if (!muteBtn) return;
    muteBtn.textContent = audioSynth.isMuted ? '🔇 サウンド OFF' : '🔊 サウンド ON';
    muteBtn.classList.toggle('muted', audioSynth.isMuted);
  }

  update(currentGameState = STATES.PLAYING) {
    this.gameMode = currentGameState;
    const worldLabel = document.getElementById('world-status');
    const pearlLabel = document.getElementById('pearl-status');
    const magicBar = document.getElementById('magic-bar');
    const arrowCount = document.getElementById('arrow-count');
    const heartsContainer = document.getElementById('hearts-container');

    // ライフ（ハート）表示
    if (heartsContainer) {
      let heartsText = '';
      const totalHearts = Math.ceil(gameState.playerMaxHealth / 2);
      let hp = gameState.playerHealth;
      for (let i = 0; i < totalHearts; i++) {
        if (hp >= 2) {
          heartsText += '❤️';
          hp -= 2;
        } else if (hp === 1) {
          heartsText += '💔';
          hp -= 1;
        } else {
          heartsText += '🖤';
        }
      }
      heartsContainer.textContent = heartsText;
    }

    // 世界名とカラーテーマ
    const info = WORLD_INFO[gameState.currentWorld];
    if (worldLabel && info) {
      worldLabel.textContent = info.name;
      worldLabel.className = `value world-val ${info.dark ? 'dark-world' : 'light-world'}`;
      const root = document.documentElement;
      root.style.setProperty('--theme-color', info.color);
      root.style.setProperty('--theme-glow', info.glow);
    }

    // ムーンパール
    if (pearlLabel) {
      pearlLabel.textContent = gameState.hasMoonPearl ? '所持' : '未所持';
      pearlLabel.className = `value ${gameState.hasMoonPearl ? 'status-on' : 'status-off'}`;
    }

    // 魔力ゲージ・矢の残数
    if (magicBar) {
      magicBar.style.width = `${(gameState.playerMagic / gameState.playerMaxMagic) * 100}%`;
    }
    if (arrowCount) {
      arrowCount.textContent = gameState.playerArrows;
    }

    // アイテムスロット（所持状況）
    const setSlot = (id, owned, name) => {
      const slot = document.getElementById(id);
      if (!slot) return;
      slot.classList.toggle('locked', !owned);
      const nameEl = slot.querySelector('.slot-name');
      if (nameEl) nameEl.textContent = owned ? name : `${name}(未)`;
    };
    setSlot('slot-1', true, gameState.hasMasterSword ? 'マスター' : 'つるぎ');
    setSlot('slot-2', gameState.hasFireRod, 'ファイア');
    setSlot('slot-3', gameState.hasBow, '弓矢');

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
      if (!this.currentScene.textures.exists(textureKey)) return;
      iconContainer.dataset.currentTexture = textureKey;
      iconContainer.innerHTML = '';

      const srcCanvas = this.currentScene.textures.get(textureKey).getSourceImage();
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

export const uiManager = new UIManager();
