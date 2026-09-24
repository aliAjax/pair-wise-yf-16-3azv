// 界面层：单张维护工单卡片，包含刃角参数、底板伤标记区和完工操作。

import { useState } from "react";
import type { DamageStatus, WorkOrder } from "../types";
import { blockingDamages, DAMAGE_STATUS_LABEL } from "../rules";

interface Props {
  order: WorkOrder;
  onAddDamage: (orderId: string, location: string) => void;
  onSetDamageStatus: (orderId: string, damageId: string, status: DamageStatus) => void;
  onComplete: (orderId: string) => void;
  onReopen: (orderId: string) => void;
}

const STATUS_ORDER: DamageStatus[] = ["pending", "repaired", "none"];

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderCard({
  order,
  onAddDamage,
  onSetDamageStatus,
  onComplete,
  onReopen,
}: Props) {
  const [newLocation, setNewLocation] = useState("");
  const [attempted, setAttempted] = useState(false);

  const blockers = blockingDamages(order);
  const completed = order.status === "completed";
  const showBlocked = attempted && !completed && blockers.length > 0;

  function handleComplete() {
    // 点完工走规则判定：有待修补时，状态保持维修中并列出阻挡位置
    setAttempted(true);
    if (blockers.length > 0) return;
    onComplete(order.id);
  }

  function handleAddDamage() {
    if (!newLocation.trim()) return;
    onAddDamage(order.id, newLocation);
    setNewLocation("");
  }

  return (
    <article className={`order-card ${completed ? "is-completed" : ""}`}>
      <header className="order-head">
        <div>
          <h3>
            {order.id}
            <span className={`status-badge status-${order.status}`}>
              {completed ? "已完工" : "维修中"}
            </span>
          </h3>
          <p className="order-meta">
            {order.customerName} · {order.brand} {order.length}cm · {order.boardModel} · 建单{" "}
            {formatTime(order.createdAt)}
          </p>
        </div>
        <div className="order-actions">
          {completed ? (
            <button className="ghost-btn" onClick={() => onReopen(order.id)}>
              重新打开
            </button>
          ) : (
            <button className="primary" onClick={handleComplete}>
              完工
            </button>
          )}
        </div>
      </header>

      <div className="tuning-grid">
        <div>
          <small>刃角参数</small>
          <strong>
            侧刃 {order.edge.side}° · 底刃 {order.edge.base}°
          </strong>
        </div>
        <div>
          <small>蜡型</small>
          <strong>{order.wax}</strong>
        </div>
        <div>
          <small>客户偏好（建单快照）</small>
          <strong>{order.preferenceSnapshot || "—"}</strong>
        </div>
      </div>

      <div className="damage-zone">
        <div className="damage-title">
          <small>底板伤标记区</small>
          {!completed && blockers.length > 0 && (
            <span className="block-count">{blockers.length} 处待修补</span>
          )}
        </div>

        {order.damages.length === 0 ? (
          <p className="empty-line">暂无底板伤记录</p>
        ) : (
          <ul className="damage-list">
            {order.damages.map((d) => (
              <li key={d.id} className={`damage damage-${d.status}`}>
                <span className="damage-location">{d.location}</span>
                <div className="damage-statuses">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={completed || d.status === s}
                      className={d.status === s ? "active" : ""}
                      onClick={() => onSetDamageStatus(order.id, d.id, s)}
                    >
                      {DAMAGE_STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!completed && (
          <div className="damage-add">
            <input
              value={newLocation}
              placeholder="登记新底板伤位置，如：板头左缘 12cm 划痕"
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDamage();
                }
              }}
            />
            <button type="button" onClick={handleAddDamage}>
              添加标记
            </button>
          </div>
        )}
      </div>

      {showBlocked && (
        <div className="block-banner" role="alert">
          <strong>无法完工，底板伤未处理清楚：</strong>
          <ul>
            {blockers.map((b) => (
              <li key={b.id}>阻挡位置：{b.location}</li>
            ))}
          </ul>
          <span>工单保持「维修中」，把以上位置标为已修补或无需处理后再点完工。</span>
          <button type="button" className="primary" onClick={handleComplete}>
            已处理清楚，再次完工
          </button>
        </div>
      )}

      {completed && order.finishSnapshot && (
        <p className="finish-note">
          完工于 {formatTime(order.completedAt!)} · 参数已冻结：{order.finishSnapshot}
        </p>
      )}
    </article>
  );
}
