import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import Navbar from '../../components/Navbar/Navbar.jsx';

const FACULTY_NAV_ITEMS = [
  { key: 'home',        label: 'Dashboard',    icon: 'dashboard' },
  { key: 'assignments', label: 'Assignments',  icon: 'assignment' },
  { key: 'quizzes',     label: 'Quizzes',      icon: 'quiz' },
  { key: 'materials',   label: 'Materials',    icon: 'folder_open' },
  { key: 'grades',      label: 'Grade Center', icon: 'grading' },
];

const PAGE_ROUTES = {
  home: '/faculty/dashboard',
  assignments: '/faculty/assignments',
  quizzes: '/faculty/quizzes',
  materials: '/faculty/materials',
  grades: '/faculty/grades',
};

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function greetText() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
}

export default function FacultyLayout({ activeKey, title, subtitle, children }) {
  const session = getSession();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const [cachedProfile, setCachedProfile] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('cachedProfile') || 'null'); } catch { return null; }
  });
  const profile = cachedProfile ?? session ?? null;
  const firstName = profile?.name?.split(' ')[0] ?? 'Faculty';
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem('cachedProfile', JSON.stringify(session));
      setCachedProfile(session);
    }
  }, [session]);

  const handleNav = (key) => {
    const route = PAGE_ROUTES[key];
    if (route) navigate(route);
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
    ::-webkit-scrollbar{width:6px;height:6px;}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
    ::-webkit-scrollbar-track{background:var(--bg);}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    .page-content{animation:fadeIn 0.2s ease;}
    .faculty-layout{min-height:100vh;}
    .faculty-layout .sidebar{position:fixed;left:0;top:0;height:100vh;z-index:50;}
    .faculty-layout .main-pad{padding:20px 24px;}
    @media(max-width:768px){
      .faculty-layout .sidebar{left:-260px;transition:left 0.25s ease;}
      .faculty-layout .sidebar-open{left:0!important;}
      .faculty-layout .hamburger-btn{display:flex!important;}
      .faculty-layout .main-pad{padding:16px 20px!important;}
      .faculty-layout main{min-height:calc(100vh - 56px);}
    }
    @media(max-width:640px){
      .faculty-layout .main-pad{padding:12px 16px!important;}
    }
  `;

  return (
    <div className="faculty-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{css}</style>

      {/* Mobile overlay backdrop */}
      {mobileSidebar && (
        <div onClick={() => setMobileSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div className={`sidebar${mobileSidebar ? ' sidebar-open' : ''}`} style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        zIndex: 50
      }}>
        <Sidebar
          navItems={FACULTY_NAV_ITEMS}
          activeSection={activeKey}
          onNav={handleNav}
          profile={profile}
          onSignOut={() => { sessionStorage.clear(); window.location.href = '/login'; }}
          mobileOpen={mobileSidebar}
          onMobileClose={() => setMobileSidebar(false)}
        />
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <Navbar
            profile={profile}
            unreadCount={0}
            activeSection={activeKey}
            greet={greetText()}
            firstName={firstName}
            dark={dark}
            onDarkModeToggle={() => setDark(p => !p)}
            onMenuClick={() => setMobileSidebar(p => !p)}
            onNotificationClick={() => { setShowNotifDrop(p => !p); setShowProfileDrop(false); }}
            onProfileClick={() => { setShowProfileDrop(p => !p); setShowNotifDrop(false); }}
          />
        </div>

        {/* Page content */}
        <main className="main-pad page-content" style={{
          flex: 1,
          padding: '24px 28px',
          overflowY: 'auto',
          background: 'var(--bg)',
          minHeight: 'calc(100vh - 64px)' // Account for navbar height
        }}>
          {title && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--text)',
                margin: 0,
                letterSpacing: '-0.6px',
                lineHeight: 1.2
              }}>{title}</h2>
              {subtitle && (
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  marginTop: 8,
                  lineHeight: 1.4
                }}>{subtitle}</p>
              )}
            </div>
          )}
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
