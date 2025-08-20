import React, { useMemo } from "react";

function useParams() {
  const qs = new URLSearchParams(location.search);
  return {
    year: parseInt(qs.get("year") || ""),
    month: parseInt(qs.get("month") || ""), // 1~12
    title: qs.get("title") || "",
    startOnMonday: qs.get("mon") === "1",
    // events=YYYY-MM-DD:라벨|YYYY-MM-DD:라벨
    events: (qs.get("events") || "")
      .split("|")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const [d, ...rest] = s.split(":");
        return { date: d, label: rest.join(":") || "●" };
      }),
  };
}

function ymd(d: Date) {
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Calendar() {
  const now = new Date();
  const { year, month, title, startOnMonday, events } = useParams();
  const y = Number.isFinite(year) ? year : now.getFullYear();
  const m = Number.isFinite(month) ? month - 1 : now.getMonth(); // 0-index

  const list = useMemo(() => {
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const offset = (() => {
      const wd = first.getDay(); // 0=일
      if (startOnMonday) {
        return (wd + 6) % 7;
      } // 0=월
      return wd; // 0=일
    })();
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(y, m, d));
    }
    // 6행을 유지하면 embed 내 레이아웃이 안정적
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    while (days.length < 42) {
      days.push(null);
    }
    return days;
  }, [y, m, startOnMonday]);

  const eventMap = useMemo(() => {
    const map = new Map<string, string[]>();
    events.forEach(e => {
      if (!map.has(e.date)) {
        map.set(e.date, []);
      }
      map.get(e.date)!.push(e.label);
    });
    return map;
  }, [events]);

  const monthLabel = new Date(y, m, 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
  const todayStr = ymd(new Date());

  const wd = startOnMonday
    ? ["월", "화", "수", "목", "금", "토", "일"]
    : ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div
      style={{
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI",
        color: "#111",
        width: "100%",
        maxWidth: 420,
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{title || "Calendar"}</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>{monthLabel}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          marginTop: 10,
          userSelect: "none",
        }}
      >
        {wd.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>{w}</div>
        ))}

        {list.map((d, i) => {
          if (!d) {
            return <div key={i} style={{ height: 54, borderRadius: 10, background: "transparent" }} />;
          }
          const key = ymd(d);
          const isToday = key === todayStr;
          const evs = eventMap.get(key) || [];
          return (
            <div
              key={i}
              style={{
                height: 54,
                borderRadius: 12,
                background: isToday ? "#eef2ff" : "#f8fafc",
                border: isToday ? "1px solid #6366f1" : "1px solid #e5e7eb",
                padding: "6px 8px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700 }}>{d.getDate()}</div>
              {evs.slice(0, 2).map((t, idx) => (
                <div key={idx} style={{ fontSize: 10, lineHeight: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t}
                </div>
              ))}
              {evs.length > 2 && (
                <div style={{ fontSize: 10, opacity: 0.6 }}>+{evs.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}