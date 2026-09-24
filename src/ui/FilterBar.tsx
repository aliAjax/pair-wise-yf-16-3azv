import { BOARD_TYPES, type BoardType } from "../model/types";

export type StatusFilter = "all" | "in_progress" | "completed";

interface Props {
  status: StatusFilter;
  board: BoardType | "all";
  onStatusChange: (s: StatusFilter) => void;
  onBoardChange: (b: BoardType | "all") => void;
  counts: Record<StatusFilter, number>;
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "全部工单" },
  { key: "in_progress", label: "维修中" },
  { key: "completed", label: "已完工" },
];

export function FilterBar({
  status,
  board,
  onStatusChange,
  onBoardChange,
  counts,
}: Props) {
  return (
    <div className="filter-bar">
      <div className="tabs" role="tablist">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={status === tab.key}
            className={status === tab.key ? "tab active" : "tab"}
            onClick={() => onStatusChange(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>
      <div className="chips">
        <button
          className={board === "all" ? "chip selected" : "chip"}
          onClick={() => onBoardChange("all")}
        >
          全部板型
        </button>
        {BOARD_TYPES.map((b) => (
          <button
            key={b}
            className={board === b ? "chip selected" : "chip"}
            onClick={() => onBoardChange(b)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}
