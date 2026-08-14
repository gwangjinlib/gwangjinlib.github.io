export type WeaponType = 'normal' | '3way' | 'laser';

export type ItemType = '3way' | 'laser' | 'nuke' | 'shield' | 'coin';

export type ObstacleType = 'rect' | 'triangle' | 'star' | 'asteroid' | 'mine' | 'orb';

export type SkillKey = 'Q' | 'C' | 'E' | 'X';

export interface CharacterSkill {
  key: SkillKey;
  name: string;
  description: string;
  icon: string;
  badge: string;
}

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  price: number;
  bodyColor: string;
  accentColor: string;
  glowColor: string;
  rarity: '일반' | '희귀' | '영웅' | '전설' | '신화';
  skills: {
    Q: CharacterSkill;
    C: CharacterSkill;
    E: CharacterSkill;
    X: CharacterSkill;
  };
}

export interface WeaponSkin {
  id: string;
  name: string;
  description: string;
  price: number;
  barrelColor: string;
  secondaryColor: string;
  glowColor: string;
  bulletColor: string;
  laserColor: string;
  rarity: '일반' | '희귀' | '영웅' | '전설' | '신화';
  theme: 'tactical' | 'prime' | 'glitch' | 'dragon' | 'protocol' | 'ion' | 'rebirth' | 'kuronami' | 'neochronos' | 'spiral_phantom';
  badgeText: string;
}

export interface ShopData {
  coins: number;
  ownedCharacters: string[];
  equippedCharacter: string;
  ownedWeapons: string[];
  equippedWeapon: string;
}

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'char_default',
    name: '클래식 시안 탱크',
    description: '신속하고 안정적인 표준 전략 요새',
    price: 0,
    bodyColor: '#06b6d4',
    accentColor: '#38bdf8',
    glowColor: '#06b6d4',
    rarity: '일반',
    skills: {
      Q: { key: 'Q', name: '대공 유도 미사일', description: '추적 미사일 3발을 발사하여 인근 운석 3개를 즉시 타격', icon: '🚀', badge: '추적' },
      C: { key: 'C', name: '나노 프로텍터', description: '4초간 상시 완전 무적 나노 에너지 실드 전개', icon: '🛡️', badge: '무적' },
      E: { key: 'E', name: '탄환 폭풍 격발', description: '360도 전방위로 24발의 고속 탄환 동시 사격', icon: '💥', badge: '전방위' },
      X: { key: 'X', name: '전술 핵폭격 [ULT]', description: '화면 전체 장애물 전멸 + 수라의 대폭발 충격파', icon: '☢️', badge: '전멸' },
    },
  },
  {
    id: 'char_crimson',
    name: '크림슨 버서커',
    description: '강렬한 붉은 화염 기운을 품은 마그마 요새',
    price: 1500,
    bodyColor: '#ef4444',
    accentColor: '#f87171',
    glowColor: '#ef4444',
    rarity: '희귀',
    skills: {
      Q: { key: 'Q', name: '인페르노 사격', description: '전방을 관통하는 3연사 화염 빔 사격', icon: '🔥', badge: '관통' },
      C: { key: 'C', name: '화염의 복구', description: '버서커의 긴급 마그마 기운으로 생명력 +1 즉시 회복', icon: '❤️', badge: '회복' },
      E: { key: 'E', name: '마그마 대돌진', description: '전방으로 순간 돌진하며 맞닥뜨린 운석 사멸 및 폭발', icon: '⚡', badge: '돌진' },
      X: { key: 'X', name: '마그마 카타클리즘 [ULT]', description: '화면 전체에 마그마 해일을 폭발시켜 지속 소멸', icon: '🌋', badge: '카타클리즘' },
    },
  },
  {
    id: 'char_emerald',
    name: '에메랄드 가디언',
    description: '녹빛 시공간 장막과 인력 드론을 품은 방어 요새',
    price: 3500,
    bodyColor: '#10b981',
    accentColor: '#34d399',
    glowColor: '#10b981',
    rarity: '희귀',
    skills: {
      Q: { key: 'Q', name: '크로노 둔화', description: '6초간 화면의 모든 운석 이동 속도를 75% 감소', icon: '⏳', badge: '감속' },
      C: { key: 'C', name: '자력 코인 인력', description: '화면의 모든 코인과 아이템을 탱크로 즉시 흡수', icon: '🧲', badge: '자석' },
      E: { key: 'E', name: '에메랄드 장벽', description: '탱크 앞쪽에 운석을 차단하는 에너에 포스 월 생성 (5초)', icon: '🧱', badge: '장벽' },
      X: { key: 'X', name: '이지스 펄스 [ULT]', description: '8초간 무적 + 사방으로 지속 연쇄 방어 파동 분출', icon: '💎', badge: '방어파동' },
    },
  },
  {
    id: 'char_gold',
    name: '골든 메카 킹',
    description: '찬란한 황금빛 연금술 오라의 왕실 황금 장갑차',
    price: 8000,
    bodyColor: '#eab308',
    accentColor: '#fde047',
    glowColor: '#eab308',
    rarity: '영웅',
    skills: {
      Q: { key: 'Q', name: '마이더스 연금술', description: '화면 내 모든 일반 운석을 황금 코인으로 즉시 변환', icon: '🪙', badge: '연금' },
      C: { key: 'C', name: '골든 포스 캐논', description: '극대 굵기의 황금 빛 레이저포 발사', icon: '✨', badge: '거대레이저' },
      E: { key: 'E', name: '더블 오버클럭', description: '8초간 획득 점수 2.5배 증가 및 초고속 자동 연사', icon: '⚡', badge: '부스트' },
      X: { key: 'X', name: '임페리얼 궤도 포격 [ULT]', description: '우주 위성에서 황금 궤도 레이저 포격을 5초간 연쇄 투하', icon: '🛰️', badge: '궤도폭격' },
    },
  },
  {
    id: 'char_cyber',
    name: '사이버 펑크 네온',
    description: '미래도시의 고주파 네온 글리치 에너지를 자유자재로 다루는 기체',
    price: 18000,
    bodyColor: '#a855f7',
    accentColor: '#f43f5e',
    glowColor: '#ec4899',
    rarity: '전설',
    skills: {
      Q: { key: 'Q', name: '글리치 EMP', description: '모든 장애물 5초간 이동 및 사격 완전 정지', icon: '👾', badge: '정지' },
      C: { key: 'C', name: '네온 잔상 유인', description: '분신을 생성해 운석을 유인한 뒤 연쇄 대폭발', icon: '👤', badge: '유인폭파' },
      E: { key: 'E', name: '사이버 크로스 참격', description: '화면 전체를 가르는 X자 네온 칼날 분쇄', icon: '⚔️', badge: '참격' },
      X: { key: 'X', name: '둠스데이 둠 레이저 [ULT]', description: '화면 전체를 휩쓰는 고주파 무지개 네온 데스 레이저', icon: '🌈', badge: '둠스데이' },
    },
  },
  {
    id: 'char_kuronami',
    name: '쿠로나미 쉐도우',
    description: '심해의 수류 소용돌이와 그림자 수신 분신을 다루는 요새',
    price: 35000,
    bodyColor: '#38bdf8',
    accentColor: '#60a5fa',
    glowColor: '#38bdf8',
    rarity: '전설',
    skills: {
      Q: { key: 'Q', name: '수류 연참격', description: '교차하는 고속 수류 참격 4발 방출', icon: '🌊', badge: '수류참' },
      C: { key: 'C', name: '해일 인비저블', description: '4초간 물길 장막 생성, 부딪히는 운석 물방울 분쇄', icon: '💧', badge: '해일실드' },
      E: { key: 'E', name: '그림자 수신 분신', description: '7초간 본체 곁에서 동시에 무기를 사격하는 그림자 분신 소환', icon: '👥', badge: '분신' },
      X: { key: 'X', name: '쿠로나미 대소용돌이 [ULT]', description: '중앙에 수류 대소용돌이를 발생시켜 운석을 흡입 후 폭발', icon: '🌀', badge: '대소용돌이' },
    },
  },
  {
    id: 'char_singularity',
    name: '보이드 아스트랄',
    description: '시공간 블랙홀과 차원 입수를 지배하는 암흑 메카 요새',
    price: 60000,
    bodyColor: '#8b5cf6',
    accentColor: '#c084fc',
    glowColor: '#a855f7',
    rarity: '신화',
    skills: {
      Q: { key: 'Q', name: '중력 역전 밀치기', description: '화면 내 모든 운석의 중력을 역전시켜 위로 밀어냄', icon: '⬆️', badge: '중력역전' },
      C: { key: 'C', name: '차원 입수', description: '3.5초간 보이드 차원에 입장하여 완벽 무적 상태 전환', icon: '🌌', badge: '차원입수' },
      E: { key: 'E', name: '암흑 포식 구체', description: '느리게 전진하며 경로 상의 모든 운석을 집어삼키는 암흑 구체', icon: '🔮', badge: '보이드구체' },
      X: { key: 'X', name: '초신성 블랙홀 [ULT]', description: '화면 중앙에 은하수 블랙홀을 생성해 전 운석 흡수 대소멸', icon: '🪐', badge: '블랙홀' },
    },
  },
  {
    id: 'char_valkyrie',
    name: '스타버스트 발키리',
    description: '천상의 유성우와 신성 유도 미사일을 강림시키는 전설적 여신 요새',
    price: 100000,
    bodyColor: '#f43f5e',
    accentColor: '#fb7185',
    glowColor: '#f43f5e',
    rarity: '신화',
    skills: {
      Q: { key: 'Q', name: '성운 초추적 미사일', description: '유도 성운 탄환 8발이 화면 상의 모든 목표 추적 분쇄', icon: '✨', badge: '초추적' },
      C: { key: 'C', name: '천상의 은총', description: '체력 +1 즉시 회복 및 3초간 영원의 천상 실드 부여', icon: '👼', badge: '회복&실드' },
      E: { key: 'E', name: '발키리 스타 노바', description: '사방으로 별빛 샤워 탄환 32발 격발', icon: '⭐', badge: '별빛탄환' },
      X: { key: 'X', name: '천상 유성우 제례 [ULT]', description: '하늘에서 신성 유성우 40개가 연달아 쏟아지며 전체 섬멸', icon: '☄️', badge: '유성우' },
    },
  },
];

export const WEAPON_SKINS: WeaponSkin[] = [
  {
    id: 'wp_spiral_phantom',
    name: '나선 팬텀 (Mystic Spiral Dragon)',
    description: '청록빛 나선 에너지와 비룡의 영혼이 깃든 팬텀. 운석 격추 시 하늘을 날아오르는 신화급 승천 비룡 피니셔 강림! (값어치 0코인 특전)',
    price: 0,
    barrelColor: '#09131f',
    secondaryColor: '#0891b2',
    glowColor: '#22d3ee',
    bulletColor: '#67e8f9',
    laserColor: '#06b6d4',
    rarity: '신화',
    theme: 'spiral_phantom',
    badgeText: 'SPIRAL DRAGON',
  },
  {
    id: 'wp_default',
    name: '스펙터 택티컬 V1',
    description: '기본 매트 블랙 도트사이트와 스텔스 소음기가 장착된 택티컬 바주카',
    price: 0,
    barrelColor: '#1e293b',
    secondaryColor: '#334155',
    glowColor: '#38bdf8',
    bulletColor: '#38bdf8',
    laserColor: '#06b6d4',
    rarity: '일반',
    theme: 'tactical',
    badgeText: 'TACTICAL',
  },
  {
    id: 'wp_ghost',
    name: '고스트 스텔스 오버로드',
    description: '저반사 매트 그레이 서프레서와 소음 제어형 서브소닉 포신',
    price: 6000,
    barrelColor: '#334155',
    secondaryColor: '#475569',
    glowColor: '#a1a1aa',
    bulletColor: '#cbd5e1',
    laserColor: '#94a3b8',
    rarity: '일반',
    theme: 'tactical',
    badgeText: 'STEALTH',
  },
  {
    id: 'wp_plasma',
    name: '프라임 프리즈마 포스 2.0',
    description: '황금빛 각진 기하학 릴리프 장갑과 고순도 크리스탈 제네레이터',
    price: 8500,
    barrelColor: '#f8fafc',
    secondaryColor: '#e2e8f0',
    glowColor: '#fbbf24',
    bulletColor: '#38bdf8',
    laserColor: '#60a5fa',
    rarity: '희귀',
    theme: 'prime',
    badgeText: 'PRIME LUXURY',
  },
  {
    id: 'wp_ion',
    name: '아이온 블레이드 하이퍼캐논',
    description: '유선형 에어로다이내믹 블레이드 구조와 푸른 고전압 플라즈마 코어',
    price: 12000,
    barrelColor: '#0284c7',
    secondaryColor: '#38bdf8',
    glowColor: '#38bdf8',
    bulletColor: '#7dd3fc',
    laserColor: '#0284c7',
    rarity: '희귀',
    theme: 'ion',
    badgeText: 'ION SCI-FI',
  },
  {
    id: 'wp_redline',
    name: '글리치팝 하이퍼 스펙트럼',
    description: 'AR 홀로그램 스코프와 스트리밍 RGB 네온 에너지 와이어',
    price: 16000,
    barrelColor: '#0f172a',
    secondaryColor: '#ec4899',
    glowColor: '#22d3ee',
    bulletColor: '#f43f5e',
    laserColor: '#ec4899',
    rarity: '희귀',
    theme: 'glitch',
    badgeText: 'GLITCHPOP',
  },
  {
    id: 'wp_gold',
    name: '엘더드래곤 마그마 오버로드',
    description: '용의 머리 뿔 장식 머즐 브레이크와 불타는 아스날 마그마 코어',
    price: 22000,
    barrelColor: '#1c1917',
    secondaryColor: '#ca8a04',
    glowColor: '#f59e0b',
    bulletColor: '#fbbf24',
    laserColor: '#f97316',
    rarity: '영웅',
    theme: 'dragon',
    badgeText: 'ELDER FLAME',
  },
  {
    id: 'wp_rebirth',
    name: '리버 가디언 소울파이어',
    description: '영혼의 칠흑 사슬과 청록빛 저승 화염이 타오르는 구천의 유물 포신',
    price: 30000,
    barrelColor: '#022c22',
    secondaryColor: '#0d9488',
    glowColor: '#2dd4bf',
    bulletColor: '#5eead4',
    laserColor: '#14b8a6',
    rarity: '영웅',
    theme: 'rebirth',
    badgeText: 'SOUL REAVER',
  },
  {
    id: 'wp_void',
    name: '프로토콜 아비살 오메가 V3',
    description: '부유하는 차원 균열 아비살 링과 암흑물질 파괴 광선 발사기',
    price: 42000,
    barrelColor: '#090d16',
    secondaryColor: '#581c87',
    glowColor: '#a855f7',
    bulletColor: '#c084fc',
    laserColor: '#e879f9',
    rarity: '전설',
    theme: 'protocol',
    badgeText: 'PROTOCOL A.I.',
  },
  {
    id: 'wp_kuronami',
    name: '쿠로나미 수신(水神) 해일 캐논',
    description: '칠흑 도검 나선 포신과 거대한 수류 회전 에너지를 응축한 전설의 명작',
    price: 60000,
    barrelColor: '#0b1329',
    secondaryColor: '#1e3a8a',
    glowColor: '#38bdf8',
    bulletColor: '#bfdbfe',
    laserColor: '#0284c7',
    rarity: '전설',
    theme: 'kuronami',
    badgeText: 'KURONAMI',
  },
  {
    id: 'wp_singularity',
    name: '싱귤래리티 보이드 이터널',
    description: '은하수 블랙홀을 가두어 모든 시공간을 왜곡하는 신화급 초신성 중력포',
    price: 100000,
    barrelColor: '#05030a',
    secondaryColor: '#4c1d95',
    glowColor: '#c084fc',
    bulletColor: '#f472b6',
    laserColor: '#a855f7',
    rarity: '신화',
    theme: 'neochronos',
    badgeText: 'SINGULARITY',
  },
];

export interface Player {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  weapon: WeaponType;
  weaponTimer: number; // frames remaining
  maxWeaponTimer: number;
  shield: boolean;
  shieldTimer: number; // frames remaining
  maxShieldTimer: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width?: number;
  height?: number;
  type: 'rocket' | 'laser';
  life?: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: ObstacleType;
  color: string;
  angle: number;
  rotSpeed: number;
  hp: number;
  maxHp: number;
  vertices?: number[]; // offsets for polygon
  swayAmp?: number;
  swayPhase?: number;
  swaySpeed?: number;
}

export interface Item {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  label: string;
  color: string;
  speed: number;
  size: number;
  pulse: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'square' | 'ring' | 'star' | 'slash' | 'diamond';
  size?: number;
  rotation?: number;
  vRot?: number;
  ringRadius?: number;
  ringExpand?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  weaponUsed: string;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  currentAmmo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  gameTime: number;
  weapon: WeaponType;
  weaponTimeLeft: number; // seconds
  hasShield: boolean;
  shieldTimeLeft: number; // seconds
  combo: number;
  maxCombo: number;
  destroyedCount: number;
  coinsCollected: number;
  totalCoins: number;
  usedSkills: {
    Q: boolean;
    C: boolean;
    E: boolean;
    X: boolean;
  };
  equippedCharSkin?: CharacterSkin;
}
