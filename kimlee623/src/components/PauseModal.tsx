import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, HelpCircle, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
  onReturnToLobby?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onShowInstructions,
  onShowLeaderboard,
  onReturnToLobby,
}) => {
  const [sfxOn, setSfxOn] = React.useState(soundEngine.isSfxOn());
  const [bgmOn, setBgmOn] = React.useState(soundEngine.isBgmOn());

  const handleToggleSfx = () => {
    setSfxOn(soundEngine.toggleSfx());
  };

  const handleToggleBgm = () => {
    setBgmOn(soundEngine.toggleBgm());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-xs w-full p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] text-center flex flex-col items-center gap-4">
        {/* Title */}
        <h2 className="text-xl font-black tracking-wider text-cyan-400 flex items-center gap-2">
          <span>PAUSED</span>
        </h2>

        {/* Action Options */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>게임 재개 (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>다시 시작</span>
          </button>

          {onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>🏠 로비로 돌아가기</span>
            </button>
          )}
        </div>

        {/* Audio Toggles */}
        <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleToggleSfx}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              sfxOn
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {sfxOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span>효과음 {sfxOn ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleToggleBgm}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              bgmOn
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            <Music className={`w-4 h-4 ${bgmOn ? 'text-purple-400' : ''}`} />
            <span>배경음 {bgmOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onShowInstructions}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>조작 설명</span>
          </button>

          <button
            onClick={onShowLeaderboard}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>순위표</span>
          </button>
        </div>
      </div>
    </div>
  );
};
