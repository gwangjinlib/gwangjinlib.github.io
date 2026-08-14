import React from 'react';
import { X, Trophy, Medal } from 'lucide-react';
import { getHighScores } from '../utils/storage';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const scores = getHighScores();

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-sm w-full p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <span>명예의 전당 (Top 10)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores List */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-semibold">
              아직 기록된 점수가 없습니다.<br />게임에서 높은 점수를 달성해 보세요!
            </div>
          ) : (
            scores.map((item, idx) => {
              const isTop3 = idx < 3;
              const rankColor =
                idx === 0
                  ? 'text-amber-400 bg-amber-950/50 border-amber-500/60'
                  : idx === 1
                  ? 'text-slate-300 bg-slate-800/80 border-slate-600'
                  : idx === 2
                  ? 'text-amber-600 bg-amber-950/30 border-amber-700/50'
                  : 'text-slate-400 bg-slate-950/50 border-slate-800';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${rankColor}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-black w-5 text-center text-sm shrink-0">
                      {isTop3 ? (
                        <Medal className="w-4 h-4 inline" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate text-slate-100">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.date} • {item.weaponUsed}</span>
                    </div>
                  </div>

                  <div className="font-mono font-black text-sm text-cyan-400 shrink-0">
                    {item.score.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
