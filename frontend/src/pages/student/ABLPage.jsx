import { useState, useEffect, useRef } from "react";
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
    const r = await fetch(url);
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
const COLORS = ["#7c3aed","#0d7ff2","#059669","#d97706","#dc2626","#0891b2","#be185d","#0369a1"];

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

function StatusBar({ status, gradingStatus }) {
  const steps = [
    { key: "submitted", label: "SUBMITTED", icon: "upload_file" },
    { key: "viewed",    label: "VIEWED",    icon: "visibility"   },
    { key: "graded",    label: "GRADED",    icon: "grade"        },
  ];
  const activeIdx =
    gradingStatus === "graded"  ? 2 :
    gradingStatus === "viewed"  ? 1 :
    status === "submitted" || status === "graded" ? 0 : -1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 16 }}>
      {steps.map((step, i) => {
        const isActive  = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 8px",
              borderRadius: i === 0 ? "8px 0 0 8px" : i === 2 ? "0 8px 8px 0" : 0,
              background: isActive ? (isCurrent ? "#7c3aed" : "#ede9fe") : "var(--border-light)",
              border: `1px solid ${isActive ? (isCurrent ? "#7c3aed" : "#c4b5fd") : "var(--border)"}`,
              borderRight: i < 2 ? "none" : undefined,
            }}>
              <Ic n={step.icon} size={16} color={isActive ? (isCurrent ? "#fff" : "#6d28d9") : "var(--border)"} fill={isActive ? 1 : 0} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: isActive ? (isCurrent ? "#fff" : "#6d28d9") : "var(--text-muted)" }}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ABLDetail({ activity, regNo, onBack }) {
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadMsg,   setUploadMsg]   = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  const isPastDeadline = activity.deadline && new Date(activity.deadline) < new Date();
  const isSubmitted    = activity.submissionStatus === "submitted" || activity.submissionStatus === "graded";
  const left           = daysLeft(activity.deadline);

  const handleSubmit = async () => {
    if (!file) { setUploadError("Please select a file to submit."); return; }
    if (isPastDeadline) { setUploadError("Deadline has passed."); return; }
    setUploading(true); setUploadError(""); setUploadMsg("");

    const form = new FormData();
    form.append("file", file);
    form.append("regNo", regNo);

    try {
      const r = await fetch(`${BASE}/abl/${activity.ablId}/submit`, { method: "POST", body: form });
      if (r.ok) {
        setUploadMsg("Activity submitted successfully!");
        setFile(null);
      } else {
        const err = await r.json().catch(() => ({}));
        setUploadError(err.error ?? "Submission failed. Please try again.");
      }
    } catch { setUploadError("Network error. Please try again."); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>
        <Ic n="arrow_back" size={18} color="#7c3aed" />
        Back to ABL Activities
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>

        {/* Activity Info */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", padding: "2px 10px", borderRadius: 20 }}>
                {activity.courseCode}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "8px 0 0", letterSpacing: "-0.3px" }}>{activity.title}</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{activity.courseName}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Deadline</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "3px 0 0" }}>
                {activity.deadline ? new Date(activity.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </p>
              {left !== null && (
                <p style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: left < 0 ? "#ef4444" : left <= 2 ? "#f59e0b" : "#16a34a" }}>
                  {left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? "Due today" : `${left}d left`}
                </p>
              )}
            </div>
          </div>

          {activity.description && (
            <div style={{ padding: "14px 16px", background: "var(--border-light)", borderRadius: 10, marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{activity.description}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {activity.activityFile && (
              <a href={`${BASE}/abl/${activity.ablId}/file`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: "rgba(124,58,237,0.06)", color: "#7c3aed", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(124,58,237,0.15)" }}>
                <Ic n="download" size={16} color="#7c3aed" />
                Download Activity File
              </a>
            )}
            {activity.activityLink && (
              <a href={activity.activityLink} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: "rgba(5,150,105,0.06)", color: "#059669", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(5,150,105,0.15)" }}>
                <Ic n="open_in_new" size={16} color="#059669" />
                Open Reference Link
              </a>
            )}
          </div>
        </div>

        {/* Submission */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 14px" }}>Your Submission</h3>

          {isSubmitted
            ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, marginBottom: 8 }}>
                  <Ic n="check_circle" size={20} color="#16a34a" fill={1} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#15803d", margin: 0 }}>Submitted Successfully</p>
                </div>
                {activity.submissionStatus === "graded" && activity.marksObtained != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, marginBottom: 8 }}>
                    <Ic n="grade" size={20} color="#7c3aed" fill={1} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                      Marks: <span style={{ color: "#7c3aed" }}>{activity.marksObtained}</span>
                    </p>
                  </div>
                )}
                <StatusBar status={activity.submissionStatus} gradingStatus={activity.gradingStatus} />
              </div>
            )
            : isPastDeadline
              ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 }}>
                  <Ic n="lock" size={20} color="#dc2626" fill={1} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", margin: 0 }}>Submission closed — deadline has passed.</p>
                </div>
              )
              : (
                <div>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#7c3aed"; }}
                    onDragLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border)"; const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                    style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", marginBottom: 14 }}>
                    <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx,.zip,.rar" onChange={e => setFile(e.target.files[0])} />
                    <Ic n="cloud_upload" size={36} color={file ? "#7c3aed" : "var(--border)"} fill={1} />
                    {file
                      ? <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", margin: "10px 0 0" }}>{file.name}</p>
                      : <><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", margin: "10px 0 4px" }}>Click or drag your file here</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>PDF, DOC, DOCX, ZIP (max 20MB)</p></>
                    }
                  </div>

                  {uploadError && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 12 }}><Ic n="error" size={16} color="#dc2626" fill={1} /><p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{uploadError}</p></div>}
                  {uploadMsg  && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 12 }}><Ic n="check_circle" size={16} color="#16a34a" fill={1} /><p style={{ fontSize: 12, color: "#16a34a", margin: 0 }}>{uploadMsg}</p></div>}

                  <button onClick={handleSubmit} disabled={uploading || !file}
                    style={{ padding: "11px 28px", background: uploading || !file ? "#94a3b8" : "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: uploading || !file ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <Ic n={uploading ? "hourglass_empty" : "upload"} size={16} color="#fff" />
                    {uploading ? "Submitting..." : "Submit Activity"}
                  </button>
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}

export default function ABLPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,    setProfile]    = useState(null);
  const [courses,    setCourses]    = useState([]);
  const [activities, setActivities] = useState([]);
  const [expanded,   setExpanded]   = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/courses/${regNo}`),
      api(`${BASE}/abl/${regNo}`),
    ]).then(([prof, crs, abl]) => {
      if (prof) setProfile(prof);
      if (crs)  setCourses(Array.isArray(crs) ? crs : []);
      if (abl)  setActivities(Array.isArray(abl) ? abl : []);
      setLoading(false);
    });
  }, [regNo]);

  if (selected) {
    return (
      <Layout activeKey="abl" title={selected.title} profile={profile}>
        <ABLDetail activity={selected} regNo={regNo} onBack={() => setSelected(null)} />
      </Layout>
    );
  }

  return (
    <Layout activeKey="abl" title="ABL Activities" subtitle="Activity Based Learning tasks assigned by your faculty" profile={profile}>
      {loading
        ? <Spinner />
        : courses.length === 0
          ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="science" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No courses enrolled</span></div></div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map((course, i) => {
                const col        = COLORS[i % COLORS.length];
                const isOpen     = expanded === course.courseId;
                const courseAbls = activities.filter(a => a.courseCode === course.courseCode);
                const pending    = courseAbls.filter(a => a.submissionStatus === "not_submitted").length;

                return (
                  <div key={course.courseId} style={{ ...card, padding: 0, overflow: "hidden" }}>
                    <button onClick={() => setExpanded(isOpen ? null : course.courseId)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic n="science" size={20} color={col} fill={1} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: col, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{course.courseCode}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "2px 0 0" }}>{course.courseName}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        {pending > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "#ede9fe", color: "#6d28d9" }}>{pending} pending</span>}
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{courseAbls.length} total</span>
                        <Ic n={isOpen ? "expand_less" : "expand_more"} size={20} color="var(--text-muted)" />
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {courseAbls.length === 0
                          ? <div style={{ padding: 20 }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0" }}><Ic n="science" size={32} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No activities yet</span></div></div>
                          : courseAbls.map((a, j) => {
                            const left    = daysLeft(a.deadline);
                            const overdue = a.isOverdue && a.submissionStatus === "not_submitted";
                            const done    = a.submissionStatus === "submitted" || a.submissionStatus === "graded";
                            return (
                              <button key={a.ablId}
                                onClick={() => setSelected(a)}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: j < courseAbls.length - 1 ? "1px solid var(--border-light)" : "none" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: done ? "#dcfce7" : overdue ? "#fee2e2" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Ic n={done ? "check_circle" : overdue ? "warning" : "pending"} size={18} color={done ? "#16a34a" : overdue ? "#dc2626" : "#7c3aed"} fill={1} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>{a.title}</p>
                                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                                    {a.deadline ? new Date(a.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "No deadline"}
                                    {left !== null && !done && <span style={{ color: left < 0 ? "#ef4444" : left <= 2 ? "#f59e0b" : "var(--text-muted)" }}>{" · "}{left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? "Due today" : `${left}d left`}</span>}
                                  </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, textTransform: "uppercase",
                                    background: done ? "#dcfce7" : overdue ? "#fee2e2" : "#ede9fe",
                                    color:      done ? "#15803d" : overdue ? "#dc2626" : "#6d28d9",
                                  }}>
                                    {a.submissionStatus === "graded" ? "Graded" : done ? "Submitted" : overdue ? "Overdue" : "Pending"}
                                  </span>
                                  <Ic n="chevron_right" size={18} color="var(--text-muted)" />
                                </div>
                              </button>
                            );
                          })
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