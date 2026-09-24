// 界面层：全局工单状态与操作，所有变更通过规则函数判定后落盘。

import { useCallback, useEffect, useState } from "react";
import type {
  BoardModel,
  Customer,
  DamageMark,
  DamageStatus,
  EdgeAngles,
  WorkOrder,
  WorkshopState,
} from "../types";
import { evaluateCompletion, snapshotTuning } from "../rules";
import { loadState, resetState, saveState } from "../model/storage";

export interface CompleteResult {
  ok: boolean;
  /** ok=false 时给出阻挡完工的底板伤位置 */
  blockers?: DamageMark[];
}

export interface NewOrderInput {
  customerName: string;
  preference: string;
  brand: string;
  length: number;
  boardModel: BoardModel;
  edge: EdgeAngles;
  wax: string;
}

function nextId(prefix: string, existing: { id: string }[]): string {
  let max = 0;
  for (const item of existing) {
    const num = Number(item.id.split("-")[1]);
    if (Number.isFinite(num) && num > max) max = num;
  }
  return `${prefix}-${max + 1}`;
}

export function useWorkshop() {
  const [state, setState] = useState<WorkshopState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const createOrder = useCallback(
    (input: NewOrderInput): { orderId: string } => {
      const name = input.customerName.trim();
      let customers = state.customers;
      let known = customers.find((c) => c.name === name);
      if (!known) {
        known = {
          id: nextId("CUS", customers),
          name,
          preference: input.preference.trim(),
        };
        customers = [...customers, known];
      }

      // 关键：偏好与参数在建单时冻结到工单上，客户日后改偏好不波及旧单
      const order: WorkOrder = {
        id: nextId("ORD", state.orders),
        createdAt: Date.now(),
        customerName: name,
        brand: input.brand.trim(),
        length: input.length,
        boardModel: input.boardModel,
        edge: { ...input.edge },
        wax: input.wax,
        preferenceSnapshot: input.preference.trim(),
        finishSnapshot: null,
        damages: [],
        status: "in_progress",
        completedAt: null,
      };
      setState({ ...state, customers, orders: [order, ...state.orders] });
      return { orderId: order.id };
    },
    [state]
  );

  /** 修改客户当前偏好：只更新客户档案，任何已有工单的快照都不动 */
  const updateCustomerPreference = useCallback(
    (customerId: string, preference: string) => {
      setState({
        ...state,
        customers: state.customers.map((c) =>
          c.id === customerId ? { ...c, preference: preference.trim() } : c
        ),
      });
    },
    [state]
  );

  const addDamage = useCallback(
    (orderId: string, location: string) => {
      const trimmed = location.trim();
      if (!trimmed) return;
      setState({
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== orderId) return o;
          const damage: DamageMark = {
            id: nextId("DMG", o.damages),
            location: trimmed,
            status: "pending",
          };
          // 完工后若又登记底板伤，工单退回维修中
          return {
            ...o,
            damages: [...o.damages, damage],
            status: "in_progress",
            completedAt: null,
            finishSnapshot: null,
          };
        }),
      });
    },
    [state]
  );

  const setDamageStatus = useCallback(
    (orderId: string, damageId: string, status: DamageStatus) => {
      setState({
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                damages: o.damages.map((d) => (d.id === damageId ? { ...d, status } : d)),
              }
            : o
        ),
      });
    },
    [state]
  );

  /** 点完工：有待修补底板伤时拒绝并保持维修中；全部处理清楚才完工 */
  const completeOrder = useCallback(
    (orderId: string): CompleteResult => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return { ok: false };
      const verdict = evaluateCompletion(order);
      if (!verdict.canComplete) {
        return { ok: false, blockers: verdict.blockers };
      }
      if (order.status === "completed") return { ok: true };

      setState({
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "completed",
                completedAt: Date.now(),
                finishSnapshot: snapshotTuning(o),
              }
            : o
        ),
      });
      return { ok: true };
    },
    [state]
  );

  const reopenOrder = useCallback(
    (orderId: string) => {
      setState({
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId && o.status === "completed"
            ? { ...o, status: "in_progress", completedAt: null, finishSnapshot: null }
            : o
        ),
      });
    },
    [state]
  );

  const resetAll = useCallback(() => setState(resetState()), []);

  return {
    state,
    customers: state.customers as Customer[],
    orders: state.orders as WorkOrder[],
    createOrder,
    updateCustomerPreference,
    addDamage,
    setDamageStatus,
    completeOrder,
    reopenOrder,
    resetAll,
  };
}
