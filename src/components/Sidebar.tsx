// 界面层：左侧维护台，板型 / 完工状态筛选与客户当前偏好维护。
// 这里改的是客户档案上的「当前偏好」，只对之后新建的工单生效，旧单快照不受影响。

import { useState } from "react";
import type { BoardModel, Customer } from "../types";
import { BOARD_MODELS } from "../types";

export type StatusFilter = "all" | "in_progress" | "completed";

interface Props {
  customers: Customer[]
  boardFilter: BoardModel | "all";
  statusFilter: StatusFilter;
  customerFilter: string | "all";
  onBoardChange: (value: BoardModel | "all") => void;
  onStatusChange: (value: StatusFilter) => void;
  onCustomerChange: (value: string | "all") => void;
  onPreferenceChange: (customerId: string, preference: string) => void;
}

export function Sidebar({
  customers,
  boardFilter,
  statusFilter,
  customerFilter,
  onBoardChange,
  onStatusChange,
  onCustomerChange,
  onPreferenceChange,
}: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  function savePreference(customerId: string) {
    onPreferenceChange(customerId, drafts[customerId] ?? "");
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[customerId];
      return next;
    });
    setSavedId(customerId);
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "全部工单" },
    { value: "in_progress", label: "维修中" },
    { value: "completed", label: "已完工" },
  ];

  return (
    <aside className="sidebar">
      <section className="panel">
        <h2>工单筛选</h2>
        <p className="side-label">完工状态</p>
        <div className="chips vertical">
          {statusOptions.map((o) => (
            <button
              key={o.value}
              className={statusFilter === o.value ? "chip-active" : ""}
              onClick={() => onStatusChange(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <p className="side-label">板型</p>
        <div className="chips vertical">
          <button
            className={boardFilter === "all" ? "chip-active" : ""}
            onClick={() => onBoardChange("all")}
          >
            全部板型
          </button>
          {BOARD_MODELS.map((m) => (
            <button
              key={m}
              className={boardFilter === m ? "chip-active" : ""}
              onClick={() => onBoardChange(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <p className="side-label">客户历史维护记录</p>
        <select
          value={customerFilter}
          onChange={(e) => onCustomerChange(e.target.value)}
        >
          <option value="all">全部客户</option>
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <h2>客户偏好</h2>
        <p className="side-hint">改动只对之后新建的工单生效，旧工单保留原偏好与参数。</p>
        <div className="customer-list">
          {customers.map((c) => {
            const draft = drafts[c.id] ?? c.preference;
            const dirty = draft !== c.preference;
            return (
              <div key={c.id} className="customer-item">
                <strong>{c.name}</strong>
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                />
                <div className="customer-actions">
                  {dirty ? (
                    <button type="button" className="primary small" onClick={() => savePreference(c.id)}>
                      保存偏好
                    </button>
                  ) : (
                    savedId === c.id && <span className="saved-hint">已保存</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
