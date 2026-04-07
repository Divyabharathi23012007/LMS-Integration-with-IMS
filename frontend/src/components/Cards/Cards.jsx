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
 * A single stat card used on the Home section.
 *
 * Props:
 *  label       — string, card title e.g. "Avg Attendance"
 *  value       — string | number, large display value
 *  unit        — optional string appended small e.g. "%"
 *  icon        — material symbol name
 *  iconBg      — background color for icon box
 *  iconColor   — icon color
 *  subText     — small text below value
 *  subColor    — color for subText
 *  progress    — optional 0-100 number, renders a progress bar if provided
 *  progressColor — color for progress bar fill
 *  onClick()   — optional click handler
 */
export function StatCard({
  label,
  value,
  unit,
  icon,
  iconBg = "#eff6ff",
  iconColor = "#0d7ff2",
  subText,
  subColor = "var(--text-muted)",
  progress,
  progressColor = "#0d7ff2",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--card)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        padding: 20,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", margin: 0 }}>{label}</p>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ic n={icon} size={18} color={iconColor} fill={1} />
        </div>
      </div>

      <p style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-1px" }}>
        {value}
        {unit && <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-muted)" }}>{unit}</span>}
      </p>

      {progress !== undefined && (
        <div style={{ marginTop: 12, height: 5, background: "var(--border)", borderRadius: 3 }}>
          <div style={{
            height: 5, borderRadius: 3,
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            background: progressColor,
            transition: "width 0.8s",
          }} />
        </div>
      )}

      {subText && (
        <p style={{ fontSize: 11, color: subColor, marginTop: 6, fontWeight: 600 }}>{subText}</p>
      )}
    </div>
  );
}

/**
 * Default export — renders a row of StatCards.
 *
 * Props:
 *  cards — array of StatCard prop objects (same shape as StatCard props above)
 */
export default function Cards({ cards = [] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
      gap: 16,
    }}>
      {cards.map((cardProps, i) => (
        <StatCard key={i} {...cardProps} />
      ))}
    </div>
  );
}