import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import {
  BOARD_TYPES,
  WAX_TYPES,
  type BoardType,
} from "../model/types";
import type { NewOrderInput } from "../rules/actions";

export function NewOrderForm() {
  const { state, dispatch } = useStore();
  const [customer, setCustomer] = useState("");
  const [preference, setPreference] = useState("");
  const [brand, setBrand] = useState("");
  const [lengthCm, setLengthCm] = useState("156");
  const [boardType, setBoardType] = useState<BoardType>("全地域");
  const [edgeSide, setEdgeSide] = useState("88");
  const [edgeBase, setEdgeBase] = useState("1");
  const [waxType, setWaxType] = useState<string>(WAX_TYPES[0]);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");

  const knownNames = useMemo(
    () => state.customers.map((c) => c.name),
    [state.customers],
  );

  const pickCustomer = (name: string) => {
    setCustomer(name);
    const found = state.customers.find((c) => c.name === name.trim());
    // 选老客户时带入其现行偏好作为本单默认快照（仍可在单内微调，不影响档案与旧工单）
    if (found) setPreference(found.preference);
  };

  const submit = () => {
    const length = Number(lengthCm);
    const side = Number(edgeSide);
    const base = Number(edgeBase);
    if (!customer.trim()) return setError("请填写客户姓名。");
    if (!brand.trim()) return setError("请填写雪板品牌。");
    if (!Number.isFinite(length) || length < 80 || length > 230)
      return setError("长度应在 80–230 cm 之间。");
    if (!Number.isFinite(side) || side < 85 || side > 90)
      return setError("侧刃角度一般在 85°–90°。");
    if (!Number.isFinite(base) || base < 0 || base > 3)
      return setError("底刃角度一般在 0°–3°。");

    const input: NewOrderInput = {
      customer,
      preference,
      brand,
      lengthCm: length,
      boardType,
      edgeSide: side,
      edgeBase: base,
      waxType,
    };
    const id = `ORD-${state.seq.order + 1}`;
    dispatch({ type: "createOrder", input });
    setCreatedId(id);
    setError("");
    setBrand("");
    window.setTimeout(() => setCreatedId(""), 4000);
  };

  return (
    <section className="panel form-panel">
      <div className="heading">
        <div>
          <p>新建维护工单</p>
          <h2>登记雪板参数</h2>
        </div>
      </div>

      <div className="field-grid">
        <label>
          <span>客户（输入姓名，老客户自动带出偏好）</span>
          <input
            list="customer-names"
            value={customer}
            placeholder="如：周晴"
            onChange={(e) => pickCustomer(e.target.value)}
          />
          <datalist id="customer-names">
            {knownNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        <label>
          <span>雪板品牌</span>
          <input
            value={brand}
            placeholder="如：Burton Custom"
            onChange={(e) => setBrand(e.target.value)}
          />
        </label>
        <label>
          <span>长度（cm）</span>
          <input
            type="number"
            value={lengthCm}
            min={80}
            max={230}
            onChange={(e) => setLengthCm(e.target.value)}
          />
        </label>
        <label>
          <span>板型</span>
          <select value={boardType} onChange={(e) => setBoardType(e.target.value as BoardType)}>
            {BOARD_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>侧刃角度（°）</span>
          <input
            type="number"
            step={0.5}
            value={edgeSide}
            onChange={(e) => setEdgeSide(e.target.value)}
          />
        </label>
        <label>
          <span>底刃角度（°）</span>
          <input
            type="number"
            step={0.5}
            value={edgeBase}
            onChange={(e) => setEdgeBase(e.target.value)}
          />
        </label>
        <label>
          <span>打蜡类型</span>
          <select value={waxType} onChange={(e) => setWaxType(e.target.value)}>
            {WAX_TYPES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="preference-field">
        <span>客户偏好（将作为本工单快照保存，之后改动不影响本单）</span>
        <textarea
          rows={2}
          value={preference}
          placeholder="如：弱咬雪，粉雪浮力优先"
          onChange={(e) => setPreference(e.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}
      {createdId && <p className="success">已创建工单 {createdId}，初始状态为维修中。</p>}

      <button className="primary wide" onClick={submit}>
        新建工单
      </button>
    </section>
  );
}
