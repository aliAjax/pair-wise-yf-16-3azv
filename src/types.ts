// 模型层：数据类型定义
// 只描述数据形状，不包含任何界面或业务判断逻辑。

export type BoardModel = "全地域" | "公园板" | "竞速板" | "粉雪板";

/** 底板伤处理状态：待修补会阻挡完工，已修补 / 无需处理 不阻挡 */
export type DamageStatus = "pending" | "repaired" | "none";

export interface DamageMark {
  id: string;
  /** 底板伤位置，例如「板头左缘 12cm 划痕」 */
  location: string;
  status: DamageStatus;
}

export interface EdgeAngles {
  /** 侧刃角度（度），如 88 */
  side: number;
  /** 底刃角度（度），如 1 */
  base: number;
}

export type OrderStatus = "in_progress" | "completed";

export interface WorkOrder {
  id: string;
  createdAt: number;
  customerName: string;
  brand: string;
  /** 板长（cm） */
  length: number;
  boardModel: BoardModel;
  edge: EdgeAngles;
  wax: string;
  /** 建单时的客户偏好快照，之后客户改偏好不会影响这张旧单 */
  preferenceSnapshot: string;
  /** 完工时的刃角 / 蜡型参数快照 */
  finishSnapshot: string | null;
  damages: DamageMark[];
  status: OrderStatus;
  completedAt: number | null;
}

export interface Customer {
  id: string;
  name: string;
  /** 当前偏好：只对之后新建的工单生效 */
  preference: string;
}

export interface WorkshopState {
  version: 1;
  orders: WorkOrder[];
  customers: Customer[];
}

export const BOARD_MODELS: BoardModel[] = ["全地域", "公园板", "竞速板", "粉雪板"];

export const WAX_TYPES = ["低温蜡", "通用蜡", "高温蜡", "板底保养蜡"];
