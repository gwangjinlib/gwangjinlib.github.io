import React, { useState } from 'react';
import { RotateCcw, Trophy, Award, Zap, Crosshair } from 'lucide-react';
import { saveHighScore } from '../utils/storage';

interface GameOverModalProps {
  score: number;
  highScore: number;
  maxCombo: number;
  destroyedCount: number;
  weapon: string;
  coinsCollected?: number;
  onRestart: () => void;
  onShowLeaderboard: () => void;
  onReturnToLobby?: () => void;
  onScoreSaved?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  maxCombo,
  destroyedCount,
  weapon,
  coinsCollected = 0,
  onRestart,
  onShowLeaderboard,
  onReturnToLobby,
  onScoreSaved,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const isNewRecord = score > 0 && score >= highScore;

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const nameToSave = playerName.trim().substring(0, 10);
    saveHighScore({
      name: nameToSave,
      score: score,
      date: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      weaponUsed: weapon === '3way' ? '3연발' : weapon === 'laser' ? '레이저' : '일반 로켓'
    });
    setIsSaved(true);
    onScoreSaved?.();
  };

  const scoreBonusCoins = Math.floor(score / 40);
  const droppedCoins = Math.max(0, coinsCollected - scoreBonusCoins);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-red-500/70 rounded-2xl max-w-sm w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center flex flex-col items-center gap-4">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 font-black tracking-widest text-lg shadow-inner">
          GAME OVER
        </div>

        {/* New Record Banner */}
        {isNewRecord && (
          <div className="w-full bg-amber-500/20 border border-amber-500/60 rounded-xl p-2 flex items-center justify-center gap-2 text-amber-300 font-bold text-sm animate-bounce">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/30" />
            <span>🎉 최고 기록 달성!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">최종 점수</span>
            <span className="text-2xl font-black font-mono text-cyan-400">{score.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-800 w-full" />
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">최대 콤보:</span>
              <span className="font-bold text-amber-300 ml-auto">{maxCombo}x</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <Crosshair className="w-4 h-4 text-red-400" />
              <span className="text-slate-400">파괴 격추:</span>
              <span className="font-bold text-red-300 ml-auto">{destroyedCount}개</span>
            </div>
          </div>

          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 flex flex-col gap-1 text-xs text-amber-300">
            <div className="flex justify-between items-center text-slate-300 text-[11px]">
              <span>필드 드롭 코인:</span>
              <span className="font-mono text-slate-200">+{droppedCoins} 🪙</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 text-[11px]">
              <span>점수 달성 보상:</span>
              <span className="font-mono text-amber-300">+{scoreBonusCoins} 🪙</span>
            </div>
            <div className="h-px bg-amber-500/30 my-0.5" />
            <div className="flex justify-between items-center font-bold">
              <span>🪙 총 획득 코인:</span>
              <span className="text-sm font-black text-amber-400">+{coinsCollected} 코인</span>
            </div>
          </div>
        </div>

        {/* High Score Name Input Form */}
        {!isSaved ? (
          <form onSubmit={handleSaveScore} className="w-full flex flex-col gap-2">
            <label className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>명예의 전당에 점수 기록하기</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="플레이어 이름 (최대 10자)"
                maxLength={10}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none text-center font-bold"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                저장
              </button>
            </div>
          </form>
        ) : (
          <div className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 rounded-xl py-2 px-3 w-full">
            ✅ 명예의 전당에 저장되었습니다!
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={onShowLeaderboard}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>순위 보기</span>
            </button>

            {onReturnToLobby && (
              <button
                onClick={onReturnToLobby}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>🏠 로비로</span>
              </button>
            )}
          </div>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 시작 [Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
