import { useRef, useState } from "react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  };

  const onTouchMove = (e) => {
    if (startY.current == null) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPull(Math.min(diff * 0.5, 80));
  };

  const onTouchEnd = async () => {
    if (pull > 55) {
      setRefreshing(true);
      try { await onRefresh?.(); } finally { setRefreshing(false); }
    }
    setPull(0);
    startY.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative h-full overflow-y-auto"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div
        className="flex items-center justify-center text-white/40 text-xs transition-all"
        style={{ height: pull, opacity: pull / 80 }}
      >
        {refreshing ? "Refreshing…" : pull > 55 ? "Release to refresh" : "Pull to refresh"}
      </div>
      {children}
    </div>
  );
}
