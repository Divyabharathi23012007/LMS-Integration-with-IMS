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

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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

// View BLOB file in new tab
function viewFile(materialId) {
  window.open(`${BASE}/study-material/${materialId}/view`, "_blank");
}

// Download BLOB file
function downloadFile(materialId, title) {
  const a = document.createElement("a");
  a.href = `${BASE}/study-material/${materialId}/download`;
  a.download = title;
  a.click();
}

export default function StudyMaterialPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,   setProfile]   = useState(null);
  const [courses,   setCourses]   = useState([]);
  const [materials, setMaterials] = useState({});   // courseId → material[]
  const [expanded,  setExpanded]  = useState(null); // courseId or null
  const [loading,   setLoading]   = useState(true);
  const [loadingMat, setLoadingMat] = useState(null); // courseId being loaded

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
    if (materials[courseId]) return; // already loaded
    setLoadingMat(courseId);
    const data = await api(`${BASE}/study-material/course/${courseId}`);
    setMaterials(p => ({ ...p, [courseId]: Array.isArray(data) ? data : [] }));
    setLoadingMat(null);
  };

  return (
    <Layout activeKey="studyMaterial" title="Study Materials" subtitle="Access course materials uploaded by your faculty" profile={profile}>
      {loading
        ? <Spinner />
        : courses.length === 0
          ? <div style={card}><Empty icon="menu_book" label="No courses enrolled" /></div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map((course, i) => {
                const col     = COLORS[i % COLORS.length];
                const isOpen  = expanded === course.courseId;
                const mats    = materials[course.courseId] ?? [];
                const loading = loadingMat === course.courseId;

                return (
                  <div key={course.courseId} style={{ ...card, padding: 0, overflow: "hidden" }}>

                    {/* Course header row */}
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
                      {!loading && materials[course.courseId] !== undefined && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginRight: 8 }}>
                          {mats.length} material{mats.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <Ic n={isOpen ? "expand_less" : "expand_more"} size={20} color="var(--text-muted)" />
                    </button>

                    {/* Materials list */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {loading
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
                                      <Ic n="play_circle" size={14} color="#dc2626" fill={1} />
                                      Watch
                                    </a>
                                  )}
                                  {m.fileData && (
                                    <>
                                      <button onClick={() => viewFile(m.materialId)}
                                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(13,127,242,0.08)", color: "#0d7ff2", fontSize: 12, fontWeight: 600, border: "1px solid rgba(13,127,242,0.15)", cursor: "pointer" }}>
                                        <Ic n="visibility" size={14} color="#0d7ff2" />
                                        View
                                      </button>
                                      <button onClick={() => downloadFile(m.materialId, m.title)}
                                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(5,150,105,0.08)", color: "#059669", fontSize: 12, fontWeight: 600, border: "1px solid rgba(5,150,105,0.15)", cursor: "pointer" }}>
                                        <Ic n="download" size={14} color="#059669" />
                                        Download
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                        }
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