import React from 'react';
import { GameStats } from '../types';
import { Heart, Shield, Zap, Bomb, Crosshair, RefreshCw } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  onReload: () => void;
  onUseSkill?: (key: 'Q' | 'C' | 'E' | 'X') => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, onReload, onUseSkill }) => {
  const {
    score,
    highScore,
    lives,
    maxLives,
    currentAmmo,
    maxAmmo,
    isReloading,
    reloadProgress,
    weapon,
    weaponTimeLeft,
    hasShield,
    shieldTimeLeft,
    combo,
    usedSkills,
    equippedCharSkin,
  } = stats;

  const skillsList = equippedCharSkin?.skills
    ? (['Q', 'C', 'E', 'X'] as const).map((key) => equippedCharSkin.skills[key])
    : [];

  return (
    <div className="absolute inset-x-0 top-0 p-3 pointer-events-none flex flex-col justify-between select-none font-sans">
      {/* Top Bar Stats */}
      <div className="flex items-start justify-between gap-2">
        {/* Score & Combo */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-lg flex flex-col gap-0.5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            SCORE
            {highScore > 0 && (
              <span className="text-[10px] text-amber-400/90 font-mono ml-1">
                BEST: {highScore}
              </span>
            )}
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {score.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            {combo > 1 && (
              <div className="inline-flex items-center gap-1 text-xs font-black text-amber-400 animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>{combo}x COMBO!</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
              <span>🪙</span>
              <span>+{stats.coinsCollected || 0}</span>
            </div>
          </div>
        </div>

        {/* Lives & Power-Up Status */}
        <div className="flex flex-col items-end gap-2">
          {/* Hearts */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-lg flex items-center gap-1.5">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-all duration-300 ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)] scale-100'
                    : 'text-slate-700 fill-slate-800 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Active Weapon / Shield Badges */}
          <div className="flex items-center gap-1.5">
            {hasShield && (
              <div className="bg-cyan-950/90 border border-cyan-500/60 rounded-lg px-2.5 py-1 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse">
                <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
                <span>쉴드</span>
                <span className="font-mono text-[11px] text-cyan-200">({shieldTimeLeft}s)</span>
              </div>
            )}

            {weapon !== 'normal' && (
              <div
                className={`rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 border shadow-md ${
                  weapon === '3way'
                    ? 'bg-blue-950/90 border-blue-500/60 text-blue-300 shadow-blue-500/20'
                    : 'bg-pink-950/90 border-pink-500/60 text-pink-300 shadow-pink-500/20'
                }`}
              >
                {weapon === '3way' ? (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                    <span>3연발</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
                    <span>레이저</span>
                  </>
                )}
                <span className="font-mono text-[11px]">({weaponTimeLeft}s)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
