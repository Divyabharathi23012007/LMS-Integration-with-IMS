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
  try {
    const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
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

const card = { background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: 20 };
const COLORS = ["#0d7ff2","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#be185d","#0369a1"];

function Spinner({ size = 36 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: size, height: size, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function Empty({ icon = "folder_open", label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
      <Ic n={icon} size={40} color="var(--border)" fill={1} />
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function viewFile(materialId) {
  window.open(`${BASE}/study-material/${materialId}/view`, "_blank");
}

function downloadFile(materialId, title) {
  const a = document.createElement("a");
  a.href = `${BASE}/study-material/${materialId}/download`;
  a.download = title;
  a.click();
}

// ─── GATE Insights Components ────────────────────────────────────────────────

function GateBadge({ label, color = "#0d7ff2" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: `${color}18`, color,
      border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

function SyllabusTab({ insight }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0 4px" }}>
        <GateBadge label={`GATE ${insight.gateCode}`} color="#7c3aed" />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{insight.examPattern}</span>
      </div>
      {insight.syllabus.map((topic, i) => (
        <div key={i} style={{
          background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{topic.name}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#059669", background: "rgba(5,150,105,0.1)",
              padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(5,150,105,0.2)",
            }}>~{topic.marks} marks</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {topic.subtopics.map((s, j) => (
              <span key={j} style={{
                fontSize: 11, background: "var(--card)", border: "1px solid var(--border)",
                padding: "3px 10px", borderRadius: 20, color: "var(--text-muted)",
              }}>{s}</span>
            ))}
          </div>
        </div>
      ))}
      <div style={{ padding: "12px 16px", background: "rgba(13,127,242,0.05)", borderRadius: 10, border: "1px solid rgba(13,127,242,0.15)", marginTop: 4 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#0d7ff2", margin: "0 0 6px" }}>Important Topics</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {insight.importantTopics.map((t, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#0d7ff2", background: "rgba(13,127,242,0.1)", padding: "3px 10px", borderRadius: 20 }}>⭐ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PYQTab({ insight }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
      {insight.pyqs.map((q, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span style={{
              flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#d97706",
              background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)",
              padding: "3px 8px", borderRadius: 20, marginTop: 1,
            }}>{q.year}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1, lineHeight: 1.5 }}>{q.question}</span>
            <Ic n={open === i ? "expand_less" : "expand_more"} size={18} color="var(--text-muted)" />
          </button>
          {open === i && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {q.options.map((opt, j) => {
                  const letter = ["A","B","C","D"][j];
                  const isCorrect = letter === q.answer;
                  return (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
                      background: isCorrect ? "rgba(5,150,105,0.08)" : "var(--card)",
                      border: `1px solid ${isCorrect ? "rgba(5,150,105,0.25)" : "var(--border)"}`,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        background: isCorrect ? "#059669" : "var(--border)",
                        color: isCorrect ? "#fff" : "var(--text-muted)",
                      }}>{letter}</span>
                      <span style={{ fontSize: 12, color: "var(--text)", fontWeight: isCorrect ? 600 : 400 }}>{opt}</span>
                      {isCorrect && <Ic n="check_circle" size={14} color="#059669" fill={1} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(13,127,242,0.06)", borderRadius: 8, border: "1px solid rgba(13,127,242,0.15)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#0d7ff2", margin: "0 0 4px" }}>Explanation</p>
                <p style={{ fontSize: 12, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResourcesTab({ insight }) {
  const typeIcon = { Practice: "quiz", Papers: "description", Video: "play_circle" };
  const typeColor = { Practice: "#7c3aed", Papers: "#d97706", Video: "#dc2626" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
      {insight.resources.map((r, i) => (
        <a key={i} href={r.url} target="_blank" rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
            textDecoration: "none", transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#0d7ff2"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 8, flexShrink: 0,
            background: `${typeColor[r.type] || "#0d7ff2"}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic n={typeIcon[r.type] || "link"} size={18} color={typeColor[r.type] || "#0d7ff2"} fill={1} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{r.title}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{r.type}</p>
          </div>
          <Ic n="open_in_new" size={16} color="var(--text-muted)" />
        </a>
      ))}
    </div>
  );
}

function GateInsightsPanel({ courseName, courseCode, accentColor }) {
  const [insight, setInsight]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("syllabus");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ courseName, courseCode: courseCode || "" });
    api(`${BASE}/gate/insights?${params}`)
      .then(data => {
        setInsight(data?.available ? data.insight : null);
        setLoading(false);
      });
  }, [courseName, courseCode]);

  if (loading) return <div style={{ padding: "20px 0" }}><Spinner size={28} /></div>;

  if (!insight) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
        background: "var(--bg)", borderRadius: 10, margin: "4px 0",
      }}>
        <Ic n="school" size={20} color="var(--text-muted)" fill={1} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          No GATE insights available for this subject.
        </p>
      </div>
    );
  }

  const tabs = [
    { key: "syllabus",   label: "Syllabus & Weightage", icon: "format_list_bulleted" },
    { key: "pyq",        label: "PYQs",                 icon: "history_edu" },
    { key: "resources",  label: "Resources",            icon: "link" },
  ];

  return (
    <div style={{ padding: "0 4px" }}>
      {/* GATE header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "14px 0 10px",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ic n="school" size={17} color="#7c3aed" fill={1} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", margin: 0 }}>GATE Insights — {insight.subject}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "1px 0 0" }}>{insight.examPattern}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: "none", borderBottom: activeTab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
              color: activeTab === t.key ? "#7c3aed" : "var(--text-muted)",
              marginBottom: -1,
            }}>
            <Ic n={t.icon} size={14} color={activeTab === t.key ? "#7c3aed" : "var(--text-muted)"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "syllabus"  && <SyllabusTab  insight={insight} />}
      {activeTab === "pyq"       && <PYQTab       insight={insight} />}
      {activeTab === "resources" && <ResourcesTab insight={insight} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyMaterialPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,    setProfile]    = useState(null);
  const [courses,    setCourses]    = useState([]);
  const [materials,  setMaterials]  = useState({});
  const [expanded,   setExpanded]   = useState(null);
  const [activeTab,  setActiveTab]  = useState({});  // courseId → "materials" | "gate"
  const [loading,    setLoading]    = useState(true);
  const [loadingMat, setLoadingMat] = useState(null);

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/courses/${regNo}`),
    ]).then(([prof, crs]) => {
      if (prof) setProfile(prof);
      if (crs)  setCourses(Array.isArray(crs) ? crs : []);
      setLoading(false);
    });
  }, [regNo]);

  const toggleCourse = async (courseId) => {
    if (expanded === courseId) { setExpanded(null); return; }
    setExpanded(courseId);
    // Default to materials tab
    setActiveTab(prev => ({ ...prev, [courseId]: prev[courseId] || "materials" }));
    if (materials[courseId]) return;
    setLoadingMat(courseId);
    const data = await api(`${BASE}/study-material/course/${courseId}`);
    setMaterials(p => ({ ...p, [courseId]: Array.isArray(data) ? data : [] }));
    setLoadingMat(null);
  };

  const setTab = (courseId, tab) => {
    setActiveTab(prev => ({ ...prev, [courseId]: tab }));
  };

  return (
    <Layout activeKey="studyMaterial" title="Study Materials" subtitle="Access course materials and GATE insights for each subject" profile={profile}>
      {loading
        ? <Spinner />
        : courses.length === 0
          ? <div style={card}><Empty icon="menu_book" label="No courses enrolled" /></div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map((course, i) => {
                const col      = COLORS[i % COLORS.length];
                const isOpen   = expanded === course.courseId;
                const mats     = materials[course.courseId] ?? [];
                const isMtLoad = loadingMat === course.courseId;
                const tab      = activeTab[course.courseId] || "materials";

                return (
                  <div key={course.courseId} style={{ ...card, padding: 0, overflow: "hidden" }}>

                    {/* Course header */}
                    <button onClick={() => toggleCourse(course.courseId)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic n="menu_book" size={20} color={col} fill={1} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: col, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{course.courseCode}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "2px 0 0" }}>{course.courseName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{course.facultyName}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {/* GATE badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: "#7c3aed",
                          background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                          padding: "2px 8px", borderRadius: 20,
                        }}>GATE</span>
                        {!isMtLoad && materials[course.courseId] !== undefined && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                            {mats.length} material{mats.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        <Ic n={isOpen ? "expand_less" : "expand_more"} size={20} color="var(--text-muted)" />
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)" }}>

                        {/* Inner tab bar */}
                        <div style={{ display: "flex", background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0 20px" }}>
                          {[
                            { key: "materials", label: "Study Materials", icon: "folder_open" },
                            { key: "gate",      label: "GATE Insights",   icon: "school"      },
                          ].map(t => (
                            <button key={t.key} onClick={() => setTab(course.courseId, t.key)}
                              style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                background: "none",
                                borderBottom: tab === t.key ? `2px solid ${t.key === "gate" ? "#7c3aed" : col}` : "2px solid transparent",
                                color: tab === t.key ? (t.key === "gate" ? "#7c3aed" : col) : "var(--text-muted)",
                                marginBottom: -1,
                              }}>
                              <Ic n={t.icon} size={14} color={tab === t.key ? (t.key === "gate" ? "#7c3aed" : col) : "var(--text-muted)"} />
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Materials tab */}
                        {tab === "materials" && (
                          <>
                            {isMtLoad
                              ? <Spinner />
                              : mats.length === 0
                                ? <div style={{ padding: "20px" }}><Empty icon="folder_open" label="No materials uploaded yet" /></div>
                                : mats.map((m, j) => (
                                  <div key={m.materialId} style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "14px 20px",
                                    borderBottom: j < mats.length - 1 ? "1px solid var(--border-light)" : "none",
                                    background: j % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                                  }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(13,127,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <Ic n={m.videoLink ? "play_circle" : "description"} size={18} color="#0d7ff2" fill={1} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{m.title}</p>
                                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                                        {m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                                        {m.uploadedBy ? ` · ${m.uploadedBy}` : ""}
                                      </p>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                      {m.videoLink && (
                                        <a href={m.videoLink} target="_blank" rel="noreferrer"
                                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#dc2626", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(220,38,38,0.15)" }}>
                                          <Ic n="play_circle" size={14} color="#dc2626" fill={1} />Watch
                                        </a>
                                      )}
                                      {m.fileData && (
                                        <>
                                          <button onClick={() => viewFile(m.materialId)}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(13,127,242,0.08)", color: "#0d7ff2", fontSize: 12, fontWeight: 600, border: "1px solid rgba(13,127,242,0.15)", cursor: "pointer" }}>
                                            <Ic n="visibility" size={14} color="#0d7ff2" />View
                                          </button>
                                          <button onClick={() => downloadFile(m.materialId, m.title)}
                                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(5,150,105,0.08)", color: "#059669", fontSize: 12, fontWeight: 600, border: "1px solid rgba(5,150,105,0.15)", cursor: "pointer" }}>
                                            <Ic n="download" size={14} color="#059669" />Download
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))
                            }
                          </>
                        )}

                        {/* GATE insights tab */}
                        {tab === "gate" && (
                          <div style={{ padding: "4px 20px 20px" }}>
                            <GateInsightsPanel
                              courseName={course.courseName}
                              courseCode={course.courseCode}
                              accentColor={col}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
      }
    </Layout>
  );
}
