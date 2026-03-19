// chrome.storage 封装

import { STORAGE_KEYS } from './constants';

/** 读取缩放级别 */
export async function readZoom(): Promise<number> {
  try {
    const key = STORAGE_KEYS.zoom;
    const data = await chrome.storage.local.get([key]);
    const stored = Number(data[key]);
    return Number.isFinite(stored) ? stored : 100;
  } catch {
    return 100;
  }
}

/** 保存缩放级别 */
export function writeZoom(zoom: number): void {
  try {
    chrome.storage.local.set({ [STORAGE_KEYS.zoom]: zoom });
  } catch {
    // 静默失败
  }
}

/** 读取悬浮球开关 */
export async function readFabEnabled(): Promise<boolean> {
  try {
    const data = await chrome.storage.local.get([STORAGE_KEYS.fabEnabled]);
    return data[STORAGE_KEYS.fabEnabled] !== false; // 默认开启
  } catch {
    return true;
  }
}

/** 保存悬浮球开关 */
export function writeFabEnabled(enabled: boolean): void {
  try {
    chrome.storage.local.set({ [STORAGE_KEYS.fabEnabled]: enabled });
  } catch {
    // 静默失败
  }
}

/** 剪贴板历史条目 */
export interface ClipboardEntry {
  type: 'url';
  content: string;
  label?: string;
  timestamp: number;
}

/** 读取剪贴板历史 */
export async function readClipboard(): Promise<ClipboardEntry[]> {
  try {
    const data = await chrome.storage.local.get([STORAGE_KEYS.clipboard]);
    const items = data[STORAGE_KEYS.clipboard];
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item): item is ClipboardEntry =>
        item?.type === 'url' &&
        typeof item?.content === 'string' &&
        typeof item?.timestamp === 'number',
    );
  } catch {
    return [];
  }
}

/** 追加剪贴板条目（最多保留 50 条） */
export async function appendClipboard(
  entry: ClipboardEntry,
): Promise<void> {
  const items = (await readClipboard()).filter(
    (item) => item.content !== entry.content,
  );
  items.unshift(entry);
  if (items.length > 50) items.length = 50;
  await chrome.storage.local.set({ [STORAGE_KEYS.clipboard]: items });
}

/** 清空剪贴板 */
export async function clearClipboard(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.clipboard]: [] });
}
