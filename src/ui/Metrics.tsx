import { useMemo } from "react";
import { useStore } from "../state/store";
import { blockingDamages } from "../rules/orderRules";

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <article style={tone ? { borderTopColor: tone } : undefined}>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

export function Metrics() {
  const { state } = useStore();

  const stats = useMemo(() => {
    const inProgress = state.orders.filter((o) => o.status === "in_progress");
    const completed = state.orders.length - inProgress.length;
    const pendingDamages = state.orders.reduce(
      (sum, o) => sum + blockingDamages(o).length,
      0,
    );
    return {
      inProgress: inProgress.length,
      completed,
      pendingDamages,
      customers: state.customers.length,
    };
  }, [state.orders, state.customers.length]);

  return (
    <section className="metrics">
      <Metric label="维修中工单" value={stats.inProgress} />
      <Metric label="已完工工单" value={stats.completed} tone="var(--secondary)" />
      <Metric label="待修补底板伤" value={stats.pendingDamages} tone="var(--accent)" />
      <Metric label="客户档案" value={stats.customers} />
    </section>
  );
}
