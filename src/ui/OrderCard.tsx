import { useState } from "react";
import { useStore } from "../state/store";
import type { WorkOrder } from "../model/types";
import {
  blockingDamages,
  canComplete,
  completeBlockedReason,
  formatDate,
  formatEdge,
} from "../rules/orderRules";
import { preferenceDrifted } from "../rules/customerRules";
import { DamagePanel } from "./DamagePanel";

export function OrderCard({ order }: { order: WorkOrder }) {
  const { state, dispatch } = useStore();
  const [showBlocked, setShowBlocked] = useState(false);

  const completed = order.status === "completed";
  const blockers = blockingDamages(order);
  const allowed = canComplete(order);
  const drifted = preferenceDrifted(order, state.customers);

  const handleComplete = () => {
    if (!allowed) {
      // 点完工时不改动工单：保持维修中，并展开阻挡位置
      setShowBlocked(true);
      return;
    }
    dispatch({ type: "requestComplete", orderId: order.id });
    setShowBlocked(false);
  };

  return (
    <article className={`order-card ${completed ? "is-completed" : ""}`}>
      <header className="order-head">
        <div>
          <h3>{order.id}</h3>
          <p className="order-meta">
            {order.brand} · {order.lengthCm}cm · {order.boardType} ·{" "}
            {formatEdge(order.edge)} · {order.waxType}
          </p>
        </div>
        <span className={`badge badge-${order.status}`}>
          {completed ? "已完工" : "维修中"}
        </span>
      </header>

      <div className="order-body">
        <div className="preference-box">
          <div className="preference-row">
            <span className="tag">客户</span>
            <b>{order.customer}</b>
            {drifted && (
              <span className="tag tag-warn" title="客户改过偏好，本工单保留建单时的原偏好">
                旧偏好已保留
              </span>
            )}
          </div>
          <p className="preference-text">
            <span className="tag">建单偏好</span>
            {order.preferenceSnapshot || "（未填写）"}
          </p>
        </div>

        <DamagePanel orderId={order.id} damages={order.damages} readOnly={completed} />
      </div>

      <footer className="order-foot">
        <div className="order-dates">
          <span>建单 {formatDate(order.createdAt)}</span>
          {completed && order.completedAt && (
            <span>完工 {formatDate(order.completedAt)}</span>
          )}
        </div>

        <div className="complete-zone">
          {showBlocked && !completed && (
            <div className="blocked-alert" role="alert">
              <b>无法完工，工单保持「维修中」。</b>
              <span>{completeBlockedReason(order)}</span>
              <ul>
                {blockers.map((d) => (
                  <li key={d.id}>
                    {d.location}
                    {d.note ? `（${d.note}）` : ""}
                  </li>
                ))}
              </ul>
              <p className="muted small">
                把以上伤点标记为「已修补」或「无需处理」后，才能完工。
              </p>
            </div>
          )}
          <button
            className={completed ? "secondary" : "primary"}
            disabled={completed}
            onClick={handleComplete}
          >
            {completed ? "✓ 已完工" : allowed ? "标记完工" : `完工（${blockers.length} 处待修补）`}
          </button>
        </div>
      </footer>
    </article>
  );
}
