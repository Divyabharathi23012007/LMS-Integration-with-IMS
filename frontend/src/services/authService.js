import axios from "axios";

const API = "http://localhost:8080/api/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Password login
// Backend returns: { id, name, role, regNo }
// ─────────────────────────────────────────────────────────────────────────────
export async function login(username, password) {
  const res = await axios.post(`${API}/login`, { username, password });
  const data = res.data;

  const user = {
    id:    data.id,
    name:  data.name,
    role:  data.role,
    regNo: data.regNo,
  };

  sessionStorage.setItem("user", JSON.stringify(user));
  // Save JWT token if backend returns one
  if (data.token) sessionStorage.setItem("token", data.token);

  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// QR login
// ─────────────────────────────────────────────────────────────────────────────
export async function qrLogin(regNo) {
  const res = await axios.post(`${API}/qr-login`, { regNo });
  const data = res.data;

  const user = {
    id:    data.id,
    name:  data.name,
    role:  data.role,
    regNo: data.regNo,
  };

  sessionStorage.setItem("user", JSON.stringify(user));
  if (data.token) sessionStorage.setItem("token", data.token);

  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function logout() {
  sessionStorage.clear();
  window.location.href = "/login";
}