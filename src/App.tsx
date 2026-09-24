import { useMemo, useState } from "react";
import type { BoardType } from "./model/types";
import { StoreProvider, useStore } from "./state/store";
import { Metrics } from "./ui/Metrics";
import { FilterBar, type StatusFilter } from "./ui/FilterBar";
import { OrdersPanel } from "./ui/OrdersPanel";
import { NewOrderForm } from "./ui/NewOrderForm";
import { CustomerPanel } from "./ui/CustomerPanel";

function Console() {
  const { state } = useStore();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [board, setBoard] = useState<BoardType | "all">("all");

  // 状态页签上的计数只跟完工状态走，不随板型筛选变化
  const counts = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: state.orders.length,
      in_progress: state.orders.filter((o) => o.status === "in_progress").length,
      completed: state.orders.filter((o) => o.status === "completed").length,
    }),
    [state.orders],
  );

  return (
    <main className="app">
      <section className="hero">
        <p>滑雪装备调校 · 维护台</p>
        <h1>滑雪板调校维护台</h1>
        <span>
          登记品牌、长度、板型、刃角、蜡型与客户偏好；底板伤按「待修补 / 已修补 / 无需处理」标记。
          有待修补伤点时无法完工，必须处理清楚后才能进入已完工。数据保存在本机，重开仍在。
        </span>
      </section>

      <Metrics />

      <section className="workspace">
        <div className="side-col">
          <NewOrderForm />
          <CustomerPanel />
        </div>

        <section className="panel list-col">
          <FilterBar
            status={status}
            board={board}
            onStatusChange={setStatus}
            onBoardChange={setBoard}
            counts={counts}
          />
          <OrdersPanel status={status} board={board} />
        </section>
      </section>
    </main>
  );
}

function App() {
  return (
    <StoreProvider>
      <Console />
    </StoreProvider>
  );
}

export default App;
