import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, qrLogin } from "../../services/authService";
import QRScanner from "../../components/QRScanner";

const LEFT_LOGO    = "/logo.jpeg";
const RIGHT_LOGO   = "/logo.png";
const COLLEGE_NAME = "RAJALAKSHMI INSTITUTE OF TECHNOLOGY";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [scannedId, setScannedId]       = useState(null);
  const [activeTab, setActiveTab]       = useState("password"); // "password" | "qr"

  const redirectByRole = (role) => {
    const routes = {
      student:     "/student/dashboard",
      faculty:     "/faculty/dashboard",
      admin:       "/admin/dashboard",
      coordinator: "/coordinator/dashboard",
    };
    navigate(routes[role] || "/login");
  };

  const saveUser = (user) => sessionStorage.setItem("user", JSON.stringify(user));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(username, password);
      saveUser(user);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (regNo) => {
    setShowScanner(false);
    setScannedId(regNo);
    setError("");
    // On mobile: switch to password tab so confirmation panel is visible
    setActiveTab("password");
  };

  const handleQRConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await qrLogin(scannedId);
      saveUser(user);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message);
      setScannedId(null);
    } finally {
      setLoading(false);
    }
  };

  const LogoFallback = ({ side }) => (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: side === "left" ? "#1152d4" : "#f1f5f9",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "10px"
    }}>
      <span style={{ fontSize: "10px", color: side === "left" ? "white" : "#94a3b8", fontWeight: "700" }}>LOGO</span>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Lexend', sans-serif; }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f6f6f8 0%, rgba(17,82,212,0.05) 100%);
          font-family: 'Lexend', sans-serif;
        }

        /* ── Header ── */
        .lms-header {
          width: 100%;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .header-logo-left {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .header-logo-right {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .header-title { font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .header-subtitle { font-size: 11px; color: #94a3b8; margin-top: 2px; }

        /* ── Main ── */
        .lms-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          max-width: 960px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 60px rgba(17,82,212,0.08), 0 4px 16px rgba(0,0,0,0.05);
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Left Panel ── */
        .left-panel {
          padding: 48px 40px;
          border-right: 1px solid #f1f5f9;
        }

        /* ── Right Panel ── */
        .right-panel {
          padding: 48px 40px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        /* ── Tab Bar (mobile only) ── */
        .tab-bar {
          display: none;
          width: 100%;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 9px;
          font-family: 'Lexend', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          color: #64748b;
        }
        .tab-btn.active {
          background: white;
          color: #1152d4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ── Input ── */
        .input-field {
          width: 100%;
          padding: 14px 16px 14px 46px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          font-size: 15px;
          font-family: 'Lexend', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #1152d4;
          box-shadow: 0 0 0 3px rgba(17,82,212,0.08);
          background: white;
        }
        .input-wrapper { position: relative; }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px !important;
          color: #94a3b8;
          pointer-events: none;
        }
        .input-icon-right {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .input-icon-right:hover { color: #1152d4; }

        /* ── Buttons ── */
        .btn-primary {
          width: 100%;
          padding: 15px;
          background: #1152d4;
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Lexend', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(17,82,212,0.28);
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { background: #0e47b8; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-outline {
          width: 100%;
          padding: 13px 24px;
          background: transparent;
          color: #1152d4;
          border: 2px solid #1152d4;
          border-radius: 10px;
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-outline:hover:not(:disabled) { background: #1152d4; color: white; }
        .btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-ghost {
          width: 100%;
          padding: 11px;
          background: transparent;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'Lexend', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { color: #64748b; border-color: #cbd5e1; }

        /* ── Error ── */
        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
        }

        /* ── QR Box ── */
        .qr-illustration {
          background: white;
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.07);
        }
        .qr-inner {
          width: 160px;
          height: 160px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #cbd5e1;
          transition: all 0.2s;
          cursor: default;
        }
        .qr-inner:hover {
          border-color: #1152d4;
          background: rgba(17,82,212,0.04);
        }

        /* ── Scanned ID Card ── */
        .scanned-card {
          background: #f0f5ff;
          border: 2px solid #1152d4;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          text-align: center;
        }

        /* ── Footer ── */
        .lms-footer {
          padding: 20px 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: #1152d4; }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .lms-header { padding: 10px 16px; }
          .header-logo-left { width: 44px; height: 44px; }
          .header-logo-right { width: 38px; height: 38px; }
          .header-title { font-size: 13px; }
          .header-subtitle { font-size: 10px; }

          .lms-main { padding: 20px 12px; align-items: flex-start; }

          .login-card {
            grid-template-columns: 1fr;
            border-radius: 16px;
            max-width: 480px;
            margin: 0 auto;
          }

          .left-panel {
            padding: 28px 24px;
            border-right: none;
            border-bottom: none;
          }

          /* Hide right panel on mobile — show as tab instead */
          .right-panel { display: none; }

          /* Show tab bar on mobile */
          .tab-bar { display: flex; }

          /* Show/hide panels based on active tab */
          .left-panel.hidden { display: none; }
          .right-panel.tab-active {
            display: flex !important;
            padding: 28px 24px;
            border-right: none;
          }

          .input-field { font-size: 16px; } /* prevents zoom on iOS */

          .qr-illustration { padding: 20px; }
          .qr-inner { width: 140px; height: 140px; }
        }

        @media (max-width: 400px) {
          .left-panel, .right-panel { padding: 24px 18px; }
          .header-title { font-size: 11px; }
        }
      `}</style>

      <div className="login-wrapper">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="lms-header">
          <div className="header-left">
            {/* Left Logo */}
            <div className="header-logo-left">
              <img src={LEFT_LOGO} alt="College Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <div>
              <div className="header-title">{COLLEGE_NAME}</div>
              <div className="header-subtitle">Learning Management System</div>
            </div>
          </div>

          {/* Right Logo */}
          <div className="header-logo-right">
            <img src={RIGHT_LOGO} alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }} />
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────── */}
        <main className="lms-main">
          <div className="login-card">

            {/* ── Left Panel ─────────────────────────────────── */}
            <div className={`left-panel ${activeTab === "qr" ? "hidden" : ""}`}>

              {/* Mobile Tab Bar */}
              <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => { setActiveTab("password"); setScannedId(null); setError(""); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
                  Password
                </button>
                <button className={`tab-btn ${activeTab === "qr" ? "active" : ""}`}
                  onClick={() => { setActiveTab("qr"); setError(""); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>qr_code_scanner</span>
                  QR Login
                </button>
              </div>

              {/* QR Confirmation Mode */}
              {scannedId ? (
                <div>
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "12px",
                      backgroundColor: "#eff6ff", display: "flex",
                      alignItems: "center", justifyContent: "center", marginBottom: "16px"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "26px", color: "#1152d4" }}>qr_code_2</span>
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
                      QR Code Detected
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                      Confirm your registration number to continue.
                    </p>
                  </div>

                  {error && (
                    <div className="error-box">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
                      {error}
                    </div>
                  )}

                  <div className="scanned-card">
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Registration Number
                    </p>
                    <p style={{ fontSize: "22px", fontWeight: "900", color: "#1152d4", letterSpacing: "1px" }}>
                      {scannedId}
                    </p>
                  </div>

                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                    Is this correct? Click <strong>Confirm</strong> to log in.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button className="btn-primary" onClick={handleQRConfirm} disabled={loading}>
                      {loading ? (
                        <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>progress_activity</span>Logging in...</>
                      ) : (
                        <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>Yes, Confirm & Login</>
                      )}
                    </button>
                    <button className="btn-outline" onClick={() => { setScannedId(null); setShowScanner(true); }} disabled={loading}>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>qr_code_scanner</span>
                      Scan Again
                    </button>
                    <button className="btn-ghost" onClick={() => { setScannedId(null); setError(""); }} disabled={loading}>
                      Back to Login
                    </button>
                  </div>
                </div>

              ) : (
                /* Normal Login Form */
                <>
                  <div style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
                      Welcome Back
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                      Log in to access your courses and academic materials.
                    </p>
                  </div>

                  {error && (
                    <div className="error-box">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Username */}
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        Student ID / Username
                      </label>
                      <div className="input-wrapper">
                        <span className="material-symbols-outlined input-icon">person</span>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. STU123456" className="input-field" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Password</label>
                        <a href="#" style={{ fontSize: "12px", fontWeight: "600", color: "#1152d4", textDecoration: "none" }}>
                          Forgot Password?
                        </a>
                      </div>
                      <div className="input-wrapper">
                        <span className="material-symbols-outlined input-icon">lock</span>
                        <input type={showPassword ? "text" : "password"} value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" className="input-field" style={{ paddingRight: "48px" }} />
                        <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? (
                        <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>progress_activity</span>Logging in...</>
                      ) : (
                        <>Login <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* ── Right Panel ────────────────────────────────── */}
            <div className={`right-panel ${activeTab === "qr" ? "tab-active" : ""}`}>

              {/* Mobile Tab Bar (repeated for QR tab) */}
              <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => { setActiveTab("password"); setScannedId(null); setError(""); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
                  Password
                </button>
                <button className={`tab-btn ${activeTab === "qr" ? "active" : ""}`}
                  onClick={() => { setActiveTab("qr"); setError(""); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>qr_code_scanner</span>
                  QR Login
                </button>
              </div>

              <div className="qr-illustration">
                <div className="qr-inner">
                  <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#cbd5e1" }}>qr_code_2</span>
                </div>
              </div>

              <div style={{ maxWidth: "260px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                  Quick Login with QR
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.7", marginBottom: "24px" }}>
                  Use your <strong style={{ color: "#374151" }}>College ID card</strong> QR code to log in instantly without a password.
                </p>
                <button className="btn-outline" onClick={() => { setScannedId(null); setShowScanner(true); }} disabled={loading}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>photo_camera</span>
                  Open Scanner
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="lms-footer">
          <div className="footer-links">
            {["Privacy Policy", "Terms of Service", "Accessibility", "System Status"].map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
          <p>© 2024 {COLLEGE_NAME}. All rights reserved.</p>
        </footer>

      </div>

      {/* ── QR Scanner Modal ───────────────────────────────────── */}
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
};

export default Login;