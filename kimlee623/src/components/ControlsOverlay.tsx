import React from 'react';
import { ArrowLeft, ArrowRight, Crosshair, RefreshCw, Zap } from 'lucide-react';
import { CharacterSkin } from '../types';

interface ControlsOverlayProps {
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onShoot: () => void;
  onReload: () => void;
  onUseSkill?: (key: 'Q' | 'C' | 'E' | 'X') => void;
  onToggleSidePanel?: () => void;
  gameMode?: 'pc' | 'mobile';
  isReloading: boolean;
  currentAmmo: number;
  maxAmmo: number;
  usedSkills?: { Q: boolean; C: boolean; E: boolean; X: boolean };
  equippedCharSkin?: CharacterSkin;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onShoot,
  onReload,
  onUseSkill,
  onToggleSidePanel,
  gameMode = 'pc',
  isReloading,
  currentAmmo,
  maxAmmo,
  usedSkills,
  equippedCharSkin,
}) => {
  const isMobile = gameMode === 'mobile';

  const skillKeys: ('Q' | 'C' | 'E' | 'X')[] = ['Q', 'C', 'E', 'X'];

  return (
    <div className="w-full max-w-[480px] mt-2 px-2 flex flex-col gap-2 select-none">
      {/* Mobile-Mode Quick Skill & Status Bar */}
      {isMobile && onUseSkill && equippedCharSkin && (
        <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-md">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {skillKeys.map((key) => {
              const skill = equippedCharSkin.skills[key];
              const isUsed = usedSkills?.[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onUseSkill(key)}
                  disabled={isUsed}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer ${
                    isUsed
                      ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                      : key === 'X'
                      ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-800 border-cyan-500/60 text-cyan-300 active:scale-95'
                  }`}
                  title={`${skill.name} (${key}스킬)`}
                >
                  <span className="text-sm">{skill.icon}</span>
                  <span className="font-mono text-[11px] font-black">{key}</span>
                  {isUsed && <span className="text-[9px] text-red-400">사용됨</span>}
                </button>
              );
            })}
          </div>

          {onToggleSidePanel && (
            <button
              type="button"
              onClick={onToggleSidePanel}
              className="px-2.5 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>상태</span>
            </button>
          )}
        </div>
      )}

      {/* Main Movement & Shooting Controls */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Directional Movement Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={onMoveLeftStart}
            onMouseUp={onMoveLeftEnd}
            onMouseLeave={onMoveLeftEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              onMoveLeftStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onMoveLeftEnd();
            }}
            className={`${
              isMobile ? 'w-20 h-16' : 'w-16 h-14'
            } bg-slate-800/90 active:bg-slate-700 hover:bg-slate-750 border-2 border-slate-600 active:border-cyan-400 rounded-2xl flex flex-col items-center justify-center text-slate-200 active:text-cyan-300 shadow-lg active:scale-95 transition-all cursor-pointer touch-none`}
            title="왼쪽 이동 (A키 / ←)"
          >
            <ArrowLeft className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
            <span className="text-[10px] font-mono text-slate-400">◀ 좌</span>
          </button>

          <button
            type="button"
            onMouseDown={onMoveRightStart}
            onMouseUp={onMoveRightEnd}
            onMouseLeave={onMoveRightEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              onMoveRightStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onMoveRightEnd();
            }}
            className={`${
              isMobile ? 'w-20 h-16' : 'w-16 h-14'
            } bg-slate-800/90 active:bg-slate-700 hover:bg-slate-750 border-2 border-slate-600 active:border-cyan-400 rounded-2xl flex flex-col items-center justify-center text-slate-200 active:text-cyan-300 shadow-lg active:scale-95 transition-all cursor-pointer touch-none`}
            title="오른쪽 이동 (D키 / →)"
          >
            <ArrowRight className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
            <span className="text-[10px] font-mono text-slate-400">우 ▶</span>
          </button>
        </div>

        {/* Actions: Reload & Shoot */}
        <div className="flex items-center gap-2">
          {/* Reload Button */}
          <button
            type="button"
            onClick={onReload}
            disabled={isReloading || currentAmmo === maxAmmo}
            className={`${
              isMobile ? 'w-16 h-16' : 'w-14 h-14'
            } bg-amber-950/80 active:bg-amber-900 hover:bg-amber-900/60 border-2 border-amber-600/70 active:border-amber-400 disabled:opacity-40 rounded-2xl flex flex-col items-center justify-center text-amber-300 shadow-lg active:scale-95 transition-all cursor-pointer touch-none disabled:cursor-not-allowed`}
            title="재장전 (R키)"
          >
            <RefreshCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-mono text-amber-400">R</span>
          </button>

          {/* Shoot Button */}
          <button
            type="button"
            onClick={onShoot}
            className={`${
              isMobile ? 'w-28 h-16' : 'w-24 h-14'
            } bg-gradient-to-r from-red-600 to-amber-600 active:from-red-500 active:to-amber-500 hover:from-red-500 hover:to-amber-500 border-2 border-red-400 rounded-2xl flex items-center justify-center gap-1.5 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all cursor-pointer touch-none`}
            title="바주카 발사 (Space키)"
          >
            <Crosshair className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'} text-yellow-300 animate-pulse`} />
            <div className="flex flex-col items-start leading-tight">
              <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-black tracking-wider`}>발사</span>
              <span className="text-[9px] font-mono opacity-80">FIRE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
