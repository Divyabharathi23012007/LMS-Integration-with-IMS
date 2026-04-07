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

function pctStyle(p) {
  if (p >= 90) return { color: "#16a34a", bg: "#dcfce7", bar: "#22c55e", label: "Excellent" };
  if (p >= 75) return { color: "#1d4ed8", bg: "#dbeafe", bar: "#3b82f6", label: "Safe"      };
  return              { color: "#dc2626", bg: "#fee2e2", bar: "#ef4444", label: "Low"       };
}

export default function AttendancePage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,    setProfile]    = useState(() => { try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; } });
  const [attendance, setAttendance] = useState([]);
  const [sessions,   setSessions]   = useState([]);   // detailed sessions per course
  const [selected,   setSelected]   = useState(null); // courseId to show dates
  const [loading,    setLoading]    = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      profile ? Promise.resolve(profile) : api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/attendance/${regNo}`),
    ]).then(([prof, att]) => {
      if (prof) { setProfile(prof); sessionStorage.setItem("cachedProfile", JSON.stringify(prof)); }
      setAttendance(Array.isArray(att) ? att : []);
      setLoading(false);
    });
  }, [regNo]);

  // Load absent dates for a course
  const loadAbsent = async (courseId) => {
    if (selected === courseId) { setSelected(null); return; }
    setSelected(courseId);
    if (sessions[courseId]) return;
    setLoadingDates(true);
    const data = await api(`${BASE}/attendance/${regNo}/course/${courseId}/sessions`);
    setSessions(p => ({ ...p, [courseId]: Array.isArray(data) ? data : [] }));
    setLoadingDates(false);
  };

  const avg = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + (a.attendancePercentage ?? 0), 0) / attendance.length)
    : 0;

  const low = attendance.filter(a => (a.attendancePercentage ?? 100) < 75).length;

  return (
    <Layout activeKey="attendance" title="Attendance" subtitle={`Average attendance: ${avg}% across ${attendance.length} courses`} profile={profile}>
      {loading ? <Spinner /> : (
        <div>

          {/* Summary stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Average",     value: `${avg}%`,                      icon: "percent",       color: avg >= 75 ? "#0d7ff2" : "#dc2626" },
              { label: "Total Courses", value: attendance.length,             icon: "auto_stories",  color: "#7c3aed"  },
              { label: "Low (<75%)",  value: low,                             icon: "warning",       color: low > 0 ? "#dc2626" : "#16a34a" },
              { label: "Safe (≥75%)", value: attendance.length - low,        icon: "check_circle",  color: "#16a34a"  },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ ...card, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
                  <Ic n={icon} size={18} color={color} fill={1} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0, letterSpacing: "-0.5px" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Course table */}
          {attendance.length === 0
            ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="event_available" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No attendance data</span></div></div>
            : (
              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--border-light)" }}>
                      {["Course","Classes Attended","Total Classes","Attendance %","Status","Absent Dates"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, i) => {
                      const pct  = Math.round(a.attendancePercentage ?? 0);
                      const s    = pctStyle(pct);
                      const isOpen = selected === a.courseId;
                      const absentDates = (sessions[a.courseId] ?? []).filter(s => s.status === "Absent").map(s => s.classDate);

                      return (
                        <>
                          <tr key={a.courseId} style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "14px 16px" }}>
                              <p style={{ fontWeight: 700, fontSize: 12, color: "#0d7ff2", margin: 0, textTransform: "uppercase" }}>{a.courseCode}</p>
                              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.courseName}</p>
                            </td>
                            <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{a.attendedClasses}</td>
                            <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{a.totalClasses}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3 }}>
                                  <div style={{ height: 6, borderRadius: 3, width: `${Math.min(pct, 100)}%`, background: s.bar }} />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <button onClick={() => loadAbsent(a.courseId)}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: isOpen ? "#0d7ff2" : "var(--card)", color: isOpen ? "#fff" : "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                <Ic n="event_busy" size={14} color={isOpen ? "#fff" : "var(--text-muted)"} fill={isOpen ? 1 : 0} />
                                View
                              </button>
                            </td>
                          </tr>

                          {/* Absent dates row */}
                          {isOpen && (
                            <tr key={`${a.courseId}-dates`}>
                              <td colSpan={6} style={{ padding: "14px 20px", background: "rgba(239,68,68,0.03)", borderBottom: "1px solid var(--border-light)" }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                                  <Ic n="event_busy" size={14} color="#dc2626" fill={1} />
                                  Absent Dates for {a.courseCode}
                                </p>
                                {loadingDates && !sessions[a.courseId]
                                  ? <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading...</p>
                                  : absentDates.length === 0
                                    ? <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>🎉 No absences recorded</p>
                                    : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {absentDates.map((date, j) => (
                                          <span key={j} style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                                            {new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                          </span>
                                        ))}
                                      </div>
                                }
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
}