import React, { useState, useEffect } from 'react';
import {
  OnlineRoom,
  OnlinePlayer,
  OnlineChatMessage,
  DEFAULT_ONLINE_ROOMS,
  getStoredPlayerName,
  setStoredPlayerName,
  subscribeToOnlineEvents,
  sendOnlineBroadcast,
} from '../utils/onlineRoom';
import {
  Globe,
  Users,
  Plus,
  Play,
  Send,
  X,
  MessageSquare,
  Trophy,
  UserCheck,
  Zap,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (room: OnlineRoom, playerName: string) => void;
  currentRoom: OnlineRoom | null;
  onLeaveRoom: () => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  currentRoom,
  onLeaveRoom,
}) => {
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [rooms, setRooms] = useState<OnlineRoom[]>(DEFAULT_ONLINE_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room_101');
  const [chatMessages, setChatMessages] = useState<OnlineChatMessage[]>([
    {
      id: 'msg_1',
      sender: '시스템',
      text: '🌐 온라인 서버에 접속했습니다! 방에 참여하여 함께 대결하세요.',
      timestamp: '방금 전',
      isSystem: true,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Handle cross-tab broadcast events
  useEffect(() => {
    const unsubscribe = subscribeToOnlineEvents((event) => {
      if (event.type === 'CHAT_MESSAGE') {
        setChatMessages((prev) => [...prev, event.payload]);
      } else if (event.type === 'ROOM_LIST_UPDATE') {
        setRooms(event.payload);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const activeRoom = currentRoom || rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleSaveName = () => {
    setStoredPlayerName(playerName);
    setIsEditingName(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: OnlineChatMessage = {
      id: Math.random().toString(),
      sender: playerName,
      text: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    sendOnlineBroadcast('CHAT_MESSAGE', newMsg);
    setInputMsg('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: OnlineRoom = {
      id: `room_${Date.now()}`,
      name: `🚀 ${newRoomName.trim()}`,
      maxPlayers: 6,
      status: 'playing',
      createdAt: Date.now(),
      players: [
        {
          id: `player_${Date.now()}`,
          name: playerName,
          score: 0,
          combo: 0,
          characterId: 'char_default',
          isAlive: true,
          isHost: true,
          lastActive: Date.now(),
        },
      ],
    };

    const updatedRooms = [newRoom, ...rooms];
    setRooms(updatedRooms);
    sendOnlineBroadcast('ROOM_LIST_UPDATE', updatedRooms);

    setShowCreateModal(false);
    setNewRoomName('');
    onJoinRoom(newRoom, playerName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Globe className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>실시간 온라인 대전 로비</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono">
                  LIVE MULTIPLAYER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                전 세계 플레이어와 함께 멀티플레이 대결에 참가하세요!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Name Tag */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              {isEditingName ? (
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-bold focus:outline-none w-28"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                  title="닉네임 변경하기"
                >
                  <span>{playerName}</span>
                  <span className="text-[10px] text-slate-500">(수정)</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 overflow-hidden">
          {/* Left Column: Room List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 flex flex-col gap-3 bg-slate-950/40 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>공개 대전방 목록</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>방 만들기</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const isCurrent = currentRoom?.id === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : isSelected
                        ? 'bg-slate-800/90 border-cyan-500/70'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-100 truncate max-w-[200px]">
                        {room.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-cyan-300">
                        {room.players.length} / {room.maxPlayers} 명
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-emerald-400 font-semibold">실시간 게임 진행 중</span>
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-amber-400 font-black flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />참여중
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Room Details & Chat (7 cols) */}
          <div className="md:col-span-7 p-4 flex flex-col justify-between gap-3 bg-slate-900/60 overflow-hidden">
            {/* Room Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-cyan-300 flex items-center gap-2">
                  <span>{activeRoom.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  현재 참가 인원: {activeRoom.players.length}명 / 최대 {activeRoom.maxPlayers}명
                </p>
              </div>

              {currentRoom?.id === activeRoom.id ? (
                <button
                  onClick={onLeaveRoom}
                  className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
                >
                  퇴장하기
                </button>
              ) : (
                <button
                  onClick={() => onJoinRoom(activeRoom, playerName)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>온라인 대전 참가</span>
                </button>
              )}
            </div>

            {/* Players Live Rank Board */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
              <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>방 참가자 실시간 점수 순위</span>
              </h5>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {activeRoom.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-200">
                        {p.name} {p.name === playerName ? '(나)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-cyan-400 font-extrabold">{p.score.toLocaleString()} P</span>
                      {p.combo > 1 && (
                        <span className="text-amber-400 font-bold text-[10px]">
                          ⚡ {p.combo}x
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Window */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 flex-1 min-h-[160px] overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>실시간 멀티 채팅</span>
                </span>
                <span className="text-[10px] text-slate-500">모든 방 공용</span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 p-1 font-sans text-xs max-h-32">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-1.5 rounded-lg text-xs leading-relaxed ${
                      msg.isSystem
                        ? 'bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 font-semibold text-center'
                        : msg.sender === playerName
                        ? 'bg-slate-800 text-slate-100 self-end max-w-[85%] border border-slate-700'
                        : 'bg-slate-900 text-slate-300 self-start max-w-[85%] border border-slate-800'
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-bold mb-0.5">
                        <span className="text-cyan-300">{msg.sender}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="메시지를 입력하세요 (예: 파이팅! 🔥)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl font-bold text-xs transition flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Sub-Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-5 w-full max-w-md flex flex-col gap-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>새로운 온라인 방 개설</span>
            </h3>

            <form onSubmit={handleCreateRoom} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">방 제목</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="예: 초보자 모두 모여라! 🔥"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow"
                >
                  방 생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
