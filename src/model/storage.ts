import type { AppState } from "./types";
import { createSeedState } from "./seed";

// 数据存本机浏览器 localStorage，重开页面仍在。
const STORAGE_KEY = "ski-tuning-console:v1";

function isValidState(value: unknown): value is AppState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<AppState>;
  return Array.isArray(state.orders) && Array.isArray(state.customers);
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed: unknown = JSON.parse(raw);
    if (isValidState(parsed)) return parsed;
    return createSeedState();
  } catch {
    return createSeedState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式或存储已满时静默失败，不影响当前会话使用。
  }
}
