import type { BoardType, DamageStatus } from "../model/types";

/** 工单上所有可能发生的操作；界面只派发动作，不直接改状态。 */

export interface NewOrderInput {
  customer: string;
  preference: string;
  brand: string;
  lengthCm: number;
  boardType: BoardType;
  edgeSide: number;
  edgeBase: number;
  waxType: string;
}

export type Action =
  | { type: "createOrder"; input: NewOrderInput }
  | { type: "addDamage"; orderId: string; location: string; note: string }
  | {
      type: "setDamageStatus";
      orderId: string;
      damageId: string;
      status: DamageStatus;
    }
  | { type: "requestComplete"; orderId: string }
  | { type: "updatePreference"; customerId: string; preference: string };
