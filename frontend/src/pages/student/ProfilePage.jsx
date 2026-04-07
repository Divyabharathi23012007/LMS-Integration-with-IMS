import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout.jsx";

const BASE = "http://localhost:8080/api";

function getSession() {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return { ...u, regNo: (u.regNo || "").toString().trim() };
  } catch { return { regNo: "" }; }
}

function Ic({ n, fill = 0, size = 20, color }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}`, lineHeight: 1, display: "inline-flex", alignItems: "center", userSelect: "none", color: color || "inherit", flexShrink: 0 }}>{n}</span>;
}

const card = { background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: 20 };

const css = `
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
`;

export default function ProfilePage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,   setProfile]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("cachedProfile") || "null"); } catch { return null; }
  });
  const [loading,   setLoading]   = useState(!profile);
  const [pwForm,    setPwForm]    = useState({ current: "", newPw: "", confirm: "" });
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    if (profile) return; // already have cached profile
    fetch(`${BASE}/student/profile/${regNo}`)
      .then(r => r.json()).then(p => {
        setProfile(p);
        sessionStorage.setItem("cachedProfile", JSON.stringify(p));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [regNo]);

  const firstName = profile?.name?.split(" ")[0] ?? "Student";

  const fields = [
    ["Registration No", profile?.regNo         ?? regNo],
    ["Full Name",       profile?.name           ?? "—"],
    ["Date of Birth",   profile?.dob            ?? "—"],
    ["Age",             profile?.age            ?? "—"],
    ["Gender",          profile?.gender         ?? "—"],
    ["Aadhar Number",   profile?.aadharNumber   ?? "—"],
    ["UMIS Number",     profile?.umisNumber     ?? "—"],
    ["Department",      profile?.department     ?? "—"],
    ["Course",          profile?.course         ?? "—"],
    ["Semester",        profile?.semester       ?? "—"],
    ["Section",         profile?.section        ?? "—"],
    ["Batch",           profile?.batch          ?? "—"],
    ["Admission Year",  profile?.admissionYear  ?? "—"],
    ["Email",           profile?.email          ?? "—"],
    ["Phone",           profile?.phone          ?? "—"],
  ];

  const handlePasswordUpdate = async () => {
    setPwError(""); setPwSuccess("");
    const { current, newPw, confirm } = pwForm;
    if (!current || !newPw || !confirm) { setPwError("All fields are required."); return; }
    if (newPw.length < 8)               { setPwError("New password must be at least 8 characters."); return; }
    if (newPw === current)              { setPwError("New password must differ from current password."); return; }
    if (newPw !== confirm)              { setPwError("Passwords do not match."); return; }

    setPwLoading(true);
    try {
      await axios.put(`${BASE}/auth/change-password`,
        { regNo, currentPassword: current, newPassword: newPw }
      );
      setPwSuccess("Password updated successfully.");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      setPwError(e?.response?.data?.error ?? "Failed to update password. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px 10px 38px",
    borderRadius: 8, fontSize: 13, fontFamily: "inherit",
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <Layout activeKey="profile" title="Profile" subtitle="Your student information and account settings" profile={profile}>
      <style>{css}</style>

      {loading
        ? <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>
        : (
          <div className="profile-grid">

            {/* Left — Student Information */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(13,127,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(13,127,242,0.2)", flexShrink: 0 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#0d7ff2" }}>{firstName[0]}</span>
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0 }}>{profile?.name ?? "—"}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>{profile?.regNo ?? regNo}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(13,127,242,0.08)", color: "#0d7ff2", padding: "2px 10px", borderRadius: 20, display: "inline-block", marginTop: 5 }}>Student</span>
                </div>
              </div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Student Information</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {fields.map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 0", color: "var(--text-muted)", width: "45%", fontSize: 12 }}>{k}</td>
                      <td style={{ padding: "10px 0", fontWeight: 600, color: "var(--text)" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right — Reset Password */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(13,127,242,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="lock" size={20} color="#0d7ff2" fill={1} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>Reset Password</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>Update your account password</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["current", "Current Password",    "lock"],
                  ["newPw",   "New Password",         "lock_open"],
                  ["confirm", "Confirm New Password", "check_circle"],
                ].map(([key, label, icon]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <Ic n={icon} size={16} color="var(--text-muted)" />
                      </span>
                      <input type="password" value={pwForm[key]}
                        onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={label} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#0d7ff2"}
                        onBlur={e  => e.target.style.borderColor = "var(--border)"} />
                    </div>
                  </div>
                ))}

                {pwError && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}><Ic n="error" size={16} color="#dc2626" fill={1} /><p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{pwError}</p></div>}
                {pwSuccess && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}><Ic n="check_circle" size={16} color="#16a34a" fill={1} /><p style={{ fontSize: 12, color: "#16a34a", margin: 0 }}>{pwSuccess}</p></div>}

                <button onClick={handlePasswordUpdate} disabled={pwLoading}
                  style={{ padding: "11px 20px", background: pwLoading ? "#94a3b8" : "#0d7ff2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: pwLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

          </div>
        )
      }
    </Layout>
  );
}