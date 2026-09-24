// 界面层：新建工单表单。
// 选客户带出「当前偏好」、按板型 + 偏好推荐刃角 / 蜡型；保存时偏好和参数一起冻结进新单。

import { useMemo, useState } from "react";
import type { BoardModel, Customer, EdgeAngles } from "../types";
import { BOARD_MODELS, WAX_TYPES } from "../types";
import { recommendTuning } from "../rules";
import type { NewOrderInput } from "../hooks/useWorkshop";

interface Props {
  customers: Customer[];
  onCreate: (input: NewOrderInput) => void;
}

export function NewOrderForm({ customers, onCreate }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [preference, setPreference] = useState("");
  const [brand, setBrand] = useState("");
  const [length, setLength] = useState("156");
  const [boardModel, setBoardModel] = useState<BoardModel>("全地域");
  const [side, setSide] = useState("88");
  const [base, setBase] = useState("1");
  const [wax, setWax] = useState("通用蜡");
  const [error, setError] = useState("");

  const knownCustomer = useMemo(
    () => customers.find((c) => c.name === customerName.trim()),
    [customers, customerName]
  );

  /** 按当前板型和偏好（老客户用当前偏好，新客户用表单里填的）重新推荐 */
  function applyRecommendation() {
    const pref = knownCustomer ? knownCustomer.preference : preference;
    const rec = recommendTuning(boardModel, pref);
    setSide(String(rec.edge.side));
    setBase(String(rec.edge.base));
    setWax(rec.wax);
  }

  function handleCustomerChange(name: string) {
    setCustomerName(name);
    const found = customers.find((c) => c.name === name.trim());
    if (found) setPreference(found.preference);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const lengthNum = Number(length);
    const sideNum = Number(side);
    const baseNum = Number(base);
    if (!customerName.trim()) return setError("请填写客户姓名");
    if (!brand.trim()) return setError("请填写雪板品牌");
    if (!Number.isFinite(lengthNum) || lengthNum <= 0) return setError("请填写正确的板长");
    if (!Number.isFinite(sideNum) || !Number.isFinite(baseNum))
      return setError("请填写正确的刃角");

    onCreate({
      customerName,
      preference: knownCustomer ? knownCustomer.preference : preference,
      brand,
      length: lengthNum,
      boardModel,
      edge: { side: sideNum, base: baseNum } as EdgeAngles,
      wax,
    });

    // 建单后只清空雪板信息，保留客户方便连开多单
    setBrand("");
    setLength("156");
    setBoardModel("全地域");
    setError("");
    applyRecommendation();
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="heading">
        <div>
          <p>新建维护工单</p>
          <h2>入站登记</h2>
        </div>
        <button className="primary" type="submit">
          开工单
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="field-grid">
        <label>
          <span>客户（可输入新客户或选择老客户）</span>
          <input
            list="customer-list"
            value={customerName}
            placeholder="客户姓名"
            onChange={(e) => handleCustomerChange(e.target.value)}
          />
          <datalist id="customer-list">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </label>

        <label>
          <span>{knownCustomer ? "客户当前偏好（新单采用）" : "新客户偏好"}</span>
          <input
            value={preference}
            placeholder="如：弱咬雪、容错优先"
            disabled={!!knownCustomer}
            onChange={(e) => setPreference(e.target.value)}
          />
        </label>

        <label>
          <span>雪板品牌</span>
          <input value={brand} placeholder="如 Burton" onChange={(e) => setBrand(e.target.value)} />
        </label>

        <label>
          <span>长度（cm）</span>
          <input
            type="number"
            value={length}
            min="80"
            max="220"
            onChange={(e) => setLength(e.target.value)}
          />
        </label>

        <label>
          <span>板型</span>
          <select
            value={boardModel}
            onChange={(e) => setBoardModel(e.target.value as BoardModel)}
          >
            {BOARD_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>打蜡类型</span>
          <select value={wax} onChange={(e) => setWax(e.target.value)}>
            {WAX_TYPES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>侧刃角度（°）</span>
          <input
            type="number"
            step="0.5"
            value={side}
            onChange={(e) => setSide(e.target.value)}
          />
        </label>

        <label>
          <span>底刃角度（°）</span>
          <input
            type="number"
            step="0.25"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </label>
      </div>

      <button type="button" className="recommend-btn" onClick={applyRecommendation}>
        按板型与偏好重新推荐刃角 / 蜡型
      </button>
    </form>
  );
}
