import React from 'react';
import { X, Crosshair, Zap, Bomb, Shield, RefreshCw } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-cyan-400 flex items-center gap-2">
            <span>🎮 게임 조작 & 아이템 가이드</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">조작법 (Controls)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1">
              <span className="text-slate-400 font-semibold">좌우 이동</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">A / D 키 또는 ← / →</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1">
              <span className="text-slate-400 font-semibold">바주카 발사</span>
              <span className="font-mono font-bold text-amber-300 text-sm">SpaceBar 키</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1">
              <span className="text-slate-400 font-semibold">수동 재장전</span>
              <span className="font-mono font-bold text-amber-400 text-sm flex items-center gap-1">
                R 키 <RefreshCw className="w-3 h-3" />
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1">
              <span className="text-slate-400 font-semibold">일시 정지</span>
              <span className="font-mono font-bold text-slate-200 text-sm">ESC 키</span>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">파워업 아이템 (Items)</h4>
          <div className="flex flex-col gap-2 text-xs">
            {/* 3-Way */}
            <div className="bg-slate-950/70 border border-blue-500/40 p-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center font-bold text-blue-300 shrink-0">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5" /> 3연발 부채꼴 로켓 (8초)
                </span>
                <span className="text-[11px] text-slate-400">한 번에 3발의 로켓을 넓은 범위로 연사합니다.</span>
              </div>
            </div>

            {/* Laser */}
            <div className="bg-slate-950/70 border border-pink-500/40 p-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-600/30 border border-pink-400 flex items-center justify-center font-bold text-pink-300 shrink-0">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-pink-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 관통 레이저 빔 (6초)
                </span>
                <span className="text-[11px] text-slate-400">탄약 소모 없이 직선상의 모든 장애물을 즉시 파괴합니다.</span>
              </div>
            </div>

            {/* Nuke */}
            <div className="bg-slate-950/70 border border-orange-500/40 p-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600/30 border border-orange-400 flex items-center justify-center text-lg shrink-0">
                💣
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-orange-300 flex items-center gap-1">
                  <Bomb className="w-3.5 h-3.5 text-orange-400" /> 필살기 핵폭탄 (즉시)
                </span>
                <span className="text-[11px] text-slate-400">화면 상의 모든 장애물을 전멸시키고 폭발 점수를 획득합니다.</span>
              </div>
            </div>

            {/* Shield */}
            <div className="bg-slate-950/70 border border-cyan-500/40 p-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-lg shrink-0">
                🛡️
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> 방어막 쉴드 (1회 방어 / 8초)
                </span>
                <span className="text-[11px] text-slate-400">장애물 충돌 피해를 1회 막아내고 플레이어를 보호합니다.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200 font-semibold leading-relaxed">
          💡 <span className="font-bold">꿀팁:</span> 적 장애물을 연속 파괴하면 <span className="text-amber-400 font-black">COMBO</span> 점수 배율이 올라갑니다! 탄약이 떨어지기 전에 <span className="text-cyan-300">R키</span>를 눌러 재장전하세요.
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          확인
        </button>
      </div>
    </div>
  );
};
