import { PALETTE } from './palette.js';

/**
 * 追加テクスチャ（HUD・エフェクト・演出用）
 * - ドット絵マトリクス形式のもの（EXTRA_PIXEL_TEXTURES）
 * - Canvas で手続き的に描画するもの（影・グロー・斬撃など）
 */
export const EXTRA_PIXEL_TEXTURES = {
  // HUD ハート (0: 満タン / 1: 半分 / 2: 空)
  'hud-heart': {
    width: 7,
    height: 7,
    scale: 2,
    frames: [
      [
        '.kk.kk.',
        'kwrkrrk',
        'krrrrrk',
        'krrrrck',
        '.krrck.',
        '..kck..',
        '...k...'
      ],
      [
        '.kk.kk.',
        'kwrkaak',
        'krrkaak',
        'krrkaak',
        '.krkak.',
        '..kak..',
        '...k...'
      ],
      [
        '.kk.kk.',
        'kbakaak',
        'kaaaaak',
        'kaaaaAk',
        '.kaaAk.',
        '..kAk..',
        '...k...'
      ]
    ]
  },

  // ハートのうつわ（ボス撃破報酬）
  'heart-container': {
    width: 13,
    height: 12,
    scale: 2,
    frames: [
      [
        '..kkk...kkk..',
        '.k1yyk.kyy1k.',
        'k1wrrrkrrrr1k',
        'k1wrrrrrrrr1k',
        'k1rrrrrrrrc1k',
        'k1rrrrrrrrc1k',
        '.k1rrrrrrc1k.',
        '..k1rrrrc1k..',
        '...k1rrc1k...',
        '....k1c1k....',
        '.....k1k.....',
        '......k......'
      ]
    ]
  },

  // 小さな矢アイコン（HUD用）
  'hud-arrow': {
    width: 8,
    height: 8,
    scale: 2,
    frames: [
      [
        '......wk',
        '.....wgk',
        '....nbk.',
        '...nk...',
        '..nk....',
        'wnk.....',
        '.wk.....',
        'w.w.....'
      ]
    ]
  }
};

function drawPixelTexture(scene, key, data) {
  const { width, height, frames, scale } = data;
  const canvas = document.createElement('canvas');
  canvas.width = width * frames.length * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  frames.forEach((matrix, fIdx) => {
    const offsetX = fIdx * width * scale;
    matrix.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = PALETTE[row[x]];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
        }
      }
    });
  });

  scene.textures.addCanvas(key, canvas);
  const texture = scene.textures.get(key);
  frames.forEach((_, fIdx) => {
    texture.add(fIdx, 0, fIdx * width * scale, 0, width * scale, height * scale);
  });
}

function addCanvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  scene.textures.addCanvas(key, canvas);
}

export function buildExtraTextures(scene) {
  Object.keys(EXTRA_PIXEL_TEXTURES).forEach(key => {
    if (!scene.textures.exists(key)) drawPixelTexture(scene, key, EXTRA_PIXEL_TEXTURES[key]);
  });

  // 足元の影（楕円）
  addCanvasTexture(scene, 'shadow', 24, 10, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.25)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.scale(1, h / w);
    ctx.beginPath();
    ctx.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 柔らかい光の粒
  addCanvasTexture(scene, 'px-glow', 16, 16, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });

  // 角ばったスパーク（ドット感を保つ）
  addCanvasTexture(scene, 'px-spark', 4, 4, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);
  });

  // 煙（撃破エフェクト）
  addCanvasTexture(scene, 'smoke', 16, 16, (ctx) => {
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * 2, y * 2, 2, 2); };
    const shape = [
      '..aaaa..',
      '.abggba.',
      'abgwwgba',
      'agwwwwga',
      'agwwwwga',
      'abgwwgba',
      '.abggba.',
      '..aaaa..'
    ];
    const map = { a: '#58626f', b: '#9aa4af', g: '#e0e6eb', w: '#fcfcfc' };
    shape.forEach((row, y) => [...row].forEach((ch, x) => { if (map[ch]) px(x, y, map[ch]); }));
  });

  // 剣の軌跡（三日月形の斬撃）
  addCanvasTexture(scene, 'slash-arc', 64, 64, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // 外側の明るい弧
    const grad = ctx.createLinearGradient(-28, 0, 28, 0);
    grad.addColorStop(0, 'rgba(168,248,248,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1, 'rgba(168,248,248,0)');
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 24, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(88,200,232,0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 19, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
    ctx.restore();
  });

  // 地下への階段（ダンジョン入口）
  addCanvasTexture(scene, 'stairs', 32, 32, (ctx) => {
    ctx.fillStyle = '#0d1017';
    ctx.fillRect(0, 0, 32, 32);
    const steps = ['#9aa4af', '#7a8490', '#58626f', '#3c4450', '#2c333e', '#1a1f28'];
    steps.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(2 + i, 2 + i * 5, 28 - i * 2, 4);
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(2 + i, 6 + i * 5, 28 - i * 2, 1);
    });
    ctx.strokeStyle = '#c89818';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 30, 30);
  });

  // ダンジョン出口（南側の扉）
  addCanvasTexture(scene, 'door-exit', 32, 32, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0, 'rgba(255,240,200,0.0)');
    g.addColorStop(1, 'rgba(255,240,200,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
  });

  // トライフォースの三角形（タイトル用）
  addCanvasTexture(scene, 'tri-gold', 64, 56, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#fff6a8');
    g.addColorStop(0.45, '#ffd84a');
    g.addColorStop(1, '#b8860b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(104,64,0,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // ハイライト
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 6);
    ctx.lineTo(w / 2 + 6, 18);
    ctx.lineTo(w / 2 - 12, 40);
    ctx.lineTo(w / 2 - 18, 40);
    ctx.closePath();
    ctx.fill();
  });

  // 闇の世界や神殿で使う周辺減光（ビネット）
  addCanvasTexture(scene, 'vignette', 400, 240, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}
