import { GameStats } from '../types';

export interface OnlinePlayer {
  id: string;
  name: string;
  score: number;
  combo: number;
  characterId: string;
  isAlive: boolean;
  isHost?: boolean;
  lastActive: number;
}

export interface OnlineChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface OnlineRoom {
  id: string;
  name: string;
  maxPlayers: number;
  players: OnlinePlayer[];
  status: 'waiting' | 'playing';
  createdAt: number;
}

const BROADCAST_CHANNEL_NAME = 'rocket_bazooka_online_v1';
const LOCAL_PLAYER_KEY = 'rocket_bazooka_online_player_name';

export function getStoredPlayerName(): string {
  const saved = localStorage.getItem(LOCAL_PLAYER_KEY);
  if (saved) return saved;
  const newName = `플레이어#${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem(LOCAL_PLAYER_KEY, newName);
  return newName;
}

export function setStoredPlayerName(name: string) {
  localStorage.setItem(LOCAL_PLAYER_KEY, name.trim() || '익명 플레이어');
}

// Initial default public online rooms
export const DEFAULT_ONLINE_ROOMS: OnlineRoom[] = [
  {
    id: 'room_101',
    name: '🔥 [공식] 초보자 격투장 #1',
    maxPlayers: 6,
    status: 'playing',
    createdAt: Date.now(),
    players: [
      { id: 'bot_1', name: 'CyberBazooka', score: 1420, combo: 5, characterId: 'char_default', isAlive: true, lastActive: Date.now() },
      { id: 'bot_2', name: 'CrimsonFire', score: 2850, combo: 8, characterId: 'char_crimson', isAlive: true, lastActive: Date.now() },
      { id: 'bot_3', name: 'EmeraldGuard', score: 910, combo: 2, characterId: 'char_emerald', isAlive: true, lastActive: Date.now() },
    ],
  },
  {
    id: 'room_102',
    name: '🚀 [랭킹] 무한 서바이벌 배틀',
    maxPlayers: 8,
    status: 'playing',
    createdAt: Date.now(),
    players: [
      { id: 'bot_4', name: 'GoldenSovereign', score: 5400, combo: 14, characterId: 'char_gold', isAlive: true, lastActive: Date.now() },
      { id: 'bot_5', name: 'KuronamiShadow', score: 3890, combo: 11, characterId: 'char_kuronami', isAlive: true, lastActive: Date.now() },
      { id: 'bot_6', name: 'ValkyrieAce', score: 4210, combo: 9, characterId: 'char_valkyrie', isAlive: true, lastActive: Date.now() },
    ],
  },
  {
    id: 'room_103',
    name: '🛡️ [클랜] 스킬 난사 방어전',
    maxPlayers: 4,
    status: 'waiting',
    createdAt: Date.now(),
    players: [
      { id: 'bot_7', name: 'SingularityMaster', score: 1200, combo: 4, characterId: 'char_singularity', isAlive: true, lastActive: Date.now() },
    ],
  },
];

// BroadcastChannel setup for cross-tab & multi-user synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment:', e);
}

export function subscribeToOnlineEvents(callback: (event: any) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (e: MessageEvent) => {
    callback(e.data);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function sendOnlineBroadcast(type: string, payload: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {
      console.error('Failed to post online broadcast:', e);
    }
  }
}
