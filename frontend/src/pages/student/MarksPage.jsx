import { useState, useEffect } from "react";
import Layout from "./Layout.jsx";

const BASE = "http://localhost:8080/api/student";

function getSession() {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return { ...u, regNo: (u.regNo || "").toString().trim() };
  } catch { return { regNo: "" }; }
}

async function api(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return r.json(); }
  catch { return null; }
}

function Ic({ n, fill = 0, size = 20, color }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}`, lineHeight: 1, display: "inline-flex", alignItems: "center", userSelect: "none", color: color || "inherit", flexShrink: 0 }}>{n}</span>;
}

const card = { background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: 20 };

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
}

const EVAL_TYPES = [
  { value: "all",        label: "All",        icon: "list_alt"   },
  { value: "CAT",        label: "CAT",        icon: "edit_note"  },
  { value: "Lab Test",   label: "Lab Test",   icon: "science"    },
  { value: "Assignment", label: "Assignment", icon: "assignment" },
  { value: "ABL",        label: "ABL",        icon: "psychology" },
  { value: "Quiz",       label: "Quiz",       icon: "quiz"       },
];

export default function MarksPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; }
  });
  const [marks,   setMarks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      profile ? Promise.resolve(profile) : api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/marks/${regNo}`),
    ]).then(([prof, mrks]) => {
      if (prof) { setProfile(prof); sessionStorage.setItem("cachedProfile", JSON.stringify(prof)); }
      if (mrks) setMarks(Array.isArray(mrks) ? mrks : []);
      setLoading(false);
    });
  }, [regNo]);

  // Filter entries across all courses
  const filteredMarks = marks.map(course => ({
    ...course,
    entries: (course.entries ?? []).filter(e => {
      if (filter === "all") return true;
      const et = (e.evaluationType ?? "").trim().toLowerCase();
      const fv = filter.trim().toLowerCase();
      // Also check evaluationLabel for cases like "CAT 1", "CAT 2" under filter "CAT"
      const el = (e.evaluationLabel ?? "").trim().toLowerCase();
      return et === fv || et.startsWith(fv) || el.startsWith(fv);
    }),
  })).filter(course => course.entries.length > 0);

  // Overall summary per course
  const overallByCourse = marks.map(course => {
    const entries  = course.entries ?? [];
    const total    = entries.reduce((s, e) => s + (e.marksObtained ?? 0), 0);
    const maxTotal = entries.reduce((s, e) => s + (e.maxMarks ?? 0), 0);
    return { courseId: course.courseId, pct: maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0 };
  });

  const pctColor = (p) => p >= 90 ? "#16a34a" : p >= 75 ? "#2563eb" : p >= 50 ? "#d97706" : "#dc2626";
  const pctBg    = (p) => p >= 90 ? "#dcfce7"  : p >= 75 ? "#dbeafe"  : p >= 50 ? "#fef3c7"  : "#fee2e2";

  return (
    <Layout activeKey="marks" title="Marks" subtitle="Your internal assessment scores across all courses" profile={profile}>
      {loading ? <Spinner /> : (
        <div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {EVAL_TYPES.map(({ value, label, icon }) => (
              <button key={value} onClick={() => setFilter(value)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 20, border: "1px solid var(--border)", cursor: "pointer", fontSize: 13, fontWeight: filter === value ? 700 : 400, background: filter === value ? "#0d7ff2" : "var(--card)", color: filter === value ? "#fff" : "var(--text-muted)", transition: "all 0.15s" }}>
                <Ic n={icon} size={14} color={filter === value ? "#fff" : "var(--text-muted)"} fill={filter === value ? 1 : 0} />
                {label}
              </button>
            ))}
          </div>

          {/* Summary cards row */}
          {filter === "all" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              {overallByCourse.map(({ courseId, pct }) => {
                const course = marks.find(c => c.courseId === courseId);
                return (
                  <div key={courseId} style={{ ...card, padding: "14px 16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#0d7ff2", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{course?.courseCode}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course?.courseName}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: pctColor(pct) }}>{pct}%</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: pctBg(pct), color: pctColor(pct) }}>
                        {pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 50 ? "Average" : "Poor"}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: 4, borderRadius: 2, width: `${Math.min(pct, 100)}%`, background: pctColor(pct), transition: "width 0.8s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main table */}
          {filteredMarks.length === 0
            ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="grade" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No {filter === "all" ? "" : filter} marks recorded yet</span></div></div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredMarks.map(course => (
                  <div key={course.courseId} style={{ ...card, padding: 0, overflow: "hidden" }}>
                    {/* Course header */}
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0d7ff2", textTransform: "uppercase", letterSpacing: "0.04em" }}>{course.courseCode}</span>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "2px 0 0" }}>{course.courseName}</p>
                      </div>
                      {filter === "all" && (() => {
                        const o = overallByCourse.find(x => x.courseId === course.courseId);
                        return o ? <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 14px", borderRadius: 20, background: pctBg(o.pct), color: pctColor(o.pct) }}>{o.pct}% overall</span> : null;
                      })()}
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "var(--border-light)" }}>
                            {["Evaluation","Type","Marks Obtained","Max Marks","Percentage"].map(h => (
                              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {course.entries.map((e, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}
                              onMouseEnter={el => el.currentTarget.style.background = "var(--border-light)"}
                              onMouseLeave={el => el.currentTarget.style.background = "transparent"}>
                              <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{e.evaluationLabel}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "rgba(13,127,242,0.08)", color: "#0d7ff2" }}>{e.evaluationType}</span>
                              </td>
                              <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{e.marksObtained ?? "—"}</td>
                              <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{e.maxMarks}</td>
                              <td style={{ padding: "12px 16px" }}>
                                {e.percentage != null
                                  ? <span style={{ fontWeight: 700, fontSize: 13, padding: "3px 12px", borderRadius: 20, background: pctBg(e.percentage), color: pctColor(e.percentage) }}>{Math.round(e.percentage)}%</span>
                                  : "—"
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
}