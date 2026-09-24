import type { DamageSpot, WorkOrder } from "../model/types";

/** 规则层：只做纯逻辑判断与计算，不碰 React、不碰存储、不碰 DOM。 */

/** 列出工单上所有仍待修补的底板伤位置 —— 完工的阻挡点 */
export function blockingDamages(order: WorkOrder): DamageSpot[] {
  return order.damages.filter((d) => d.status === "pending");
}

/** 规则：底板伤没处理清楚（还存在「待修补」），不允许完工 */
export function canComplete(order: WorkOrder): boolean {
  return order.status !== "completed" && blockingDamages(order).length === 0;
}

export function completeBlockedReason(order: WorkOrder): string | null {
  if (order.status === "completed") return "工单已完工。";
  const blockers = blockingDamages(order);
  if (blockers.length === 0) return null;
  const positions = blockers.map((d) => d.location).join("、");
  return `仍有 ${blockers.length} 处底板伤待修补：${positions}`;
}

export function formatEdge(edge: WorkOrder["edge"]): string {
  return `侧刃 ${edge.side}° / 底刃 ${edge.base}°`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
