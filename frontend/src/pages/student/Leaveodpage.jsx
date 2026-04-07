import { useState, useEffect, useRef } from "react";
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

function statusStyle(s) {
  const st = (s ?? "").toLowerCase();
  if (st === "approved") return { color: "#16a34a", bg: "#dcfce7", icon: "check_circle"  };
  if (st === "rejected") return { color: "#dc2626", bg: "#fee2e2", icon: "cancel"        };
  return                        { color: "#d97706", bg: "#fef3c7", icon: "hourglass_empty" };
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "inherit",
  border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
  outline: "none", boxSizing: "border-box",
};

export default function LeaveODPage() {
  const session = getSession();
  const regNo   = session.regNo;
  const fileRef = useRef();

  const [profile,  setProfile]  = useState(() => { try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; } });
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState("");
  const [submitErr,  setSubmitErr]  = useState("");
  const [tab,      setTab]      = useState("form"); // "form" | "history"

  const [form, setForm] = useState({
    leaveType: "leave",
    reason:    "",
    fromDate:  "",
    toDate:    "",
    file:      null,
  });

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      profile ? Promise.resolve(profile) : api(`${BASE}/profile/${regNo}`),
      api(`${BASE}/leave/${regNo}`),
    ]).then(([prof, reqs]) => {
      if (prof) { setProfile(prof); sessionStorage.setItem("cachedProfile", JSON.stringify(prof)); }
      setRequests(Array.isArray(reqs) ? reqs : []);
      setLoading(false);
    });
  }, [regNo]);

  const handleSubmit = async () => {
    setSubmitErr(""); setSubmitMsg("");
    if (!form.reason.trim())  { setSubmitErr("Reason is required.");   return; }
    if (!form.fromDate)       { setSubmitErr("From date is required."); return; }
    if (!form.toDate)         { setSubmitErr("To date is required.");   return; }
    if (form.toDate < form.fromDate) { setSubmitErr("To date must be after from date."); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("regNo",     regNo);
      fd.append("leaveType", form.leaveType);
      fd.append("reason",    form.reason);
      fd.append("fromDate",  form.fromDate);
      fd.append("toDate",    form.toDate);
      if (form.file) fd.append("file", form.file);

      const r = await fetch(`${BASE}/leave/apply`, { method: "POST", body: fd });
      if (r.ok) {
        setSubmitMsg("Request submitted successfully! You'll be notified once reviewed.");
        setForm({ leaveType: "leave", reason: "", fromDate: "", toDate: "", file: null });
        // Refresh history
        const updated = await api(`${BASE}/leave/${regNo}`);
        if (updated) setRequests(Array.isArray(updated) ? updated : []);
        setTab("history");
      } else {
        const err = await r.json().catch(() => ({}));
        setSubmitErr(err.error ?? "Submission failed. Please try again.");
      }
    } catch { setSubmitErr("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const pending  = requests.filter(r => (r.status ?? "").toLowerCase() === "pending").length;
  const approved = requests.filter(r => (r.status ?? "").toLowerCase() === "approved").length;

  return (
    <Layout activeKey="leaveOD" title="Leave / On-Duty" subtitle="Apply for leave or on-duty and track your requests" profile={profile}>
      {loading ? <Spinner /> : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Left — main content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--border-light)", padding: 4, borderRadius: 10, width: "fit-content" }}>
              {[["form","Apply for Leave/OD","add_circle"],["history","My Requests","history"]].map(([key, label, icon]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === key ? 700 : 400, background: tab === key ? "var(--card)" : "transparent", color: tab === key ? "#0d7ff2" : "var(--text-muted)", boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                  <Ic n={icon} size={16} color={tab === key ? "#0d7ff2" : "var(--text-muted)"} fill={tab === key ? 1 : 0} />
                  {label}
                </button>
              ))}
            </div>

            {tab === "form" && (
              <div style={{ ...card, maxWidth: 680 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 20px" }}>Submit Leave / OD Request</h3>

                {/* Leave type toggle */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Request Type</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[["leave","Leave","event_busy"],["on-duty","On-Duty (OD)","work"]].map(([val, label, icon]) => (
                      <button key={val} onClick={() => setForm(p => ({ ...p, leaveType: val }))}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 10, border: `2px solid ${form.leaveType === val ? "#0d7ff2" : "var(--border)"}`, background: form.leaveType === val ? "rgba(13,127,242,0.08)" : "var(--bg)", cursor: "pointer", fontSize: 13, fontWeight: form.leaveType === val ? 700 : 400, color: form.leaveType === val ? "#0d7ff2" : "var(--text-muted)" }}>
                        <Ic n={icon} size={18} color={form.leaveType === val ? "#0d7ff2" : "var(--text-muted)"} fill={form.leaveType === val ? 1 : 0} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[["fromDate","From Date"],["toDate","To Date"]].map(([key, label]) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
                      <input type="date" value={form[key]} min={new Date().toISOString().split("T")[0]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#0d7ff2"}
                        onBlur={e  => e.target.style.borderColor = "var(--border)"} />
                    </div>
                  ))}
                </div>

                {/* Reason */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Reason <span style={{ color: "#dc2626" }}>*</span></label>
                  <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Describe the reason for your request..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = "#0d7ff2"}
                    onBlur={e  => e.target.style.borderColor = "var(--border)"} />
                </div>

                {/* Document upload */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Supporting Document <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                  <div onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#0d7ff2"; }}
                    onDragLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border)"; const f = e.dataTransfer.files[0]; if (f) setForm(p => ({ ...p, file: f })); }}
                    style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}>
                    <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={e => setForm(p => ({ ...p, file: e.target.files[0] }))} />
                    <Ic n="cloud_upload" size={28} color={form.file ? "#0d7ff2" : "var(--border)"} fill={1} />
                    {form.file
                      ? <p style={{ fontSize: 13, fontWeight: 600, color: "#0d7ff2", margin: "8px 0 0" }}>{form.file.name}</p>
                      : <><p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0 2px" }}>Click or drag to upload</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>PDF, JPG, PNG, DOC (max 10MB)</p></>
                    }
                  </div>
                </div>

                {submitErr && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 14 }}><Ic n="error" size={16} color="#dc2626" fill={1} /><p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{submitErr}</p></div>}
                {submitMsg && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 14 }}><Ic n="check_circle" size={16} color="#16a34a" fill={1} /><p style={{ fontSize: 12, color: "#16a34a", margin: 0 }}>{submitMsg}</p></div>}

                <button onClick={handleSubmit} disabled={submitting}
                  style={{ width: "100%", padding: "12px 0", background: submitting ? "#94a3b8" : "#0d7ff2", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Ic n={submitting ? "hourglass_empty" : "send"} size={18} color="#fff" />
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}

            {tab === "history" && (
              <div>
                {requests.length === 0
                  ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="history" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No requests submitted yet</span></div></div>
                  : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {requests.map(req => {
                        const s = statusStyle(req.status);
                        return (
                          <div key={req.leaveId} style={{ ...card, display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Ic n={s.icon} size={22} color={s.color} fill={1} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: req.leaveType === "on-duty" ? "rgba(124,58,237,0.1)" : "rgba(13,127,242,0.1)", color: req.leaveType === "on-duty" ? "#7c3aed" : "#0d7ff2", textTransform: "uppercase" }}>
                                    {req.leaveType === "on-duty" ? "On-Duty" : "Leave"}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: s.bg, color: s.color, textTransform: "capitalize" }}>{req.status}</span>
                                </div>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                  {req.appliedAt ? new Date(req.appliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                                </span>
                              </div>
                              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 4px" }}>
                                <strong style={{ color: "var(--text)" }}>
                                  {req.fromDate ? new Date(req.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}
                                  {" – "}
                                  {req.toDate ? new Date(req.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                                </strong>
                              </p>
                              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 4px", lineHeight: 1.5 }}>{req.reason}</p>
                              {req.reviewComment && (
                                <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--border-light)", borderRadius: 8, borderLeft: `3px solid ${s.color}` }}>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 2px" }}>Reviewer Comment</p>
                                  <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>{req.reviewComment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 14px" }}>Request Summary</p>
              {[
                { label: "Total",    value: requests.length, color: "var(--text)"  },
                { label: "Pending",  value: pending,          color: "#d97706"      },
                { label: "Approved", value: approved,         color: "#16a34a"      },
                { label: "Rejected", value: requests.length - pending - approved, color: "#dc2626" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, background: "rgba(13,127,242,0.04)", border: "1px solid rgba(13,127,242,0.15)" }}>
              <Ic n="info" size={20} color="#0d7ff2" fill={1} />
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: "8px 0 0" }}>
                Submit your request at least <strong style={{ color: "var(--text)" }}>2 days before</strong> the planned leave. OD requests require official documentation.
              </p>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}