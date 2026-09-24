import { useState } from "react";
import { useStore } from "../state/store";
import { formatDate } from "../rules/orderRules";

export function CustomerPanel() {
  const { state, dispatch } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  const startEdit = (id: string, preference: string) => {
    setEditingId(id);
    setDraft(preference);
  };

  const save = (id: string) => {
    if (!draft.trim()) return;
    dispatch({ type: "updatePreference", customerId: id, preference: draft });
    setEditingId(null);
    setSavedId(id);
    window.setTimeout(() => setSavedId(null), 3000);
  };

  const orderCount = (name: string) =>
    state.orders.filter((o) => o.customer === name).length;

  return (
    <section className="panel customer-panel">
      <div className="heading">
        <div>
          <p>客户档案与现行偏好</p>
          <h2>偏好管理</h2>
        </div>
      </div>

      <p className="muted small">
        在此修改偏好只影响<strong>之后新建</strong>的工单；旧工单保留各自的原偏好与刃角、蜡型等参数，不会被带偏。
      </p>

      <div className="customer-list">
        {state.customers.map((c) => (
          <article key={c.id} className="customer-card">
            <div className="customer-head">
              <b>{c.name}</b>
              <span className="muted small">
                {orderCount(c.name)} 张工单 · 更新于 {formatDate(c.updatedAt)}
              </span>
            </div>

            {editingId === c.id ? (
              <div className="customer-edit">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="row-actions">
                  <button className="primary small" onClick={() => save(c.id)}>
                    保存偏好
                  </button>
                  <button className="ghost small" onClick={() => setEditingId(null)}>
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="preference-text">{c.preference || "（未填写偏好）"}</p>
                <button className="ghost small" onClick={() => startEdit(c.id, c.preference)}>
                  修改现行偏好
                </button>
                {savedId === c.id && (
                  <p className="success small">已保存，仅对新工单生效。</p>
                )}
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
