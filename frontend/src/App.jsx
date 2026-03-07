import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";

// ─── Placeholder Dashboard Components ──────────────────────
// Replace these with actual dashboard pages as you build them
const StudentDashboard     = () => <h1 className="p-8 text-2xl font-bold">Student Dashboard</h1>;
const FacultyDashboard     = () => <h1 className="p-8 text-2xl font-bold">Faculty Dashboard</h1>;
const AdminDashboard       = () => <h1 className="p-8 text-2xl font-bold">Admin Dashboard</h1>;
const CoordinatorDashboard = () => <h1 className="p-8 text-2xl font-bold">Coordinator Dashboard</h1>;

// ─── Get logged in user from storage ───────────────────────
const getUser = () => {
  const fromLocal   = localStorage.getItem("user");
  const fromSession = sessionStorage.getItem("user");
  try {
    return JSON.parse(fromLocal || fromSession || "null");
  } catch {
    return null;
  }
};

// ─── Protected Route ────────────────────────────────────────
// Checks if user is logged in AND has the correct role
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their own dashboard if wrong role
    const routes = {
      student:     "/student/dashboard",
      faculty:     "/faculty/dashboard",
      admin:       "/admin/dashboard",
      coordinator: "/coordinator/dashboard",
    };
    return <Navigate to={routes[user.role] || "/login"} replace />;
  }

  return children;
};

// ─── App ────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Role-Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinator/dashboard"
          element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;