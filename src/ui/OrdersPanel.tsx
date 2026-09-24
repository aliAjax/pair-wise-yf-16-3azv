import { useMemo } from "react";
import { useStore } from "../state/store";
import type { BoardType } from "../model/types";
import type { StatusFilter } from "./FilterBar";
import { OrderCard } from "./OrderCard";

interface Props {
  status: StatusFilter;
  board: BoardType | "all";
}

export function OrdersPanel({ status, board }: Props) {
  const { state } = useStore();

  const orders = useMemo(() => {
    return state.orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (board !== "all" && o.boardType !== board) return false;
      return true;
    });
  }, [state.orders, status, board]);

  return (
    <div className="orders-panel">
      <div className="heading">
        <div>
          <p>维护工单</p>
          <h2>
            {status === "completed"
              ? "已完工工单"
              : status === "in_progress"
                ? "维修中工单"
                : "全部工单"}
          </h2>
        </div>
        <span className="muted">共 {orders.length} 张</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty">
          {status === "completed"
            ? "还没有满足筛选条件的已完工工单——底板伤全部处理清楚后，工单才会出现在这里。"
            : "当前筛选下没有工单。"}
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
