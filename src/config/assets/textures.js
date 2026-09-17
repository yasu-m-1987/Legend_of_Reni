import { PALETTE } from './palette.js';

/**
 * SFC『ゼルダの伝説 神々のトライフォース』水準 16bitピクセルアート集
 */
export const TEXTURES = {
  // ================= 1. プレイヤー：れに (キジトラ猫) =================
  // 4方向 x 2フレーム歩行アニメーション (16x16, 2倍スケール)
  'reni-walk': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      // Frame 0: 正面 (下向き 1)
      [
        '....kppkkppk....', // 耳のピンク
        '...kpooppook....', // 耳の毛並み
        '..kpsoHHosspk...', // 耳の付け根・ハイライト
        '..ksooHHossok...', // 額のキジトラ縞模様
        '.ksooHwwHwsok...', // まん丸な瞳
        '.ksokkkokkkok...', // 黒い瞳孔
        '.koo66rr66ook...', // 鼻・ピンクのマズル・口元
        '.kso665566sok...', // 頬の毛
        '..kssPccPsk.....', // 首元の赤いバンダナ
        '..keeeSSdeek....', // 緑の勇者マント (ハイライト〜影)
        '.keeddSSddeek...', // マントの広がり
        '.keedByxBddek...', // 金具ベルト
        '..kedByxBdzk....',
        '..ksoossPPsk....', // 足元の茶毛
        '...kaakkak......', // 後ろ足の影
        '....k....k......'
      ],
      // Frame 1: 正面 (下向き 2 - 歩行足踏み)
      [
        '....kppkkppk....',
        '...kpooppook....',
        '..kpsoHHosspk...',
        '..ksooHHossok...',
        '.ksooHwwHwsok...',
        '.ksokkkokkkok...',
        '.koo66rr66ook...',
        '.kso665566sok...',
        '..kssPccPsk.....',
        '..keeeSSdeek....',
        '.keeddSSddeek...',
        '.keedByxBddek...',
        '..kedByxBdzk....',
        '..kPso..osPk....', // 足を開いて歩く
        '..ka......ak....',
        '................'
      ],
      // Frame 2: 背面 (上向き 1)
      [
        '....kppkkppk....',
        '...kpooppook....',
        '..kPsoHHosPk....',
        '..kPsoHHosPk....',
        '.kPssoHHossPk...', // 後頭部のキジトラ縞模様
        '.kPssoHHossPk...',
        '.kPssoHHossPk...',
        '..kPsoHHosPk....',
        '..kssPccPsk.....',
        '..keeeSSdeek....', // 後ろ姿のマント
        '.keeedSSddeek...',
        '.keeddSSddeek...',
        '..keddddddek....',
        '..ksoossPPsk....', // しっぽと足
        '...ksIIssk......',
        '....kakkak......'
      ],
      // Frame 3: 背面 (上向き 2 - 歩行足踏み)
      [
        '....kppkkppk....',
        '...kpooppook....',
        '..kPsoHHosPk....',
        '..kPsoHHosPk....',
        '.kPssoHHossPk...',
        '.kPssoHHossPk...',
        '.kPssoHHossPk...',
        '..kPsoHHosPk....',
        '..kssPccPsk.....',
        '..keeeSSdeek....',
        '.keeedSSddeek...',
        '.keeddSSddeek...',
        '..keddddddek....',
        '..kPso..osPk....',
        '..ka......ak....',
        '................'
      ],
      // Frame 4: 側面 (右向き 1)
      [
        '......kppk......', // 片耳
        '.....kpoook.....',
        '....kpsoHos.....',
        '....ksoHHook....',
        '...ksooHwwk.....', // 横顔の瞳
        '...ksokkkok.....',
        '...koo66rrok....', // 鼻先
        '...kso665sok....',
        '....kssPck......', // 首輪
        '...keeeSSdek....', // なびくマント
        '..keeddSSddek...',
        '..keedByxBdek...',
        '...kedByxBdzk...',
        '...ksoosPPsk....', // 足としっぽ
        '....ksIIsska....',
        '.....kaakk......'
      ],
      // Frame 5: 側面 (右向き 2 - 歩行足踏み)
      [
        '......kppk......',
        '.....kpoook.....',
        '....kpsoHos.....',
        '....ksoHHook....',
        '...ksooHwwk.....',
        '...ksokkkok.....',
        '...koo66rrok....',
        '...kso665sok....',
        '....kssPck......',
        '...keeeSSdek....',
        '..keeddSSddek...',
        '..keedByxBdek...',
        '...kedByxBdzk...',
        '....kPso.osPk...', // 足を踏み出す
        '.....ksIIska....',
        '......ka..a.....'
      ]
    ]
  },

  // ================= 2. アイテム掲げポーズ =================
  'reni-hold': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '..kppk....kppk..',
        '.kpoook..kpoook.',
        '..kpsoH..Hospk..',
        '..ksooHwwHwook..',
        '..ksookkkkokok..',
        '..koo66rr66ook..',
        '..kso665566sok..',
        '...kssPccPsk....',
        '..keeeSSdeek....',
        '.keeddSSddeek...',
        '.keedByxBddek...',
        '..kedByxBdzk....',
        '..ksoossPPsk....',
        '...kaakkak......',
        '................',
        '................'
      ]
    ]
  },

  // ================= 3. ピンクのウサギ姿 =================
  'reni-bunny': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '..kppk....kppk..',
        '.kpphpk..kphppk.',
        '.kpwwpp..ppwwpk.',
        '.kpwwpp..ppwwpk.',
        '.kppppppppppppk.',
        'kppphpppphppppk.',
        'kpwwkppppkwwppk.',
        'kppppprrppppppk.',
        '.kppphhhhppppk..',
        '..kpppppppppk...',
        '..keeeeedeeeek..',
        '.keeeddddddeek..',
        '..kedddddddzk...',
        '...kppppppk.....',
        '....ka..ak......',
        '................'
      ]
    ]
  },

  // ================= 4. 刈れる草 (SFC神トラ風ふんわりブッシュ) =================
  'cut-bush': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kkLL88kk....',
        '..kL88eeeeee8k..',
        '.k8eeeeeSSSeee8k',
        '.k8eeeSSSSSSSee8k',
        'k8eeSSSSddSSSeee',
        'keeSSSddddddSeee',
        'keeSSddTTTTdSSek',
        'keeSddTTzzTTdSek',
        'keeSddTzzzzTdSek',
        'keeSSddTTTTdSSek',
        'keeSSSddddddSeee',
        'k8eeSSSSddSSSeee',
        '.k8eeeSSSSSSSee8k',
        '.k8eeeeeSSSeee8k',
        '..kL88eeeeee8k..',
        '....kkddTTkk....'
      ]
    ]
  },

  // ================= 5. 回転斬りスピンリング =================
  'spin-ring': {
    width: 32,
    height: 32,
    scale: 1,
    frames: [
      [
        '............wwwwwwww............',
        '........wwwwEEEEEEEEwwww........',
        '......wwEEEEFFFFFFFFEEEEww......',
        '....wwEEFFFFGGGGGGGGFFFFEEww....',
        '...wEEFFFGG..........GGFFFEEw...',
        '..wEEFFGG..............GGFFEEw..',
        '.wEEFFG..................GFFEEw.',
        '.wEFFG....................GFFEw.',
        'wEEFF......................FFEEw',
        'wEEFF......................FFEEw',
        'wEEFG......................GFFEE',
        'wEFFG......................GFFEw',
        'wEEFF......................FFEEw',
        'wEEFF......................FFEEw',
        '.wEEFFG..................GFFEEw.',
        '..wEEFFGG..............GGFFEEw..',
        '...wEEFFFGG..........GGFFFEEw...',
        '....wwEEFFFFGGGGGGGGFFFFEEww....',
        '......wwEEEEFFFFFFFFEEEEww......',
        '........wwwwEEEEEEEEwwww........',
        '............wwwwwwww............',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................'
      ]
    ]
  },

  // ================= 6. オクタロック (丸みとツヤのあるSFCドット) =================
  'enemy-octorok': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '.....khhhhk.....',
        '...khrrrrrrrk...',
        '..khrrrrwwrrrrk.',
        '.khrrrwwwwrrrrrk',
        '.khrkwwrrkwwrrrk',
        '.khrkkkrrkkkrrrck',
        '.khrrrrrrrrrrrck',
        '..khrryyyyyyrrck',
        '..khrryx11xyrcck',
        '...khrfffffcck..',
        '..khrrrrrrrrcck.',
        '.khr..rrrr..rck.',
        '.kh....rr....rk.',
        '..k....rr....k..',
        '................',
        '................'
      ]
    ]
  },

  // ================= 7. 司祭アグニム (豪華な司祭ローブと装飾) =================
  'boss-agahnim': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '......kQQQQk....',
        '....kQQuuuuuqk..',
        '...kQQuuuuwwuqk.',
        '..kQQrkwwrrkwuqk',
        '..kQQuukkquukuqk',
        '..kQuuuuuuuuuuuqk',
        '...kQuuuwuuuuqk.',
        '..kQQuuyyyyyuqk.',
        '.kQQuuy1111yuuqk',
        '.kQuuy1xxxx1yuqk',
        '.kQuy1xxxxxx1yqk',
        '.kQuyxxxxxxxxyqk',
        '.kQuyyxxxxxyyqqk',
        '..kqyyyyyyyyyyqk',
        '...kaaa....aaak.',
        '................'
      ]
    ]
  },

  // ================= 8. 大魔王ガノン (SFC神トラの重厚な魔王) =================
  'boss-ganon': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kkyyyyykk...', // 金の冠
        '...kkhhhhhhkk...',
        '..khhrrrrrrchk..', // 凶暴な赤い眼光
        '.khrrEwwEEwwrchk',
        '.khrrFFFvFFFfchk',
        '.khrvvvvvvvvvchk', // 猪の巨大な牙
        '.khrvvvkkvvvvchk',
        '..krvvkkkkvvck..',
        '..kBBBBBBBBBBk..', // 重厚な青銅鎧
        '.kBByyyyyyyyBBk.',
        '.kByxxxxxxxxxyBk',
        'kBBy11xxxx11yBBk',
        '.kBBxxxxxxxBBk..',
        '..krrvvvvvvrrk..', // 赤いマント
        '..krr......rrk..',
        '..ka........ak..'
      ]
    ]
  },

  // ================= 9. デグサード (Lanmola) =================
  'boss-lanmola': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '......kjjjjk....',
        '....kjjHooHjjk..',
        '...kjjHooooHjjk.',
        '..kjjoowwjoowwjjk',
        '..kjjookjookjjjk',
        '..kjjjoooooojjjk',
        '...kjjjPnjjjjjk.',
        '....kjjjjjjjjk..',
        '..kjjjjjjjjjjjk.',
        '.kjjjjjssssjjjjk',
        '.kjjjjssssssjjjk',
        '.kjjjssssssssjjk',
        '.kjjssssssssssjk',
        '..kjjssssssssjk.',
        '...kjj......k...',
        '................'
      ]
    ]
  },

  // ================= 10. デグテール (Moldorm) =================
  'boss-moldorm': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '.....kwwwwwk....',
        '...kwyyyyyyyxfk.',
        '..kwyyyyyyyyyxffk',
        '.kyyykwyyykwyyxff',
        '.kyyykkkyykkkyxff',
        '.kyyyyyyyyyyyyffk',
        '.kyyyyyrrryyyyffk', // 弱点の赤い光
        '..kyyyyrrrryyyffk',
        '...kyyyyyyyxffk.',
        '..kyyyyyyyyyxffk',
        '.kyyy..yyyy..yfk',
        '.kyy....yy....yk',
        '..k......k....k.',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 11. 宝箱 (金具と木目のSFCデザイン) =================
  'chest': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '..kkkkkkkkkkkk..',
        '.kyy11111111yyk.',
        'ky11xxxxxxxx11yk',
        'ky1xkkkkkkkkx1yk',
        'ky1xkwgbbgwkx1yk', // 金具ロック
        'ky1xkgwwbbgkx1yk',
        'ky1xkwgbbgwkx1yk',
        'kkkkkkkkkkkkkkkk',
        'kNNNNNNNNNNNNNNk', // 木材の木目
        'kNOOOOOOOOOOOONk',
        'kNOsPkkwwkkPsONk',
        'kNOskkwwbbkkssNk',
        'kNOsPkkwwkkPsONk',
        'kNNnnnnnnnnnnNNk',
        'kjjjjjjjjjjjjjjk',
        '.kkkkkkkkkkkkkk.'
      ]
    ]
  },

  // ================= 12. ポータル =================
  'portal': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kkQQQQkk....',
        '..kQQwyyyywQQk..',
        '.kQwyyxxxxxywQk.',
        'kQyyxxQQQQxxxyQk',
        'kQyxQQuuuuQQxyQk',
        'kQuuqqqqqqquuQk.',
        'kQuqqEFEFEqquQk.',
        'kQuqqFEGEFqquQk.',
        'kQuuqqqqqqquuQk.',
        'kQyxQQuuuuQQxyQk',
        'kQyyxxQQQQxxxyQk',
        '.kQwyyxxxxxywQk.',
        '..kQQwyyyywQQk..',
        '....kkQQQQkk....',
        '................',
        '................'
      ]
    ]
  },

  // ================= 13. ファイアボール =================
  'fireball': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....khhhhk......',
        '...khrryyrhk....',
        '..khrywwyyrhk...',
        '.khrywwwwyyrhk..',
        '.khrywwwwyyrhk..',
        '..khrywwyyrhk...',
        '...khrryyrhk....',
        '....kcccck......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 14. 弓矢 =================
  'arrow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '......kwk.......',
        '.....kwgwk......',
        '....kgbaak......',
        '......kOk.......',
        '......kOk.......',
        '......kPk.......',
        '.....kLrrk......',
        '....kLwwwrk.....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 15. 剣ビーム =================
  'beam': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '......kwk.......',
        '....kwwEwwk.....',
        '...kwEFEFEwk....',
        '..kEFEFGFEFEk...',
        '..kEFEFGFEFEk...',
        '...kwEFEFEwk....',
        '....kwwEwwk.....',
        '......kwk.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 16. アグニムの魔法弾 =================
  'magic-ball': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kQQQQk......',
        '...kQuuuuqk.....',
        '..kQuwEwwuqk....',
        '.kQuwEEwwuuqk...',
        '.kQuwEEwwuuqk...',
        '..kQuwEwwuqk....',
        '...kQuuuuqk.....',
        '....kqqqqk......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 17. 跳ね返された黄金魔法弾 =================
  'magic-ball-reflected': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kyyyyk......',
        '...ky1111fk.....',
        '..ky1wEEw1fk....',
        '.ky1wEEEEw11fk..',
        '.ky1wEEEEw11fk..',
        '..ky1wEEw1fk....',
        '...ky1111fk.....',
        '....kffffk......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 18. 岩石弾 =================
  'rock-proj': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kNNNNk......',
        '...kNOOOOPk.....',
        '..kNOkkOOPk.....',
        '.kNOkkkkOOPk....',
        '.kNOkkkkOOPk....',
        '..kNOkkOOPk.....',
        '...kNOOOOPk.....',
        '....kPPPPk......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 19. ドロップアイテム =================
  'drop-heart': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '..khhr....rrhk..',
        '.khwwrr..rrwwhk.',
        'khwwrrr..rrwwrhk',
        'khrrrrrrrrrrrchk',
        'khrccccccccccchk',
        '.krcccccccccck..',
        '..krcccccccck...',
        '...krcccccck....',
        '....krcccck.....',
        '.....krcck......',
        '......kck.......',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },
  'drop-magic': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '.....kbbk.......',
        '....kgwwgk......',
        '...kgLLLLgk.....',
        '..kgLLeeLLgk....',
        '.kgLeeeedeeegk..',
        '.kgdeeeeedeedgk.',
        '.kgddeeedddzdgk.',
        '..kgdddddddGk...',
        '...kgddddGk.....',
        '.....kGGk.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },
  'drop-arrow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....kggggk......',
        '...kgbbbbgk.....',
        '..kgbamabgk.....',
        '..knnnmnnnnk....',
        '..keee.eeek.....',
        '..kwww.wwwk.....',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // ================= 20. マップタイル (SFC神トラ風リッチグラフィック) =================
  // (A) 光の世界 草原床 (自然な木漏れ日と草の揺らぎ)
  'tile-grass-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        'eeee8eeeeeeSeeee',
        'eee88eLeeeSSdeee',
        'eeee8eeeeSSddeee',
        'eSeeeeeeeeSdeeee',
        'eSdeee88eeeeee8e',
        'eSdeee8Leeeee88e',
        'eedeeeeeeeeeee8e',
        'eeeeeeSeeeeee8ee',
        'ee8eeSSdeeeeeeee',
        'e88eeSddeeeeSeee',
        'eeeeeeSdeeeSSeee',
        'eeeeeeedeeeSdeee',
        'eSeeeeeeeeeedeee',
        'eSdeee8eeeeeeeee',
        'eedee88eeee88eee',
        'eeeeee8eeee8Leee'
      ]
    ]
  },

  // (B) 闇の世界 荒野床
  'tile-grass-dark': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        'uuQu0uuuuQu0uuuu',
        'uQu0quuuuQ0quuuu',
        'uqAuu0uuquAuu0uu',
        'uu0uuQu0u0uuQu0u',
        'uuQu0Qq9uQu0Qq9u',
        'uuqAuquu0uqAuquu',
        'uuQu0uuuuQu0uuuu',
        'uQu0quuuuQ0quuuu',
        'uqAuu0uuquAuu0uu',
        'uu0uuQu0u0uuQu0u',
        'uuQu0Qq9uQu0Qq9u',
        'uuqAuquu0uqAuquu',
        'uuQu0uuuuQu0uuuu',
        'uQu0quuuuQ0quuuu',
        'uqAuu0uuquAuu0uu',
        'uu0uuQu0u0uuQu0u'
      ]
    ]
  },

  // (C) 光の世界 豊かな木立ち・生け垣の壁 (SFC神トラ風)
  'tile-wall-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '...kLL88LLk.....',
        '..kL88eeee88k...',
        '.k88eeeeeSS88k..',
        'k8eeeeSSSSSS8ek.',
        'keeSSSSddSSSeee.',
        'keeSSddddddSeee.',
        'keSSddTTTTddSee.',
        'kdSddTzzzzTTdSek',
        'kdSddTzkkzzTdSek',
        'keSSddTTTTddSeek',
        'keeSSSddddddSeee',
        '..kOnnTTTTnnOk..',
        '..kOOnkkkkOnOk..',
        '..kOnnkkkkOnnk..',
        '.kzzkkzzzzkkzzk.',
        'kkkkkkkkkkkkkkkk'
      ]
    ]
  },

  // (D) 闇の世界 暗紫レンガ壁
  'tile-wall-dark': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        'kkkkkkkkkkkkkkkk',
        'kQQQuuuuuuuuQQQk',
        'kQuuuuuuuuuuuuQk',
        'kuuuuqqqqqquuuuk',
        'kuqq00000000qquk',
        'kq00k0000k0000qk',
        'k000k0000k00000k',
        'kkkkkkkkkkkkkkkk',
        'kQQQuuuuuuuuQQQk',
        'kQuuuuuuuuuuuuQk',
        'kuuuuqqqqqquuuuk',
        'kuqq00000000qquk',
        'kq00k0000k0000qk',
        'k000k0000k00000k',
        'kKKKKKKKKKKKKKKk',
        'kkkkkkkkkkkkkkkk'
      ]
    ]
  },

  // (E) 水面 (光の世界 - 美しいクリスタルブルーのきらめき)
  'tile-water-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        'FFFFFFFFFFFFFFFF',
        'FFwwwwFFFFwwwwFF',
        'FwEEEEwFFwEEEEwF',
        'FEFFFFEFEFFFFEFF',
        'FFFFFFFFFFFFFFFF',
        'FFGGGGFFFFGGGGFF',
        'FGGvvGGFGGvvGGF.',
        'FGvvvvGFGvvvvGF.',
        'FFFFFFFFFFFFFFFF',
        'FFFFwwwwFFFFwwww',
        'FFFwEEEEwFFwEEEE',
        'FFFEFFFFEFEFFFFE',
        'FFFFFFFFFFFFFFFF',
        'FFFFGGGGFFFFGGGG',
        'FFGGvvGGFGGvvGGF',
        'FFGvvvvGFGvvvvGF'
      ]
    ]
  },

  // (F) 水面 (闇の世界)
  'tile-water-dark': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        'tttttttttttttttt',
        'twwwwwwwwwwwwwwt',
        'twwvvvvvvvvvvwwt',
        'twvvvvvvvvvvvvwt',
        'vvvvvvwwvvvvvvvv',
        'vvvvvvwwvvvvvvvv',
        'vwvvvvVVvvvvVVwv',
        'vwwvvvVVvvvVVwwv',
        'vvvvVVVVVVVVvvvv',
        'twwwwwwwwwwwwwwt',
        'twwvvvvvvvvvvwwt',
        'twvvvvvvvvvvvvwt',
        'vvvvvvwwvvvvvvvv',
        'vvvvvvwwvvvvvvvv',
        'vwvvvvVVvvvvVVwv',
        'vwwvvvVVvvvVVwwv'
      ]
    ]
  },

  // (G) ダンジョン床・壁
  'tile-floor-desert': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      'iiiiiiiiiiiiiiii',
      'iiUiiiiiiiiiiUii',
      'iiiiiiiiiiiiiiii',
      'iiiiiiiiWiiiiiii',
      'iiiiiiiiiiiiiiii',
      'iiUiiiiiiiiiiUii',
      'iiiiiiiiiiiiiiii',
      'iiiiiiiiWiiiiiii',
      'iiiiiiiiiiiiiiii',
      'iiUiiiiiiiiiiUii',
      'iiiiiiiiiiiiiiii',
      'iiiiiiiiWiiiiiii',
      'iiiiiiiiiiiiiiii',
      'iiUiiiiiiiiiiUii',
      'iiiiiiiiiiiiiiii',
      'iiiiiiiiWiiiiiii'
    ]]
  },
  'tile-wall-desert': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      'kkkkkkkkkkkkkkkk',
      'kZZiiiiiiiiiiZZk',
      'kZiiUUUUUUUUiiZk',
      'kiUUWWWWWWWWUUik',
      'kUWWXXXXkXXXXWWk',
      'kWWXXXXkXXXXXXWk',
      'kXXXXkkXXXXkkXXk',
      'kkkkkkkkkkkkkkkk',
      'kZZiiiiiiiiiiZZk',
      'kZiiUUUUUUUUiiZk',
      'kiUUWWWWWWWWUUik',
      'kUWWXXXXkXXXXWWk',
      'kWWXXXXkXXXXXXWk',
      'kXXXXkkXXXXkkXXk',
      'kjkkjjjjjjjjkkjk',
      'kkkkkkkkkkkkkkkk'
    ]]
  },
  'tile-floor-darktemple': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'tile-wall-darktemple': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      'kkkkkkkkkkkkkkkk',
      'kEEvvvvvvvvvvEEk',
      'kEvvvvvvvvvvvvEk',
      'kvvvvVVVVVVvvvvk',
      'kvvVVtttktttVVvk',
      'kvVVtttkttttttVk',
      'kVTtkktkktkkkTVk',
      'kkkkkkkkkkkkkkkk',
      'kEEvvvvvvvvvvEEk',
      'kEvvvvvvvvvvvvEk',
      'kvvvvVVVVVVvvvvk',
      'kvvVVtttktttVVvk',
      'kvVVtttkttttttVk',
      'kVTtkktkktkkkTVk',
      'kKKKKKKKKKKKKKKk',
      'kkkkkkkkkkkkkkkk'
    ]]
  },
  'tile-floor-pyramid': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'tile-wall-pyramid': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      'kkkkkkkkkkkkkkkk',
      'kKRRRRRRRRRRRRKk',
      'kRYYYYYYYYYYYYRK',
      'kRYYCCYYCCYYCCRK',
      'kRYYCCYYCCYYCCRK',
      'kRYYYYYYYYYYYYRK',
      'kKRRRRRRRRRRRRKk',
      'kkkkkkkkkkkkkkkk',
      'kKRRRRRRRRRRRRKk',
      'kRYYYYYYYYYYYYRK',
      'kRYYCCYYCCYYCCRK',
      'kRYYCCYYCCYYCCRK',
      'kRYYYYYYYYYYYYRK',
      'kKRRRRRRRRRRRRKk',
      'kKKKKKKKKKKKKKKk',
      'kkkkkkkkkkkkkkkk'
    ]]
  },
  'tile-lava': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'tile-entrance': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },

  // ================= 21. 単体装備アイテムアイコン (UI用) =================
  'item-sword-normal': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      '............kwk.',
      '...........kgwk.',
      '..........kgbawk',
      '.........kgbaawk',
      '........kgbaak..',
      '.......kgbaak...',
      '......kgbaak....',
      '.....kgbaak.....',
      '....kgbaak......',
      '...kyxfk........',
      '..kyxfk.........',
      '.kyxfk..........',
      'nknk............',
      'k...............',
      '................',
      '................'
    ]]
  },
  'item-sword-master': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      '............kwk.',
      '...........kEwk.',
      '..........kEFGwk',
      '.........kEFGGwk',
      '........kEFGGk..',
      '.......kEFGGk...',
      '......kEFGGk....',
      '.....kEFGGk.....',
      '....kEFGGk......',
      '...kQukk........',
      '..kQukk.........',
      '.kyxfk..........',
      'nknk............',
      'k...............',
      '................',
      '................'
    ]]
  },
  'item-firerod': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      '........khhrk...',
      '.......khwwrrk..',
      '......khwyyrrk..',
      '.......khcrk....',
      '........kyk.....',
      '.......kyxfk....',
      '......kyxfk.....',
      '.....kyxfk......',
      '....kyxfk.......',
      '...kyxfk........',
      '..kyxfk.........',
      '.kyxfk..........',
      '................',
      '................',
      '................',
      '................'
    ]]
  },
  'item-bow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      '......kHok......',
      '....kHok..kssk..',
      '...kHok.....ksk.',
      '..kok..kwk...kPk',
      '.kok..kwgwk...kP',
      'kok..kwgbak...kP',
      'kok...kwk.....kP',
      'kok...kwk.....kP',
      '.kok..kwk....kPk',
      '..kok.kwk...kPk.',
      '...kHokwk.kssk..',
      '....kHossksk....',
      '......kHok......',
      '................',
      '................',
      '................'
    ]]
  },
  'item-mirror': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
      '.....kyyyyyk....',
      '...kyyxxxxxyyk..',
      '..kyxxwwwwwxxyk.',
      '.kyxwwEGwGEwwxyk',
      '.kyxwEGGwGGEewxy',
      '.kyxwEGGwGGEewxy',
      '.kyxwwEGwGEwwxyk',
      '..kyxxwwwwwxxyk.',
      '...kyyxxxxxyyk..',
      '.....kyxfk......',
      '.....kyxfk......',
      '.....kyxfk......',
      '.....kyxfk......',
      '......kkk.......',
      '................',
      '................'
    ]]
  },

  // ================= 22. 斬撃エフェクト =================
  'slash-effect': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      // 0: 横
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
      // 1: 縦
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
    ]
  }
};

/**
 * Phaser Sceneに対してテクスチャを一括登録し、
 * 各スプライトシートのフレームを手動で正確にスライス登録するビルダー関数
 * （※これにより複数フレームが横並びで表示されるバグを完全解消！）
 */
export function buildAllTextures(scene) {
  Object.keys(TEXTURES).forEach(key => {
    if (scene.textures.exists(key)) return;

    const data = TEXTURES[key];
    const { width, height, frames, scale } = data;
    const canvas = document.createElement('canvas');
    canvas.width = width * frames.length * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    frames.forEach((matrix, fIdx) => {
      const offsetX = fIdx * width * scale;
      for (let y = 0; y < matrix.length; y++) {
        const row = matrix[y];
        for (let x = 0; x < row.length; x++) {
          const char = row[x];
          const color = PALETTE[char] || 'transparent';
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
          }
        }
      }
    });

    // 1. Canvasをテクスチャとして登録
    scene.textures.addCanvas(key, canvas);

    // 2. フレームごとに正確にスライス登録（これが抜けていたのが6人バグの原因！）
    const texture = scene.textures.get(key);
    const frameWidth = width * scale;
    const frameHeight = height * scale;
    frames.forEach((_, fIdx) => {
      texture.add(fIdx, 0, fIdx * frameWidth, 0, frameWidth, frameHeight);
    });
  });
}
