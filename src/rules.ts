// 规则层：底板伤阻挡规则、刃角 / 蜡型推荐规则。
// 纯函数，不依赖 React，也不直接读写存储；界面与模型都通过这里做判断。

import type { BoardModel, DamageMark, DamageStatus, EdgeAngles, WorkOrder } from "./types";

export const DAMAGE_STATUS_LABEL: Record<DamageStatus, string> = {
  pending: "待修补",
  repaired: "已修补",
  none: "无需处理",
};

/** 一条底板伤是否阻挡完工：只有「待修补」阻挡 */
export function isBlocking(damage: DamageMark): boolean {
  return damage.status === "pending";
}

/** 工单上所有尚未处理清楚的底板伤（阻挡位置） */
export function blockingDamages(order: WorkOrder): DamageMark[] {
  return order.damages.filter(isBlocking);
}

/**
 * 完工规则：
 * 已完工工单不能重复完工；维修中工单必须先把所有底板伤处理成
 * 「已修补」或「无需处理」。有待修补时保持维修中，并返回阻挡位置。
 */
export function evaluateCompletion(order: WorkOrder): {
  canComplete: boolean;
  blockers: DamageMark[];
} {
  if (order.status === "completed") {
    return { canComplete: true, blockers: [] };
  }
  const blockers = blockingDamages(order);
  return { canComplete: blockers.length === 0, blockers };
}

interface BoardPreset {
  edge: EdgeAngles;
  wax: string;
}

/** 各板型的出厂调校参数表 */
export const BOARD_PRESETS: Record<BoardModel, BoardPreset> = {
  全地域: { edge: { side: 88, base: 1 }, wax: "通用蜡" },
  公园板: { edge: { side: 89, base: 0.5 }, wax: "板底保养蜡" },
  竞速板: { edge: { side: 87, base: 1 }, wax: "低温蜡" },
  粉雪板: { edge: { side: 89, base: 0.75 }, wax: "高温蜡" },
};

/**
 * 根据板型和建单时的客户偏好给出推荐刃角与蜡型。
 * 偏好只在新单上参与计算；旧单保存的是当时的参数，不会被重新推导。
 */
export function recommendTuning(boardModel: BoardModel, preference: string): {
  edge: EdgeAngles;
  wax: string;
} {
  const preset = BOARD_PRESETS[boardModel];
  const edge = { ...preset.edge };
  let wax = preset.wax;

  const text = preference.trim();
  if (text) {
    if (text.includes("弱咬雪") || text.includes("容错")) {
      edge.side = Math.min(edge.side + 1, 90);
    } else if (text.includes("强咬雪") || text.includes("刻滑") || text.includes("竞速")) {
      edge.side = Math.max(edge.side - 1, 85);
    }
    if (text.includes("低温") || text.includes("粉雪")) wax = "低温蜡";
    if (text.includes("高温") || text.includes("春雪")) wax = "高温蜡";
    if (text.includes("保养")) wax = "板底保养蜡";
  }

  return { edge, wax };
}

/** 工单当前参数的文本快照，完工时冻结，之后改任何东西都不会动旧单 */
export function snapshotTuning(order: WorkOrder): string {
  return `侧刃${order.edge.side}° · 底刃${order.edge.base}° · ${order.wax}`;
}
