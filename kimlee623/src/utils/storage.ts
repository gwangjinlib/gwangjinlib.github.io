import { HighScore, ShopData, CHARACTER_SKINS, WEAPON_SKINS } from '../types';

const STORAGE_KEY = 'bazooka_dodger_highscores';
const SHOP_STORAGE_KEY = 'bazooka_dodger_shop';

export function getHighScores(): HighScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading high scores', e);
    return [];
  }
}

export function saveHighScore(newScore: HighScore): HighScore[] {
  try {
    const scores = getHighScores();
    scores.push(newScore);
    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);
    // Keep top 10
    const topScores = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  } catch (e) {
    console.error('Error saving high score', e);
    return [];
  }
}

export function getTopScore(): number {
  const scores = getHighScores();
  return scores.length > 0 ? scores[0].score : 0;
}

// Shop Storage Management
const DEFAULT_SHOP_DATA: ShopData = {
  coins: 100, // Initial welcome coins
  ownedCharacters: ['char_default'],
  equippedCharacter: 'char_default',
  ownedWeapons: ['wp_default', 'wp_spiral_phantom'],
  equippedWeapon: 'wp_spiral_phantom', // Default equipped or available
};

export function getShopData(): ShopData {
  try {
    const data = localStorage.getItem(SHOP_STORAGE_KEY);
    if (!data) return DEFAULT_SHOP_DATA;
    const parsed = JSON.parse(data);
    const shop: ShopData = {
      ...DEFAULT_SHOP_DATA,
      ...parsed,
    };
    // Ensure 0-cost free special weapon is available in ownedWeapons
    if (!shop.ownedWeapons.includes('wp_spiral_phantom')) {
      shop.ownedWeapons.push('wp_spiral_phantom');
    }
    return shop;
  } catch (e) {
    console.error('Error reading shop data', e);
    return DEFAULT_SHOP_DATA;
  }
}

export function saveShopData(shopData: ShopData): void {
  try {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(shopData));
  } catch (e) {
    console.error('Error saving shop data', e);
  }
}

export function addCoins(amount: number): ShopData {
  const current = getShopData();
  const updated = { ...current, coins: current.coins + amount };
  saveShopData(updated);
  return updated;
}

export function buyCharacter(skinId: string): { success: boolean; data: ShopData; message?: string } {
  const shop = getShopData();
  const skin = CHARACTER_SKINS.find((s) => s.id === skinId);
  if (!skin) return { success: false, data: shop, message: '캐릭터를 찾을 수 없습니다.' };

  if (shop.ownedCharacters.includes(skinId)) {
    return { success: false, data: shop, message: '이미 소유한 캐릭터입니다.' };
  }

  if (shop.coins < skin.price) {
    return { success: false, data: shop, message: '코인이 부족합니다.' };
  }

  const updated: ShopData = {
    ...shop,
    coins: shop.coins - skin.price,
    ownedCharacters: [...shop.ownedCharacters, skinId],
    equippedCharacter: skinId, // Auto-equip on purchase
  };
  saveShopData(updated);
  return { success: true, data: updated };
}

export function equipCharacter(skinId: string): ShopData {
  const shop = getShopData();
  if (!shop.ownedCharacters.includes(skinId)) return shop;

  const updated: ShopData = {
    ...shop,
    equippedCharacter: skinId,
  };
  saveShopData(updated);
  return updated;
}

export function buyWeapon(skinId: string): { success: boolean; data: ShopData; message?: string } {
  const shop = getShopData();
  const skin = WEAPON_SKINS.find((s) => s.id === skinId);
  if (!skin) return { success: false, data: shop, message: '무기를 찾을 수 없습니다.' };

  if (shop.ownedWeapons.includes(skinId)) {
    return { success: false, data: shop, message: '이미 소유한 무기입니다.' };
  }

  if (shop.coins < skin.price) {
    return { success: false, data: shop, message: '코인이 부족합니다.' };
  }

  const updated: ShopData = {
    ...shop,
    coins: shop.coins - skin.price,
    ownedWeapons: [...shop.ownedWeapons, skinId],
    equippedWeapon: skinId, // Auto-equip on purchase
  };
  saveShopData(updated);
  return { success: true, data: updated };
}

export function equipWeapon(skinId: string): ShopData {
  const shop = getShopData();
  if (!shop.ownedWeapons.includes(skinId)) return shop;

  const updated: ShopData = {
    ...shop,
    equippedWeapon: skinId,
  };
  saveShopData(updated);
  return updated;
}

