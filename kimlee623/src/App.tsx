import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  HelpCircle,
  Trophy,
  Flame,
  Home,
  Globe,
} from 'lucide-react';
import { GameCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ControlsOverlay } from './components/ControlsOverlay';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { InstructionsModal } from './components/InstructionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { Lobby } from './components/Lobby';
import { GameStats, WeaponType } from './types';
import { soundEngine } from './utils/audio';
import { getTopScore, getShopData, addCoins } from './utils/storage';
import { OnlineRoom } from './utils/onlineRoom';

import { SideStatusPanel } from './components/SideStatusPanel';

export default function App() {
  const [inLobby, setInLobby] = useState(true);
  const [gameMode, setGameMode] = useState<'pc' | 'mobile'>('pc');
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [currentOnlineRoom, setCurrentOnlineRoom] = useState<OnlineRoom | null>(null);
  const [onlinePlayerName, setOnlinePlayerName] = useState<string>('');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sfxOn, setSfxOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(false);

  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxCombo, setFinalMaxCombo] = useState(0);
  const [finalDestroyedCount, setFinalDestroyedCount] = useState(0);
  const [finalCoinsCollected, setFinalCoinsCollected] = useState(0);
  const [finalWeapon, setFinalWeapon] = useState<WeaponType>('normal');

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: getTopScore(),
    lives: 3,
    maxLives: 3,
    currentAmmo: 5,
    maxAmmo: 5,
    isReloading: false,
    reloadProgress: 0,
    gameTime: 0,
    weapon: 'normal',
    weaponTimeLeft: 0,
    hasShield: false,
    shieldTimeLeft: 0,
    combo: 0,
    maxCombo: 0,
    destroyedCount: 0,
    coinsCollected: 0,
    totalCoins: getShopData().coins,
  });

  // Keys ref
  const keysRef = useRef({
    a: false,
    d: false,
    space: false,
    r: false,
  });

  // Direct action triggers for touch/mouse controls
  const triggerShootRef = useRef(false);
  const triggerReloadRef = useRef(false);
  const triggerSkillRef = useRef<{ Q: boolean; C: boolean; E: boolean; X: boolean }>({
    Q: false,
    C: false,
    E: false,
    X: false,
  });

  // Skill trigger callback for UI buttons
  const handleUseSkill = useCallback((key: 'Q' | 'C' | 'E' | 'X') => {
    triggerSkillRef.current[key] = true;
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore game controls if typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        keysRef.current.a = true;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        keysRef.current.d = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (
          !keysRef.current.space &&
          !showGameOverModal &&
          !isPaused &&
          !showLeaderboard &&
          !showInstructions
        ) {
          triggerShootRef.current = true;
        }
        keysRef.current.space = true;

        if (showGameOverModal && !showLeaderboard && !showInstructions) {
          handleRestart();
        }
      }
      if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ') {
        if (!isPaused && !showGameOverModal) {
          triggerReloadRef.current = true;
        }
      }
      if ((e.key === 'q' || e.key === 'Q' || e.key === 'ㅂ') && !isPaused && !showGameOverModal) {
        triggerSkillRef.current.Q = true;
      }
      if ((e.key === 'c' || e.key === 'C' || e.key === 'ㅊ') && !isPaused && !showGameOverModal) {
        triggerSkillRef.current.C = true;
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') && !isPaused && !showGameOverModal) {
        triggerSkillRef.current.E = true;
      }
      if ((e.key === 'x' || e.key === 'X' || e.key === 'ㅌ') && !isPaused && !showGameOverModal) {
        triggerSkillRef.current.X = true;
      }
      if (e.key === 'Tab' || e.code === 'Tab') {
        e.preventDefault();
        setIsSidePanelOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (!showGameOverModal) {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        keysRef.current.a = false;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        keysRef.current.d = false;
      }
      if (e.code === 'Space') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showGameOverModal, isPaused]);

  // Audio Toggles
  const handleToggleSfx = () => {
    const newState = soundEngine.toggleSfx();
    setSfxOn(newState);
  };

  const handleToggleBgm = () => {
    const newState = soundEngine.toggleBgm();
    setBgmOn(newState);
  };

  // Game Handlers
  const handleGameOver = useCallback(
    (score: number, maxCombo: number, destroyedCount: number, weapon: WeaponType) => {
      setFinalScore(score);
      setFinalMaxCombo(maxCombo);
      setFinalDestroyedCount(destroyedCount);
      setFinalWeapon(weapon);

      const droppedCoins = stats.coinsCollected || 0;
      const scoreBonusCoins = Math.floor(score / 40); // Score-based coin reward
      if (scoreBonusCoins > 0) {
        addCoins(scoreBonusCoins);
      }
      const totalMatchCoins = droppedCoins + scoreBonusCoins;

      setFinalCoinsCollected(totalMatchCoins);
      setShowGameOverModal(true);
    },
    [stats.coinsCollected]
  );

  const handleStartGameFromLobby = () => {
    setInLobby(false);
    setIsPaused(false);
    setShowGameOverModal(false);
    setTimeout(() => {
      if ((window as unknown as { restartBazookaGame?: () => void }).restartBazookaGame) {
        (window as unknown as { restartBazookaGame: () => void }).restartBazookaGame();
      }
    }, 50);
  };

  const handleReturnToLobby = () => {
    setIsPaused(false);
    setShowGameOverModal(false);
    setInLobby(true);
  };

  const handleRestart = () => {
    setShowGameOverModal(false);
    setIsPaused(false);
    if ((window as unknown as { restartBazookaGame?: () => void }).restartBazookaGame) {
      (window as unknown as { restartBazookaGame: () => void }).restartBazookaGame();
    }
  };

  // Virtual Controls callbacks
  const handleMoveLeftStart = () => {
    keysRef.current.a = true;
  };
  const handleMoveLeftEnd = () => {
    keysRef.current.a = false;
  };

  const handleMoveRightStart = () => {
    keysRef.current.d = true;
  };
  const handleMoveRightEnd = () => {
    keysRef.current.d = false;
  };

  const handleShoot = () => {
    if (!showGameOverModal && !isPaused) {
      triggerShootRef.current = true;
    }
  };

  const handleReload = () => {
    if (!showGameOverModal && !isPaused) {
      triggerReloadRef.current = true;
    }
  };

  const handleJoinOnlineRoom = (room: OnlineRoom, name: string) => {
    setCurrentOnlineRoom(room);
    setOnlinePlayerName(name);
    setShowOnlineModal(false);
  };

  const handleLeaveOnlineRoom = () => {
    setCurrentOnlineRoom(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {inLobby ? (
        <div className="my-auto w-full flex items-center justify-center py-4">
          <Lobby
            onStartGame={handleStartGameFromLobby}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenInstructions={() => setShowInstructions(true)}
            onOpenOnline={() => setShowOnlineModal(true)}
            gameMode={gameMode}
            onToggleGameMode={(mode) => setGameMode(mode)}
            sfxOn={sfxOn}
            bgmOn={bgmOn}
            onToggleSfx={handleToggleSfx}
            onToggleBgm={handleToggleBgm}
          />
        </div>
      ) : (
        <>
          {/* Header Bar */}
          <header className="w-full max-w-[480px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 shadow-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <h1 className="font-black text-sm text-slate-100 tracking-tight leading-none flex items-center gap-1">
                  바주카 피하기
                </h1>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                  BAZOOKA DODGER
                </span>
              </div>
            </div>

            {/* Top Header Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReturnToLobby}
                className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-amber-300 transition cursor-pointer"
                title="로비로 돌아가기"
              >
                <Home className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleSfx}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  sfxOn
                    ? 'bg-slate-800 border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={`효과음 ${sfxOn ? '끄기' : '켜기'}`}
              >
                {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleBgm}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  bgmOn
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={`배경 음악 ${bgmOn ? '끄기' : '켜기'}`}
              >
                <Music className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSidePanelOpen((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSidePanelOpen
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                }`}
                title="상태창 (Tab 키)"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Tab</span>
              </button>

              <button
                onClick={() => setShowOnlineModal(true)}
                className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentOnlineRoom
                    ? 'bg-gradient-to-r from-blue-900 to-cyan-900 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-cyan-300'
                }`}
                title="실시간 온라인 대전"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>온라인</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-amber-400 transition cursor-pointer"
                title="명예의 전당 (순위)"
              >
                <Trophy className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowInstructions(true)}
                className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
                title="게임 가이드"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-cyan-400 transition cursor-pointer"
                title={isPaused ? '게임 재개' : '일시정지'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-cyan-400" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Main Canvas Game Window */}
          <main className="relative w-full max-w-[480px] flex flex-col items-center justify-center">
            <GameCanvas
              isPaused={isPaused || showGameOverModal}
              onUpdateStats={setStats}
              onGameOver={handleGameOver}
              keysRef={keysRef}
              triggerShootRef={triggerShootRef}
              triggerReloadRef={triggerReloadRef}
              triggerSkillRef={triggerSkillRef}
              gameMode={gameMode}
            />

            {/* HUD Live Overlay */}
            <HUD stats={stats} onReload={handleReload} onUseSkill={handleUseSkill} />
          </main>

          {/* Small indicator notice under canvas */}
          <div className="mt-1 text-[11px] text-cyan-300/90 font-medium tracking-tight bg-slate-900/80 px-3 py-1 rounded-full border border-cyan-500/30 inline-flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>💡 <b>[Tab]</b> 키를 누르면 스킬 및 재장전 상태를 언제든 확인할 수 있습니다</span>
          </div>

          {/* Virtual On-Screen Controller */}
          <ControlsOverlay
            onMoveLeftStart={handleMoveLeftStart}
            onMoveLeftEnd={handleMoveLeftEnd}
            onMoveRightStart={handleMoveRightStart}
            onMoveRightEnd={handleMoveRightEnd}
            onShoot={handleShoot}
            onReload={handleReload}
            onUseSkill={handleUseSkill}
            isReloading={stats.isReloading}
            currentAmmo={stats.currentAmmo}
            maxAmmo={stats.maxAmmo}
            usedSkills={stats.usedSkills}
            equippedCharSkin={stats.equippedCharSkin}
            gameMode={gameMode}
            onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
          />

          {/* Side Status Panel (Toggled via Tab) */}
          <SideStatusPanel
            stats={stats}
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
            onReload={handleReload}
            onUseSkill={handleUseSkill}
          />

          {/* Footer Info */}
          <footer className="mt-2 text-center text-[11px] text-slate-500 font-medium">
            조작: <span className="text-slate-300 font-bold">A/D</span> (이동),{' '}
            <span className="text-slate-300 font-bold">SPACE</span> (발사),{' '}
            <span className="text-amber-400 font-bold">R</span> (재장전),{' '}
            <span className="text-cyan-400 font-bold">Q/C/E/X</span> (스킬),{' '}
            <span className="text-cyan-300 font-bold">Tab</span> (상태창 토글)
          </footer>
        </>
      )}

      {/* Modals */}
      {showGameOverModal && (
        <GameOverModal
          score={finalScore}
          highScore={stats.highScore}
          maxCombo={finalMaxCombo}
          destroyedCount={finalDestroyedCount}
          weapon={finalWeapon}
          coinsCollected={finalCoinsCollected}
          onRestart={handleRestart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onReturnToLobby={handleReturnToLobby}
          onScoreSaved={() => setStats((prev) => ({ ...prev, highScore: getTopScore() }))}
        />
      )}

      {isPaused && !showGameOverModal && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onShowInstructions={() => setShowInstructions(true)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      <OnlineRoomModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        onJoinRoom={handleJoinOnlineRoom}
        currentRoom={currentOnlineRoom}
        onLeaveRoom={handleLeaveOnlineRoom}
      />
    </div>
  );
}
