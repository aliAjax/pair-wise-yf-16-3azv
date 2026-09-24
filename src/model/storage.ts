// 模型层：本机持久化与种子数据。
// 数据存浏览器 localStorage，重开浏览器仍在；规则与界面不直接访问存储。

import type { WorkshopState } from "../types";

const STORAGE_KEY = "ski-workshop-state-v1";

export function seedState(): WorkshopState {
  const now = Date.now();
  return {
    version: 1,
    customers: [
      { id: "CUS-1", name: "张野", preference: "弱咬雪，容错优先" },
      { id: "CUS-2", name: "刘竞速", preference: "强咬雪，刻滑走线" },
    ],
    orders: [
      {
        id: "ORD-106",
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
        customerName: "张野",
        brand: "Burton",
        length: 156,
        boardModel: "全地域",
        edge: { side: 89, base: 1 },
        wax: "通用蜡",
        preferenceSnapshot: "弱咬雪，容错优先",
        finishSnapshot: null,
        damages: [
          { id: "DMG-1", location: "板尾底板 8cm 浅划痕", status: "repaired" },
        ],
        status: "in_progress",
        completedAt: null,
      },
      {
        id: "ORD-112",
        createdAt: now - 1000 * 60 * 60 * 24 * 2,
        customerName: "刘竞速",
        brand: "Fischer",
        length: 165,
        boardModel: "竞速板",
        edge: { side: 86, base: 1 },
        wax: "低温蜡",
        preferenceSnapshot: "强咬雪，刻滑走线",
        finishSnapshot: null,
        damages: [
          { id: "DMG-2", location: "板头左缘 12cm 深划痕", status: "pending" },
          { id: "DMG-3", location: "固定器旁压痕", status: "none" },
        ],
        status: "in_progress",
        completedAt: null,
      },
      {
        id: "ORD-118",
        createdAt: now - 1000 * 60 * 60 * 24,
        customerName: "陈粉",
        brand: "Gentemstick",
        length: 158,
        boardModel: "粉雪板",
        edge: { side: 89, base: 0.75 },
        wax: "高温蜡",
        preferenceSnapshot: "粉雪浮力优先",
        finishSnapshot: "侧刃89° · 底刃0.75° · 高温蜡",
        damages: [],
        status: "completed",
        completedAt: now - 1000 * 60 * 60 * 6,
      },
    ],
  };
}

export function loadState(): WorkshopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as WorkshopState;
    if (parsed.version !== 1 || !Array.isArray(parsed.orders) || !Array.isArray(parsed.customers)) {
      return seedState();
    }
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state: WorkshopState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储不可用（隐私模式等）时退化为本次会话内存态，不影响界面使用
  }
}

export function resetState(): WorkshopState {
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}
