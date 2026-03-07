const API_BASE_URL = "http://localhost:8080/api";

// ─── Username + Password Login ──────────────────────────────
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Invalid username or password");
  }

  return data;
};

// ─── QR Code Login ──────────────────────────────────────────
export const qrLogin = async (regNo) => {
  const response = await fetch(`${API_BASE_URL}/auth/qr-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regNo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "User not registered");
  }

  return data;
};