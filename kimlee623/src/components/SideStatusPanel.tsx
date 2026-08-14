import React from 'react';
import { GameStats } from '../types';
import { RefreshCw, Zap, Shield, Flame, Sparkles, Crosshair, Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SideStatusPanelProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  onUseSkill: (key: 'Q' | 'C' | 'E' | 'X') => void;
}

export const SideStatusPanel: React.FC<SideStatusPanelProps> = ({
  stats,
  isOpen,
  onClose,
  onReload,
  onUseSkill,
}) => {
  if (!isOpen) return null;

  const {
    currentAmmo,
    maxAmmo,
    isReloading,
    reloadProgress,
    weapon,
    usedSkills,
    equippedCharSkin,
  } = stats;

  const skillsList = equippedCharSkin?.skills
    ? (['Q', 'C', 'E', 'X'] as const).map((key) => equippedCharSkin.skills[key])
    : [];

  return (
    <aside className="fixed top-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/60 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] text-slate-100 p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-extrabold text-sm tracking-wide text-cyan-300 uppercase flex items-center gap-1.5">
            <span>Tab 상태 패널</span>
            <span className="text-[10px] bg-cyan-950 border border-cyan-500/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">
              ON
            </span>
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          title="닫기 (Tab 키)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section 1: Reload & Ammo Status */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-300">
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
            <span>재장전 & 탄약 상태</span>
          </span>
          <button
            onClick={onReload}
            disabled={isReloading || currentAmmo === maxAmmo || weapon === 'laser'}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-500/50 disabled:opacity-30 text-amber-300 font-mono text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>재장전 [R]</span>
          </button>
        </div>

        {weapon === 'laser' ? (
          <div className="bg-pink-950/60 border border-pink-500/40 rounded-lg p-2 text-center text-xs font-bold text-pink-300 animate-pulse">
            무제한 둠 레이저 가동 중!
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">보유 탄약:</span>
              <span className="font-extrabold text-amber-400 text-sm">
                {currentAmmo} / {maxAmmo}
              </span>
            </div>
            {/* Ammo Gauge */}
            <div className="grid grid-cols-6 gap-1 h-3">
              {Array.from({ length: maxAmmo }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm border transition-all duration-200 ${
                    i < currentAmmo
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reloading Progress Indicator */}
        {isReloading && (
          <div className="flex flex-col gap-1 mt-1 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg">
            <div className="flex justify-between text-[11px] font-mono text-amber-400 font-bold">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                RELOADING...
              </span>
              <span>{Math.floor(reloadProgress * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-500/40">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75"
                style={{ width: `${reloadProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Character Skills Status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>캐릭터 스킬 (한 게임당 1회)</span>
          </span>
          {equippedCharSkin && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              {equippedCharSkin.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {skillsList.map((skill) => {
            const isUsed = usedSkills?.[skill.key];
            const isUlt = skill.key === 'X';

            return (
              <div
                key={skill.key}
                className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isUsed
                    ? 'bg-slate-950/70 border-slate-800 opacity-60'
                    : isUlt
                    ? 'bg-gradient-to-r from-amber-950/80 to-red-950/80 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{skill.icon}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-100">
                          {skill.name}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-black px-1.5 py-0.2 rounded ${
                            isUlt
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {skill.key}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        {skill.description}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUsed}
                    onClick={() => onUseSkill(skill.key)}
                    className={`shrink-0 ml-2 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      isUsed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : isUlt
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-black active:scale-95'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                    }`}
                  >
                    {isUsed ? (
                      <span className="flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                        완료
                      </span>
                    ) : (
                      <span>사용 [{skill.key}]</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 text-center bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
        ⌨️ 키보드 <span className="font-mono font-bold text-cyan-300">Tab</span> 키를 눌러 이 창을 언제든 토글할 수 있습니다.
      </div>
    </aside>
  );
};
