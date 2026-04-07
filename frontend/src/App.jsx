import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login               from "./pages/auth/Login";
import StudentDashboard    from "./pages/student/StudentDashboard";
import StudyMaterialPage   from "./pages/student/StudyMaterialPage";
import AssignmentsPage     from "./pages/student/AssignmentsPage";
import ABLPage             from "./pages/student/ABLPage";
import QuizPage            from "./pages/student/QuizPage";
import MarksPage           from "./pages/student/MarksPage";
import AnnouncementsPage   from "./pages/student/AnnouncementsPage";
import AttendancePage      from "./pages/student/AttendancePage";
import LeaveODPage         from "./pages/student/LeaveODPage";
import ProfilePage         from "./pages/student/ProfilePage";

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  let user = {};
  try { user = JSON.parse(sessionStorage.getItem("user") || "{}"); } catch {}

  if (!user?.id) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const dashMap = {
      student:     "/student/dashboard",
      faculty:     "/faculty/dashboard",
      admin:       "/admin/dashboard",
      coordinator: "/coordinator/dashboard",
    };
    return <Navigate to={dashMap[user.role] || "/login"} replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderPage({ title }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7f8" }}>
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0d7ff2", marginBottom: "0.5rem" }}>{title}</h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>This page is under construction.</p>
        <button onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }}
          style={{ padding: "0.5rem 1.5rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RootRedirect
// ─────────────────────────────────────────────────────────────────────────────
function RootRedirect() {
  let user = {};
  try { user = JSON.parse(sessionStorage.getItem("user") || "{}"); } catch {}
  if (!user?.id) return <Navigate to="/login" replace />;
  const dashMap = {
    student:     "/student/dashboard",
    faculty:     "/faculty/dashboard",
    admin:       "/admin/dashboard",
    coordinator: "/coordinator/dashboard",
  };
  return <Navigate to={dashMap[user.role] || "/login"} replace />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Student route wrapper — DRY helper
// ─────────────────────────────────────────────────────────────────────────────
function S({ element }) {
  return <ProtectedRoute role="student">{element}</ProtectedRoute>;
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<RootRedirect />} />

        {/* ── Student ── */}
        <Route path="/student/dashboard"     element={<S element={<StudentDashboard />}  />} />
        <Route path="/student/study-material" element={<S element={<StudyMaterialPage />} />} />
        <Route path="/student/assignments"   element={<S element={<AssignmentsPage />}   />} />
        <Route path="/student/abl"           element={<S element={<ABLPage />}           />} />
        <Route path="/student/quizzes"       element={<S element={<QuizPage />}          />} />

        {/* ── Student pages ── */}
        <Route path="/student/marks"         element={<S element={<MarksPage />}         />} />
        <Route path="/student/announcements" element={<S element={<AnnouncementsPage />} />} />
        <Route path="/student/attendance"    element={<S element={<AttendancePage />}    />} />
        <Route path="/student/leave"         element={<S element={<LeaveODPage />}       />} />
        <Route path="/student/profile"       element={<S element={<ProfilePage />}       />} />

        {/* ── Faculty / Admin / Coordinator ── */}
        <Route path="/faculty/dashboard"     element={<ProtectedRoute role="faculty">     <PlaceholderPage title="Faculty Dashboard" />     </ProtectedRoute>} />
        <Route path="/admin/dashboard"       element={<ProtectedRoute role="admin">       <PlaceholderPage title="Admin Dashboard" />       </ProtectedRoute>} />
        <Route path="/coordinator/dashboard" element={<ProtectedRoute role="coordinator"> <PlaceholderPage title="Coordinator Dashboard" /> </ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}