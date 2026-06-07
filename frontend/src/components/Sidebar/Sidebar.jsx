function Ic({ n, fill = 0, size = 20, color }) {
  return (
    <span className="material-symbols-outlined" style={{
      fontSize: size, fontVariationSettings: `'FILL' ${fill}`,
      lineHeight: 1, display: "inline-flex", alignItems: "center",
      userSelect: "none", color: color || "inherit", flexShrink: 0,
    }}>{n}</span>
  );
}

/**
 * Props:
 *  navItems      — array of { key, label, icon }
 *  activeSection — current active section key for item highlighting
 *  onNav(key)    — called when a nav item is clicked
 *  profile       — { name, regNo }
 *  onSignOut()
 *  mobileOpen    — boolean, sidebar visible on mobile
 *  onMobileClose — close handler for mobile overlay
 */
export default function Sidebar({ navItems = [], activeSection, onNav, profile, onSignOut, mobileOpen, onMobileClose }) {

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        style={{
          width: 240, flexShrink: 0,
          background: "var(--card)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          height: "100vh", position: "sticky", top: 0, overflow: "hidden",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f8fafc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", overflow: "hidden" }}>
            <img src="/logo.png" alt="RIT" style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-weight:800;font-size:14px;color:#0d7ff2">RIT</span>`; }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", margin: 0, letterSpacing: "-0.3px" }}>RIT LMS</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Rajalakshmi Inst.</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {navItems.map(({ key, label, icon }) => {
              const isActive = activeSection === key;

            // All nav items are buttons — parent decides what happens (section switch or page nav)
            return (
              <button key={key} onClick={() => { onNav(key); onMobileClose?.(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  marginBottom: 1, textAlign: "left", fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "#0d7ff2" : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--border-light)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Ic n={icon} fill={isActive ? 1 : 0} size={18} color={isActive ? "#fff" : "var(--text-muted)"} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Profile footer */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(13,127,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0d7ff2" }}>{(profile?.name ?? "S")[0]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.name ?? "Loading..."}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.regNo ?? ""}
              </p>
            </div>
          </div>
          <button onClick={onSignOut}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#ef4444", background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Ic n="logout" size={16} color="#ef4444" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}