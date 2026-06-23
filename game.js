/**
 * れにの伝説 (Legend of Reni) - Main Game Logic
 * Powered by Phaser 3 & Web Audio Synth
 */

// --- Global Flags & Settings ---
const TILE_SIZE = 32;
const MAP_COLS = 40;
const MAP_ROWS = 30;

// Game States
const STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
  CLEAR: 'clear'
};

let gameState = STATES.TITLE;
let gameScene = null;

// Game State variables managed across scenes
let currentWorld = 'light'; // 'light' or 'dark'
let hasMoonPearl = false;
let hasMasterSword = false;
let hasFireRod = false;
let hasBow = false;
let bossDefeated = false; // Agahnim
let finalBossDefeated = false; // Ganon
let activePortal = null; // Portal position in light world

let selectedItem = 1; // 1: 剣, 2: ファイアロッド, 3: 弓矢, 4: ミラー
let playerHealth = 6;
let playerMaxHealth = 6;
let playerMagic = 100;
let playerMaxMagic = 100;
let playerArrows = 15;
let playerMaxArrows = 30;

const maps = {
  light: [],
  dark: [],
  desert: [],
  dark_temple: [],
  lost_woods: [],
  pyramid: []
};

// --- Map Generation ---
function generateMaps() {
  maps.light = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
  maps.dark = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
  maps.desert = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
  maps.dark_temple = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
  maps.lost_woods = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));
  maps.pyramid = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      // Borders
      if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
        maps.light[r][c] = 1;
        maps.dark[r][c] = 1;
        continue;
      }

      // Middle dividing river (Water)
      if (c === 20 && r > 4 && r < 25) {
        maps.light[r][c] = 2;
        maps.dark[r][c] = 2; // Purple river
        continue;
      }
      
      // Bridges in light, broken bridge in dark
      if (c === 20 && r === 15) {
        maps.light[r][c] = 0; // Solid bridge
        maps.dark[r][c] = 2; // Broken bridge (Must use Dark World / Mirror wrap)
        continue;
      }

      // Random boulders / trees (Keep paths relatively clear)
      // Exempt main horizontal corridors (r=4, 6, 15, 24) and vertical corridors (c=4, 6, 10, 30, 34)
      const isPathRow = [4, 6, 15, 24].includes(r);
      const isPathCol = [4, 6, 10, 30, 34].includes(c);
      
      if (Math.random() < 0.08 && !isPathRow && !isPathCol) {
        maps.light[r][c] = 1;
      }
      if (Math.random() < 0.10 && !isPathRow && !isPathCol) {
        maps.dark[r][c] = 1;
      }
    }
  }

  // Clear spawn area
  for (let r = 13; r <= 17; r++) {
    for (let c = 8; c <= 12; c++) {
      maps.light[r][c] = 0;
      maps.dark[r][c] = 0;
    }
  }

  // --- Light World Setup ---
  // Setup Portal in Light World (Near Spawn)
  maps.light[14][12] = 3; 

  // Setup Bow Chest in Light World (North East corner)
  maps.light[4][34] = 7;
  maps.light[3][34] = 1;
  maps.light[5][34] = 1;
  maps.light[4][33] = 1; // Needs to walk in from right

  // Setup Desert Temple & Fire Rod Chest in Light World (South West corner)
  maps.light[24][5] = 6;
  // Surrounded by walls (Blocked entrance)
  for (let r = 22; r <= 26; r++) {
    for (let c = 3; c <= 7; c++) {
      if (r !== 24 || (c !== 5 && c !== 6 && c !== 7)) {
        maps.light[r][c] = 1; // Blocked in light world except chest & front tile
      }
    }
  }
  // But open in dark world so we can warp in using mirror!
  for (let r = 22; r <= 26; r++) {
    for (let c = 3; c <= 7; c++) {
      maps.dark[r][c] = 0; // Clear in dark world
    }
  }

  // Setup Master Sword pedestal in Light World (Deep Forest Northwest)
  maps.light[4][4] = 5;
  // Surrounding forest structure
  for (let r = 2; r < 7; r++) {
    for (let c = 2; c < 7; c++) {
      if ((r !== 4 || c !== 4) && (r !== 5 || c !== 4)) {
        maps.light[r][c] = 1;
      }
    }
  }
  maps.light[6][4] = 1; // Blocked until Agahnim is defeated (Cleared dynamically!)

  // --- Dark World Setup ---
  // Setup Moon Pearl Chest in Dark World (South East corner, isolated by river)
  maps.dark[24][34] = 4;
  for (let r = 22; r <= 26; r++) {
    for (let c = 32; c <= 36; c++) {
      if (r !== 24 || (c !== 34 && c !== 33 && c !== 32)) {
        maps.dark[r][c] = 1; // Blocked in dark world except chest, front tile, and portal tile
      }
    }
  }
  // Open in light world, so mirror wrap can access it!
  for (let r = 22; r <= 26; r++) {
    for (let c = 32; c <= 36; c++) {
      maps.light[r][c] = 0; // Open in light world
    }
  }
  maps.light[24][32] = 3; // Light Portal on East side to help warp in

  // Setup Temple of Darkness in Dark World (Northwest)
  // Boss Agahnim is here. Protected by Ice Block 8.
  for (let r = 2; r < 7; r++) {
    for (let c = 2; c < 7; c++) {
      if (r === 6 && c === 4) {
        maps.dark[r][c] = 8; // Ice block entrance!
      } else if ((r !== 4 || c !== 4) && (r !== 5 || c !== 4)) {
        maps.dark[r][c] = 1; // Temple walls
      }
    }
  }

  // Setup Pyramid of Ganon in Dark World (Center)
  maps.dark[14][18] = 9; // Pyramid tile
  maps.dark[13][18] = 1;
  maps.dark[15][18] = 1;
  maps.dark[14][17] = 1;

  // 各ダンジョンの共通初期化（周囲の壁）
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
        maps.desert[r][c] = 1;
        maps.dark_temple[r][c] = 1;
        maps.lost_woods[r][c] = 1;
        maps.pyramid[r][c] = 1;
      }
    }
  }

  // 1. 砂漠の神殿 (desert) の構造
  // 迷路のような壁を配置
  for (let r = 4; r < 25; r++) {
    maps.desert[r][10] = 1;
    maps.desert[r][30] = 1;
  }
  for (let c = 10; c <= 30; c++) {
    if (c !== 20) {
      maps.desert[12][c] = 1;
      maps.desert[20][c] = 1;
    }
  }
  // 最深部ボス部屋の奥に宝箱 (ファイアーロッド: 6) を配置 -> ボス討伐後に出現するように修正
  // maps.desert[3][20] = 6;
  // ボス部屋の周囲を壁で囲む（入り口 c=20, r=8 以外）
  for (let c = 15; c <= 25; c++) {
    maps.desert[8][c] = 1;
  }
  maps.desert[8][20] = 0; // ボス部屋入り口

  // 2. 闇の神殿 (dark_temple) の構造
  // 氷ブロック(8)で各部屋の入り口を塞ぐ
  for (let r = 5; r < 25; r += 5) {
    for (let c = 5; c < 35; c++) {
      maps.dark_temple[r][c] = 1;
    }
    // 通路に氷ブロックを配置
    maps.dark_temple[r][10] = 8;
    maps.dark_temple[r][20] = 8;
    maps.dark_temple[r][30] = 8;
  }
  // 宝箱 (ムーンパール: 4) を途中の部屋に配置 -> 削除（通常世界の右下に配置済みのため）
  // maps.dark_temple[12][5] = 4;
  // ボスアグニム部屋への入り口も氷ブロック(8)
  for (let c = 15; c <= 25; c++) {
    maps.dark_temple[4][c] = 1;
  }
  maps.dark_temple[4][20] = 8; // ボス部屋の入り口

  // 3. 迷いの森 (lost_woods) の構造
  // 木々(壁1)を点在させ、複雑な迷路にする
  // シード値を固定するため簡易的な決定論的ランダムを使用
  let lseed = 12345;
  function lrand() {
    lseed = (lseed * 9301 + 49297) % 233280;
    return lseed / 233280;
  }
  for (let r = 3; r < 26; r++) {
    for (let c = 3; c < 37; c++) {
      if (lrand() < 0.22 && (r > 8 || c !== 20)) {
        maps.lost_woods[r][c] = 1;
      }
    }
  }
  // ボス部屋
  for (let c = 15; c <= 25; c++) {
    maps.lost_woods[7][c] = 1;
  }
  maps.lost_woods[7][20] = 0; // ボス部屋入り口
  // maps.lost_woods[3][20] = 5; // マスターソード台座 -> ボス討伐後に出現するように修正

  // 4. ピラミッド内部 (pyramid) の構造
  // 溶岩(10)の川を配置
  for (let r = 5; r < 25; r++) {
    maps.pyramid[r][15] = 10;
    maps.pyramid[r][25] = 10;
  }
  // 橋
  maps.pyramid[12][15] = 0;
  maps.pyramid[18][25] = 0;
  // ボス部屋 (r=3, c=20)
  for (let c = 15; c <= 25; c++) {
    maps.pyramid[6][c] = 1;
  }
  maps.pyramid[6][20] = 0; // ガノン部屋入り口

  // 通常世界での重複宝箱を削除 (ダンジョン側に移したため)
  // maps.dark[24][34] = 0; // コメントアウトして宝箱を復活させる
}

// Generate maps immediately
generateMaps();

// --- Main UI Update Helper ---
function updateUI() {
  const startScreen = document.getElementById('start-overlay');
  const gameOverScreen = document.getElementById('gameover-overlay');
  const clearScreen = document.getElementById('clear-overlay');
  const worldLabel = document.getElementById('world-status');
  const pearlLabel = document.getElementById('pearl-status');

  // Resource HUD
  const magicBar = document.getElementById('magic-bar');
  const arrowCount = document.getElementById('arrow-count');

  // Item Slots
  const slot1 = document.getElementById('slot-1');
  const slot2 = document.getElementById('slot-2');
  const slot3 = document.getElementById('slot-3');
  const slot4 = document.getElementById('slot-4');

  // Overlays
  if (startScreen) startScreen.classList.toggle('hidden', gameState !== STATES.TITLE);
  if (gameOverScreen) gameOverScreen.classList.toggle('hidden', gameState !== STATES.GAMEOVER);
  if (clearScreen) clearScreen.classList.toggle('hidden', gameState !== STATES.CLEAR);

  const root = document.documentElement;
  if (worldLabel) {
    if (currentWorld === 'light') {
      worldLabel.textContent = "光の世界";
      worldLabel.className = "value world-val light-world";
      root.style.setProperty('--theme-color', '#2ecc71');
      root.style.setProperty('--theme-glow', 'rgba(46, 204, 113, 0.35)');
    } else if (currentWorld === 'dark') {
      worldLabel.textContent = "闇の世界";
      worldLabel.className = "value world-val dark-world";
      root.style.setProperty('--theme-color', '#9b59b6');
      root.style.setProperty('--theme-glow', 'rgba(155, 89, 182, 0.35)');
    } else if (currentWorld === 'desert') {
      worldLabel.textContent = "砂漠の神殿";
      worldLabel.className = "value world-val light-world";
      root.style.setProperty('--theme-color', '#f1c40f');
      root.style.setProperty('--theme-glow', 'rgba(241, 196, 15, 0.35)');
    } else if (currentWorld === 'dark_temple') {
      worldLabel.textContent = "闇の神殿";
      worldLabel.className = "value world-val dark-world";
      root.style.setProperty('--theme-color', '#3498db');
      root.style.setProperty('--theme-glow', 'rgba(52, 152, 219, 0.35)');
    } else if (currentWorld === 'lost_woods') {
      worldLabel.textContent = "迷いの森";
      worldLabel.className = "value world-val light-world";
      root.style.setProperty('--theme-color', '#2ecc71');
      root.style.setProperty('--theme-glow', 'rgba(46, 204, 113, 0.35)');
    } else if (currentWorld === 'pyramid') {
      worldLabel.textContent = "ピラミッド内部";
      worldLabel.className = "value world-val dark-world";
      root.style.setProperty('--theme-color', '#e74c3c');
      root.style.setProperty('--theme-glow', 'rgba(231, 76, 60, 0.35)');
    }
  }

  if (pearlLabel) {
    if (hasMoonPearl) {
      pearlLabel.textContent = "所持";
      pearlLabel.className = "value status-on";
    } else {
      pearlLabel.textContent = "未所持";
      pearlLabel.className = "value status-off";
    }
  }

  // Update Resources
  if (magicBar) {
    magicBar.style.width = (playerMagic / playerMaxMagic) * 100 + '%';
  }
  if (arrowCount) {
    arrowCount.textContent = playerArrows;
  }

  // Update Items Slot UI lock states
  if (slot2) {
    if (hasFireRod) {
      slot2.classList.remove('locked');
      slot2.querySelector('.slot-name').textContent = "ファイア";
    } else {
      slot2.classList.add('locked');
      slot2.querySelector('.slot-name').textContent = "ファイア(未)";
    }
  }

  if (slot3) {
    if (hasBow) {
      slot3.classList.remove('locked');
      slot3.querySelector('.slot-name').textContent = "弓矢";
    } else {
      slot3.classList.add('locked');
      slot3.querySelector('.slot-name').textContent = "弓矢(未)";
    }
  }

  // 各スロットをクリックした際にアイテムを切り替えられるようにイベントを設定
  const setupSlotClick = (slotEl, itemIdx) => {
    if (slotEl && !slotEl.dataset.hasListener) {
      slotEl.dataset.hasListener = "true";
      slotEl.onclick = () => {
        if (itemIdx === 2 && !hasFireRod) return;
        if (itemIdx === 3 && !hasBow) return;
        selectedItem = itemIdx;
        updateUI();
      };
      slotEl.style.cursor = 'pointer';
    }
  };

  setupSlotClick(slot1, 1);
  setupSlotClick(slot2, 2);
  setupSlotClick(slot3, 3);
  setupSlotClick(slot4, 4);

  // アイテムアイコンの描画更新
  const updateSlotIcon = (slotIdx, textureKey) => {
    const iconContainer = document.getElementById(`slot-icon-${slotIdx}`);
    if (iconContainer && gameScene) {
      if (iconContainer.dataset.currentTexture === textureKey) return;
      iconContainer.dataset.currentTexture = textureKey;
      iconContainer.innerHTML = ''; // 既存をクリア

      const texture = gameScene.textures.get(textureKey);
      if (texture) {
        const srcCanvas = texture.getSourceImage();
        if (srcCanvas) {
          const destCanvas = document.createElement('canvas');
          destCanvas.width = 32;
          destCanvas.height = 32;
          const ctx = destCanvas.getContext('2d');
          
          ctx.imageSmoothingEnabled = false;
          ctx.mozImageSmoothingEnabled = false;
          ctx.webkitImageSmoothingEnabled = false;
          ctx.msImageSmoothingEnabled = false;
          
          ctx.drawImage(srcCanvas, 0, 0, 32, 32);
          destCanvas.style.width = '32px';
          destCanvas.style.height = '32px';
          iconContainer.appendChild(destCanvas);
        }
      }
    }
  };

  updateSlotIcon(1, hasMasterSword ? 'item-sword-master' : 'item-sword-normal');
  updateSlotIcon(2, 'item-firerod');
  updateSlotIcon(3, 'item-bow');
  updateSlotIcon(4, 'item-mirror');

  // Toggle Active Slots
  const slots = [slot1, slot2, slot3, slot4];
  slots.forEach((s, idx) => {
    if (s) {
      s.classList.toggle('active', selectedItem === (idx + 1));
    }
  });
}

// --- Collision System Check ---
function checkCollisionAt(x, y, isEnemy = false) {
  const colLeft = Math.floor(x / TILE_SIZE);
  const colRight = Math.floor((x + 28) / TILE_SIZE);
  const rowTop = Math.floor(y / TILE_SIZE);
  const rowBottom = Math.floor((y + 28) / TILE_SIZE);

  const currentMap = maps[currentWorld];

  if (colLeft < 0 || colRight >= MAP_COLS || rowTop < 0 || rowBottom >= MAP_ROWS) {
    return true;
  }

  const tilesToCheck = [
    currentMap[rowTop][colLeft],
    currentMap[rowTop][colRight],
    currentMap[rowBottom][colLeft],
    currentMap[rowBottom][colRight]
  ];

  for (const tile of tilesToCheck) {
    if (tile === 1) return true; // Wall
    if (tile === 2) return true; // Water
    if (tile === 4) return true; // Moon Pearl chest
    if (tile === 5) return true; // Sword Pedestal
    if (tile === 6) return true; // Fire Rod chest
    if (tile === 7) return true; // Bow chest
    if (tile === 8) return true; // Ice block
    if (tile === 9) return true; // Pyramid
  }

  return false;
}

function checkRectOverlap(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// --- Web Audio Synth Engine (CORS-free Sounds & BGM) ---
const AudioSynth = {
  ctx: null,
  bgmInterval: null,
  isMuted: false,
  tempo: 130,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser.");
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playTone(freq, type, duration, volume = 0.2) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Sound Effects
  playSlash() {
    this.playTone(550, 'triangle', 0.1, 0.25);
    setTimeout(() => this.playTone(280, 'sawtooth', 0.12, 0.15), 50);
  },

  playFireball() {
    this.playTone(400, 'sawtooth', 0.25, 0.2);
    this.playTone(300, 'sine', 0.25, 0.2);
  },

  playArrow() {
    this.playTone(880, 'sine', 0.08, 0.25);
    setTimeout(() => this.playTone(660, 'sine', 0.08, 0.2), 30);
  },

  playHurt() {
    this.playTone(180, 'sawtooth', 0.2, 0.3);
  },

  playWarp() {
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(440 + i * 110, 'sine', 0.15, 0.15);
      }, i * 60);
    }
  },

  playFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25]; // C E G C G C
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
    let time = 0;
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 'triangle', durations[i], 0.25);
      }, time);
      time += durations[i] * 800;
    });
  },

  // Simple Retro BGM Sequencer
  startBGM(world = 'light') {
    this.stopBGM();
    this.resume();

    // 8-bit Zelda main theme hook
    const lightMelody = [
      { f: 440, d: 2 }, { f: 330, d: 2 }, // A4, E4
      { f: 440, d: 1 }, { f: 494, d: 1 }, { f: 523, d: 1 }, { f: 587, d: 1 }, // A, B, C, D
      { f: 659, d: 4 }, // E5
      { f: 0, d: 2 }, // Rest
      { f: 659, d: 1 }, { f: 698, d: 1 }, { f: 784, d: 2 }, // E, F, G5
      { f: 880, d: 4 }  // A5
    ];

    const darkMelody = [
      { f: 220, d: 2 }, { f: 196, d: 2 }, // A3, G3
      { f: 220, d: 1 }, { f: 233, d: 1 }, { f: 220, d: 2 }, // A, Bb, A
      { f: 165, d: 4 }, // E3
      { f: 0, d: 2 }, // Rest
      { f: 165, d: 1 }, { f: 174, d: 1 }, { f: 196, d: 2 }, // E, F, G
      { f: 220, d: 4 }  // A3
    ];

    const melody = world === 'light' ? lightMelody : darkMelody;
    const type = world === 'light' ? 'triangle' : 'sawtooth';
    const volume = world === 'light' ? 0.08 : 0.04;

    let index = 0;
    const beatDuration = 220; // ms per quarter note

    this.bgmInterval = setInterval(() => {
      if (gameState !== STATES.PLAYING) return;
      const note = melody[index];
      if (note.f > 0) {
        this.playTone(note.f, type, (note.d * beatDuration) / 1000, volume);
      }
      index = (index + 1) % melody.length;
    }, beatDuration);
  },

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
};

// --- Texture & Asset Generator (CORS-free Drawing) ---
const TextureBuilder = {
  PALETTE: {
    '.': 'transparent',
    'k': '#111318', // 暗い黒（アウトライン）
    'w': '#ffffff', // 純白（ハイライト）
    'o': '#e89b4f', // 明るい茶（猫基本色）
    's': '#c87530', // 暗い茶（猫縞・ウッド中間）
    'q': '#8e44ad', // 暗い紫（ポータル中間）
    'p': '#ffb3ba', // ピンク
    'e': '#4cc76e', // 明るい緑（芝生基本色）
    'd': '#2d8a4e', // 深緑（服・木陰）
    'z': '#1a5c36', // 最深緑（壁影）
    'y': '#f7d636', // 明るい金
    'x': '#e8a620', // 黄金中間
    'f': '#b07018', // 黄金シャドウ
    'g': '#e8edf0', // 明るい銀（ブレード）
    'b': '#a8b0b8', // 中間鉄（ブレード）
    'a': '#6b7880', // 暗い鉄（ブレード影）
    'u': '#a855c8', // 明るい紫（ポータル）
    'r': '#e53535', // 赤（炎・ハート）
    'h': '#ff8a80', // 明るい赤（炎ハイライト）
    'c': '#a02020', // 深紅（炎シャドウ）
    'l': '#f0c870', // 薄茶（弓）
    'm': '#d89030', // 中間茶（弓）
    'n': '#906018', // 影茶（弓）
    'i': '#f0d8a0', // 砂漠床の明るい黄色
    'j': '#a06828', // 砂漠壁の暗い茶色
    't': '#7060e0', // 結晶の青紫色
    'v': '#4830c8', // 結晶壁の暗い青紫色
    'V': '#180f40', // 結晶壁 of 深青紫色
    'K': '#0a0a10', // ピラミッドの極暗黒
    'R': '#ff4050', // ピラミッド・溶岩の明るい赤
    'C': '#b02828', // 溶岩の暗い赤
    'Y': '#e8c860', // ピラミッド床の黄土色
    'A': '#050508', // 超深影
    'B': '#384858', // 鉄・盾中間色
    'D': '#283848', // 盾深影
    'E': '#80e8e8', // 結晶・氷ハイライト
    'F': '#60a8e8', // 結晶・氷中間色
    'G': '#2870b0', // 結晶・氷深影
    'H': '#f8e090', // 猫・木目超ハイライト
    'I': '#c86040', // 猫・オレンジ影
    'J': '#c82828', // 赤・魔力弾中間色
    'L': '#68e8b0', // 葉・超薄緑
    'M': '#188860', // 葉・深い草原
    'N': '#f8e0a0', // 木材・明るい茶
    'O': '#e0b060', // 木材・中間茶
    'P': '#c06838', // 木材・深影
    'Q': '#b098f8', // ポータルハイライト
    // === 拡張パレット（リマスター用）===
    'S': '#38a058', // 草の中間緑
    'T': '#185830', // 草の超深緑
    'U': '#d8a848', // 砂岩中間色
    'W': '#785020', // 砂岩暗色
    'X': '#483018', // 砂岩超暗色
    'Z': '#f8f0d0', // 薄黄クリーム色
    '0': '#303848', // 暗灰青
    '1': '#e8d070', // 明るいゴールド
    '2': '#c0a040', // 暗いゴールド
    '3': '#586878', // 中灰青
    '4': '#d0b878', // 鈍い黄土
    '5': '#ffd0a0', // 肌色ハイライト
    '6': '#f8b878', // 肌色中間
    '7': '#c88050', // 肌色シャドウ
    '8': '#98d868', // ライムグリーン
    '9': '#386828'  // ダークオリーブ
  },

  buildAll(scene) {
    // 1. Draw Player Reni (Walking Sheet - 4 directions x 2 frames)
    this.createSheet(scene, 'reni-walk', [
      // Frame 0: Down 1
      [
        '....keeekk......',
        '...keSddSek.....',
        '..ke8ddd8dek....',
        '..k5wkk5wkek....',
        '..koHosssoHek...',
        '..ko6ppp6oek....',
        '.ko6opoop6oek...',
        '.kI7kwokwk7Ik...',
        '.ks7ooPoo7sek...',
        '..ksIoocIsek....',
        '...kLeSeek......',
        '..keSdeSdek.....',
        '..kedddddzk.....',
        '..keBByxBDk.....',
        '...k7ss7sk......',
        '....kakkak......'
      ],
      // Frame 1: Down 2
      [
        '....LLeeee......',
        '...Ledddeed.....',
        '..eedddddzde....',
        '..exwdddzxde....',
        '..eHssssssHde...',
        '..esopsspose....',
        '.esopooppooose..',
        '.sIokwosokwoIs..',
        '.ssoooPoooosss..',
        '..ssooocossd....',
        '...LLeeeeee.....',
        '..Ledddeeeed....',
        '..edddddddzd....',
        '..edBByxBDzd....',
        '...Isso.ssI.....',
        '....a....aa.....'
      ],
      // Frame 2: Up 1
      [
        '....LLeeee......',
        '...eeddddee.....',
        '..eedddddzde....',
        '..eedddddzde....',
        '..eeHssssHde....',
        '..esssssssde....',
        '.esssssssssde...',
        '.sIsIsIsIsIs....',
        '.sIsIsIsIsIs....',
        '..sIsIsIsIs.....',
        '...LLeeeeee.....',
        '..Ledddeeeed....',
        '..edddddddzd....',
        '..edddddddzd....',
        '...IssoossI..I..',
        '....aa...aa..ss.'
      ],
      // Frame 3: Up 2
      [
        '....LLeeee......',
        '...eeddddee.....',
        '..eedddddzde....',
        '..eedddddzde....',
        '..eeHssssHde....',
        '..esssssssde....',
        '.esssssssssde...',
        '.sIsIsIsIsIs....',
        '.sIsIsIsIsIs....',
        '..sIsIsIsIs.....',
        '...LLeeeeee.....',
        '..Ledddeeeed....',
        '..edddddddzd....',
        '..edddddddzd....',
        '...IssoossI.I...',
        '....aa...aa.ss..'
      ],
      // Frame 4: Side 1 (Right)
      [
        '......Leeee.....',
        '.....Ledddeed...',
        '....eedddddzde..',
        '....exwdddzxde..',
        '....eHssssssde..',
        '....esopsspode..',
        '....esopooppod..',
        '....sIokwosokw..',
        '....ssoooPooos..',
        '.....ssooocos...',
        '......LLeeee....',
        '....gLedddeed...',
        '....gddddddzd...',
        '....gdBByxBDd...',
        '.....IssoossI...',
        '......aa...aa...'
      ],
      // Frame 5: Side 2 (Right walk)
      [
        '......Leeee.....',
        '.....Ledddeed...',
        '....eedddddzde..',
        '....exwdddzxde..',
        '....eHssssssde..',
        '....esopsspode..',
        '....esopooppod..',
        '....sIokwosokw..',
        '....ssoooPooos..',
        '.....ssooocos...',
        '......LLeeee....',
        '....gLedddeed...',
        '....gddddddzd...',
        '....gdBByxBDd...',
        '......Issoos....',
        '......aa.aa.....'
      ]
    ], 16, 16);

    // 2. Bunny Sheet
    this.createSheet(scene, 'reni-bunny', [
      [
        '..pp......pp....',
        '..phpp..pphp....',
        '..pwwp..pwwp....',
        '..pwwp..pwwp....',
        '..pppppppppp....',
        '.pphphpphphpp...',
        '.pphwwppwwhpp...',
        '.pppppppppppp...',
        '.pppppprpppppp..',
        '..pppppppppp....',
        '...pphhhhpp.....',
        '..ppphhpphpp....',
        '..pppppppppp....',
        '..pppppppppp....',
        '...ppp..ppp.....',
        '....aa...aa.....'
      ]
    ], 16, 16);

    // 3. Enemy Octorok
    this.createSheet(scene, 'enemy-octorok', [
      [
        '.....hhhhh......',
        '...hhrrrrrrcc...',
        '..hhrrrrrrrrrcc.',
        '.hhrrkwwrrkwwrcc',
        '.hhrrkkkrrkkkrcc',
        '.hrrrrrrrrrrrrcc',
        '.hrrrrryyyyrrrcc',
        '..hrrryxxxyrrcc.',
        '...hrrfffffcc...',
        '..hhrrrrrrrrcc..',
        '.hhr..rrrr..rcc.',
        '.hr....rr....rc.',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 4. Boss Agahnim
    this.createSheet(scene, 'boss-agahnim', [
      [
        '......QQQQ......',
        '....QQuuuuuq....',
        '...QQuuuuuuuq...',
        '..QQrkwwrrkwuuq.',
        '..QQuukkquukuuq.',
        '..Quuuuuuuuuuuq.',
        '...Quuuuwuuuuq..',
        '....Quuuuuuuq...',
        '..QQuuuuuuuuuuq.',
        '.QQuuuyyyyyuuuq.',
        '.Quuuyyxxxyyuuq.',
        '.Quuyyxxxxxxyuq.',
        '.Quyyxxxxxxxxyq.',
        '.Quyyxxxxxxxxyq.',
        '..qyyyyyyyyyyq..',
        '...aa......aa...'
      ]
    ], 16, 16);

    // 5. Boss Ganon
    this.createSheet(scene, 'boss-ganon', [
      [
        '.....kkkkkk.....',
        '...kkhhhhhhkk...',
        '..khhrrrrrrchk..',
        '.khrrEwwEEwwrchk.',
        '.khrrFFFvFFFfchk.',
        '.khrvvvvvvvvvchk.',
        '.khrvvvkkvvvvchk.',
        '..krvvkkkkvvck..',
        '...kkkkkkkkkk...',
        '..krrvvvvvvcck..',
        '.krrrvvvvvvccck.',
        '.krr.vvvvvv.cck.',
        '.kr...vvvv...ck.',
        '..k....vv....k..',
        '................',
        '................'
      ]
    ], 16, 16);

    // 6. Chest
    this.createSheet(scene, 'chest', [
      [
        '...kkkkkkkkkk...',
        '..kwwyyyyyywwk..',
        '.kyyxxxxxxxxxxky.',
        'kyxxxxxxxxxxxxky',
        'kyxkkkwwwwwkkxky',
        'kyxkkwwbwwkkkxky',
        'kyxkkkwwwwwkkxky',
        'kkkkkkkkkkkkkkkk',
        'kHoooooooooooHk',
        'koooooooooooook',
        'koossPkkwwkPsook',
        'koosskwwbwwksook',
        'koossPkkwwkPsook',
        'kossssssssssssok',
        'kssssssssssssssk',
        '.kkkkkkkkkkkkkk.'
      ]
    ], 16, 16);

    // 7. Portal
    this.createSheet(scene, 'portal', [
      [
        '....kkkkkk....',
        '..kkwwyyyykkk..',
        '.kwyyxxxxxxywk.',
        'kyyxxQQQQxxxyk',
        'kyxQQuuuuQQxky',
        'kyQuuqqqqquQky',
        'kxQuqqEEEquQkx',
        'kxQuqqEEEquQkx',
        'kyQuuqqqqquQky',
        'kyxQQuuuuQQxky',
        'kyyxxQQQQxxxyk',
        '.kwyyxxxxxxywk.',
        '..kkwwyyyykkk..',
        '....kkkkkk....',
        '................',
        '................'
      ]
    ], 16, 16);

    // 8. Fireball
    this.createSheet(scene, 'fireball', [
      [
        '....hhhh....',
        '...hryyyrh...',
        '..hrywwyyrh..',
        '.hrywwwwyyrh.',
        '.hrywwwwyyrh.',
        '..hrywwyyrh..',
        '...hryyyrh...',
        '....cccc....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 9. Arrow
    this.createSheet(scene, 'arrow', [
      [
        '......w.......',
        '.....wgw......',
        '....gbaa......',
        '......O.......',
        '......O.......',
        '......P.......',
        '.....Lrr......',
        '....Lwwwr.....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 10. Sword Beam
    this.createSheet(scene, 'beam', [
      [
        '......w.......',
        '....wwEww.....',
        '...wEFEFEw....',
        '..EFEFGFEFE...',
        '..EFEFGFEFE...',
        '...wEFEFEw....',
        '....wwEww.....',
        '......w.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 11. Heart Drop
    this.createSheet(scene, 'drop-heart', [
      [
        '..hhr....rrh..',
        '.hwwrr..rrwwh.',
        'hwwrrr..rrwwrh',
        'hrrrrrrrrrrrch',
        'hrccccccccccch',
        '.rcccccccccc.',
        '..rcccccccc..',
        '...rcccccc...',
        '....rcccc....',
        '.....rcc.....',
        '......c......',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 12. Magic Drop
    this.createSheet(scene, 'drop-magic', [
      [
        '.....bb.....',
        '....gwwg....',
        '...gLLLLg...',
        '..gLLeeLLg..',
        '.gLeeeedeeeg.',
        '.gdeeeeedeedg.',
        '.gddeeedddzdg.',
        '..gdddddddG..',
        '...gddddG...',
        '.....GG.....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 13. Arrow Drop
    this.createSheet(scene, 'drop-arrow', [
      [
        '....gggg....',
        '...gbbbbg...',
        '..gbamabg...',
        '..nnnmnnnn..',
        '..eee.eee...',
        '..www.www...',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 14. 地面タイル (光) - リマスター
    this.createSheet(scene, 'tile-grass-light', [
      [
        'eSe8eSeee8eSe8eS',
        'eS9deede9eSd9dee',
        'edTeeee8deeTeeee',
        'ee8eeSeSe8eee8ee',
        'eeSe9Sd9eSeeeSee',
        'eedTedee8edTedee',
        'eSe8eSeee8eSe8eS',
        'eS9deede9eSd9dee',
        'edTeeee8deeTeeee',
        'ee8eeSeSe8eee8ee',
        'eeSe9Sd9eSeeeSee',
        'eedTedee8edTedee',
        'eSe8eSeee8eSe8eS',
        'eS9deede9eSd9dee',
        'edTeeee8deeTeeee',
        'ee8eeSeSe8eee8ee'
      ]
    ], 16, 16);

    // 15. 地面タイル (闇) - リマスター
    this.createSheet(scene, 'tile-grass-dark', [
      [
        'uQu0uQuuu0uQu0uQ',
        'uQ9quku9uQq9quuu',
        'uqAuuuu0quuAuuuu',
        'uu0uuQu0u0uuu0uu',
        'uuQu9Qq9uQuuuQuu',
        'uuqAuquu0uqAuquu',
        'uQu0uQuuu0uQu0uQ',
        'uQ9quku9uQq9quuu',
        'uqAuuuu0quuAuuuu',
        'uu0uuQu0u0uuu0uu',
        'uuQu9Qq9uQuuuQuu',
        'uuqAuquu0uqAuquu',
        'uQu0uQuuu0uQu0uQ',
        'uQ9quku9uQq9quuu',
        'uqAuuuu0quuAuuuu',
        'uu0uuQu0u0uuu0uu'
      ]
    ], 16, 16);

    // 16. 壁タイル (光) - リマスター (立体レンガ)
    this.createSheet(scene, 'tile-wall-light', [
      [
        'kkkkkkkkkkkkkkkk',
        'kZNoooooooooNZkk',
        'kNoHoooooooHoNkk',
        'kooooooooooooook',
        'kooss7kooss7ook.',
        'kooss7kooss7ook.',
        'kssssPsssssPssk.',
        'kPPPkkPPPPkkPPk.',
        'kkkkkkkkkkkkkkkk',
        'kZNoooooooooNZkk',
        'kNoHoooooooHoNkk',
        'kooooooooooooook',
        'kooss7kooss7ook.',
        'kooss7kooss7ook.',
        'kssssPsssssPssk.',
        'kPPPkkPPPPkkPPk.'
      ]
    ], 16, 16);

    // 17. 壁タイル (闇) - リマスター (暗紫レンガ)
    this.createSheet(scene, 'tile-wall-dark', [
      [
        'kkkkkkkkkkkkkkkk',
        'kQQuuuuuuuuuQQkk',
        'kQuuuuuuuuuuuQkk',
        'kuuuuuuuuuuuuuuk',
        'kuuqq0kkuuqq0kku',
        'kuuqq0kkuuqq0kku',
        'kuqqq0kqqqqk0qqu',
        'kqqq0kkqqqq0kqkk',
        'kkkkkkkkkkkkkkkk',
        'kQQuuuuuuuuuQQkk',
        'kQuuuuuuuuuuuQkk',
        'kuuuuuuuuuuuuuuk',
        'kuuqq0kkuuqq0kku',
        'kuuqq0kkuuqq0kku',
        'kuqqq0kqqqqk0qqu',
        'kqqq0kkqqqq0kqkk'
      ]
    ], 16, 16);

    // 18. 水面タイル (光)
    this.createSheet(scene, 'tile-water-light', [
      [
        'EEEEEEEEEEEEEEEE',
        'EwwwwwwwwwwwwwwE',
        'EwwFFFFFFFFFFwwE',
        'EwFFFFFFFFFFFFwE',
        'FFFFFwwFFFFFFFFF',
        'FFFFFwwFFFFFFFFF',
        'FwFFFFFFFFFFFFwF',
        'FwwFFFFFFFFFFwwF',
        'FFFFFFFFFFFFFFFF',
        'EwwwwwwwwwwwwwwE',
        'EwwFFFFFFFFFFwwE',
        'EwFFFFFFFFFFFFwE',
        'FFFFFwwFFFFFFFFF',
        'FFFFFwwFFFFFFFFF',
        'FwFFFFFFFFFFFFwF',
        'FwwFFFFFFFFFFwwF'
      ]
    ], 16, 16);

    // 19. 水面タイル (闇)
    this.createSheet(scene, 'tile-water-dark', [
      [
        'tttttttttttttttt',
        'twwwwwwwwwwwwwwt',
        'twwvvvvvvvvvvwwt',
        'twvvvvvvvvvvvvwt',
        'vvvvvvwwvvvvvvvv',
        'vvvvvvwwvvvvvvvv',
        'vwvvvvvvvvvvvvwv',
        'vwwvvvvvvvvvvwwv',
        'vvvvvvvvvvvvvvvv',
        'twwwwwwwwwwwwwwt',
        'twwvvvvvvvvvvwwt',
        'twvvvvvvvvvvvvwt',
        'vvvvvvwwvvvvvvvv',
        'vvvvvvwwvvvvvvvv',
        'vwvvvvvvvvvvvvwv',
        'vwwvvvvvvvvvvwwv'
      ]
    ], 16, 16);

    // --- 20. 単体装備アイテムアイコン画像 (UIスロット用) ---
    // (A) 通常つるぎ
    this.createSheet(scene, 'item-sword-normal', [
      [
        '............w...',
        '...........gw...',
        '..........gbaw..',
        '.........gbaaw..',
        '........gbaa....',
        '.......gbaa.....',
        '......gbaa......',
        '.....gbaa.......',
        '....gbaa........',
        '...yxf..........',
        '..yxf...........',
        '.yxf............',
        'nkn.............',
        'k...............',
        '................',
        '................'
      ]
    ], 16, 16);

    // (B) マスターソード
    this.createSheet(scene, 'item-sword-master', [
      [
        '............w...',
        '...........Ew...',
        '..........EFGw..',
        '.........EFGGw..',
        '........EFGG....',
        '.......EFGG.....',
        '......EFGG......',
        '.....EFGG.......',
        '....EFGG........',
        '...Quk..........',
        '..Quk...........',
        '.yxf............',
        'nkn.............',
        'k...............',
        '................',
        '................'
      ]
    ], 16, 16);

    // (C) ファイアロッド
    this.createSheet(scene, 'item-firerod', [
      [
        '........hhr.....',
        '.......hwwrr....',
        '......hwyyrr....',
        '.......hcr......',
        '........y.......',
        '.......yxf......',
        '......yxf.......',
        '.....yxf........',
        '....yxf.........',
        '...yxf..........',
        '..yxf...........',
        '.yxf............',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // (D) 弓
    this.createSheet(scene, 'item-bow', [
      [
        '......Hoo.......',
        '....Hoo...ss....',
        '...Ho.......s...',
        '..o....w....P...',
        '.o....wgw....P..',
        'o....wgba....P.',
        'o.....w......P.',
        'o.....w......P.',
        '.o....w.....P..',
        '..o...w....P...',
        '...Ho.w...s....',
        '....Hoss.s......',
        '......Hoo.......',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // (E) マジカルミラー
    this.createSheet(scene, 'item-mirror', [
      [
        '.....yyyyy......',
        '...yyxxxxxyy....',
        '..yxxwwwwwxxy...',
        '.yxwwEGwGEwwxy..',
        '.yxwEGGwGGEewxy.',
        '.yxwEGGwGGEewxy.',
        '.yxwwEGwGEwwxy..',
        '..yxxwwwwwxxy...',
        '...yyxxxxxyy....',
        '.....yxf........',
        '.....yxf........',
        '.....yxf........',
        '.....yxf........',
        '......k.........',
        '................',
        '................'
      ]
    ], 16, 16);

    // 21. 斬撃（スラッシュ）エフェクト
    this.createSheet(scene, 'slash-effect', [
      // 0: 横向き (右)
      [
        '......ww........',
        '....wwEEww......',
        '..wwEFEFEeww....',
        '.wEFEFaFaFEew...',
        'wEFEFaaaaFEeew..',
        'wEFEFaaaaFEeew..',
        '.wEFEFaFaFEew...',
        '..wwEFEFEeww....',
        '....wwEEww......',
        '......ww........',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ],
      // 1: 縦向き (下)
      [
        '......ww......',
        '....wwEEww....',
        '..wwEFEFEeww..',
        '.wEFEFaFaFEew.',
        'wEFEFaaaaFEeew',
        'wEFEFaaaaFEeew',
        '.wEFEFaFaFEew.',
        '..wwEFEFEeww..',
        '....wwEEww....',
        '......ww......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 22. 砂漠床タイル
    this.createSheet(scene, 'tile-floor-desert', [
      [
        'iiiiiiiiiiiiiiii',
        'iiYiiiiiiiiiyYii',
        'iiiiiiiiiiiiiiii',
        'iiiiiijiiiiiiiii',
        'iiiiiiiiiiiiiiii',
        'iiYiiiiiiiiiyYii',
        'iiiiiiiiiiiiiiii',
        'iiiiiijiiiiiiiii',
        'iiiiiiiiiiiiiiii',
        'iiYiiiiiiiiiyYii',
        'iiiiiiiiiiiiiiii',
        'iiiiiijiiiiiiiii',
        'iiiiiiiiiiiiiiii',
        'iiYiiiiiiiiiyYii',
        'iiiiiiiiiiiiiiii',
        'iiiiiijiiiiiiiii'
      ]
    ], 16, 16);

    // 23. 砂漠壁タイル
    this.createSheet(scene, 'tile-wall-desert', [
      [
        'jjjjjjjjjjjjjjjj',
        'jYYYYYYYYYYYYYYj',
        'jYiiiiiiiiiiiiYj',
        'jYiiYjiiYjiiYjYj',
        'jYiiYjiiYjiiYjYj',
        'jYiiiiiiiiiiiiYj',
        'jYYYYYYYYYYYYYYj',
        'jjjjjjjjjjjjjjjj',
        'jYYYYYYYYYYYYYYj',
        'jYiiiiiiiiiiiiYj',
        'jYiiYjiiYjiiYjYj',
        'jYiiYjiiYjiiYjYj',
        'jYiiiiiiiiiiiiYj',
        'jYYYYYYYYYYYYYYj',
        'jjjjjjjjjjjjjjjj',
        'jjjjjjjjjjjjjjjj'
      ]
    ], 16, 16);

    // 24. 闇の神殿床タイル
    this.createSheet(scene, 'tile-floor-darktemple', [
      [
        'tttttttttttttttt',
        'ttEtttttttttEEtt',
        'tttttttttttttttt',
        'tttttttttttttttt',
        'ttttttvttttttttt',
        'tttttttttttttttt',
        'ttttttttttttvttt',
        'ttvttttttttttvtt',
        'tttttttttttttttt',
        'tttttttttttttttt',
        'ttttttvttttttttt',
        'tttttttttttttttt',
        'ttttttttttttvttt',
        'ttEtttttttttEEtt',
        'tttttttttttttttt',
        'tttttttttttttttt'
      ]
    ], 16, 16);

    // 25. 闇の神殿壁タイル
    this.createSheet(scene, 'tile-wall-darktemple', [
      [
        'vvvvvvvvvvvvvvvv',
        'vVVVVVVVVVVVVVVv',
        'vVttttttttttttVv',
        'vVttEEttEEttEEVv',
        'vVttEEttEEttEEVv',
        'vVttttttttttttVv',
        'vVVVVVVVVVVVVVVv',
        'vvvvvvvvvvvvvvvv',
        'vVVVVVVVVVVVVVVv',
        'vVttttttttttttVv',
        'vVttEEttEEttEEVv',
        'vVttEEttEEttEEVv',
        'vVttttttttttttVv',
        'vVVVVVVVVVVVVVVv',
        'vvvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvvvv'
      ]
    ], 16, 16);

    // 26. ピラミッド床タイル
    this.createSheet(scene, 'tile-floor-pyramid', [
      [
        'YYYYYYYYYYYYYYYY',
        'YYRRYYYYYYYYRRR.',
        'YYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYYYYYY',
        'YYYYYKKYYYYYYYYY',
        'YYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYKKYYY',
        'YYRRYYYYYYYYRRR.',
        'YYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYYYYYY',
        'YYYYYKKYYYYYYYYY',
        'YYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYKKYYY',
        'YYRRYYYYYYYYRRR.',
        'YYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYYYYYY'
      ]
    ], 16, 16);

    // 27. ピラミッド壁タイル
    this.createSheet(scene, 'tile-wall-pyramid', [
      [
        'KKKKKKKKKKKKKKKK',
        'KRRRRRRRRRRRRRRK',
        'KRYYYYYYYYYYYYRK',
        'KRYYCCYYCCYYCCRK',
        'KRYYCCYYCCYYCCRK',
        'KRYYYYYYYYYYYYRK',
        'KRRRRRRRRRRRRRRK',
        'KKKKKKKKKKKKKKKK',
        'KRRRRRRRRRRRRRRK',
        'KRYYYYYYYYYYYYRK',
        'KRYYCCYYCCYYCCRK',
        'KRYYCCYYCCYYCCRK',
        'KRYYYYYYYYYYYYRK',
        'KRRRRRRRRRRRRRRK',
        'KKKKKKKKKKKKKKKK',
        'KKKKKKKKKKKKKKKK'
      ]
    ], 16, 16);

    // 28. 溶岩タイル
    this.createSheet(scene, 'tile-lava', [
      [
        'RRRRRRRRRRRRRRRR',
        'RCCCCCCCCCCCCCCR',
        'RCyCCCCyCCCCyCCR',
        'RCxCCCCxCCCCxCCR',
        'RCCCCCCCCCCCCCCR',
        'RCCCCyCCCCyCCCCR',
        'RCCCCxCCCCxCCCCR',
        'RCyCCCCyCCCCyCCR',
        'RCCCCCCCCCCCCCCR',
        'RCyCCCCyCCCCyCCR',
        'RCxCCCCxCCCCxCCR',
        'RCCCCCCCCCCCCCCR',
        'RCCCCyCCCCyCCCCR',
        'RCCCCxCCCCxCCCCR',
        'RCCCCCCCCCCCCCCR',
        'RRRRRRRRRRRRRRRR'
      ]
    ], 16, 16);

    // 29. ボス：デグサード（Lanmola）のスプライト
    this.createSheet(scene, 'boss-lanmola', [
      [
        '......jjjj......',
        '....jjHooHjj....',
        '...jjHooooHjj...',
        '..jjoowwjoowwjj..',
        '..jjookjookjjj..',
        '..jjjoooooojjj..',
        '...jjjPPjjjjj...',
        '....jjjjjjjj....',
        '..jjjjjjjjjjjj..',
        '.jjjjjssssjjjjj.',
        '.jjjjssssssjjjj.',
        '.jjjssssssssjjj.',
        '.jjssssssssssjj.',
        '.jjssssssssssjj.',
        '..jssssssssssj..',
        '...jj......jj...'
      ]
    ], 16, 16);

    // 30. ボス：デグテール（Moldorm）のスプライト
    this.createSheet(scene, 'boss-moldorm', [
      [
        '.....wwwww......',
        '...wyyyyyyyxf...',
        '..wyyyyyyyyyxff.',
        '.yyykwyyykwyyxff',
        '.yyykkkyykkkyxff',
        '.yyyyyyyyyyyyff.',
        '.yyyyyrrryyyyff.',
        '..yyyyrrrryyyff..',
        '...yyyyyyyxff...',
        '..yyyyyyyyyxff..',
        '.yyy..yyyy..yff.',
        '.yy....yy....yf.',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 31. 魔術師アグニムの魔法弾
    this.createSheet(scene, 'magic-ball', [
      [
        '....QQQQ....',
        '...Quuuuq...',
        '..QuwEwwuq..',
        '.QuwEEwwuuq.',
        '.QuwEEwwuuq.',
        '..QuwEwwuq..',
        '...Quuuuq...',
        '....qqqq....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 32. 岩石弾（デグサード用）
    this.createSheet(scene, 'rock-proj', [
      [
        '....NNNN....',
        '...NOOOOP...',
        '..NOkkOOP..',
        '.NOkkkkOOP.',
        '.NOkkkkOOP.',
        '..NOkkOOP..',
        '...NOOOOP...',
        '....PPPP....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ], 16, 16);

    // 33. ダンジョン入り口（階段・ゲート）
    this.createSheet(scene, 'tile-entrance', [
      [
        'bbbbbbbbbbbbbbbb',
        'bkkkkkkkkkkkkkkb',
        'bkaaaaaaaaaaaakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkakkkkkkkkkkakb',
        'bkaaaaaaaaaaaakb',
        'bkkkkkkkkkkkkkkb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb'
      ]
    ], 16, 16);
  },

  createSheet(scene, key, frames, width, height, scale = 2) {
    const canvas = document.createElement('canvas');
    canvas.width = width * frames.length * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    frames.forEach((matrix, fIdx) => {
      const offset = fIdx * width * scale;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          const char = matrix[r][c];
          const color = this.PALETTE[char];
          if (color && color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(offset + c * scale, r * scale, scale, scale);
          }
        }
      }
    });

    // Canvasをテクスチャとして登録後に手動でスライス
    scene.textures.addCanvas(key, canvas);
    const texture = scene.textures.get(key);
    const frameWidth = width * scale;
    const frameHeight = height * scale;
    frames.forEach((_, fIdx) => {
      texture.add(fIdx, 0, fIdx * frameWidth, 0, frameWidth, frameHeight);
    });
  }
};

// --- Projectiles & Drops Classes ---
class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, dx, dy, type) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setSize(16, 16);
    this.body.setOffset(8, 8);

    this.type = type; // 'fireball', 'arrow', 'beam'
    this.owner = 'player'; // デフォルトはプレイヤーの弾
    
    // Colliders setup
    scene.physics.add.collider(this, scene.walls, () => this.destroy());
    scene.physics.add.collider(this, scene.iceBlocks, (p, ice) => {
      if (this.type === 'fireball') {
        maps[currentWorld][ice.gridY][ice.gridX] = 0; // Melt ice!
        scene.rebuildMapPhysics();
        AudioSynth.playFanfare();
        scene.showBanner("氷の壁が溶けた！");
      }
      this.destroy();
    });
    scene.projectiles.add(this);
    this.body.setVelocity(dx, dy);
  }
}

class DropItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.type = type; // 'heart', 'magic', 'arrow'
    scene.drops.add(this);
    
    // Blink and decay timer
    scene.time.delayedCall(6000, () => {
      if (this.active) this.destroy();
    });
  }
}

// --- Scene Definitions ---

// 1. Title/Start Scene
class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] TitleScene.create() 開始', '#ffd700');
    }
    AudioSynth.init();
    gameState = STATES.TITLE;
    updateUI();

    const startInput = () => {
      AudioSynth.resume();
      if (typeof showDebugError === 'function') {
        showDebugError('[LOG] 入力検知。PlaySceneを開始します...', '#ffd700');
      }
      this.scene.start('PlayScene');
    };

    this.input.keyboard.once('keydown-ENTER', startInput);
    this.input.once('pointerdown', startInput);

    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] TitleScene.create() 完了。待機中...', '#4caf50');
    }
  }
}

// 2. Main Gameplay Scene
class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  preload() {
    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] PlayScene.preload() 開始 (アセット動的生成中)', '#ffd700');
    }
    TextureBuilder.buildAll(this);
    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] PlayScene.preload() 完了 (アセット生成成功)', '#4caf50');
    }
  }

  create() {
    gameScene = this;
    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] PlayScene.create() 開始 (ワールド初期化中)', '#ffd700');
    }
    gameState = STATES.PLAYING;
    AudioSynth.startBGM(currentWorld);
    
    this.physics.world.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // Collision layer groups
    this.walls = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();
    this.pedestals = this.physics.add.staticGroup();
    this.iceBlocks = this.physics.add.staticGroup();
    this.pyramids = this.physics.add.staticGroup();

    this.rebuildMapPhysics();

    // Setup Player with smaller collider for sliding past corners
    this.player = this.physics.add.sprite(10 * TILE_SIZE, 15 * TILE_SIZE, 'reni-walk', 0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(16, 16);
    this.player.body.setOffset(8, 8);

    this.player.direction = 'down';
    this.player.isScratching = false;
    this.player.invulnerable = false;

    // Camera following
    this.cameras.main.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Dynamic Groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.drops = this.physics.add.group();

    // Colliders
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.chests);
    this.physics.add.collider(this.player, this.pedestals);
    this.physics.add.collider(this.player, this.iceBlocks);
    this.physics.add.collider(this.player, this.pyramids);
    this.physics.add.collider(this.enemies, this.walls);

    this.spawnEntities();

    // Input settings
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    // アイテムスロット切り替えキー (1, 2, 3, 4)
    this.input.keyboard.on('keydown-ONE', () => { selectedItem = 1; updateUI(); });
    this.input.keyboard.on('keydown-TWO', () => { if (hasFireRod) { selectedItem = 2; updateUI(); } });
    this.input.keyboard.on('keydown-THREE', () => { if (hasBow) { selectedItem = 3; updateUI(); } });
    this.input.keyboard.on('keydown-FOUR', () => { selectedItem = 4; updateUI(); });

    updateUI();

    this.splashText = this.add.text(400, 240, '', {
      fontFamily: '"DotGothic16", sans-serif',
      fontSize: '24px',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);

    // Overlap events
    this.physics.add.overlap(this.player, this.drops, this.collectDrop, null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    this.physics.add.overlap(this.player, this.projectiles, this.hitPlayerByProjectile, null, this);

    this.createAnimations();

    if (typeof showDebugError === 'function') {
      showDebugError('[LOG] PlayScene.create() 完了 (ゲームスタート！)', '#4caf50');
    }
  }

  createAnimations() {
    this.anims.create({
      key: 'walk-down',
      frames: [
        { key: 'reni-walk', frame: 0 },
        { key: 'reni-walk', frame: 1 }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'walk-up',
      frames: [
        { key: 'reni-walk', frame: 2 },
        { key: 'reni-walk', frame: 3 }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'walk-side',
      frames: [
        { key: 'reni-walk', frame: 4 },
        { key: 'reni-walk', frame: 5 }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  showBanner(message) {
    this.splashText.setText(message).setVisible(true);
    this.time.delayedCall(2000, () => {
      this.splashText.setVisible(false);
    });
  }

  rebuildMapPhysics() {
    this.walls.clear(true, true);
    this.portals.clear(true, true);
    this.chests.clear(true, true);
    this.pedestals.clear(true, true);
    this.iceBlocks.clear(true, true);
    this.pyramids.clear(true, true);

    // 既存の描画用タイルをクリア
    if (!this.mapTilesGroup) {
      this.mapTilesGroup = this.add.group();
    } else {
      this.mapTilesGroup.clear(true, true);
    }

    const mapData = maps[currentWorld];

    // タイルキーの決定
    let grassKey = 'tile-grass-light';
    let wallKey = 'tile-wall-light';
    let waterKey = 'tile-water-light';

    if (currentWorld === 'light' || currentWorld === 'lost_woods') {
      grassKey = 'tile-grass-light';
      wallKey = 'tile-wall-light';
      waterKey = 'tile-water-light';
    } else if (currentWorld === 'dark') {
      grassKey = 'tile-grass-dark';
      wallKey = 'tile-wall-dark';
      waterKey = 'tile-water-dark';
    } else if (currentWorld === 'desert') {
      grassKey = 'tile-floor-desert';
      wallKey = 'tile-wall-desert';
      waterKey = 'tile-water-light';
    } else if (currentWorld === 'dark_temple') {
      grassKey = 'tile-floor-darktemple';
      wallKey = 'tile-wall-darktemple';
      waterKey = 'tile-water-dark';
    } else if (currentWorld === 'pyramid') {
      grassKey = 'tile-floor-pyramid';
      wallKey = 'tile-wall-pyramid';
      waterKey = 'tile-water-dark';
    }

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tile = mapData[r][c];
        const tx = c * TILE_SIZE + 16;
        const ty = r * TILE_SIZE + 16;

        // 1. 全てのベース地面を描画
        const grass = this.mapTilesGroup.create(tx, ty, grassKey);
        grass.setDepth(-10);

        // 2. タイルの種類に応じた追加描画と物理設定
        if (tile === 1) {
          const wall = this.mapTilesGroup.create(tx, ty, wallKey);
          wall.setDepth(-9);
          this.walls.create(tx, ty, null, null, false);
        } else if (tile === 2) {
          const water = this.mapTilesGroup.create(tx, ty, waterKey);
          water.setDepth(-9);
          this.walls.create(tx, ty, null, null, false);
        } else if (tile === 3) {
          this.portals.create(tx, ty, 'portal').refreshBody();
        } else if (tile === 4 || tile === 6 || tile === 7) {
          const chestObj = this.chests.create(tx, ty, 'chest').refreshBody();
          chestObj.tileType = tile;
          chestObj.gridX = c;
          chestObj.gridY = r;
        } else if (tile === 5) {
          const ped = this.pedestals.create(tx, ty, 'chest').refreshBody();
          ped.gridX = c;
          ped.gridY = r;
          ped.setTint(0xffd700); // 金色
        } else if (tile === 8) {
          const ice = this.iceBlocks.create(tx, ty, 'portal').refreshBody();
          ice.gridX = c;
          ice.gridY = r;
          ice.setTint(0xaae6ff);
        } else if (tile === 9) {
          const pyr = this.pyramids.create(tx, ty, 'portal').refreshBody();
          pyr.gridX = c;
          pyr.gridY = r;
          pyr.setTint(0xffd700);
        } else if (tile === 10) {
          const lava = this.mapTilesGroup.create(tx, ty, 'tile-lava');
          lava.setDepth(-9);
          this.walls.create(tx, ty, null, null, false);
        }

        // 3. ダンジョン入り口の明示的描画
        let isEntrance = false;
        if (currentWorld === 'light') {
          if ((r === 24 && c === 6) || (r === 6 && c === 4)) isEntrance = true;
        } else if (currentWorld === 'dark') {
          if ((r === 6 && c === 4) || (r === 14 && c === 18)) isEntrance = true;
        }

        if (isEntrance) {
          const entrance = this.mapTilesGroup.create(tx, ty, 'tile-entrance');
          entrance.setDepth(-8); // 地面より少し上
        }
      }
    }

    this.setupFog();
    this.setupDarkness();
  }

  setupFog() {
    if (this.fogGroup) this.fogGroup.destroy(true);
    if (currentWorld !== 'lost_woods') return;

    this.fogGroup = this.add.group();
    for (let i = 0; i < 4; i++) {
      const fog = this.add.graphics();
      fog.fillStyle(0xffffff, 0.08);
      fog.fillCircle(100, 100, 150);
      fog.fillCircle(250, 150, 180);
      fog.fillCircle(400, 100, 160);
      fog.fillCircle(550, 160, 150);
      
      fog.setScrollFactor(0);
      fog.setDepth(50);
      fog.x = -800 + i * 400;
      fog.y = -50 + Math.random() * 50;
      fog.speed = 0.5 + Math.random() * 0.5;
      this.fogGroup.add(fog);
    }
  }

  setupDarkness() {
    if (this.darknessMask) this.darknessMask.destroy();
    const isDarkArea = false; // 全てのダンジョンで暗闇設定を解除
    if (!isDarkArea) return;

    this.darknessMask = this.add.graphics();
    this.darknessMask.setDepth(40);
  }

  createSpark(x, y, color = 0xffd700) {
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(x, y, 2 + Math.random() * 2, color);
      this.physics.add.existing(spark);
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 60;
      spark.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.time.delayedCall(200 + Math.random() * 200, () => {
        spark.destroy();
      });
    }
  }

  spawnEntities() {
    this.enemies.clear(true, true);

    if (currentWorld === 'light') {
      this.addEnemy(15 * TILE_SIZE, 8 * TILE_SIZE, 'octorok');
      this.addEnemy(8 * TILE_SIZE, 22 * TILE_SIZE, 'octorok');
      this.addEnemy(28 * TILE_SIZE, 8 * TILE_SIZE, 'octorok');
    } else if (currentWorld === 'dark') {
      this.addEnemy(28 * TILE_SIZE, 12 * TILE_SIZE, 'octorok');
      this.addEnemy(32 * TILE_SIZE, 20 * TILE_SIZE, 'octorok');
      this.addEnemy(12 * TILE_SIZE, 25 * TILE_SIZE, 'octorok');
    } else if (currentWorld === 'desert') {
      // 砂漠の神殿ボス「デグサード」
      if (!hasFireRod) {
        this.addEnemy(20 * TILE_SIZE, 5 * TILE_SIZE, 'lanmola');
      }
    } else if (currentWorld === 'dark_temple') {
      // 闇の神殿ボス「アグニム」
      if (!bossDefeated) {
        this.addEnemy(20 * TILE_SIZE, 3 * TILE_SIZE, 'agahnim');
      }
    } else if (currentWorld === 'lost_woods') {
      // 迷いの森ボス「デグテール」
      if (!hasMasterSword) {
        this.addEnemy(20 * TILE_SIZE, 5 * TILE_SIZE, 'moldorm');
      }
    } else if (currentWorld === 'pyramid') {
      // ピラミッドボス「ガノン」
      if (!finalBossDefeated) {
        this.addEnemy(20 * TILE_SIZE, 5 * TILE_SIZE, 'ganon');
      }
    }
  }

  addEnemy(x, y, type) {
    let textureKey = 'enemy-octorok';
    if (type === 'agahnim') textureKey = 'boss-agahnim';
    else if (type === 'ganon') textureKey = 'boss-ganon';
    else if (type === 'lanmola') textureKey = 'boss-lanmola';
    else if (type === 'moldorm') textureKey = 'boss-moldorm';

    const enemy = this.enemies.create(x, y, textureKey);
    enemy.body.setSize(20, 20);
    enemy.body.setOffset(6, 6);
    enemy.type = type;
    enemy.health = type === 'ganon' ? 12 : (type === 'agahnim' ? 4 : (type === 'lanmola' ? 6 : (type === 'moldorm' ? 6 : 2)));
    enemy.speed = type === 'ganon' ? 95 : (type === 'agahnim' ? 70 : (type === 'lanmola' ? 110 : (type === 'moldorm' ? 120 : 55)));

    if (type === 'lanmola') {
      enemy.isSubmerged = false;
    }

    if (type === 'octorok') {
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (!enemy.active) return;
          const dx = this.player.x - enemy.x;
          const dy = this.player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            enemy.body.setVelocity((dx / dist) * enemy.speed, (dy / dist) * enemy.speed);
          } else {
            const angle = Math.random() * Math.PI * 2;
            enemy.body.setVelocity(Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
          }
        },
        loop: true
      });
    } else if (type === 'agahnim') {
      this.time.addEvent({
        delay: 3500,
        callback: () => {
          if (!enemy.active) return;
          const tc = 17 + Math.floor(Math.random() * 7); // c=17..23
          const tr = 3 + Math.floor(Math.random() * 3);  // r=3..5
          enemy.x = tc * TILE_SIZE + 16;
          enemy.y = tr * TILE_SIZE + 16;
          enemy.body.setVelocity(0, 0);

          this.cameras.main.flash(200, 156, 39, 176, true);

          this.time.delayedCall(800, () => {
            if (!enemy.active) return;
            AudioSynth.playFireball();
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const speed = 120;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const ball = new Projectile(this, enemy.x, enemy.y, 'magic-ball', dx, dy, 'magic-ball');
            ball.owner = 'enemy';
            ball.setTint(0x9b59b6);
          });
        },
        loop: true
      });
    } else if (type === 'lanmola') {
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          if (!enemy.active) return;
          if (!enemy.isSubmerged) {
            enemy.isSubmerged = true;
            enemy.setVisible(false);
            enemy.body.enable = false;
            enemy.body.setVelocity(0, 0);
          } else {
            enemy.isSubmerged = false;
            enemy.setVisible(true);
            enemy.body.enable = true;
            
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 60;
            enemy.x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 11 * TILE_SIZE, 29 * TILE_SIZE);
            enemy.y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 9 * TILE_SIZE, 23 * TILE_SIZE);
            
            const pAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            enemy.body.setVelocity(Math.cos(pAngle) * enemy.speed, Math.sin(pAngle) * enemy.speed);
            
            AudioSynth.playHurt();
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              const rdx = Math.cos(a) * 150;
              const rdy = Math.sin(a) * 150;
              const rock = new Projectile(this, enemy.x, enemy.y, 'rock-proj', rdx, rdy, 'rock-proj');
              rock.owner = 'enemy';
              rock.setTint(0xcd853f);
            }
          }
        },
        loop: true
      });
    } else if (type === 'moldorm') {
      this.time.addEvent({
        delay: 400,
        callback: () => {
          if (!enemy.active) return;
          const angle = Math.random() * Math.PI * 2;
          enemy.body.setVelocity(Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
        },
        loop: true
      });
    } else if (type === 'ganon') {
      this.time.addEvent({
        delay: 3500,
        callback: () => {
          if (!enemy.active) return;
          const tc = 16 + Math.floor(Math.random() * 9);
          const tr = 8 + Math.floor(Math.random() * 8);
          enemy.x = tc * TILE_SIZE + 16;
          enemy.y = tr * TILE_SIZE + 16;
          enemy.body.setVelocity(0, 0);

          AudioSynth.playFireball();
          const speed = 160;
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const targetAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const finalAngle = angle + targetAngle;
            const fball = new Projectile(this, enemy.x, enemy.y, 'fireball', Math.cos(finalAngle) * speed, Math.sin(finalAngle) * speed, 'fireball');
            fball.owner = 'enemy';
            fball.setTint(0xff3333);
          }

          this.time.delayedCall(800, () => {
            if (!enemy.active) return;
            const pAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            enemy.body.setVelocity(Math.cos(pAngle) * enemy.speed * 1.5, Math.sin(pAngle) * enemy.speed * 1.5);
          });
        },
        loop: true
      });
    }
  }

  update() {
    if (gameState !== STATES.PLAYING) return;

    this.handleMovement();

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.jKey)) {
      this.useItem();
    }

    this.physics.overlap(this.player, this.portals, this.enterPortal, null, this);
    
    if (this.player.isScratching) {
      this.checkMeleeHits();
    }

    this.checkAreaTransition();

    // 霧のスクロール更新
    if (currentWorld === 'lost_woods' && this.fogGroup) {
      this.fogGroup.getChildren().forEach(fog => {
        fog.x += fog.speed;
        if (fog.x > 800) {
          fog.x = -800;
          fog.y = -50 + Math.random() * 50;
        }
      });
    }

    // 暗闇マスク（ランタン効果）の追従・再描画
    if (this.darknessMask && this.darknessMask.active) {
      this.darknessMask.clear();
      this.darknessMask.fillStyle(0x050508, 0.95);
      this.darknessMask.fillRect(this.cameras.main.scrollX, this.cameras.main.scrollY, 800, 480);
      
      this.darknessMask.setBlendMode(Phaser.BlendModes.ERASE);
      const maxRadius = 150;
      for (let r = maxRadius; r > 0; r -= 10) {
        this.darknessMask.fillStyle(0xffffff, 0.08);
        this.darknessMask.fillCircle(this.player.x, this.player.y, r);
      }
      this.darknessMask.setBlendMode(Phaser.BlendModes.NORMAL);
    }
  }

  handleMovement() {
    if (this.player.isScratching) {
      this.player.body.setVelocity(0, 0);
      return;
    }

    const isBunny = (['dark', 'dark_temple', 'pyramid'].includes(currentWorld) && !hasMoonPearl);
    const speed = 120;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      vx = -speed;
      this.player.direction = 'left';
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      vx = speed;
      this.player.direction = 'right';
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      vy = -speed;
      this.player.direction = 'up';
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      vy = speed;
      this.player.direction = 'down';
    }

    this.player.body.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      if (currentWorld === 'desert' && Math.random() < 0.12) {
        const dust = this.add.circle(this.player.x, this.player.y + 12, 3, 0xecd8b0, 0.7);
        this.tweens.add({
          targets: dust,
          y: dust.y - 12,
          scale: 0.1,
          alpha: 0,
          duration: 320,
          onComplete: () => dust.destroy()
        });
      }

      if (isBunny) {
        this.player.setTexture('reni-bunny');
      } else {
        this.player.setTexture('reni-walk');
        if (this.player.direction === 'down') {
          this.player.play('walk-down', true);
          this.player.flipX = false;
        } else if (this.player.direction === 'up') {
          this.player.play('walk-up', true);
          this.player.flipX = false;
        } else if (this.player.direction === 'right') {
          this.player.play('walk-side', true);
          this.player.flipX = false;
        } else if (this.player.direction === 'left') {
          this.player.play('walk-side', true);
          this.player.flipX = true;
        }
      }
    } else {
      this.player.anims.stop();
      if (isBunny) {
        this.player.setTexture('reni-bunny');
      } else {
        this.player.setTexture('reni-walk');
        if (this.player.direction === 'down') this.player.setFrame(0);
        else if (this.player.direction === 'up') this.player.setFrame(2);
        else this.player.setFrame(4);
      }
    }
  }

  useItem() {
    const isBunny = (['dark', 'dark_temple', 'pyramid'].includes(currentWorld) && !hasMoonPearl);
    if (isBunny) {
      this.checkMeleeHits();
      return;
    }

    if (selectedItem === 1) {
      this.player.isScratching = true;
      AudioSynth.playSlash();
      this.player.body.setVelocity(0, 0);

      // 斬撃エフェクトの表示
      let sx = this.player.x;
      let sy = this.player.y;
      let frame = 0;
      let flipX = false;
      let flipY = false;

      if (this.player.direction === 'right') {
        sx += 20;
        frame = 0;
      } else if (this.player.direction === 'left') {
        sx -= 20;
        frame = 0;
        flipX = true;
      } else if (this.player.direction === 'down') {
        sy += 20;
        frame = 1;
      } else if (this.player.direction === 'up') {
        sy -= 20;
        frame = 1;
        flipY = true;
      }

      const slash = this.add.sprite(sx, sy, 'slash-effect', frame);
      slash.setDepth(15);
      slash.flipX = flipX;
      slash.flipY = flipY;
      
      if (hasMasterSword) {
        slash.setTint(0x88ccff); // マスターソードなら青白く光る
      }

      this.time.delayedCall(120, () => {
        if (slash && slash.active) slash.destroy();
      });

      if (hasMasterSword && playerHealth === playerMaxHealth) {
        this.fireProjectile('beam');
      }

      this.time.delayedCall(200, () => {
        this.player.isScratching = false;
      });
    } else if (selectedItem === 2 && hasFireRod) {
      if (playerMagic >= 15) {
        playerMagic -= 15;
        AudioSynth.playFireball();
        this.fireProjectile('fireball');
        updateUI();
      } else {
        this.showBanner("まほうが足りない！");
      }
    } else if (selectedItem === 3 && hasBow) {
      if (playerArrows >= 1) {
        playerArrows -= 1;
        AudioSynth.playArrow();
        this.fireProjectile('arrow');
        updateUI();
      } else {
        this.showBanner("矢がない！");
      }
    } else if (selectedItem === 4) {
      this.useMirror();
    }
  }

  fireProjectile(type) {
    let dx = 0;
    let dy = 0;
    let speed = 250;
    let sx = this.player.x;
    let sy = this.player.y;

    if (this.player.direction === 'left') { dx = -speed; sx -= 16; }
    else if (this.player.direction === 'right') { dx = speed; sx += 16; }
    else if (this.player.direction === 'up') { dy = -speed; sy -= 16; }
    else if (this.player.direction === 'down') { dy = speed; sy += 16; }

    new Projectile(this, sx, sy, type, dx, dy, type);
  }

  checkMeleeHits() {
    let ax = this.player.x;
    let ay = this.player.y;
    const range = 24;

    if (this.player.direction === 'down') ay += range;
    else if (this.player.direction === 'up') ay -= range;
    else if (this.player.direction === 'right') ax += range;
    else if (this.player.direction === 'left') ax -= range;

    const hitBox = new Phaser.Geom.Rectangle(ax - 12, ay - 12, 24, 24);

    // 敵への近接攻撃判定
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy || !enemy.active || !enemy.body) return;
      const enemyBox = enemy.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitBox, enemyBox)) {
        let damage = hasMasterSword ? 3 : 1;
        if (enemy.type === 'agahnim') {
          damage = 0; // アグニム自身への通常攻撃は無効
          this.showBanner("魔法を跳ね返して攻撃しろ！");
        } else if (enemy.type === 'ganon') {
          if (!hasMasterSword) {
            damage = 0;
            this.showBanner("マスターソードでないと効かない！");
          }
        } else if (enemy.type === 'moldorm') {
          // デグテールの背後からのみ攻撃可能
          const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
          const moveAngle = Math.atan2(enemy.body.velocity.y, enemy.body.velocity.x);
          const diff = Phaser.Math.Angle.Wrap(angleToPlayer - moveAngle);
          
          if (Math.abs(diff) > Math.PI * 0.6) {
            damage = hasMasterSword ? 3 : 1;
            this.showBanner("弱点にヒット！");
          } else {
            damage = 0;
            this.showBanner("頭部は硬い！後ろから狙え！");
            const kbAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            this.player.body.setVelocity(Math.cos(kbAngle) * 320, Math.sin(kbAngle) * 320);
          }
        }

        if (damage > 0) {
          this.damageEnemy(enemy, damage);
        }
      }
    });

    // プレイヤーの剣と敵の魔法弾との衝突判定
    this.projectiles.getChildren().forEach(proj => {
      if (proj.type === 'magic-ball' && proj.owner === 'enemy') {
        const projBox = proj.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitBox, projBox)) {
          proj.owner = 'player';
          proj.setTint(0x55ff55); // 跳ね返した弾は緑色に光る！
          
          let vx = 0;
          let vy = 0;
          const speed = 250;
          if (this.player.direction === 'left') vx = -speed;
          else if (this.player.direction === 'right') vx = speed;
          else if (this.player.direction === 'up') vy = -speed;
          else if (this.player.direction === 'down') vy = speed;

          proj.body.setVelocity(vx, vy);
          AudioSynth.playSlash();
          this.showBanner("魔法弾を跳ね返した！");
        }
      }
    });

    this.chests.getChildren().forEach(chest => {
      const chestBox = chest.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitBox, chestBox)) {
        this.openChest(chest);
      }
    });

    this.pedestals.getChildren().forEach(ped => {
      const pedBox = ped.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitBox, pedBox)) {
        this.drawMasterSword(ped);
      }
    });

    this.pyramids.getChildren().forEach(pyr => {
      if (!pyr || !pyr.active) return;
      const pyrBox = pyr.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitBox, pyrBox)) {
        if (hasMasterSword) {
          maps.dark[pyr.gridY][pyr.gridX] = 0; // コリダーを消して踏めるようにする
          this.rebuildMapPhysics();
          AudioSynth.playWarp();
          this.showBanner("ピラミッドの入り口が開いた！");
        } else {
          this.showBanner("マスターソードが必要だ...");
        }
      }
    });
  }

  openChest(chest) {
    if (chest.tileType === 4) {
      hasMoonPearl = true;
      maps[currentWorld][chest.gridY][chest.gridX] = 0;
      this.rebuildMapPhysics();
      AudioSynth.playFanfare();
      this.showBanner("ムーンパールを手に入れた！");
    } else if (chest.tileType === 6) {
      hasFireRod = true;
      maps[currentWorld][chest.gridY][chest.gridX] = 0;
      this.rebuildMapPhysics();
      AudioSynth.playFanfare();
      this.showBanner("ファイアロッドを手に入れた！");
    } else if (chest.tileType === 7) {
      hasBow = true;
      maps[currentWorld][chest.gridY][chest.gridX] = 0;
      this.rebuildMapPhysics();
      AudioSynth.playFanfare();
      this.showBanner("弓矢を手に入れた！");
    }
    updateUI();
  }

  drawMasterSword(ped) {
    hasMasterSword = true;
    maps[currentWorld][ped.gridY][ped.gridX] = 0;
    this.rebuildMapPhysics();
    AudioSynth.playFanfare();
    this.showBanner("マスターソードを引き抜いた！");
    updateUI();
  }

  enterPortal(player, portal) {
    if (currentWorld !== 'light') return;
    currentWorld = 'dark';
    
    this.player.x += 32;
    AudioSynth.playWarp();
    AudioSynth.startBGM('dark');
    this.cameras.main.flash(400, 255, 255, 255);
    this.rebuildMapPhysics();
    this.spawnEntities();
    updateUI();
  }

  useMirror() {
    const isDungeon = ['desert', 'dark_temple', 'lost_woods', 'pyramid'].includes(currentWorld);
    if (isDungeon) {
      AudioSynth.playWarp();
      this.cameras.main.flash(400, 255, 255, 255);
      if (currentWorld === 'desert') {
        currentWorld = 'light';
        this.player.x = 8 * TILE_SIZE + 16;
        this.player.y = 24 * TILE_SIZE + 16;
      } else if (currentWorld === 'dark_temple') {
        currentWorld = 'dark';
        this.player.x = 4 * TILE_SIZE + 16;
        this.player.y = 7 * TILE_SIZE + 16;
      } else if (currentWorld === 'lost_woods') {
        currentWorld = 'light';
        this.player.x = 4 * TILE_SIZE + 16;
        this.player.y = 7 * TILE_SIZE + 16;
      } else if (currentWorld === 'pyramid') {
        currentWorld = 'dark';
        this.player.x = 18 * TILE_SIZE + 16;
        this.player.y = 15 * TILE_SIZE + 16;
      }
      AudioSynth.startBGM(currentWorld === 'light' ? 'light' : 'dark');
      this.rebuildMapPhysics();
      this.spawnEntities();
      updateUI();
      return;
    }

    if (currentWorld === 'dark') {
      currentWorld = 'light';
      activePortal = { x: this.player.x, y: this.player.y };
      AudioSynth.playWarp();
      AudioSynth.startBGM('light');
      this.cameras.main.flash(400, 255, 255, 255);
      this.rebuildMapPhysics();
      this.spawnEntities();
      updateUI();
    } else if (currentWorld === 'light' && activePortal) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, activePortal.x, activePortal.y);
      if (dist < 40) {
        currentWorld = 'dark';
        activePortal = null;
        AudioSynth.playWarp();
        AudioSynth.startBGM('dark');
        this.cameras.main.flash(400, 255, 255, 255);
        this.rebuildMapPhysics();
        this.spawnEntities();
        updateUI();
      }
    }
  }

  checkAreaTransition() {
    const px = Math.floor(this.player.x / TILE_SIZE);
    const py = Math.floor(this.player.y / TILE_SIZE);

    const isDungeon = ['desert', 'dark_temple', 'lost_woods', 'pyramid'].includes(currentWorld);

    // 1. ダンジョンからの南門脱出
    if (isDungeon && py === 29) {
      AudioSynth.playWarp();
      this.cameras.main.flash(400, 255, 255, 255);
      if (currentWorld === 'desert') {
        currentWorld = 'light';
        this.player.x = 8 * TILE_SIZE + 16;
        this.player.y = 24 * TILE_SIZE + 16;
      } else if (currentWorld === 'dark_temple') {
        currentWorld = 'dark';
        this.player.x = 4 * TILE_SIZE + 16;
        this.player.y = 7 * TILE_SIZE + 16;
      } else if (currentWorld === 'lost_woods') {
        currentWorld = 'light';
        this.player.x = 4 * TILE_SIZE + 16;
        this.player.y = 7 * TILE_SIZE + 16;
      } else if (currentWorld === 'pyramid') {
        currentWorld = 'dark';
        this.player.x = 18 * TILE_SIZE + 16;
        this.player.y = 15 * TILE_SIZE + 16;
      }
      AudioSynth.startBGM(currentWorld === 'light' ? 'light' : 'dark');
      this.rebuildMapPhysics();
      this.spawnEntities();
      updateUI();
      return;
    }

    // 2. 通常世界からダンジョンへの進入
    if (currentWorld === 'light') {
      // 砂漠の神殿 (入り口手前の c=6, r=24 を踏む)
      if (py === 24 && px === 6) {
        currentWorld = 'desert';
        this.player.x = 20 * TILE_SIZE + 16;
        this.player.y = 28 * TILE_SIZE + 16;
        AudioSynth.playWarp();
        AudioSynth.startBGM('dark'); // ダンジョン用の緊迫BGM
        this.cameras.main.flash(400, 255, 255, 255);
        this.rebuildMapPhysics();
        this.spawnEntities();
        updateUI();
      }
      // 迷いの森 (結界が消えた後の c=4, r=6 を踏む)
      else if (py === 6 && px === 4 && bossDefeated) {
        currentWorld = 'lost_woods';
        this.player.x = 20 * TILE_SIZE + 16;
        this.player.y = 28 * TILE_SIZE + 16;
        AudioSynth.playWarp();
        AudioSynth.startBGM('light');
        this.cameras.main.flash(400, 255, 255, 255);
        this.rebuildMapPhysics();
        this.spawnEntities();
        updateUI();
      }
    } else if (currentWorld === 'dark') {
      // 闇の神殿 (氷ブロックを溶かした後の c=4, r=6 を踏む)
      if (py === 6 && px === 4) {
        currentWorld = 'dark_temple';
        this.player.x = 20 * TILE_SIZE + 16;
        this.player.y = 28 * TILE_SIZE + 16;
        AudioSynth.playWarp();
        AudioSynth.startBGM('dark');
        this.cameras.main.flash(400, 255, 255, 255);
        this.rebuildMapPhysics();
        this.spawnEntities();
        updateUI();
      }
      // ピラミッド (壁が消えた後の c=18, r=14 を踏む)
      else if (py === 14 && px === 18) {
        currentWorld = 'pyramid';
        this.player.x = 20 * TILE_SIZE + 16;
        this.player.y = 28 * TILE_SIZE + 16;
        AudioSynth.playWarp();
        AudioSynth.startBGM('dark');
        this.cameras.main.flash(400, 255, 255, 255);
        this.rebuildMapPhysics();
        this.spawnEntities();
        updateUI();
      }
    }
  }

  hitEnemy(proj, enemy) {
    if (proj.owner === 'enemy') return; // 敵の弾は敵には当たらない

    if (enemy.type === 'agahnim') {
      if (proj.type === 'magic-ball' && proj.owner === 'player') {
        proj.destroy();
        this.damageEnemy(enemy, 2);
        this.showBanner("アグニムにダメージ！");
      } else {
        proj.destroy();
      }
      return;
    }

    proj.destroy();

    let damage = 1;
    if (proj.type === 'fireball') damage = 3;
    if (proj.type === 'arrow') damage = 2;
    if (proj.type === 'beam') damage = 2;

    if (enemy.type === 'ganon') {
      if (proj.type === 'arrow') damage = 0;
      if (proj.type === 'fireball') damage = 2;
      if (proj.type === 'beam' && !hasMasterSword) damage = 0;
    }

    this.damageEnemy(enemy, damage);
  }

  damageEnemy(enemy, damage) {
    if (damage <= 0) return;

    enemy.health -= damage;
    
    // 火花を散らす
    this.createSpark(enemy.x, enemy.y, 0xffaa00);
    
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    enemy.body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);

    enemy.setTint(0xff5555);
    this.time.delayedCall(120, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.health <= 0) {
      if (enemy.type === 'agahnim') {
        bossDefeated = true;
        maps.light[6][4] = 0; // 光の世界の森の結界を消去
        this.rebuildMapPhysics();
        AudioSynth.playFanfare();
        this.showBanner("アグニムを倒した！結界が消えた！");
      } else if (enemy.type === 'lanmola') {
        maps.desert[5][20] = 6; // ファイアーロッドの宝箱を出現させる
        this.rebuildMapPhysics();
        AudioSynth.playFanfare();
        this.showBanner("デグサードを倒した！宝箱が出現！");
      } else if (enemy.type === 'moldorm') {
        maps.lost_woods[3][20] = 5; // マスターソード台座を出現させる
        this.rebuildMapPhysics();
        AudioSynth.playFanfare();
        this.showBanner("デグテールを倒した！台座が出現！");
      } else if (enemy.type === 'ganon') {
        finalBossDefeated = true;
        AudioSynth.stopBGM();
        AudioSynth.playFanfare();
        gameState = STATES.CLEAR;
        updateUI();
        this.scene.start('ClearScene');
      } else {
        const rand = Math.random();
        if (rand < 0.25) {
          new DropItem(this, enemy.x, enemy.y, 'drop-heart', 'heart');
        } else if (rand < 0.50) {
          new DropItem(this, enemy.x, enemy.y, 'drop-magic', 'magic');
        } else if (rand < 0.75) {
          new DropItem(this, enemy.x, enemy.y, 'drop-arrow', 'arrow');
        }
      }
      enemy.destroy();
    }
  }

  hitPlayerByProjectile(player, proj) {
    if (!proj || !proj.active) return;
    if (proj.owner === 'player') return; // プレイヤー自身の弾は当たらない
    
    proj.destroy();
    
    if (player.invulnerable) return;

    playerHealth = Math.max(0, playerHealth - 1);
    updateUI();
    AudioSynth.playHurt();

    if (playerHealth <= 0) {
      gameState = STATES.GAMEOVER;
      updateUI();
      AudioSynth.stopBGM();
      this.scene.start('GameOverScene');
      return;
    }

    player.invulnerable = true;
    
    let angle = 0;
    if (proj.body && proj.body.velocity) {
      angle = Math.atan2(proj.body.velocity.y, proj.body.velocity.x);
    } else {
      angle = Phaser.Math.Angle.Between(proj.x, proj.y, player.x, player.y);
    }
    player.body.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);

    this.time.addEvent({
      delay: 50,
      callback: () => {
        player.setVisible(!player.visible);
      },
      repeat: 8
    });

    this.time.delayedCall(500, () => {
      player.invulnerable = false;
      player.setVisible(true);
    });
  }

  hitPlayer(player, enemy) {
    if (player.invulnerable) return;

    playerHealth = Math.max(0, playerHealth - 1);
    updateUI();

    AudioSynth.playHurt();

    if (playerHealth <= 0) {
      gameState = STATES.GAMEOVER;
      updateUI();
      AudioSynth.stopBGM();
      this.scene.start('GameOverScene');
      return;
    }

    player.invulnerable = true;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

    this.time.addEvent({
      delay: 50,
      callback: () => {
        player.setVisible(!player.visible);
      },
      repeat: 8
    });

    this.time.delayedCall(500, () => {
      player.invulnerable = false;
      player.setVisible(true);
    });
  }

  collectDrop(player, drop) {
    if (drop.type === 'heart') {
      playerHealth = Math.min(playerMaxHealth, playerHealth + 2);
      this.showBanner("ライフ回復！");
    } else if (drop.type === 'magic') {
      playerMagic = Math.min(playerMaxMagic, playerMagic + 30);
      this.showBanner("まほう回復！");
    } else if (drop.type === 'arrow') {
      playerArrows = Math.min(playerMaxArrows, playerArrows + 5);
      this.showBanner("矢を手に入れた！");
    }
    drop.destroy();
    updateUI();
  }
}

// 3. Game Over Scene
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('PlayScene');
    });
  }
}

// 4. Game Clear Scene
class ClearScene extends Phaser.Scene {
  constructor() {
    super('ClearScene');
  }

  create() {
    this.input.keyboard.once('keydown-ENTER', () => {
      gameState = STATES.TITLE;
      updateUI();
      this.scene.start('TitleScene');
    });
  }
}

// --- Phaser Config & Setup ---
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 480,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [TitleScene, PlayScene, GameOverScene, ClearScene]
};

// Initialize Phaser Game ONLY after DOM is fully loaded to avoid timing issues
window.addEventListener('DOMContentLoaded', () => {
  if (typeof showDebugError === 'function') {
    showDebugError('[SYSTEM] DOM構築完了。Phaser初期化を開始します...', '#4caf50');
  }
  try {
    const game = new Phaser.Game(config);
    if (typeof showDebugError === 'function') {
      showDebugError('[SYSTEM] Phaser 3 ゲームインスタンスが正常に生成されました。', '#4caf50');
    }
  } catch (e) {
    if (typeof showDebugError === 'function') {
      showDebugError('[FATAL ERROR] Phaser初期化中に例外が発生しました: ' + e.message, '#ff3333');
    }
  }
});
