import { useState } from "react";
import { useStore } from "../state/store";
import type { DamageSpot, DamageStatus } from "../model/types";

const STATUS_OPTIONS: { value: DamageStatus; label: string }[] = [
  { value: "pending", label: "待修补" },
  { value: "repaired", label: "已修补" },
  { value: "none", label: "无需处理" },
];

function StatusControl({
  orderId,
  damage,
  readOnly,
}: {
  orderId: string;
  damage: DamageSpot;
  readOnly: boolean;
}) {
  const { dispatch } = useStore();
  return (
    <div
      className="status-segment"
      role="group"
      aria-label={`底板伤 ${damage.location} 的处理状态`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`seg seg-${opt.value}${damage.status === opt.value ? " on" : ""}`}
          disabled={readOnly}
          onClick={() =>
            dispatch({
              type: "setDamageStatus",
              orderId,
              damageId: damage.id,
              status: opt.value,
            })
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function DamagePanel({
  orderId,
  damages,
  readOnly,
}: {
  orderId: string;
  damages: DamageSpot[];
  readOnly: boolean;
}) {
  const { dispatch } = useStore();
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    if (!location.trim()) {
      setError("请先填写底板伤位置。");
      return;
    }
    dispatch({ type: "addDamage", orderId, location, note });
    setLocation("");
    setNote("");
    setError("");
  };

  return (
    <div className="damage-panel">
      <h4>底板伤标记</h4>
      {damages.length === 0 ? (
        <p className="muted">暂无底板伤记录。</p>
      ) : (
        <ul className="damage-list">
          {damages.map((d) => (
            <li key={d.id} className={`damage damage-${d.status}`}>
              <div className="damage-head">
                <b>{d.location}</b>
                <span className={`dot dot-${d.status}`}>
                  {STATUS_OPTIONS.find((o) => o.value === d.status)?.label}
                </span>
              </div>
              {d.note && <p className="damage-note">{d.note}</p>}
              <StatusControl orderId={orderId} damage={d} readOnly={readOnly} />
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="damage-add">
          <div className="field-grid">
            <label>
              <span>伤点位置（阻挡完工必填）</span>
              <input
                value={location}
                placeholder="如：左固定器前方 12cm"
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label>
              <span>伤情 / 处理备注</span>
              <input
                value={note}
                placeholder="如：深划痕，待补 P-Tex"
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="ghost" onClick={add}>
            + 标记底板伤（默认待修补）
          </button>
        </div>
      )}
    </div>
  );
}
