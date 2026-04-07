import { useState } from "react";

function Ic({ n, fill = 0, size = 20, color }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
        color: color || "inherit",
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

/**
 * Props:
 *  assignments   — array of assignment objects with { deadline, submissionStatus }
 *                  Used to place deadline dots on the calendar.
 */
export default function Calendar({ assignments = [] }) {
  const [cur, setCur] = useState(new Date());
  const today = new Date();
  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const monthName = cur.toLocaleString("default", { month: "long" });

  const firstDayRaw  = new Date(year, month, 1).getDay();          // 0=Sun
  const startOffset  = firstDayRaw === 0 ? 6 : firstDayRaw - 1;   // shift to Mon-start
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  // Collect days that have pending deadlines this month
  const deadlineDays = new Set(
    assignments
      .filter(a => a.submissionStatus === "not_submitted" && a.deadline)
      .map(a => {
        const d = new Date(a.deadline);
        return (d.getMonth() === month && d.getFullYear() === year) ? d.getDate() : null;
      })
      .filter(Boolean)
  );

  // Collect days that have submitted assignments this month
  const submittedDays = new Set(
    assignments
      .filter(a => (a.submissionStatus === "submitted" || a.submissionStatus === "graded") && a.deadline)
      .map(a => {
        const d = new Date(a.deadline);
        return (d.getMonth() === month && d.getFullYear() === year) ? d.getDate() : null;
      })
      .filter(Boolean)
  );

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Build cell array: nulls for offset, then day numbers
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const iconBtn = {
    background: "none", border: "none", cursor: "pointer",
    width: 26, height: 26, display: "flex", alignItems: "center",
    justifyContent: "center", borderRadius: 6,
  };

  return (
    <div>
      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
          {monthName} {year}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => setCur(new Date(year, month - 1, 1))} style={iconBtn}>
            <Ic n="chevron_left" size={16} color="var(--text-muted)" />
          </button>
          <button onClick={() => setCur(new Date(year, month + 1, 1))} style={iconBtn}>
            <Ic n="chevron_right" size={16} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {["MO","TU","WE","TH","FR","SA","SU"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px 0" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const tod  = isToday(d);
          const dead = deadlineDays.has(d);
          const sub  = submittedDays.has(d);
          return (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <span style={{
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%",
                fontSize: 12,
                fontWeight: tod ? 700 : 400,
                background: tod ? "#0d7ff2" : "transparent",
                color: tod ? "#fff" : "var(--text-muted)",
              }}>
                {d}
              </span>
              {/* Dots */}
              <div style={{ display: "flex", gap: 2, marginTop: 1, minHeight: 5 }}>
                {dead && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#ef4444" }} />}
                {sub  && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            ["#0d7ff2", "Today"],
            ["#ef4444", "Deadline"],
            ["#f97316", "Submitted"],
          ].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}