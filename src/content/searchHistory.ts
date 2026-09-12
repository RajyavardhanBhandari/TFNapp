import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@tfn/search-history';
const LIMIT = 8;

export async function getSearchHistory(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, LIMIT) : [];
  } catch { return []; }
}

export async function addSearchHistory(query: string): Promise<string[]> {
  const normalized = query.trim();
  if (!normalized) return getSearchHistory();
  const history = await getSearchHistory();
  const next = [normalized, ...history.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, LIMIT);
  try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch { /* history is best effort */ }
  return next;
}

export async function removeSearchHistory(query: string): Promise<string[]> {
  const history = await getSearchHistory();
  const next = history.filter((item) => item.toLowerCase() !== query.trim().toLowerCase());
  try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch { /* history is best effort */ }
  return next;
}

export async function clearSearchHistory(): Promise<void> {
  try { await AsyncStorage.removeItem(KEY); } catch { /* history is best effort */ }
}
