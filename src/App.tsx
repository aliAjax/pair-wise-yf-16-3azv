import "./styles.css";
import { useMemo, useState } from "react";
import type { BoardModel } from "./types";
import { useWorkshop } from "./hooks/useWorkshop";
import { Sidebar, type StatusFilter } from "./components/Sidebar";
import { NewOrderForm } from "./components/NewOrderForm";
import { OrderCard } from "./components/OrderCard";
import { blockingDamages } from "./rules";

function App() {
  const workshop = useWorkshop();
  const [boardFilter, setBoardFilter] = useState<BoardModel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [customerFilter, setCustomerFilter] = useState<string | "all">("all");

  const metrics = useMemo(() => {
    const inProgress = workshop.orders.filter((o) => o.status === "in_progress").length;
    const completed = workshop.orders.filter((o) => o.status === "completed").length;
    const pendingDamages = workshop.orders.reduce(
      (sum, o) => sum + blockingDamages(o).length,
      0
    );
    const angles = workshop.orders.map((o) => o.edge.side);
    const avgSide =
      angles.length > 0
        ? (angles.reduce((a, b) => a + b, 0) / angles.length).toFixed(1) + "°"
        : "—";
    return { inProgress, completed, avgSide, pendingDamages };
  }, [workshop.orders]);

  const visibleOrders = useMemo(() => {
    return workshop.orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (boardFilter !== "all" && o.boardModel !== boardFilter) return false;
      if (customerFilter !== "all" && o.customerName !== customerFilter) return false;
      return true;
    });
  }, [workshop.orders, statusFilter, boardFilter, customerFilter]);

  return (
    <main className="app">
      <section className="hero compact">
        <p>hxyfront-62004 · 滑雪板调校维护台</p>
        <h1>雪板维护台</h1>
        <span>
          登记品牌、长度、板型、刃角、蜡型与客户偏好；底板伤按「待修补 / 已修补 / 无需处理」标记，
          待修补未处理清楚时不能完工。数据存本机，重开仍在。
        </span>
      </section>

      <section className="metrics">
        <article>
          <small>维修中工单</small>
          <strong>{metrics.inProgress}</strong>
        </article>
        <article>
          <small>完工工单</small>
          <strong>{metrics.completed}</strong>
        </article>
        <article>
          <small>平均侧刃角</small>
          <strong>{metrics.avgSide}</strong>
        </article>
        <article>
          <small>待修补底板伤</small>
          <strong>{metrics.pendingDamages}</strong>
        </article>
      </section>

      <section className="workspace">
        <Sidebar
          customers={workshop.customers}
          boardFilter={boardFilter}
          statusFilter={statusFilter}
          customerFilter={customerFilter}
          onBoardChange={setBoardFilter}
          onStatusChange={setStatusFilter}
          onCustomerChange={setCustomerFilter}
          onPreferenceChange={workshop.updateCustomerPreference}
        />

        <div className="main-col">
          <NewOrderForm customers={workshop.customers} onCreate={workshop.createOrder} />

          <section className="panel order-panel">
            <div className="heading">
              <div>
                <p>维护工单列表</p>
                <h2>
                  工作台
                  <span className="result-count">{visibleOrders.length} 张</span>
                </h2>
              </div>
              <button className="ghost-btn" onClick={workshop.resetAll}>
                恢复演示数据
              </button>
            </div>

            {visibleOrders.length === 0 ? (
              <p className="empty-line">
                当前筛选下没有工单——把完工状态切到「已完工」才能看到处理清楚并完工的工单。
              </p>
            ) : (
              <div className="order-list">
                {visibleOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAddDamage={workshop.addDamage}
                    onSetDamageStatus={workshop.setDamageStatus}
                    onComplete={workshop.completeOrder}
                    onReopen={workshop.reopenOrder}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
