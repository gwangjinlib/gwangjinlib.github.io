import React, { useState, useEffect } from 'react';
import {
  Coins,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Play,
  Trophy,
  Sparkles,
  User,
  Crosshair,
  Volume2,
  VolumeX,
  Music,
  HelpCircle,
  Flame,
  Globe,
  Smartphone,
  Monitor,
  X,
  Info,
} from 'lucide-react';
import {
  CHARACTER_SKINS,
  WEAPON_SKINS,
  CharacterSkin,
  WeaponSkin,
  ShopData,
} from '../types';
import {
  getShopData,
  buyCharacter,
  equipCharacter,
  buyWeapon,
  equipWeapon,
  getTopScore,
} from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { WeaponGraphic } from './WeaponGraphic';

interface LobbyProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenInstructions: () => void;
  onOpenOnline?: () => void;
  gameMode?: 'pc' | 'mobile';
  onToggleGameMode?: (mode: 'pc' | 'mobile') => void;
  sfxOn: boolean;
  bgmOn: boolean;
  onToggleSfx: () => void;
  onToggleBgm: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenInstructions,
  onOpenOnline,
  gameMode = 'pc',
  onToggleGameMode,
  sfxOn,
  bgmOn,
  onToggleSfx,
  onToggleBgm,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'character' | 'weapon'>('main');
  const [shopData, setShopData] = useState<ShopData>(getShopData());
  const [message, setMessage] = useState<string | null>(null);
  const [selectedCharDetail, setSelectedCharDetail] = useState<CharacterSkin | null>(null);

  const topScore = getTopScore();

  useEffect(() => {
    setShopData(getShopData());
  }, []);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  const handleBuyCharacter = (skin: CharacterSkin) => {
    const res = buyCharacter(skin.id);
    if (res.success) {
      setShopData(res.data);
      soundEngine.playItemPickup();
      showToast(`✨ ${skin.name} 캐릭터를 구매 및 장착했습니다!`);
    } else {
      showToast(`⚠️ ${res.message || '구매에 실패했습니다.'}`);
    }
  };

  const handleEquipCharacter = (skinId: string) => {
    const updated = equipCharacter(skinId);
    setShopData(updated);
    soundEngine.playReload();
    const skin = CHARACTER_SKINS.find((s) => s.id === skinId);
    if (skin) showToast(`🛡️ ${skin.name} 장착 완료!`);
  };

  const handleBuyWeapon = (skin: WeaponSkin) => {
    const res = buyWeapon(skin.id);
    if (res.success) {
      setShopData(res.data);
      soundEngine.playItemPickup();
      showToast(`🚀 ${skin.name} 무기를 구매 및 장착했습니다!`);
    } else {
      showToast(`⚠️ ${res.message || '구매에 실패했습니다.'}`);
    }
  };

  const handleEquipWeapon = (skinId: string) => {
    const updated = equipWeapon(skinId);
    setShopData(updated);
    soundEngine.playReload();
    const skin = WEAPON_SKINS.find((s) => s.id === skinId);
    if (skin) showToast(`⚡ ${skin.name} 장착 완료!`);
  };

  const equippedChar =
    CHARACTER_SKINS.find((s) => s.id === shopData.equippedCharacter) || CHARACTER_SKINS[0];
  const equippedWp =
    WEAPON_SKINS.find((s) => s.id === shopData.equippedWeapon) || WEAPON_SKINS[0];

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case '전설':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case '영웅':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case '희귀':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="w-full max-w-[760px] bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative overflow-hidden select-none">
      {/* Background Neon Aura */}
      <div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: equippedChar.glowColor }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: equippedWp.glowColor }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.5)]">
            <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
              바주카 기지 로비
            </h1>
            <span className="text-xs text-amber-400 font-extrabold tracking-wider mt-1 block">
              BAZOOKA HANGAR HQ
            </span>
          </div>
        </div>

        {/* Currency & Audio controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/70 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-black text-amber-300 text-base sm:text-lg tracking-wide">
              {shopData.coins.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSfx}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                sfxOn
                  ? 'bg-slate-800 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
              title="효과음"
            >
              {sfxOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={onToggleBgm}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                bgmOn
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
              title="배경음악"
            >
              <Music className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-amber-400/80 text-amber-200 text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {message}
        </div>
      )}

      {/* Mode Choice Selector: PC Mode vs Mobile Mode */}
      <div className="bg-slate-950/90 p-2 sm:p-2.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">조작 모드 선택:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onToggleGameMode?.('pc')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              gameMode === 'pc'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-extrabold'
                : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>💻 PC 키보드 모드</span>
          </button>
          <button
            onClick={() => onToggleGameMode?.('mobile')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              gameMode === 'mobile'
                ? 'bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-extrabold'
                : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>📱 모바일 터치 모드</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 z-10">
        <button
          onClick={() => setActiveTab('main')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'main'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          메인 로비
        </button>
        <button
          onClick={() => setActiveTab('character')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'character'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          캐릭터 연구소 ({shopData.ownedCharacters.length}/{CHARACTER_SKINS.length})
        </button>
        <button
          onClick={() => setActiveTab('weapon')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'weapon'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          무기 격납고 ({shopData.ownedWeapons.length}/{WEAPON_SKINS.length})
        </button>
      </div>

      {/* Tab Contents */}
      {/* TAB 1: MAIN LOBBY */}
      {activeTab === 'main' && (
        <div className="flex flex-col gap-4 z-10 animate-fade-in">
          {/* Expanded Hangar Preview Platform */}
          <div className="relative w-full h-56 sm:h-64 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center overflow-hidden group">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-40" />

            {/* Glowing Pedestal */}
            <div
              className="absolute bottom-7 w-48 h-12 rounded-full blur-lg opacity-70 animate-pulse"
              style={{ backgroundColor: equippedChar.glowColor }}
            />
            <div className="absolute bottom-8 w-44 h-4 rounded-full bg-slate-800 border border-slate-700 shadow-inner" />

            {/* Visual Tank & Bazooka Rendering */}
            <div className="relative z-10 flex flex-col items-center mb-3 transition-transform duration-300 group-hover:scale-110">
              {/* Detailed Bazooka Weapon Graphic */}
              <div className="-mb-2 z-10">
                <WeaponGraphic skin={equippedWp} size={84} />
              </div>

              {/* Turret */}
              <div
                className="w-12 h-12 rounded-full border-2 border-slate-950 -mt-4 shadow-md flex items-center justify-center relative z-20"
                style={{ backgroundColor: equippedChar.accentColor }}
              >
                <div className="w-5 h-5 rounded-full bg-slate-950/60 border border-white/40" />
              </div>
              {/* Tank Body */}
              <div
                className="w-20 h-10 rounded-xl border-2 border-slate-950 -mt-2 shadow-2xl flex items-center justify-center relative z-20"
                style={{
                  backgroundColor: equippedChar.bodyColor,
                  boxShadow: `0 0 20px ${equippedChar.glowColor}`,
                }}
              >
                <div className="w-14 h-2.5 rounded bg-slate-950/40" />
              </div>
            </div>

            {/* Currently Equipped Info Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-md">
              <span className="text-xs sm:text-sm font-extrabold text-slate-200">
                🛡️ {equippedChar.name}
              </span>
              <span className="text-xs text-slate-600">|</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                🚀 {equippedWp.name}
              </span>
            </div>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-bold">최고 점수 기록</div>
                <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
                  {topScore.toLocaleString()}점
                </div>
              </div>
              <Trophy className="w-7 h-7 text-amber-400/70" />
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-bold">보유 무기 코인</div>
                <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
                  {shopData.coins.toLocaleString()} 코인
                </div>
              </div>
              <Coins className="w-7 h-7 text-amber-400/70" />
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={onStartGame}
            className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition active:scale-98 flex items-center justify-center gap-3 cursor-pointer border border-amber-300/60 tracking-tight"
          >
            <Play className="w-7 h-7 fill-slate-950" />
            출격! 게임 시작 (Start Game)
          </button>

          {/* Secondary Lobby Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenOnline}
              className="py-3 bg-gradient-to-r from-blue-900 to-cyan-900 hover:from-blue-800 hover:to-cyan-800 border border-cyan-500/60 rounded-xl text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>온라인 로비</span>
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>리더보드</span>
            </button>
            <button
              onClick={onOpenInstructions}
              className="py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>가이드</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER SHOP */}
      {activeTab === 'character' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 max-h-[480px] overflow-y-auto pr-1.5">
          {CHARACTER_SKINS.map((skin) => {
            const isOwned = shopData.ownedCharacters.includes(skin.id);
            const isEquipped = shopData.equippedCharacter === skin.id;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  isEquipped
                    ? 'bg-slate-800/90 border-cyan-500/80 shadow-[0_0_18px_rgba(6,182,212,0.25)]'
                    : isOwned
                    ? 'bg-slate-950/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Skin Icon & Color Preview */}
                <div
                  onClick={() => setSelectedCharDetail(skin)}
                  className="flex items-start gap-3 cursor-pointer group/card"
                >
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-slate-950 flex items-center justify-center shrink-0 shadow-md transition-transform group-hover/card:scale-105"
                    style={{
                      backgroundColor: skin.bodyColor,
                      boxShadow: `0 0 12px ${skin.glowColor}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-slate-950"
                      style={{ backgroundColor: skin.accentColor }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-100 truncate group-hover/card:text-cyan-300 transition">
                        {skin.name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getRarityBadge(
                          skin.rarity
                        )}`}
                      >
                        {skin.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-tight mt-1">
                      {skin.description}
                    </p>
                  </div>
                </div>

                {/* Skill Chips Preview Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCharDetail(skin)}
                  className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-xl text-[11px] font-bold text-cyan-300 flex items-center justify-between gap-1 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>스킬 능력치 ({Object.keys(skin.skills).length}개)</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    {Object.values(skin.skills).map((s) => (
                      <span key={s.key} title={s.name}>
                        {s.icon}
                      </span>
                    ))}
                    <span className="text-cyan-400 ml-0.5">상세보기 &gt;</span>
                  </div>
                </button>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  {isEquipped ? (
                    <div className="w-full text-center py-1.5 bg-cyan-950 border border-cyan-500/60 rounded-xl text-cyan-400 font-black text-xs flex items-center justify-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      장착중
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquipCharacter(skin.id)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      장착하기
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCharacter(skin)}
                      disabled={shopData.coins < skin.price}
                      className={`w-full py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        shopData.coins >= skin.price
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {skin.price.toLocaleString()} 코인
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: WEAPON SHOP */}
      {activeTab === 'weapon' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 max-h-[480px] overflow-y-auto pr-1.5">
          {WEAPON_SKINS.map((skin) => {
            const isOwned = shopData.ownedWeapons.includes(skin.id);
            const isEquipped = shopData.equippedWeapon === skin.id;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  isEquipped
                    ? 'bg-slate-800/90 border-purple-500/80 shadow-[0_0_18px_rgba(168,85,247,0.25)]'
                    : isOwned
                    ? 'bg-slate-950/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Weapon Icon Preview */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 relative shadow-md p-1 overflow-hidden"
                    style={{
                      boxShadow: `0 0 14px ${skin.glowColor}33`,
                    }}
                  >
                    <WeaponGraphic skin={skin} size={58} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-black text-sm text-slate-100">{skin.name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getRarityBadge(
                          skin.rarity
                        )}`}
                      >
                        {skin.rarity}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {skin.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-tight mt-1">
                      {skin.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  {isEquipped ? (
                    <div className="w-full text-center py-1.5 bg-purple-950 border border-purple-500/60 rounded-xl text-purple-300 font-black text-xs flex items-center justify-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-300" />
                      장착중
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquipWeapon(skin.id)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      장착하기
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyWeapon(skin)}
                      disabled={shopData.coins < skin.price}
                      className={`w-full py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        shopData.coins >= skin.price
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {skin.price.toLocaleString()} 코인
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Ability Detail Modal */}
      {selectedCharDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div
            className="w-full max-w-lg bg-slate-900 border-2 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden"
            style={{ borderColor: selectedCharDetail.glowColor }}
          >
            {/* Background Glow */}
            <div
              className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: selectedCharDetail.glowColor }}
            />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-13 h-13 rounded-2xl border-2 border-slate-950 flex items-center justify-center shrink-0 shadow-lg"
                  style={{
                    backgroundColor: selectedCharDetail.bodyColor,
                    boxShadow: `0 0 16px ${selectedCharDetail.glowColor}`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-slate-950"
                    style={{ backgroundColor: selectedCharDetail.accentColor }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg sm:text-xl text-slate-100">{selectedCharDetail.name}</h2>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded border ${getRarityBadge(
                        selectedCharDetail.rarity
                      )}`}
                    >
                      {selectedCharDetail.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedCharDetail.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCharDetail(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Skills Title */}
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm tracking-wide z-10">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>전용 스킬 및 고유 특수 능력</span>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 z-10">
              {(['Q', 'C', 'E', 'X'] as const).map((key) => {
                const sk = selectedCharDetail.skills[key];
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border flex flex-col gap-1.5 ${
                      key === 'X'
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{sk.icon}</span>
                        <span className="font-black text-xs sm:text-sm text-slate-100">{sk.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono">
                          [{key}키]
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sk.badge}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {sk.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 z-10">
              {shopData.equippedCharacter === selectedCharDetail.id ? (
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 현재 장착 중인 캐릭터
                </span>
              ) : shopData.ownedCharacters.includes(selectedCharDetail.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    handleEquipCharacter(selectedCharDetail.id);
                    setSelectedCharDetail(null);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  이 캐릭터 장착
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleBuyCharacter(selectedCharDetail);
                    setSelectedCharDetail(null);
                  }}
                  disabled={shopData.coins < selectedCharDetail.price}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition cursor-pointer ${
                    shopData.coins >= selectedCharDetail.price
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  {selectedCharDetail.price.toLocaleString()} 코인 구매
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCharDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
