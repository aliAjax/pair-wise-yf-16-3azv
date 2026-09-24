import type { AppState, Customer, WorkOrder } from "../model/types";
import type { NewOrderInput } from "./actions";

/** 规则层：客户与偏好规则。偏好改动只写回客户档案，旧工单保持各自快照。 */

export function findCustomer(state: AppState, name: string): Customer | undefined {
  const trimmed = name.trim();
  return state.customers.find((c) => c.name === trimmed);
}

/** 新建工单时冻结一份偏好快照；新客户则按现行输入建档 */
export function resolveCustomerForOrder(
  state: AppState,
  input: NewOrderInput,
  now: string,
): { customers: Customer[]; preference: string } {
  const name = input.customer.trim();
  const existing = findCustomer(state, name);
  if (existing) {
    // 老客户：默认带出档案现行偏好，表单内可针对本单微调；为空时回退档案
    return {
      customers: state.customers,
      preference: input.preference.trim() || existing.preference,
    };
  }
  const customer: Customer = {
    id: `C-${String(state.customers.length + 1).padStart(3, "0")}`,
    name,
    preference: input.preference.trim(),
    updatedAt: now,
  };
  return { customers: [...state.customers, customer], preference: customer.preference };
}

/** 改偏好只影响客户档案（进而影响之后的新工单），绝不触碰任何旧工单的快照与参数 */
export function withUpdatedPreference(
  customers: Customer[],
  customerId: string,
  preference: string,
  now: string,
): Customer[] {
  return customers.map((c) =>
    c.id === customerId ? { ...c, preference: preference.trim(), updatedAt: now } : c,
  );
}

/** 旧工单保留原偏好：工单快照与客户现行偏好是否已不一致 */
export function preferenceDrifted(order: WorkOrder, customers: Customer[]): boolean {
  const customer = customers.find((c) => c.name === order.customer);
  return Boolean(customer) && customer!.preference !== order.preferenceSnapshot;
}
