import React, { useEffect, useRef } from 'react';
import {
  Player,
  Bullet,
  Obstacle,
  Item,
  ItemType,
  Particle,
  FloatingText,
  GameStats,
  WeaponType,
  ObstacleType,
  CHARACTER_SKINS,
  WEAPON_SKINS,
} from '../types';
import { soundEngine } from '../utils/audio';
import { getShopData, addCoins } from '../utils/storage';

interface GameCanvasProps {
  isPaused: boolean;
  gameMode?: 'pc' | 'mobile';
  onUpdateStats: (stats: GameStats) => void;
  onGameOver: (finalScore: number, maxCombo: number, destroyedCount: number, weapon: WeaponType) => void;
  keysRef: React.MutableRefObject<{
    a: boolean;
    d: boolean;
    space: boolean;
    r: boolean;
  }>;
  triggerShootRef: React.MutableRefObject<boolean>;
  triggerReloadRef: React.MutableRefObject<boolean>;
  triggerSkillRef: React.MutableRefObject<{ Q: boolean; C: boolean; E: boolean; X: boolean }>;
}

export interface KillBanner {
  id: number;
  x: number;
  y: number;
  combo: number;
  title: string;
  subTitle: string;
  color: string;
  glowColor: string;
  alpha: number;
  scale: number;
  maxAge: number;
  age: number;
}

export interface DragonFinisher {
  id: number;
  startX: number;
  startY: number;
  headX: number;
  headY: number;
  headAngle: number;
  progress: number;
  maxFrames: number;
  segments: { x: number; y: number; angle: number; size: number }[];
  wingPhase: number;
  color: string;
  glowColor: string;
  burstDone?: boolean;
}

export interface DebrisPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  points: { x: number; y: number }[];
}

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPaused,
  gameMode = 'pc',
  onUpdateStats,
  onGameOver,
  keysRef,
  triggerShootRef,
  triggerReloadRef,
  triggerSkillRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cache shop data to avoid calling localStorage JSON.parse on every frame
  const shopDataRef = useRef(getShopData());

  useEffect(() => {
    shopDataRef.current = getShopData();
  }, [isPaused]);

  // References for mutable game state inside animation loop
  const gameStateRef = useRef({
    score: 0,
    highScore: 0,
    lives: 3,
    maxLives: 3,
    gameTime: 0,
    combo: 0,
    maxCombo: 0,
    destroyedCount: 0,
    coinsCollected: 0,
    gameOver: false,
    flashOpacity: 0,
    screenShake: 0,
    // Ammo & Reloading
    maxAmmo: 5,
    currentAmmo: 5,
    isReloading: false,
    reloadTimer: 0,
    reloadDuration: 110, // ~1.8s
    // Spawning
    spawnCounter: 0,
    // Skills (usable once per match)
    usedSkills: {
      Q: false,
      C: false,
      E: false,
      X: false,
    },
    timeSlowTimer: 0,
    empTimer: 0,
    scoreMultiplierTimer: 0,
    scoreMultiplier: 1,
    shadowTwinTimer: 0,
    orbitalStrikeTimer: 0,
    vortexTimer: 0,
    meteorRainTimer: 0,
  });

  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    radius: 18,
    speed: 7,
    color: '#38bdf8',
    weapon: 'normal',
    weaponTimer: 0,
    maxWeaponTimer: 480,
    shield: false,
    shieldTimer: 0,
    maxShieldTimer: 480,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const starfieldRef = useRef<{ x: number; y: number; size: number; speed: number; alpha: number }[]>([]);
  const killBannersRef = useRef<KillBanner[]>([]);
  const dragonFinishersRef = useRef<DragonFinisher[]>([]);
  const debrisRef = useRef<DebrisPiece[]>([]);

  // Initialize starfield background
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.8 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    starfieldRef.current = stars;
  }, []);

  // Helper functions
  const addFloatingText = (x: number, y: number, text: string, color: string = '#fef08a') => {
    floatingTextsRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1,
    });
  };

  const createExplosion = (x: number, y: number, color: string, isBig: boolean = false) => {
    soundEngine.playExplosion(isBig);

    // Particle cap to maintain high FPS (especially on mobile)
    if (particlesRef.current.length > 80) return;

    const shopData = shopDataRef.current;
    const equippedWp =
      WEAPON_SKINS.find((s) => s.id === shopData.equippedWeapon) || WEAPON_SKINS[0];
    const theme = equippedWp.theme;
    const glowColor = equippedWp.glowColor || color;

    // Expanding shockwave ring particle
    particlesRef.current.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 4,
      color: glowColor,
      alpha: 0.9,
      decay: 0.04,
      shape: 'ring',
      ringRadius: 8,
      ringExpand: isBig ? 8 : 4.5,
    });

    if (theme === 'prime') {
      // Prime: Golden Prism Shatter + Floating Diamonds
      for (let i = 0; i < (isBig ? 28 : 16); i++) {
        const angle = (Math.PI * 2 * i) / (isBig ? 28 : 16) + Math.random() * 0.2;
        const speed = Math.random() * 6 + 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 3,
          color: i % 2 === 0 ? '#fbbf24' : '#f8fafc',
          alpha: 1,
          decay: 0.03,
          shape: 'diamond',
          size: Math.random() * 7 + 5,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'PRIME FINISH! 💎', '#fbbf24');
      }
    } else if (theme === 'ion') {
      // Ion: Electric cyan star bursts & lightning shock
      for (let i = 0; i < (isBig ? 26 : 15); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 3 + 2,
          color: i % 3 === 0 ? '#ffffff' : '#38bdf8',
          alpha: 1,
          decay: 0.035,
          shape: 'star',
          size: Math.random() * 6 + 4,
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'ION SHOCK! ⚡', '#38bdf8');
      }
    } else if (theme === 'glitch') {
      // Glitchpop: Magenta & Cyan square pixels + RGB scanlines
      for (let i = 0; i < (isBig ? 30 : 18); i++) {
        const vx = (Math.random() - 0.5) * (isBig ? 14 : 9);
        const vy = (Math.random() - 0.5) * (isBig ? 14 : 9);
        particlesRef.current.push({
          x,
          y,
          vx,
          vy,
          radius: Math.random() * 3 + 2,
          color: i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#22d3ee' : '#f43f5e',
          alpha: 1,
          decay: 0.04,
          shape: 'square',
          size: Math.random() * 7 + 4,
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'GLITCHPOP! 👾', '#ec4899');
      }
    } else if (theme === 'dragon') {
      // Elder Dragon: Magma eruption flame particles shooting upwards
      for (let i = 0; i < (isBig ? 32 : 18); i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = Math.random() * 8 + 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 5 + 3,
          color: i % 2 === 0 ? '#f59e0b' : '#f97316',
          alpha: 1,
          decay: 0.025,
          shape: 'circle',
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'ELDER FLAME! 🔥', '#f59e0b');
      }
    } else if (theme === 'rebirth') {
      // Soul Reaver: Turquoise ghost flame wisps floating upward
      for (let i = 0; i < (isBig ? 24 : 14); i++) {
        const vx = (Math.random() - 0.5) * 4;
        const vy = -Math.random() * 6 - 2;
        particlesRef.current.push({
          x,
          y,
          vx,
          vy,
          radius: Math.random() * 4 + 2,
          color: i % 2 === 0 ? '#2dd4bf' : '#5eead4',
          alpha: 1,
          decay: 0.02,
          shape: 'circle',
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'SOUL REAVED! 👻', '#2dd4bf');
      }
    } else if (theme === 'protocol') {
      // Protocol AI: Dark purple void burst
      for (let i = 0; i < (isBig ? 28 : 16); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          color: i % 2 === 0 ? '#a855f7' : '#c084fc',
          alpha: 1,
          decay: 0.03,
          shape: 'circle',
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'PROTOCOL VOID! ⚛️', '#a855f7');
      }
    } else if (theme === 'kuronami') {
      // Kuronami: Water vortex slash particles crossing
      for (let i = 0; i < (isBig ? 26 : 16); i++) {
        const isSlash1 = i % 2 === 0;
        const speed = (Math.random() - 0.5) * 12;
        particlesRef.current.push({
          x,
          y,
          vx: isSlash1 ? speed : speed,
          vy: isSlash1 ? speed : -speed,
          radius: Math.random() * 3 + 2,
          color: i % 3 === 0 ? '#bfdbfe' : '#38bdf8',
          alpha: 1,
          decay: 0.035,
          shape: 'slash',
          size: Math.random() * 12 + 8,
          rotation: isSlash1 ? Math.PI / 4 : -Math.PI / 4,
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'KURONAMI SLASH! 🌊', '#38bdf8');
      }
    } else if (theme === 'neochronos') {
      // Singularity: Black hole collapse and galaxy star burst
      for (let i = 0; i < (isBig ? 34 : 20); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          color: i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#c084fc' : '#ffffff',
          alpha: 1,
          decay: 0.025,
          shape: 'star',
          size: Math.random() * 7 + 4,
        });
      }
      if (Math.random() < 0.35) {
        addFloatingText(x, y - 10, 'SINGULARITY! 🌌', '#c084fc');
      }
    } else if (theme === 'spiral_phantom') {
      // Spiral Phantom: Swirling double-helix dragon stardust & cyan energy vortex
      for (let i = 0; i < (isBig ? 36 : 22); i++) {
        const angle = (Math.PI * 2 * i) / (isBig ? 36 : 22);
        const speed = Math.random() * 8 + 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2.5,
          color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#22d3ee' : '#06b6d4',
          alpha: 1,
          decay: 0.025,
          shape: 'diamond',
          size: Math.random() * 8 + 5,
          rotation: angle,
          vRot: 0.1,
        });
      }
      // Concentric dragon energy rings
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 6,
        color: '#22d3ee',
        alpha: 1,
        decay: 0.035,
        shape: 'ring',
        ringRadius: 10,
        ringExpand: isBig ? 12 : 7,
      });
      addFloatingText(x, y - 12, 'SPIRAL DRAGON BURST! 🐉', '#22d3ee');
    } else {
      // Tactical / Default: Shrapnel & Orange Fire
      for (let i = 0; i < (isBig ? 24 : 14); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.8 + 0.2) * (isBig ? 12 : 6);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * (isBig ? 5 : 3) + 2,
          color: i % 2 === 0 ? '#ef4444' : '#f97316',
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          shape: 'circle',
        });
      }
    }
  };

  const spawnDragonFinisher = (startX: number, startY: number) => {
    soundEngine.playDragonFinisherSound();

    // Create 18 dragon body segments initialized at spawn point
    const segments = [];
    for (let i = 0; i < 18; i++) {
      segments.push({
        x: startX,
        y: startY + i * 6,
        angle: -Math.PI / 2,
        size: Math.max(7, 18 - i * 0.7),
      });
    }

    dragonFinishersRef.current.push({
      id: Math.random(),
      startX,
      startY,
      headX: startX,
      headY: startY,
      headAngle: -Math.PI / 2,
      progress: 0,
      maxFrames: 95, // ~1.6s of smooth majestic flight
      segments,
      wingPhase: 0,
      color: '#22d3ee',
      glowColor: '#67e8f9',
    });

    // Spawn initial spiral stardust burst around spawn point
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * (Math.random() * 5 + 3),
        vy: Math.sin(angle) * (Math.random() * 5 + 3),
        radius: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#22d3ee' : '#67e8f9',
        alpha: 1,
        decay: 0.025,
        shape: 'ring',
        ringRadius: 6,
        ringExpand: 5,
      });
    }
  };

  const triggerValorantMeteorKill = (
    x: number,
    y: number,
    color: string,
    isBig: boolean = false,
    combo: number = 1
  ) => {
    const shopData = shopDataRef.current;
    const equippedWp =
      WEAPON_SKINS.find((s) => s.id === shopData.equippedWeapon) || WEAPON_SKINS[0];
    const theme = equippedWp.theme;

    // 1. Play signature Valorant Kill chime / progressive combo note
    const isSpecialDragon = theme === 'spiral_phantom';
    soundEngine.playValorantKill(combo, isSpecialDragon);

    // 2. Trigger Dragon Finisher if equipped with Spiral Phantom (or on high combos)
    if (isSpecialDragon || (combo >= 5 && Math.random() < 0.4)) {
      spawnDragonFinisher(x, y);
    }

    // 3. Trigger Particle Explosion
    createExplosion(x, y, color, isBig);

    // 4. Valorant-Style Kill Confirmation Banner
    let killTitle = '1 KILL 🎯';
    let subTitle = 'VALORANT HEADSHOT';
    let bannerColor = '#38bdf8';
    let glowColor = '#0284c7';

    if (theme === 'spiral_phantom') {
      killTitle = combo > 1 ? `${combo}x DRAGON KILL! 🐉` : 'MYSTIC DRAGON KILL 🐉';
      subTitle = 'SPIRAL PHANTOM FINISHER';
      bannerColor = '#22d3ee';
      glowColor = '#06b6d4';
    } else if (combo >= 5) {
      killTitle = 'ACE! 👑 VALORANT PENTAKILL';
      subTitle = 'TARGET AREA WIPED OUT';
      bannerColor = '#f59e0b';
      glowColor = '#fbbf24';
    } else if (combo === 4) {
      killTitle = 'QUADRA KILL! ⚡';
      subTitle = 'MULTI-TARGET SUPREMACY';
      bannerColor = '#c084fc';
      glowColor = '#a855f7';
    } else if (combo === 3) {
      killTitle = 'TRIPLE KILL! 🔥';
      subTitle = 'KILLING STREAK x3';
      bannerColor = '#f97316';
      glowColor = '#ef4444';
    } else if (combo === 2) {
      killTitle = 'DOUBLE KILL! ⚔️';
      subTitle = 'RAPID ELIMINATION';
      bannerColor = '#38bdf8';
      glowColor = '#0284c7';
    }

    killBannersRef.current.push({
      id: Math.random(),
      x,
      y: Math.max(45, y - 25),
      combo,
      title: killTitle,
      subTitle,
      color: bannerColor,
      glowColor,
      alpha: 1,
      scale: 0.6,
      maxAge: 45,
      age: 0,
    });

    // 5. Spawn tumbling realistic meteorite debris polygons
    const debrisCount = isBig ? 8 : 5;
    for (let d = 0; d < debrisCount; d++) {
      const angle = (Math.PI * 2 * d) / debrisCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6 + 3;
      const pts: { x: number; y: number }[] = [];
      const numVerts = Math.floor(Math.random() * 3) + 4;
      const baseR = Math.random() * 5 + 4;
      for (let v = 0; v < numVerts; v++) {
        const a = (Math.PI * 2 * v) / numVerts;
        const r = baseR * (0.6 + Math.random() * 0.7);
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }

      debrisRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slight upward pop
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        size: baseR,
        color,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.02,
        points: pts,
      });
    }
  };

  const spawnItem = (x: number, y: number) => {
    const rand = Math.random();
    let itemType: ItemType = 'coin';
    let label = '🪙';
    let color = '#f59e0b';

    if (rand < 0.45) {
      itemType = 'coin';
      label = '🪙';
      color = '#f59e0b';
    } else if (rand < 0.6) {
      itemType = '3way';
      label = '3';
      color = '#3b82f6';
    } else if (rand < 0.75) {
      itemType = 'laser';
      label = 'L';
      color = '#ec4899';
    } else if (rand < 0.88) {
      itemType = 'shield';
      label = '🛡️';
      color = '#06b6d4';
    } else {
      itemType = 'nuke';
      label = '💣';
      color = '#f97316';
    }

    itemsRef.current.push({
      id: Math.random(),
      x,
      y,
      type: itemType,
      label,
      color,
      speed: 2,
      size: 24,
      pulse: 0,
    });
  };

  const startReload = () => {
    const st = gameStateRef.current;
    if (!st.isReloading && st.currentAmmo < st.maxAmmo && playerRef.current.weapon !== 'laser') {
      st.isReloading = true;
      st.reloadTimer = 0;
      soundEngine.playReload();
    }
  };

  const shootWeapon = () => {
    const st = gameStateRef.current;
    const player = playerRef.current;

    if (st.isReloading && player.weapon !== 'laser') return;

    if (player.weapon === 'laser') {
      // Laser Beam (Piercing beam)
      bulletsRef.current.push({
        id: Math.random(),
        x: player.x - 12,
        y: 0,
        width: 24,
        height: player.y,
        vx: 0,
        vy: 0,
        radius: 0,
        type: 'laser',
        life: 12,
      });
      soundEngine.playLaser();
      return;
    }

    if (st.currentAmmo <= 0) {
      startReload();
      return;
    }

    st.currentAmmo--;

    if (player.weapon === '3way') {
      // 3-Way Spread
      [-0.3, 0, 0.3].forEach((angle) => {
        bulletsRef.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y - 15,
          vx: Math.sin(angle) * 12,
          vy: -Math.cos(angle) * 12,
          radius: 6,
          type: 'rocket',
        });
      });
    } else {
      // Normal single rocket
      bulletsRef.current.push({
        id: Math.random(),
        x: player.x,
        y: player.y - 15,
        vx: 0,
        vy: -12,
        radius: 6,
        type: 'rocket',
      });
    }

    const shopData = shopDataRef.current;
    const equippedWp =
      WEAPON_SKINS.find((s) => s.id === shopData.equippedWeapon) || WEAPON_SKINS[0];
    if (equippedWp.theme === 'spiral_phantom') {
      soundEngine.playPhantomShoot();
    } else {
      soundEngine.playShoot();
    }

    if (st.currentAmmo === 0) {
      startReload();
    }
  };

  const createObstacle = () => {
    const st = gameStateRef.current;
    const size = Math.random() * 20 + 24; // 24 to 44px
    const baseSpeed = 3 + Math.floor(st.gameTime / 300) * 0.7;
    const speed = baseSpeed + Math.random() * 1.5;

    let type: ObstacleType = 'rect';
    let color = '#ef4444';

    if (st.gameTime > 1200) {
      type = 'star';
      color = '#a855f7'; // Level 3: Purple Cosmic Star Meteorite
    } else if (st.gameTime > 600) {
      type = 'triangle';
      color = '#eab308'; // Level 2: Golden Triangular Fire Meteorite
    } else {
      type = 'rect';
      color = '#ef4444'; // Level 1: Red Rocky Block Meteorite
    }

    // Irregular vertices for rocky surface
    const numVerts = 8;
    const vertices: number[] = [];
    for (let i = 0; i < numVerts; i++) {
      vertices.push(0.75 + Math.random() * 0.4);
    }

    obstaclesRef.current.push({
      id: Math.random(),
      x: Math.random() * (CANVAS_WIDTH - size - 20) + 10,
      y: -size - 10,
      size,
      speed,
      type,
      color,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      hp: 1,
      maxHp: 1,
      vertices,
    });
  };

  const nukeScreen = (color = '#ef4444') => {
    const st = gameStateRef.current;
    const obstacles = obstaclesRef.current;
    for (let o = obstacles.length - 1; o >= 0; o--) {
      createExplosion(obstacles[o].x + obstacles[o].size / 2, obstacles[o].y + obstacles[o].size / 2, color);
      if (Math.random() < 0.25) spawnItem(obstacles[o].x, obstacles[o].y);
      st.destroyedCount++;
      st.score += 25;
    }
    obstaclesRef.current = [];
  };

  const useSkill = (key: 'Q' | 'C' | 'E' | 'X') => {
    const st = gameStateRef.current;
    const player = playerRef.current;

    if (st.gameOver || isPaused) return;

    if (st.usedSkills[key]) {
      addFloatingText(player.x, player.y - 35, `${key} 스킬 이미 사용함!`, '#94a3b8');
      return;
    }

    st.usedSkills[key] = true;

    const shopData = shopDataRef.current;
    const char = CHARACTER_SKINS.find((s) => s.id === shopData.equippedCharacter) || CHARACTER_SKINS[0];
    const skill = char.skills[key];

    soundEngine.playNuke();
    st.screenShake = key === 'X' ? 22 : 12;
    if (key === 'X') st.flashOpacity = 0.8;

    addFloatingText(player.x, player.y - 45, `${skill.icon} ${skill.name}!`, char.glowColor || '#38bdf8');

    const obstacles = obstaclesRef.current;

    switch (char.id) {
      case 'char_default': { // Classic Cyan Tank
        if (key === 'Q') {
          for (let i = 0; i < 3; i++) {
            const target = obstacles[i];
            const angle = target
              ? Math.atan2(target.y - player.y, target.x - player.x)
              : -Math.PI / 2 + (i - 1) * 0.3;
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y - 15,
              vx: Math.cos(angle) * 14,
              vy: Math.sin(angle) * 14,
              radius: 8,
              type: 'rocket',
            });
          }
        } else if (key === 'C') {
          player.shield = true;
          player.shieldTimer = 240;
        } else if (key === 'E') {
          for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y,
              vx: Math.cos(angle) * 11,
              vy: Math.sin(angle) * 11,
              radius: 7,
              type: 'rocket',
            });
          }
        } else if (key === 'X') {
          nukeScreen('#06b6d4');
        }
        break;
      }

      case 'char_crimson': { // Crimson Berserker
        if (key === 'Q') {
          for (let i = -1; i <= 1; i++) {
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x + i * 20 - 10,
              y: 0,
              width: 20,
              height: player.y,
              vx: 0,
              vy: 0,
              radius: 0,
              type: 'laser',
              life: 25,
            });
          }
        } else if (key === 'C') {
          st.lives = Math.min(st.maxLives, st.lives + 1);
          addFloatingText(player.x, player.y - 20, '+1 생명 회복! ❤️', '#ef4444');
        } else if (key === 'E') {
          player.shield = true;
          player.shieldTimer = 150;
          for (let o = obstacles.length - 1; o >= 0; o--) {
            if (Math.abs(obstacles[o].x - player.x) < 90) {
              createExplosion(obstacles[o].x + obstacles[o].size / 2, obstacles[o].y + obstacles[o].size / 2, '#ef4444');
              st.destroyedCount++;
              st.score += 25;
              obstacles.splice(o, 1);
            }
          }
        } else if (key === 'X') {
          nukeScreen('#ef4444');
        }
        break;
      }

      case 'char_emerald': { // Emerald Guardian
        if (key === 'Q') {
          st.timeSlowTimer = 360;
        } else if (key === 'C') {
          itemsRef.current.forEach((item) => {
            item.x = player.x;
            item.y = player.y;
          });
          const count = Math.min(4, obstacles.length);
          for (let i = 0; i < count; i++) {
            spawnItem(obstacles[i].x, obstacles[i].y);
            createExplosion(obstacles[i].x + obstacles[i].size / 2, obstacles[i].y + obstacles[i].size / 2, '#10b981');
          }
          obstacles.splice(0, count);
        } else if (key === 'E') {
          player.shield = true;
          player.shieldTimer = 300;
        } else if (key === 'X') {
          player.shield = true;
          player.shieldTimer = 480;
          nukeScreen('#10b981');
        }
        break;
      }

      case 'char_gold': { // Golden Sovereign Mech
        if (key === 'Q') {
          for (let o = obstacles.length - 1; o >= 0; o--) {
            spawnItem(obstacles[o].x, obstacles[o].y);
            createExplosion(obstacles[o].x + obstacles[o].size / 2, obstacles[o].y + obstacles[o].size / 2, '#eab308');
            st.destroyedCount++;
            st.score += 30;
            obstacles.splice(o, 1);
          }
        } else if (key === 'C') {
          bulletsRef.current.push({
            id: Math.random(),
            x: player.x - 40,
            y: 0,
            width: 80,
            height: player.y,
            vx: 0,
            vy: 0,
            radius: 0,
            type: 'laser',
            life: 30,
          });
        } else if (key === 'E') {
          st.scoreMultiplierTimer = 480;
          st.scoreMultiplier = 2.5;
          st.currentAmmo = st.maxAmmo;
        } else if (key === 'X') {
          st.orbitalStrikeTimer = 300;
          nukeScreen('#eab308');
        }
        break;
      }

      case 'char_cyber': { // Cyber Neon Phantom
        if (key === 'Q') {
          st.empTimer = 300;
        } else if (key === 'C') {
          nukeScreen('#a855f7');
        } else if (key === 'E') {
          for (let i = 0; i < 2; i++) {
            bulletsRef.current.push({
              id: Math.random(),
              x: i === 0 ? 0 : CANVAS_WIDTH / 2,
              y: 0,
              width: CANVAS_WIDTH / 2,
              height: CANVAS_HEIGHT,
              vx: 0,
              vy: 0,
              radius: 0,
              type: 'laser',
              life: 18,
            });
          }
        } else if (key === 'X') {
          nukeScreen('#ec4899');
        }
        break;
      }

      case 'char_kuronami': { // Kuronami Shadow
        if (key === 'Q') {
          for (let i = -2; i <= 2; i++) {
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x + i * 15,
              y: player.y - 15,
              vx: i * 2,
              vy: -15,
              radius: 8,
              type: 'rocket',
            });
          }
        } else if (key === 'C') {
          player.shield = true;
          player.shieldTimer = 240;
        } else if (key === 'E') {
          st.shadowTwinTimer = 420;
        } else if (key === 'X') {
          st.vortexTimer = 180;
          nukeScreen('#38bdf8');
        }
        break;
      }

      case 'char_singularity': { // Void Singularity
        if (key === 'Q') {
          obstacles.forEach((obs) => {
            obs.speed = -Math.abs(obs.speed) * 1.5;
          });
        } else if (key === 'C') {
          player.shield = true;
          player.shieldTimer = 210;
        } else if (key === 'E') {
          bulletsRef.current.push({
            id: Math.random(),
            x: player.x - 25,
            y: 0,
            width: 50,
            height: player.y,
            vx: 0,
            vy: 0,
            radius: 0,
            type: 'laser',
            life: 30,
          });
        } else if (key === 'X') {
          nukeScreen('#c084fc');
        }
        break;
      }

      case 'char_valkyrie': { // Celestial Valkyrie
        if (key === 'Q') {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y - 10,
              vx: Math.cos(angle) * 13,
              vy: Math.sin(angle) * 13,
              radius: 9,
              type: 'rocket',
            });
          }
        } else if (key === 'C') {
          st.lives = Math.min(st.maxLives, st.lives + 1);
          player.shield = true;
          player.shieldTimer = 180;
        } else if (key === 'E') {
          for (let i = 0; i < 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y,
              vx: Math.cos(angle) * 12,
              vy: Math.sin(angle) * 12,
              radius: 7,
              type: 'rocket',
            });
          }
        } else if (key === 'X') {
          st.meteorRainTimer = 240;
          nukeScreen('#f43f5e');
        }
        break;
      }

      default:
        nukeScreen();
        break;
    }
  };

  // Main Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const st = gameStateRef.current;
      const player = playerRef.current;

      if (!isPaused && !st.gameOver) {
        st.gameTime++;
        st.score = Math.floor(st.gameTime / 5) + st.destroyedCount * 15;

        // Process external triggers from touch/button events
        if (triggerShootRef.current) {
          shootWeapon();
          triggerShootRef.current = false;
        }
        if (triggerReloadRef.current) {
          startReload();
          triggerReloadRef.current = false;
        }

        // Process skill triggers Q, C, E, X
        if (triggerSkillRef.current.Q) {
          triggerSkillRef.current.Q = false;
          useSkill('Q');
        }
        if (triggerSkillRef.current.C) {
          triggerSkillRef.current.C = false;
          useSkill('C');
        }
        if (triggerSkillRef.current.E) {
          triggerSkillRef.current.E = false;
          useSkill('E');
        }
        if (triggerSkillRef.current.X) {
          triggerSkillRef.current.X = false;
          useSkill('X');
        }

        // Active skill effect timers
        if (st.timeSlowTimer > 0) st.timeSlowTimer--;
        if (st.empTimer > 0) st.empTimer--;
        if (st.scoreMultiplierTimer > 0) {
          st.scoreMultiplierTimer--;
          if (st.scoreMultiplierTimer === 0) st.scoreMultiplier = 1;
        }

        // Shadow Twin Turret Auto-Fire
        if (st.shadowTwinTimer > 0) {
          st.shadowTwinTimer--;
          if (st.gameTime % 18 === 0) {
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x - 30,
              y: player.y - 15,
              vx: 0,
              vy: -12,
              radius: 5,
              type: 'rocket',
            });
            bulletsRef.current.push({
              id: Math.random(),
              x: player.x + 30,
              y: player.y - 15,
              vx: 0,
              vy: -12,
              radius: 5,
              type: 'rocket',
            });
          }
        }

        // Orbital Strike Fire
        if (st.orbitalStrikeTimer > 0) {
          st.orbitalStrikeTimer--;
          if (st.gameTime % 12 === 0) {
            const strikeX = Math.random() * (CANVAS_WIDTH - 60) + 30;
            bulletsRef.current.push({
              id: Math.random(),
              x: strikeX,
              y: 0,
              width: 40,
              height: CANVAS_HEIGHT,
              vx: 0,
              vy: 0,
              radius: 0,
              type: 'laser',
              life: 15,
            });
          }
        }

        // Celestial Meteor Shower
        if (st.meteorRainTimer > 0) {
          st.meteorRainTimer--;
          if (st.gameTime % 8 === 0) {
            const rx = Math.random() * CANVAS_WIDTH;
            bulletsRef.current.push({
              id: Math.random(),
              x: rx,
              y: -10,
              vx: (Math.random() - 0.5) * 4,
              vy: 14,
              radius: 8,
              type: 'rocket',
            });
          }
        }

        // Process Keyboard Movement & Reloading
        const keys = keysRef.current;
        if (keys.a && player.x - player.radius > 5) {
          player.x -= player.speed;
        }
        if (keys.d && player.x + player.radius < CANVAS_WIDTH - 5) {
          player.x += player.speed;
        }
        if (keys.r) {
          startReload();
          keys.r = false; // single trigger
        }

        // Weapon Timer management
        if (player.weaponTimer > 0) {
          player.weaponTimer--;
          if (player.weaponTimer === 0) {
            player.weapon = 'normal';
          }
        }

        // Shield Timer management
        if (player.shieldTimer > 0) {
          player.shieldTimer--;
          if (player.shieldTimer === 0) {
            player.shield = false;
          }
        }

        // Reload Timer
        if (st.isReloading) {
          st.reloadTimer++;
          if (st.reloadTimer >= st.reloadDuration) {
            st.currentAmmo = st.maxAmmo;
            st.isReloading = false;
            st.reloadTimer = 0;
          }
        }

        // Spawn Obstacles
        const spawnInterval = Math.max(18, 45 - Math.floor(st.gameTime / 350) * 4);
        st.spawnCounter++;
        if (st.spawnCounter >= spawnInterval) {
          createObstacle();
          st.spawnCounter = 0;
        }

        // Update Bullets & Bullet-Obstacle Collisions
        const bullets = bulletsRef.current;
        const obstacles = obstaclesRef.current;

        for (let b = bullets.length - 1; b >= 0; b--) {
          const bullet = bullets[b];

          if (bullet.type === 'laser') {
            bullet.life!--;
            // Laser collision check
            for (let o = obstacles.length - 1; o >= 0; o--) {
              const obs = obstacles[o];
              if (obs.x + obs.size > bullet.x && obs.x < bullet.x + bullet.width!) {
                st.destroyedCount++;
                st.combo++;
                if (st.combo > st.maxCombo) st.maxCombo = st.combo;

                triggerValorantMeteorKill(
                  obs.x + obs.size / 2,
                  obs.y + obs.size / 2,
                  obs.color,
                  false,
                  st.combo
                );

                if (Math.random() < 0.25) spawnItem(obs.x, obs.y);

                const points = 20 * (1 + Math.floor(st.combo / 5) * 0.5);
                st.score += points;
                addFloatingText(obs.x + obs.size / 2, obs.y, `+${Math.round(points)}`, '#f472b6');

                obstacles.splice(o, 1);
              }
            }
            if (bullet.life! <= 0) bullets.splice(b, 1);
          } else {
            // Rocket Bullet
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Out of screen
            if (
              bullet.y < -20 ||
              bullet.x < -20 ||
              bullet.x > CANVAS_WIDTH + 20
            ) {
              bullets.splice(b, 1);
              st.combo = 0; // Missed shot resets combo
              continue;
            }

            // Hit Obstacle
            for (let o = obstacles.length - 1; o >= 0; o--) {
              const obs = obstacles[o];
              if (
                bullet.x > obs.x &&
                bullet.x < obs.x + obs.size &&
                bullet.y > obs.y &&
                bullet.y < obs.y + obs.size
              ) {
                st.destroyedCount++;
                st.combo++;
                if (st.combo > st.maxCombo) st.maxCombo = st.combo;

                triggerValorantMeteorKill(
                  obs.x + obs.size / 2,
                  obs.y + obs.size / 2,
                  obs.color,
                  false,
                  st.combo
                );

                if (Math.random() < 0.25) spawnItem(obs.x, obs.y);

                const comboMultiplier = 1 + Math.floor(st.combo / 5) * 0.5;
                const points = Math.round(15 * comboMultiplier);
                st.score += points;

                if (st.combo % 5 === 0 && st.combo > 0) {
                  addFloatingText(obs.x + obs.size / 2, obs.y, `${st.combo}x COMBO!`, '#fbbf24');
                } else {
                  addFloatingText(obs.x + obs.size / 2, obs.y, `+${points}`, '#38bdf8');
                }

                st.screenShake = 6;
                obstacles.splice(o, 1);
                bullets.splice(b, 1);
                break;
              }
            }
          }
        }

        // Update Obstacles & Player Collision
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.y += obs.speed;
          obs.angle += obs.rotSpeed;

          if (obs.swayAmp) {
            obs.swayPhase = (obs.swayPhase || 0) + (obs.swaySpeed || 0.03);
            obs.x += Math.sin(obs.swayPhase) * obs.swayAmp;
            obs.x = Math.max(5, Math.min(CANVAS_WIDTH - obs.size - 5, obs.x));
          }

          // Subtle re-entry particle trail
          if (Math.random() < 0.22) {
            particlesRef.current.push({
              x: obs.x + obs.size / 2 + (Math.random() - 0.5) * obs.size * 0.5,
              y: obs.y,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -Math.random() * 1.5 - 0.5,
              radius: Math.random() * 2 + 1,
              color: obs.color,
              alpha: 0.5,
              decay: 0.04,
            });
          }

          // Circle-AABB collision check with player
          const closestX = Math.max(obs.x, Math.min(player.x, obs.x + obs.size));
          const closestY = Math.max(obs.y, Math.min(player.y, obs.y + obs.size));
          const dx = player.x - closestX;
          const dy = player.y - closestY;

          if (dx * dx + dy * dy < player.radius * player.radius) {
            createExplosion(obs.x + obs.size / 2, obs.y + obs.size / 2, '#f59e0b', true);
            obstacles.splice(i, 1);
            st.combo = 0;

            if (player.shield) {
              player.shield = false;
              player.shieldTimer = 0;
              soundEngine.playShieldHit();
              addFloatingText(player.x, player.y - 30, 'SHIELD ABSORBED!', '#06b6d4');
              st.screenShake = 8;
            } else {
              st.lives--;
              st.screenShake = 15;
              addFloatingText(player.x, player.y - 30, 'OOUCH! -1 HP', '#ef4444');

              if (st.lives <= 0) {
                st.gameOver = true;
                soundEngine.playGameOver();
                onGameOver(st.score, st.maxCombo, st.destroyedCount, player.weapon);
              }
            }
            continue;
          }

          if (obs.y > CANVAS_HEIGHT + 50) {
            obstacles.splice(i, 1);
          }
        }

        // Update Items & Pickup
        const items = itemsRef.current;
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          item.y += item.speed;
          item.pulse += 0.08;

          const dx = player.x - item.x;
          const dy = player.y - item.y;
          if (Math.sqrt(dx * dx + dy * dy) < player.radius + item.size / 2) {
            if (item.type === 'coin') {
              soundEngine.playCoin();
              st.coinsCollected = (st.coinsCollected || 0) + 10;
              // Accumulate in local memory and flush to storage on game over or asynchronously
              try { addCoins(10); } catch (_) {}
              addFloatingText(player.x, player.y - 30, '+10 🪙', '#f59e0b');
            } else if (item.type === '3way') {
              soundEngine.playItemPickup();
              player.weapon = '3way';
              player.weaponTimer = player.maxWeaponTimer;
              addFloatingText(player.x, player.y - 30, '3-WAY ROCKETS!', '#3b82f6');
            } else if (item.type === 'laser') {
              soundEngine.playItemPickup();
              player.weapon = 'laser';
              player.weaponTimer = 360; // 6s
              addFloatingText(player.x, player.y - 30, 'LASER BEAM!', '#ec4899');
            } else if (item.type === 'nuke') {
              st.flashOpacity = 0.95;
              soundEngine.playNuke();
              st.screenShake = 20;

              obstacles.forEach((o) => {
                createExplosion(o.x + o.size / 2, o.y + o.size / 2, o.color, true);
              });
              st.destroyedCount += obstacles.length;
              st.score += obstacles.length * 20;
              addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '💣 NUKE DETONATED!', '#f97316');
              obstaclesRef.current = [];
            } else if (item.type === 'shield') {
              soundEngine.playItemPickup();
              player.shield = true;
              player.shieldTimer = player.maxShieldTimer;
              addFloatingText(player.x, player.y - 30, '🛡️ SHIELD ACTIVE!', '#06b6d4');
            }

            items.splice(i, 1);
            continue;
          }

          if (item.y > CANVAS_HEIGHT + 30) {
            items.splice(i, 1);
          }
        }

        // Update Particles
        const particles = particlesRef.current;
        for (let p = particles.length - 1; p >= 0; p--) {
          const part = particles[p];
          part.x += part.vx;
          part.y += part.vy;
          part.alpha -= part.decay;
          if (part.alpha <= 0) {
            particles.splice(p, 1);
          }
        }

        // Update Dragon Finishers (비룡 승천 모션)
        const dragonFinishers = dragonFinishersRef.current;
        for (let i = dragonFinishers.length - 1; i >= 0; i--) {
          const df = dragonFinishers[i];
          df.progress += 1 / df.maxFrames;
          df.wingPhase += 0.35;

          // Sinuous ascending flight trajectory
          const t = df.progress * Math.PI * 2.2;
          const sway = Math.sin(t * 1.8) * 85;
          const nextHeadX = df.startX + sway + Math.sin(t * 0.7) * 40;
          const nextHeadY = df.startY - df.progress * (CANVAS_HEIGHT * 0.9);

          const dx = nextHeadX - df.headX;
          const dy = nextHeadY - df.headY;
          df.headAngle = Math.atan2(dy, dx) + Math.PI / 2;
          df.headX = nextHeadX;
          df.headY = nextHeadY;

          // Update head segment
          df.segments[0].x = df.headX;
          df.segments[0].y = df.headY;
          df.segments[0].angle = df.headAngle;

          // Update body segments following the head
          for (let s = 1; s < df.segments.length; s++) {
            const prev = df.segments[s - 1];
            const curr = df.segments[s];
            const segDx = prev.x - curr.x;
            const segDy = prev.y - curr.y;
            const dist = Math.sqrt(segDx * segDx + segDy * segDy) || 1;
            const targetDist = 9;
            curr.x = prev.x - (segDx / dist) * targetDist;
            curr.y = prev.y - (segDy / dist) * targetDist;
            curr.angle = Math.atan2(segDy, segDx) + Math.PI / 2;
          }

          // Emit dragon stardust embers along body
          if (Math.random() < 0.5) {
            const segIdx = Math.floor(Math.random() * (df.segments.length - 2)) + 1;
            const seg = df.segments[segIdx];
            particlesRef.current.push({
              x: seg.x + (Math.random() - 0.5) * 8,
              y: seg.y + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2 + 1,
              radius: Math.random() * 3 + 1.5,
              color: Math.random() < 0.5 ? '#67e8f9' : '#22d3ee',
              alpha: 0.8,
              decay: 0.04,
              shape: 'diamond',
              size: 5,
            });
          }

          // At apex (near end), emit celestial dragon ring pulse
          if (df.progress > 0.85 && !df.burstDone) {
            df.burstDone = true;
            particlesRef.current.push({
              x: df.headX,
              y: df.headY,
              vx: 0,
              vy: 0,
              radius: 8,
              color: '#22d3ee',
              alpha: 1,
              decay: 0.03,
              shape: 'ring',
              ringRadius: 15,
              ringExpand: 12,
            });
          }

          if (df.progress >= 1) {
            dragonFinishers.splice(i, 1);
          }
        }

        // Update Debris Pieces
        const debris = debrisRef.current;
        for (let d = debris.length - 1; d >= 0; d--) {
          const deb = debris[d];
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.vy += 0.22; // gravity
          deb.rot += deb.vRot;
          deb.alpha -= deb.decay;
          if (deb.alpha <= 0 || deb.y > CANVAS_HEIGHT + 40) {
            debris.splice(d, 1);
          }
        }

        // Update Kill Banners
        const banners = killBannersRef.current;
        for (let b = banners.length - 1; b >= 0; b--) {
          const banner = banners[b];
          banner.age++;
          banner.y -= 0.6;
          if (banner.scale < 1) banner.scale += 0.08;
          if (banner.age > banner.maxAge * 0.6) {
            banner.alpha -= 0.05;
          }
          if (banner.age >= banner.maxAge || banner.alpha <= 0) {
            banners.splice(b, 1);
          }
        }

        // Update Floating Text
        const texts = floatingTextsRef.current;
        for (let t = texts.length - 1; t >= 0; t--) {
          const txt = texts[t];
          txt.y -= 1;
          txt.alpha -= 0.02;
          if (txt.alpha <= 0) {
            texts.splice(t, 1);
          }
        }

        // Fade Flash & Screen Shake
        if (st.flashOpacity > 0) st.flashOpacity -= 0.04;
        if (st.screenShake > 0) st.screenShake -= 0.5;

        // Drifting starfield
        starfieldRef.current.forEach((star) => {
          star.y += star.speed;
          if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
          }
        });

        // Send stats up to HUD component
        const currentShop = shopDataRef.current;
        const currentSkin = CHARACTER_SKINS.find((s) => s.id === currentShop.equippedCharacter) || CHARACTER_SKINS[0];

        onUpdateStats({
          score: st.score,
          highScore: st.highScore,
          lives: st.lives,
          maxLives: st.maxLives,
          currentAmmo: st.currentAmmo,
          maxAmmo: st.maxAmmo,
          isReloading: st.isReloading,
          reloadProgress: st.isReloading ? st.reloadTimer / st.reloadDuration : 0,
          gameTime: st.gameTime,
          weapon: player.weapon,
          weaponTimeLeft: Math.ceil(player.weaponTimer / 60),
          hasShield: player.shield,
          shieldTimeLeft: Math.ceil(player.shieldTimer / 60),
          combo: st.combo,
          maxCombo: st.maxCombo,
          destroyedCount: st.destroyedCount,
          coinsCollected: st.coinsCollected,
          totalCoins: currentShop.coins,
          usedSkills: { ...st.usedSkills },
          equippedCharSkin: currentSkin,
        });
      }

      // Render Frame
      render();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const st = gameStateRef.current;
      const player = playerRef.current;

      ctx.save();

      // Screen Shake offset
      if (st.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * st.screenShake;
        const shakeY = (Math.random() - 0.5) * st.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Background Space Canvas
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Starfield
      starfieldRef.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nuclear Flash Screen Overlay
      if (st.flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, st.flashOpacity)})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Get equipped skin data
      const shopData = getShopData();
      const equippedChar =
        CHARACTER_SKINS.find((s) => s.id === shopData.equippedCharacter) || CHARACTER_SKINS[0];
      const equippedWp =
        WEAPON_SKINS.find((s) => s.id === shopData.equippedWeapon) || WEAPON_SKINS[0];

      // Bullets
      bulletsRef.current.forEach((b) => {
        if (b.type === 'laser') {
          // Laser beam effect
          const grad = ctx.createLinearGradient(b.x, 0, b.x + b.width!, 0);
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
          grad.addColorStop(0.5, equippedWp.glowColor || 'rgba(244, 114, 182, 0.9)');
          grad.addColorStop(1, 'rgba(236, 72, 153, 0.2)');

          ctx.fillStyle = grad;
          ctx.fillRect(b.x, b.y, b.width!, b.height!);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x + 8, b.y, b.width! - 16, b.height!);
        } else {
          // Rocket Bullet
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = equippedWp.bulletColor || '#f97316';
          ctx.shadowColor = equippedWp.glowColor || '#f97316';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.closePath();

          // Flame trail behind rocket
          ctx.beginPath();
          ctx.moveTo(b.x - 3, b.y + 4);
          ctx.lineTo(b.x, b.y + 12);
          ctx.lineTo(b.x + 3, b.y + 4);
          ctx.fillStyle = equippedWp.glowColor || '#ef4444';
          ctx.fill();
        }
      });

      // Player Bazooka Tank
      ctx.save();
      ctx.translate(player.x, player.y);

      // Shield Aura
      if (player.shield) {
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fill();
      }

      // Tank Body with Skin Colors
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = equippedChar.bodyColor;
      ctx.shadowColor = equippedChar.glowColor;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = equippedChar.accentColor;
      ctx.stroke();
      ctx.closePath();

      // Inner Turret Core
      ctx.beginPath();
      ctx.arc(0, 0, player.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = equippedChar.accentColor;
      ctx.fill();
      ctx.closePath();

      // --- DETAILED TACTICAL WEAPON BARREL RENDERING ---
      const theme = equippedWp.theme || 'tactical';

      // Laser Aiming Sight Guide
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, -120);
      ctx.strokeStyle = equippedWp.laserColor || 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (theme === 'tactical') {
        // Suppressor & Muzzle Brake
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, -38, 10, 8);
        ctx.strokeStyle = equippedWp.glowColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(-5, -38, 10, 8);
        // Heat Vent Lines
        ctx.fillStyle = equippedWp.glowColor;
        ctx.fillRect(-3, -36, 6, 1.5);
        ctx.fillRect(-3, -33, 6, 1.5);

        // Main Cannon Tube
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fillRect(-6, -30, 12, 18);
        ctx.strokeStyle = equippedWp.secondaryColor;
        ctx.strokeRect(-6, -30, 12, 18);

        // Picatinny Side Rails
        ctx.fillStyle = '#475569';
        ctx.fillRect(-8, -25, 2, 10);
        ctx.fillRect(6, -25, 2, 10);

        // Red-Dot Holographic Optic Sight
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-3, -20, 6, 6);
        ctx.beginPath();
        ctx.arc(0, -17, 2, 0, Math.PI * 2);
        ctx.fillStyle = equippedWp.glowColor;
        ctx.shadowColor = equippedWp.glowColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (theme === 'prime') {
        // Prime White & Gold Geometric Shroud
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.lineTo(-8, -26);
        ctx.lineTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(8, -26);
        ctx.closePath();
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Side Wings
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-11, -22, 3, 8);
        ctx.fillRect(8, -22, 3, 8);

        // Floating Diamond Crystal Core
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(-4, -22);
        ctx.lineTo(0, -16);
        ctx.lineTo(4, -22);
        ctx.closePath();
        ctx.fillStyle = equippedWp.glowColor;
        ctx.shadowColor = equippedWp.glowColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (theme === 'glitch') {
        // Glitchpop Cyber Frame
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fillRect(-7, -32, 14, 20);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-7, -32, 14, 20);

        // Neon Wires
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, -28);
        ctx.lineTo(-10, -20);
        ctx.lineTo(-7, -14);
        ctx.stroke();

        // Floating Hologram Ring Scope
        ctx.beginPath();
        ctx.ellipse(0, -36, 9, 3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (theme === 'dragon') {
        // Elder Dragon Scale Snout
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.lineTo(-9, -24);
        ctx.lineTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(9, -24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dragon Fangs / Horns
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(-8, -28);
        ctx.lineTo(-13, -34);
        ctx.lineTo(-6, -26);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, -28);
        ctx.lineTo(13, -34);
        ctx.lineTo(6, -26);
        ctx.fill();

        // Magma Flame Core
        ctx.beginPath();
        ctx.arc(0, -28, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (theme === 'protocol') {
        // Protocol Abyssal Dark Matter Barrel
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fillRect(-7, -32, 14, 20);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-7, -32, 14, 20);

        // Floating Orbit Ring
        ctx.beginPath();
        ctx.ellipse(0, -32, 11, 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Void Singularity Core
        ctx.beginPath();
        ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e879f9';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (theme === 'ion') {
        // Ion Sci-Fi Curve
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.quadraticCurveTo(-10, -25, -6, -12);
        ctx.lineTo(6, -12);
        ctx.quadraticCurveTo(10, -25, 0, -38);
        ctx.fill();
        ctx.strokeStyle = equippedWp.glowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -24, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = equippedWp.glowColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (theme === 'rebirth') {
        // Soul Reaver Spectral Horns
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fillRect(-6, -30, 12, 18);
        ctx.strokeStyle = equippedWp.glowColor;
        ctx.strokeRect(-6, -30, 12, 18);

        ctx.fillStyle = equippedWp.glowColor;
        ctx.beginPath();
        ctx.moveTo(-6, -26);
        ctx.lineTo(-12, -34);
        ctx.lineTo(-4, -28);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6, -26);
        ctx.lineTo(12, -34);
        ctx.lineTo(4, -28);
        ctx.fill();
      } else if (theme === 'kuronami') {
        // Kuronami Katana Barrel & Water Vortex
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(-5, -28);
        ctx.lineTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(5, -28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = equippedWp.glowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Water Spiral Arc
        ctx.beginPath();
        ctx.arc(0, -26, 7, 0, Math.PI);
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (theme === 'neochronos') {
        // Singularity Black Hole Barrel
        ctx.fillStyle = equippedWp.barrelColor;
        ctx.fillRect(-7, -32, 14, 20);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-7, -32, 14, 20);

        // Cosmic Ring
        ctx.beginPath();
        ctx.ellipse(0, -32, 10, 3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (theme === 'spiral_phantom') {
        // Spiral Phantom: Sleek Silencer Barrel + Double-Helix Swirling Dragon Ring + Mystic Core
        ctx.fillStyle = '#09131f';
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(-6, -30);
        ctx.lineTo(-7, -12);
        ctx.lineTo(7, -12);
        ctx.lineTo(6, -30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Spiral Energy Rings
        ctx.beginPath();
        ctx.ellipse(0, -32, 10, 3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.ellipse(0, -22, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing Dragon Pearl Core
        ctx.beginPath();
        ctx.arc(0, -27, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Extra Power-up Visual Overlays
      if (player.weapon === '3way') {
        // Multi-barrel launcher visual
        ctx.fillStyle = equippedWp.glowColor;
        ctx.fillRect(-11, -28, 3, 12);
        ctx.fillRect(8, -28, 3, 12);
      } else if (player.weapon === 'laser') {
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(-8, -34, 16, 4);
      }

      // Reloading Progress Indicator under player
      if (st.isReloading) {
        const progress = st.reloadTimer / st.reloadDuration;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(-24, 26, 48, 6);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-24, 26, 48 * progress, 6);
      }

      ctx.restore();

      // Obstacles (Falling Meteorites)
      obstaclesRef.current.forEach((obs) => {
        const cx = obs.x + obs.size / 2;
        const cy = obs.y + obs.size / 2;
        const r = obs.size / 2;

        // 1. Render fiery tail flame streaming UPWARDS behind falling meteorite
        ctx.save();
        const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy - r * 3.2);
        flameGrad.addColorStop(0, obs.color);
        flameGrad.addColorStop(0.4, '#f97316');
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy);
        ctx.quadraticCurveTo(cx - r * 0.9, cy - r * 1.6, cx, cy - r * 3.2);
        ctx.quadraticCurveTo(cx + r * 0.9, cy - r * 1.6, cx + r * 0.7, cy);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Render rotating meteorite body
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(obs.angle);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (obs.type === 'triangle') {
          // Level 2: Golden Triangular Comet Meteorite (황금 삼각 유성 운석)
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.25);
          ctx.lineTo(-r * 0.9, r * 0.9);
          ctx.lineTo(0, r * 0.4); // inner aerodynamic notch
          ctx.lineTo(r * 0.9, r * 0.9);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Burning inner golden core
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, -r * 0.1, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

        } else if (obs.type === 'star') {
          // Level 3: Purple Cosmic Star Meteorite (보라색 플라즈마 별 운석)
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 12;

          ctx.beginPath();
          const numPoints = 5;
          const outerR = r * 1.15;
          const innerR = outerR * 0.48;
          for (let p = 0; p < numPoints * 2; p++) {
            const currentR = p % 2 === 0 ? outerR : innerR;
            const a = (p * Math.PI) / numPoints - Math.PI / 2;
            const px = Math.cos(a) * currentR;
            const py = Math.sin(a) * currentR;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cosmic starlight center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

        } else {
          // Level 1: Red Rocky Block Meteorite (일반 붉은 사각/암석 운석)
          ctx.fillStyle = obs.color;
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          const verts = obs.vertices || [1, 0.85, 1.1, 0.8, 1, 0.9, 1.15, 0.8];
          const step = (Math.PI * 2) / verts.length;
          for (let v = 0; v < verts.length; v++) {
            const rad = r * verts[v];
            const a = v * step;
            const px = Math.cos(a) * rad;
            const py = Math.sin(a) * rad;
            if (v === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Rocky crater markings
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.arc(-r * 0.25, -r * 0.2, r * 0.22, 0, Math.PI * 2);
          ctx.arc(r * 0.2, r * 0.25, r * 0.18, 0, Math.PI * 2);
          ctx.fill();

          // Glowing magma vein
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-r * 0.2, -r * 0.1);
          ctx.lineTo(r * 0.15, r * 0.2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // Items / Powerups
      itemsRef.current.forEach((item) => {
        const pulseSize = item.size / 2 + Math.sin(item.pulse) * 2;
        ctx.beginPath();
        ctx.arc(item.x, item.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, item.x, item.y + 1);
      });

      // Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.shape === 'ring') {
          p.ringRadius = (p.ringRadius || 8) + (p.ringExpand || 4);
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        } else if (p.shape === 'square') {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          const sz = p.size || 6;
          ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
          ctx.restore();
        } else if (p.shape === 'diamond') {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) {
            p.rotation += p.vRot || 0.05;
            ctx.rotate(p.rotation);
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          const sz = p.size || 8;
          ctx.beginPath();
          ctx.moveTo(0, -sz);
          ctx.lineTo(sz * 0.6, 0);
          ctx.lineTo(0, sz);
          ctx.lineTo(-sz * 0.6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.shape === 'star') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          const sz = p.size || 6;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(
              Math.cos(((18 + i * 72) * Math.PI) / 180) * sz,
              -Math.sin(((18 + i * 72) * Math.PI) / 180) * sz
            );
            ctx.lineTo(
              Math.cos(((54 + i * 72) * Math.PI) / 180) * (sz / 2),
              -Math.sin(((54 + i * 72) * Math.PI) / 180) * (sz / 2)
            );
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.shape === 'slash') {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation) ctx.rotate(p.rotation);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = Math.max(0, p.alpha);
          const sz = p.size || 10;
          ctx.beginPath();
          ctx.moveTo(-sz, 0);
          ctx.lineTo(sz, 0);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // Render Meteor Debris Pieces
      debrisRef.current.forEach((deb) => {
        ctx.save();
        ctx.translate(deb.x, deb.y);
        ctx.rotate(deb.rot);
        ctx.globalAlpha = Math.max(0, deb.alpha);

        ctx.beginPath();
        deb.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = deb.color;
        ctx.shadowColor = deb.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      // Render Flying Dragon Finishers (비룡 날아다니는 모션)
      dragonFinishersRef.current.forEach((df) => {
        ctx.save();

        // 1. Draw Dragon Wings on Segment 3
        const wingSeg = df.segments[3] || df.segments[0];
        const wingFlap = Math.sin(df.wingPhase);
        ctx.save();
        ctx.translate(wingSeg.x, wingSeg.y);
        ctx.rotate(wingSeg.angle);

        // Left Dragon Wing
        ctx.save();
        ctx.scale(1, wingFlap * 0.9);
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(-28, -25, -45, -12);
        ctx.quadraticCurveTo(-38, 8, -24, 18);
        ctx.quadraticCurveTo(-14, 10, -6, 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Wing Rib Bones
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-45, -12);
        ctx.moveTo(-16, 2);
        ctx.lineTo(-38, 8);
        ctx.stroke();
        ctx.restore();

        // Right Dragon Wing
        ctx.save();
        ctx.scale(1, wingFlap * 0.9);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.quadraticCurveTo(28, -25, 45, -12);
        ctx.quadraticCurveTo(38, 8, 24, 18);
        ctx.quadraticCurveTo(14, 10, 6, 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Wing Rib Bones
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(45, -12);
        ctx.moveTo(16, 2);
        ctx.lineTo(38, 8);
        ctx.stroke();
        ctx.restore();

        ctx.restore(); // end wings

        // 2. Draw Serpentine Dragon Body (back to front)
        for (let s = df.segments.length - 1; s >= 0; s--) {
          const seg = df.segments[s];
          const isTail = s > df.segments.length - 4;
          const radius = seg.size;

          ctx.save();
          ctx.translate(seg.x, seg.y);
          ctx.rotate(seg.angle);

          // Dragon dorsal fin / spine spike
          ctx.beginPath();
          ctx.moveTo(0, radius + 1);
          ctx.lineTo(-radius * 0.4, radius + 7);
          ctx.lineTo(0, radius + 12);
          ctx.lineTo(radius * 0.4, radius + 7);
          ctx.closePath();
          ctx.fillStyle = '#67e8f9';
          ctx.fill();

          // Body Segment Core
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = isTail ? '#0891b2' : '#0e7490';
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = s < 3 ? 14 : 8;
          ctx.fill();
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Dragon scale ornament inside segment
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.5, 0, Math.PI);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();
        }

        // 3. Draw Majestic Dragon Head at Segment 0
        const head = df.segments[0];
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(head.angle);

        // Dragon Antlers / Horns
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        // Left horn
        ctx.beginPath();
        ctx.moveTo(-6, 6);
        ctx.quadraticCurveTo(-14, 16, -20, 24);
        ctx.moveTo(-12, 14);
        ctx.lineTo(-18, 16);
        ctx.stroke();
        // Right horn
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.quadraticCurveTo(14, 16, 20, 24);
        ctx.moveTo(12, 14);
        ctx.lineTo(18, 16);
        ctx.stroke();

        // Main Dragon Snout / Skull
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-10, -6);
        ctx.lineTo(-12, 8);
        ctx.lineTo(0, 14);
        ctx.lineTo(12, 8);
        ctx.lineTo(10, -6);
        ctx.closePath();
        ctx.fillStyle = '#083344';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing Dragon Eyes
        ctx.beginPath();
        ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Whiskers waving in wind
        const whiskerWiggle = Math.sin(df.wingPhase * 1.5) * 5;
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.quadraticCurveTo(-20, -18 + whiskerWiggle, -28, -6);
        ctx.moveTo(8, -12);
        ctx.quadraticCurveTo(20, -18 - whiskerWiggle, 28, -6);
        ctx.stroke();

        // Mystic Dragon Pearl / Mouth Stardust Light
        ctx.beginPath();
        ctx.arc(0, -20, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#67e8f9';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.restore(); // end head

        ctx.restore();
      });

      // Render Valorant Kill Banners & Reticles
      killBannersRef.current.forEach((kb) => {
        ctx.save();
        ctx.translate(kb.x, kb.y);
        ctx.scale(kb.scale, kb.scale);
        ctx.globalAlpha = Math.max(0, kb.alpha);

        // 1. Valorant Geometric 4-Corner Reticle
        const retSize = 22;
        const armLen = 8;
        ctx.strokeStyle = kb.glowColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = kb.glowColor;
        ctx.shadowBlur = 10;

        // Top-Left Corner
        ctx.beginPath();
        ctx.moveTo(-retSize, -retSize + armLen);
        ctx.lineTo(-retSize, -retSize);
        ctx.lineTo(-retSize + armLen, -retSize);
        // Top-Right Corner
        ctx.moveTo(retSize - armLen, -retSize);
        ctx.lineTo(retSize, -retSize);
        ctx.lineTo(retSize, -retSize + armLen);
        // Bottom-Left Corner
        ctx.moveTo(-retSize, retSize - armLen);
        ctx.lineTo(-retSize, retSize);
        ctx.lineTo(-retSize + armLen, retSize);
        // Bottom-Right Corner
        ctx.moveTo(retSize - armLen, retSize);
        ctx.lineTo(retSize, retSize);
        ctx.lineTo(retSize, retSize - armLen);
        ctx.stroke();

        // 2. Central Headshot Skull Diamond
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fill();
        ctx.strokeStyle = kb.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner Skull Icon
        ctx.fillStyle = kb.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', 0, 0);

        // 3. Kill Banner Title Box
        ctx.font = '900 13px monospace';
        const titleWidth = ctx.measureText(kb.title).width;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.fillRect(-titleWidth / 2 - 10, 16, titleWidth + 20, 20);
        ctx.strokeStyle = kb.glowColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-titleWidth / 2 - 10, 16, titleWidth + 20, 20);

        ctx.fillStyle = kb.color;
        ctx.shadowColor = kb.glowColor;
        ctx.shadowBlur = 8;
        ctx.fillText(kb.title, 0, 26);
        ctx.shadowBlur = 0;

        // Subtitle badge
        if (kb.subTitle) {
          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(kb.subTitle, 0, 42);
        }

        ctx.restore();
      });

      // Floating Texts
      floatingTextsRef.current.forEach((t) => {
        ctx.save();
        ctx.font = 'black 14px monospace';
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, onGameOver, onUpdateStats, keysRef, triggerShootRef, triggerReloadRef]);

  // Method to restart game
  const resetGame = () => {
    const st = gameStateRef.current;
    st.score = 0;
    st.lives = 3;
    st.gameTime = 0;
    st.combo = 0;
    st.maxCombo = 0;
    st.destroyedCount = 0;
    st.coinsCollected = 0;
    st.currentAmmo = st.maxAmmo;
    st.isReloading = false;
    st.reloadTimer = 0;
    st.gameOver = false;
    st.flashOpacity = 0;
    st.screenShake = 0;

    // Reset skill states & active timers for match restart
    st.usedSkills = {
      Q: false,
      C: false,
      E: false,
      X: false,
    };
    st.timeSlowTimer = 0;
    st.empTimer = 0;
    st.scoreMultiplierTimer = 0;
    st.scoreMultiplier = 1;
    st.shadowTwinTimer = 0;
    st.orbitalStrikeTimer = 0;
    st.vortexTimer = 0;
    st.meteorRainTimer = 0;

    const player = playerRef.current;
    player.x = CANVAS_WIDTH / 2;
    player.weapon = 'normal';
    player.weaponTimer = 0;
    player.shield = false;
    player.shieldTimer = 0;

    bulletsRef.current = [];
    obstaclesRef.current = [];
    itemsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    killBannersRef.current = [];
    dragonFinishersRef.current = [];
    debrisRef.current = [];
  };

  // Expose restart method via window/ref
  useEffect(() => {
    (window as unknown as { restartBazookaGame: () => void }).restartBazookaGame = resetGame;
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-[0_0_40px_rgba(2,6,23,0.9)] bg-slate-950 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block max-w-full h-auto aspect-[3/4] touch-none cursor-crosshair"
      />
    </div>
  );
};
