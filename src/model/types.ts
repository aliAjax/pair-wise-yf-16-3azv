// 模型层：数据结构与固定选项。界面与业务规则都只依赖这里的类型。

export const BOARD_TYPES = ["全地域", "公园板", "竞速板", "粉雪板"] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const WAX_TYPES = ["低温蜡", "全温蜡", "高温蜡", "免蜡维护"] as const;
export type WaxType = (typeof WAX_TYPES)[number];

/** 底板伤处理状态 */
export type DamageStatus = "pending" | "repaired" | "none";

/** 工单状态：只要存在「待修补」伤点，就不允许进入已完工 */
export type OrderStatus = "in_progress" | "completed";

export interface DamageSpot {
  id: string;
  /** 修补位置，例如「左固定器前方 12cm」 */
  location: string;
  /** 伤情备注，例如「深划痕，待补 P-Tex」 */
  note: string;
  status: DamageStatus;
}

export interface EdgeAngle {
  /** 侧刃角度（度），常见 87–90 */
  side: number;
  /** 底刃角度（度），常见 0.5–1 */
  base: number;
}

export interface WorkOrder {
  id: string;
  customer: string;
  /** 建单时的客户偏好快照，之后客户改偏好不回写旧工单 */
  preferenceSnapshot: string;
  brand: string;
  lengthCm: number;
  boardType: BoardType;
  edge: EdgeAngle;
  waxType: string;
  damages: DamageSpot[];
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  /** 客户的现行偏好，只用于新建工单时取快照 */
  preference: string;
  updatedAt: string;
}

export interface AppState {
  orders: WorkOrder[];
  customers: Customer[];
  seq: {
    order: number;
    damage: number;
  };
}
