import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Navbar  from "../../components/Navbar/Navbar.jsx";

const NAV_ITEMS = [
  { key: "home",          label: "Home",           icon: "home" },
  { key: "studyMaterial", label: "Study Material", icon: "folder_open" },
  { key: "assignments",   label: "Assignments",    icon: "assignment" },
  { key: "abl",           label: "ABL",            icon: "science" },
  { key: "quizzes",       label: "Quizzes",        icon: "quiz" },
  { key: "marks",         label: "Marks",          icon: "grade" },
  { key: "announcements", label: "Announcements",  icon: "campaign" },
  { key: "attendance",    label: "Attendance",     icon: "event_available" },
  { key: "leaveOD",       label: "Leave/OD",       icon: "calendar_month" },
  { key: "profile",       label: "Profile",        icon: "person" },
];

// Keys that navigate to their own page
const PAGE_ROUTES = {
  home:          "/student/dashboard",
  studyMaterial: "/student/study-material",
  assignments:   "/student/assignments",
  abl:           "/student/abl",
  quizzes:       "/student/quizzes",
  marks:         "/student/marks",
  announcements: "/student/announcements",
  attendance:    "/student/attendance",
  leaveOD:       "/student/leave",
  profile:       "/student/profile",
};

function getSession() {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return { ...u, regNo: (u.regNo || u.username || "").toString().trim() };
  } catch { return { regNo: "" }; }
}

function greetText() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

function Ic({ n, fill = 0, size = 20, color }) {
  return (
    <span className="material-symbols-outlined" style={{
      fontSize: size, fontVariationSettings: `'FILL' ${fill}`,
      lineHeight: 1, display: "inline-flex", alignItems: "center",
      userSelect: "none", color: color || "inherit", flexShrink: 0,
    }}>{n}</span>
  );
}

function ProfileDropdown({ profile, regNo, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 8px)", right: 12,
      width: 220, background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{profile?.name ?? "Student"}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0" }}>{profile?.regNo ?? regNo}</p>
      </div>
      <div style={{ padding: 8 }}>
        <button onClick={() => { window.location.href = "/student/profile"; onClose(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <Ic n="person" size={16} color="var(--text-muted)" />
          View Profile
        </button>
      </div>
    </div>
  );
}


function NotifDropdown({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  // Notifications are fetched per-page; this just shows a quick panel
  const session = getSession();
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!session.regNo) return;
    fetch(`http://localhost:8080/api/student/notifications/${session.regNo}`)
      .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0,8) : [])).catch(() => {});
  }, []);
  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 12, width: 310, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Notifications</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>close</span>
        </button>
      </div>
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {notifs.length === 0
          ? <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 16px" }}>No notifications</p>
          : notifs.map((n, i) => (
            <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.isRead ? "var(--border)" : "#0d7ff2", marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{n.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{n.message}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/**
 * Shared layout shell for all student pages.
 * Props:
 *   activeKey   — nav item key for current page (highlights sidebar)
 *   title       — page title shown in navbar header area
 *   subtitle    — optional subtitle
 *   profile     — student profile object (passed down from page)
 *   children    — page content
 */
export default function Layout({ activeKey, title, subtitle, profile: profileProp, children }) {
  const session = getSession();
  const [dark,               setDark]               = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileSidebar,      setMobileSidebar]      = useState(false);
  const [showProfileDrop,    setShowProfileDrop]    = useState(false);
  const [showNotifDrop,      setShowNotifDrop]      = useState(false);
  const [unreadCount,        setUnreadCount]        = useState(0);

  // Read cached profile instantly to avoid sidebar flash between page navigations
  const [cachedProfile, setCachedProfile] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; }
  });
  const profile    = profileProp ?? cachedProfile ?? null;
  const firstName  = profile?.name?.split(" ")[0] ?? session?.name?.split(" ")[0] ?? "Student";

  // When profileProp arrives, update the cache
  useEffect(() => {
    if (profileProp) {
      sessionStorage.setItem("cachedProfile", JSON.stringify(profileProp));
      setCachedProfile(profileProp);
    }
  }, [profileProp]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Fetch unread count silently
  useEffect(() => {
    if (!session.regNo) return;
    fetch(`http://localhost:8080/api/student/notifications/${session.regNo}/unread-count`)
      .then(r => r.json()).then(d => { if (d?.unreadCount) setUnreadCount(d.unreadCount); })
      .catch(() => {});
  }, [session.regNo]);

  const handleNav = (key) => {
    const route = PAGE_ROUTES[key];
    if (route) window.location.href = route;
  };

  const vars = dark
    ? `--bg:#0b1120;--card:#101922;--border:#1e293b;--border-light:#162032;--text:#f1f5f9;--text-muted:#94a3b8;`
    : `--bg:#f5f7f8;--card:#ffffff;--border:#e2e8f0;--border-light:#f8fafc;--text:#0f172a;--text-muted:#64748b;`;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
    :root{${vars}}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;}
    button{font-family:'Plus Jakarta Sans',sans-serif;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px;}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    .page-content{animation:fadeIn 0.2s ease;}
    @media(max-width:768px){
      .sidebar{position:fixed!important;left:-260px;top:0;height:100vh;transition:left 0.25s ease;z-index:50;}
      .sidebar-open{left:0!important;}
      .hamburger-btn{display:flex!important;}
      .main-pad{padding:16px!important;}
    }
  `;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{css}</style>

      {/* Mobile backdrop */}
      {mobileSidebar && (
        <div onClick={() => setMobileSidebar(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div className={`sidebar${mobileSidebar ? " sidebar-open" : ""}`}
        style={{ width: 240, flexShrink: 0, background: "var(--card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflow: "hidden", zIndex: 50 }}>
        <Sidebar
          navItems={NAV_ITEMS}
          activeSection={activeKey}
          onNav={handleNav}
          profile={profile}
          onSignOut={() => { sessionStorage.clear(); window.location.href = "/login"; }}
          onMobileClose={() => setMobileSidebar(false)}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Navbar wrapper */}
        <div style={{ position: "relative" }}>
          <Navbar
            profile={profile}
            unreadCount={unreadCount}
            activeSection={activeKey}
            greet={greetText()}
            firstName={firstName}
            dark={dark}
            onDarkModeToggle={() => setDark(p => !p)}
            onMenuClick={() => setMobileSidebar(p => !p)}
            onNotificationClick={() => { setShowNotifDrop(p => !p); setShowProfileDrop(false); }}
            onProfileClick={() => { setShowProfileDrop(p => !p); setShowNotifDrop(false); }}
          />
          {showNotifDrop && (
            <NotifDropdown onClose={() => setShowNotifDrop(false)} />
          )}
          {showProfileDrop && (
            <ProfileDropdown
              profile={profile} regNo={session.regNo}
              onClose={() => setShowProfileDrop(false)}
            />
          )}
        </div>

        {/* Page content */}
        <main className="main-pad page-content" style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {/* Page header */}
          {title && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.4px" }}>{title}</h2>
              {subtitle && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}