import { PALETTE } from './palette.js';

/**
 * ゼルダの伝説 神々のトライフォース風 ドット絵テクスチャ定義
 */
export const TEXTURES = {
  // 1. プレイヤー：れに（キジトラ猫） 歩行シート
  'reni-walk': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 2. アイテム掲げポーズ
  'reni-hold': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '..ke....ek......',
        '..k5w..w5k......',
        '...koHHok.......',
        '...ko66ok.......',
        '..koo66ook......',
        '..kowkkwok......',
        '..ksoPPosk......',
        '...ksIIsk.......',
        '....kLLk........',
        '...keddek.......',
        '..keeeeeek......',
        '..kBBxxBBk......',
        '..k7ssss7k......',
        '...kakkak.......',
        '................',
        '................'
      ]
    ]
  },

  // 3. ピンクウサギ（ムーンパール未所持時の闇の世界姿）
  'reni-bunny': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 4. 刈れる草（神トラのブッシュ）
  'cut-bush': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....LLeeeeLL....',
        '...LedddeeedL...',
        '..eeddddddddee..',
        '..edddTTddddde..',
        '.LddTTTTTTdddL..',
        '.edTTTTTTTTdde.',
        '.edTTddddTTdde.',
        'edTddzkkzddTde',
        'edTddkzzkddTde',
        '.edTTddddTTdde.',
        '.edTTTTTTTTdde.',
        '.LddTTTTTTdddL..',
        '..edddTTddddde..',
        '..eeddddddddee..',
        '...LedddeeedL...',
        '....LLeeeeLL....'
      ]
    ]
  },

  // 5. 回転斬りリング（Spin Attack）
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

  // 6. オクタロック
  'enemy-octorok': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 7. 司祭アグニム (Agahnim)
  'boss-agahnim': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 8. 大魔王ガノン (Ganon)
  'boss-ganon': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 9. デグサード（Lanmola）
  'boss-lanmola': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 10. デグテール（Moldorm）
  'boss-moldorm': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 11. 宝箱
  'chest': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 12. ポータル
  'portal': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 13. ファイアボール
  'fireball': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 14. 弓矢
  'arrow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 15. 剣ビーム
  'beam': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 16. アグニムの魔法弾
  'magic-ball': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 17. 跳ね返された黄金の魔法弾 (神トラ打ち返し)
  'magic-ball-reflected': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
      [
        '....yyyy....',
        '...y1111f...',
        '..y1wEEw1f..',
        '.y1wEEEEw11f.',
        '.y1wEEEEw11f.',
        '..y1wEEw1f..',
        '...y1111f...',
        '....ffff....',
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

  // 18. 岩石弾（オクタロック/ランモラ用）
  'rock-proj': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 19. ドロップ：ハート
  'drop-heart': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 20. ドロップ：魔力ツボ
  'drop-magic': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 21. ドロップ：矢
  'drop-arrow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
        '................'
      ]
    ]
  },

  // 22. タイル：草地 (光)
  'tile-grass-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 23. タイル：草地 (闇)
  'tile-grass-dark': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 24. タイル：壁 (光)
  'tile-wall-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 25. タイル：壁 (闇)
  'tile-wall-dark': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 26. タイル：水面 (光)
  'tile-water-light': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [
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
    ]
  },

  // 27. タイル：水面 (闇)
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
    ]
  },

  // 28. ダンジョン床・壁
  'tile-floor-desert': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'tile-wall-desert': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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

  // 29. アイテムアイコン
  'item-sword-normal': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'item-sword-master': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'item-firerod': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'item-bow': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },
  'item-mirror': {
    width: 16,
    height: 16,
    scale: 2,
    frames: [[
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
    ]]
  },

  // 30. 斬撃エフェクト
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
 * Phaser Sceneに対してテクスチャを一括登録するビルダー関数
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

    scene.textures.addCanvas(key, canvas);
  });
}
