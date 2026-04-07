import { useState, useEffect } from "react";
import Layout from "./Layout.jsx";

const BASE = "http://localhost:8080/api/student";

function getSession() {
  try { const u = JSON.parse(sessionStorage.getItem("user") || "{}"); return { ...u, regNo: (u.regNo || "").toString().trim() }; }
  catch { return { regNo: "" }; }
}

async function api(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return r.json(); } catch { return null; }
}

function Ic({ n, fill = 0, size = 20, color }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}`, lineHeight: 1, display: "inline-flex", alignItems: "center", userSelect: "none", color: color || "inherit", flexShrink: 0 }}>{n}</span>;
}

const card = { background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: 20 };

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const COURSE_COLORS = ["#0d7ff2","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#be185d","#0369a1"];

export default function AnnouncementsPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,       setProfile]       = useState(() => { try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; } });
  const [announcements, setAnnouncements] = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [filter,        setFilter]        = useState("all");
  const [expanded,      setExpanded]      = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      profile ? Promise.resolve(profile) : api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/announcements/${regNo}`),
      api(`${BASE}/courses/${regNo}`),
    ]).then(([prof, ann, crs]) => {
      if (prof) { setProfile(prof); sessionStorage.setItem("cachedProfile", JSON.stringify(prof)); }
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setCourses(Array.isArray(crs) ? crs : []);
      setLoading(false);
    });
  }, [regNo]);

  const courseColorMap = {};
  courses.forEach((c, i) => { courseColorMap[c.courseId] = COURSE_COLORS[i % COURSE_COLORS.length]; });

  const filtered = filter === "all" ? announcements
    : announcements.filter(a => String(a.courseId) === filter);

  const uniqueCourses = [...new Map(announcements.map(a => [a.courseId, { courseId: a.courseId, courseCode: courses.find(c => c.courseId === a.courseId)?.courseCode ?? `Course ${a.courseId}` }])).values()];

  return (
    <Layout activeKey="announcements" title="Announcements" subtitle={`${announcements.length} announcement${announcements.length !== 1 ? "s" : ""} across your courses`} profile={profile}>
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Left — announcement list */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Course filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => setFilter("all")}
                style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid var(--border)", cursor: "pointer", fontSize: 12, fontWeight: filter === "all" ? 700 : 400, background: filter === "all" ? "#0d7ff2" : "var(--card)", color: filter === "all" ? "#fff" : "var(--text-muted)" }}>
                All ({announcements.length})
              </button>
              {uniqueCourses.map(({ courseId, courseCode }) => {
                const count = announcements.filter(a => a.courseId === courseId).length;
                const col   = courseColorMap[courseId] ?? "#0d7ff2";
                const isActive = filter === String(courseId);
                return (
                  <button key={courseId} onClick={() => setFilter(String(courseId))}
                    style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${isActive ? col : "var(--border)"}`, cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400, background: isActive ? col : "var(--card)", color: isActive ? "#fff" : "var(--text-muted)" }}>
                    {courseCode} ({count})
                  </button>
                );
              })}
            </div>

            {filtered.length === 0
              ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="campaign" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No announcements</span></div></div>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map(a => {
                    const col      = courseColorMap[a.courseId] ?? "#0d7ff2";
                    const isOpen   = expanded === a.announcementId;
                    const longMsg  = (a.message ?? "").length > 180;
                    const preview  = longMsg && !isOpen ? (a.message ?? "").slice(0, 180) + "..." : (a.message ?? "");

                    return (
                      <div key={a.announcementId} style={{ ...card, borderLeft: `4px solid ${col}`, padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Ic n="campaign" size={20} color={col} fill={1} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>{a.title}</p>
                                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${col}18`, color: col }}>
                                    {courses.find(c => c.courseId === a.courseId)?.courseCode ?? `Course ${a.courseId}`}
                                  </span>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>by {a.author}</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(a.createdAt)}</span>
                            </div>

                            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{preview}</p>

                            {longMsg && (
                              <button onClick={() => setExpanded(isOpen ? null : a.announcementId)}
                                style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: col, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                {isOpen ? "Show less ↑" : "Read more ↓"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          {/* Right — stats sidebar */}
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 14px" }}>By Course</p>
              {uniqueCourses.map(({ courseId, courseCode }) => {
                const count = announcements.filter(a => a.courseId === courseId).length;
                const col   = courseColorMap[courseId] ?? "#0d7ff2";
                return (
                  <div key={courseId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{courseCode}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{count}</span>
                  </div>
                );
              })}
              {uniqueCourses.length === 0 && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No announcements yet</p>}
            </div>

            <div style={{ ...card, background: "linear-gradient(135deg,#0d7ff2,#0051cc)" }}>
              <Ic n="info" size={24} color="#fff" fill={1} />
              <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: "10px 0 6px" }}>Stay Updated</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, margin: 0 }}>Check here regularly for important updates from your faculty.</p>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}