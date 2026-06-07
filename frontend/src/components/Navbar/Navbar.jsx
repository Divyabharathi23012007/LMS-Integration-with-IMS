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
 *  profile               — { name, regNo, department, semester, section }
 *  unreadCount           — number of unread notifications
 *  activeSection         — current section key (unused visually but available)
 *  onNotificationClick() — toggle notification dropdown
 *  onProfileClick()      — toggle profile dropdown
 *  onDarkModeToggle()    — toggle dark mode
 *  dark                  — boolean, current dark state
 *  greet                 — greeting string e.g. "Good Morning"
 *  firstName             — first name string
 */
export default function Navbar({
  profile,
  unreadCount = 0,
  activeSection,
  onNotificationClick,
  onProfileClick,
  onDarkModeToggle,
  dark,
  greet,
  firstName,
  onMenuClick,
}) {
  const iconBtn = {
    background: "none",
    border: "1px solid var(--border)",
    cursor: "pointer",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  };

  return (
    <header style={{
      background: "var(--card)",
      borderBottom: "1px solid var(--border)",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 20,
    }}>

      {/* Left — hamburger (mobile) + greeting */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Hamburger — only visible on mobile via CSS */}
        <button onClick={onMenuClick}
          className="hamburger-btn"
          style={{ ...iconBtn, display: "none" }}>
          <Ic n="menu" size={20} color="var(--text-muted)" />
        </button>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: 0, letterSpacing: "-0.4px" }} data-tour="greeting">
          {greet}, {firstName} 👋
        </h1>
        {profile && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {profile.department} · Sem {profile.semester} · Section {profile.section}
          </p>
        )}
      </div>

      </div>{/* end left */}

      {/* Right — actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <style>{`@media(max-width:768px){.hamburger-btn{display:flex!important;}}`}</style>

        {/* Dark mode toggle */}
        <button onClick={onDarkModeToggle} style={iconBtn}>
          <Ic n={dark ? "light_mode" : "dark_mode"} size={18} color="var(--text-muted)" />
        </button>

        {/* Tour button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('start-tour', { detail: { tourId: 'student-dashboard' } }));
          }}
          style={iconBtn}
          title="Take a tour"
        >
          <Ic n="tour" size={18} color="var(--text-muted)" />
        </button>

        {/* Notification bell */}
        <button onClick={onNotificationClick} style={{ ...iconBtn, position: "relative" }} data-tour="notifications">
          <Ic n="notifications" size={18} color="var(--text-muted)" />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 5, right: 5,
              width: 8, height: 8, borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid var(--card)",
            }} />
          )}
        </button>

        {/* Profile avatar */}
        <button
          onClick={onProfileClick}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(13,127,242,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(13,127,242,0.25)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0d7ff2" }}>
            {(firstName ?? "S")[0]}
          </span>
        </button>

      </div>
    </header>
  );
}