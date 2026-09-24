import type { AppState } from "./types";

// 首次打开时的演示数据，对应原样例页的 ORD-106 / ORD-112 / ORD-118。
export function createSeedState(): AppState {
  return {
    customers: [
      {
        id: "C-001",
        name: "李昂",
        preference: "均衡抓雪，日常机压雪道滑行，刃感不要太凶。",
        updatedAt: "2026-09-18T10:00:00.000Z",
      },
      {
        id: "C-002",
        name: "周晴",
        preference: "高立刃竞速，喜欢强咬雪，侧刃尽量锋利。",
        updatedAt: "2026-09-19T10:00:00.000Z",
      },
      {
        id: "C-003",
        name: "陈屿",
        preference: "弱咬雪，粉雪浮力优先，转向要灵活。",
        updatedAt: "2026-09-20T10:00:00.000Z",
      },
    ],
    orders: [
      {
        id: "ORD-106",
        customer: "李昂",
        preferenceSnapshot: "均衡抓雪，日常机压雪道滑行，刃感不要太凶。",
        brand: "Burton Custom",
        lengthCm: 156,
        boardType: "全地域",
        edge: { side: 88, base: 1 },
        waxType: "低温蜡",
        damages: [
          {
            id: "D-001",
            location: "板尾中央 8cm 浅划痕",
            note: "P-Tex 修补后打磨平整",
            status: "repaired",
          },
        ],
        status: "completed",
        createdAt: "2026-09-18T11:00:00.000Z",
        completedAt: "2026-09-18T15:30:00.000Z",
      },
      {
        id: "ORD-112",
        customer: "周晴",
        preferenceSnapshot: "高立刃竞速，喜欢强咬雪，侧刃尽量锋利。",
        brand: "Völkl Racetiger",
        lengthCm: 165,
        boardType: "竞速板",
        edge: { side: 87, base: 0.5 },
        waxType: "高温蜡",
        damages: [
          {
            id: "D-002",
            location: "左固定器前方 12cm 深划痕",
            note: "深及芯材，待补 P-Tex",
            status: "pending",
          },
          {
            id: "D-003",
            location: "右板刃根部 2cm 缺口",
            note: "需要补钢边后重新修刃",
            status: "pending",
          },
        ],
        status: "in_progress",
        createdAt: "2026-09-19T09:20:00.000Z",
      },
      {
        id: "ORD-118",
        customer: "陈屿",
        preferenceSnapshot: "弱咬雪，粉雪浮力优先，转向要灵活。",
        brand: "Jones Hovercraft",
        lengthCm: 158,
        boardType: "粉雪板",
        edge: { side: 89, base: 1 },
        waxType: "全温蜡",
        damages: [
          {
            id: "D-004",
            location: "板头右侧轻微氧化",
            note: "仅表面发乌，打磨即可，无需补底",
            status: "none",
          },
        ],
        status: "in_progress",
        createdAt: "2026-09-20T13:40:00.000Z",
      },
    ],
    seq: { order: 118, damage: 4 },
  };
}
