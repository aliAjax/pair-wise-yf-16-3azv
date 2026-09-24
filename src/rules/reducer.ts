import type { AppState, DamageSpot, WorkOrder } from "../model/types";
import { blockingDamages } from "./orderRules";
import { resolveCustomerForOrder, withUpdatedPreference } from "./customerRules";
import type { Action, NewOrderInput } from "./actions";

/** 纯状态迁移：输入旧状态 + 动作，输出新状态，不读存储也不读时间以外的外部世界。 */

function nextOrderId(state: AppState): { id: string; seq: number } {
  const n = state.seq.order + 1;
  return { id: `ORD-${n}`, seq: n };
}

function addDamageToOrder(order: WorkOrder, spot: DamageSpot): WorkOrder {
  // 已完工工单若再挂入待修补伤点，自动回到维修中（重新阻挡完工）
  const fallsBackToProgress =
    order.status === "completed" && spot.status === "pending";
  return {
    ...order,
    damages: [...order.damages, spot],
    status: fallsBackToProgress ? "in_progress" : order.status,
    completedAt: fallsBackToProgress ? undefined : order.completedAt,
  };
}

function setDamageStatusInOrder(
  order: WorkOrder,
  damageId: string,
  status: DamageSpot["status"],
): WorkOrder {
  const damages = order.damages.map((d) =>
    d.id === damageId ? { ...d, status } : d,
  );
  // 已完工工单上又冒出待修补伤点，退回维修中并清掉完工时间
  const fallsBackToProgress =
    order.status === "completed" && damages.some((d) => d.status === "pending");
  return {
    ...order,
    damages,
    status: fallsBackToProgress ? "in_progress" : order.status,
    completedAt: fallsBackToProgress ? undefined : order.completedAt,
  };
}

function createOrder(state: AppState, input: NewOrderInput, now: string): AppState {
  const { customers, preference } = resolveCustomerForOrder(state, input, now);
  const { id, seq } = nextOrderId(state);
  const order: WorkOrder = {
    id,
    customer: input.customer.trim(),
    preferenceSnapshot: preference,
    brand: input.brand.trim(),
    lengthCm: input.lengthCm,
    boardType: input.boardType,
    edge: { side: input.edgeSide, base: input.edgeBase },
    waxType: input.waxType,
    damages: [],
    status: "in_progress",
    createdAt: now,
  };
  return {
    ...state,
    customers,
    orders: [order, ...state.orders],
    seq: { ...state.seq, order: seq },
  };
}

export function reducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();

  switch (action.type) {
    case "createOrder":
      return createOrder(state, action.input, now);

    case "addDamage": {
      const seq = state.seq.damage + 1;
      const damageId = `D-${String(seq).padStart(3, "0")}`;
      const spot: DamageSpot = {
        id: damageId,
        location: action.location.trim(),
        note: action.note.trim(),
        status: "pending",
      };
      return {
        ...state,
        seq: { ...state.seq, damage: seq },
        orders: state.orders.map((o) =>
          o.id === action.orderId ? addDamageToOrder(o, spot) : o,
        ),
      };
    }

    case "setDamageStatus":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? setDamageStatusInOrder(o, action.damageId, action.status)
            : o,
        ),
      };

    case "requestComplete": {
      // 规则闸门：仍有阻挡伤点时保持维修中，由界面列出阻挡位置
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          if (o.status === "completed" || blockingDamages(o).length > 0) return o;
          return { ...o, status: "completed", completedAt: now };
        }),
      };
    }

    case "updatePreference":
      return {
        ...state,
        customers: withUpdatedPreference(
          state.customers,
          action.customerId,
          action.preference,
          now,
        ),
      };

    default:
      return state;
  }
}
