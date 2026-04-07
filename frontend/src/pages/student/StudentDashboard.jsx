import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar  from "../../components/Sidebar/Sidebar.jsx";
import Navbar   from "../../components/Navbar/Navbar.jsx";
import Cards    from "../../components/Cards/Cards.jsx";
import Calendar from "../../components/Calendar/Calendar.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "http://localhost:8080/api/student";

const NAV_ITEMS = [
  { key: "home",          label: "Home",           icon: "home" },
  { key: "studyMaterial", label: "Study Material", icon: "folder_open" },
  { key: "assignments",   label: "Assignments",    icon: "assignment" },
  { key: "abl",           label: "ABL",            icon: "science" },
  { key: "quizzes",       label: "Quizzes",        icon: "quiz" },
  { key: "marks",         label: "Marks",          icon: "grade" },
  { key: "announcements", label: "Announcements",  icon: "campaign" },
  { key: "attendance",    label: "Attendance",     icon: "event_available" },
  { key: "leaveOD",       label: "Leave/OD",       icon: "calendar_month" },
  { key: "profile",       label: "Profile",        icon: "person" },
];

// Only home stays in-dashboard. All others navigate to their own page.
const ACTIVE_SECTIONS = new Set(["home"]);

const NAV_ROUTES = {
  studyMaterial: "/student/study-material",
  assignments:   "/student/assignments",
  abl:           "/student/abl",
  quizzes:       "/student/quizzes",
  marks:         "/student/marks",
  announcements: "/student/announcements",
  attendance:    "/student/attendance",
  leaveOD:       "/student/leave",
  profile:       "/student/profile",
};

const DAYS_FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSession() {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    const regNo = (u.regNo || u.username || "").toString().trim().replace(/[:\s]/g, "");
    return { ...u, regNo };
  } catch { return { regNo: "" }; }
}

async function safeGet(url) {
  try {
    return (await axios.get(url, { timeout: 8000 })).data;
  } catch (e) {
    console.warn("[API]", e?.response?.status, url);
    return null;
  }
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function todayName() {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}

function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

// Shared icon component
function Ic({ n, fill = 0, size = 20, color }) {
  return (
    <span className="material-symbols-outlined" style={{
      fontSize: size, fontVariationSettings: `'FILL' ${fill}`,
      lineHeight: 1, display: "inline-flex", alignItems: "center",
      userSelect: "none", color: color || "inherit", flexShrink: 0,
    }}>{n}</span>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const card = {
  background: "var(--card)", borderRadius: 12,
  border: "1px solid var(--border)", padding: 20,
};

function Empty({ icon, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0" }}>
      <Ic n={icon} size={36} color="var(--border)" fill={1} />
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

// ─── Dropdowns ────────────────────────────────────────────────────────────────

function NotifDropdown({ notifications, onMarkAllRead, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 8px)", right: 12,
      width: 310, background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Notifications</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <Ic n="close" size={16} color="var(--text-muted)" />
        </button>
      </div>
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {notifications.length === 0
          ? <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 16px" }}>No notifications</p>
          : notifications.slice(0, 8).map((n, i) => (
            <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0d7ff2", marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{n.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{n.message}</p>
              </div>
            </div>
          ))
        }
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
        <button onClick={onMarkAllRead}
          style={{ width: "100%", padding: 8, background: "rgba(13,127,242,0.06)", color: "#0d7ff2", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Mark all as read
        </button>
      </div>
    </div>
  );
}

function ProfileDropdown({ profile, regNo, onViewProfile, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 8px)", right: 12,
      width: 220, background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{profile?.name ?? "Student"}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0" }}>{profile?.regNo ?? regNo}</p>
      </div>
      <div style={{ padding: 8 }}>
        <button
          onClick={() => { onViewProfile(); onClose(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Ic n="person" size={16} color="var(--text-muted)" />
          View Profile
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME SECTION
// ═════════════════════════════════════════════════════════════════════════════

function HomeSection({ courses, attendance, assignments, marks, timetable, announcements, onNav }) {
  const today = todayName();

  // Derived
  const avgAtt = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + (a.attendancePercentage ?? 0), 0) / attendance.length) : 0;
  const pendingCount = assignments.filter(a => a.submissionStatus === "not_submitted").length;
  const overdueCount = assignments.filter(a => a.isOverdue === true && a.submissionStatus === "not_submitted").length;
  const dueThisWeek  = assignments.filter(a => {
    if (a.submissionStatus !== "not_submitted" || !a.deadline) return false;
    const d = daysLeft(a.deadline);
    return d !== null && d >= 0 && d <= 7;
  }).length;
  const lowAtt = attendance.filter(a => (a.attendancePercentage ?? 100) < 75);

  // Marks bar chart
  const marksData = marks.map(course => {
    const entries  = course.entries ?? [];
    const total    = entries.reduce((s, e) => s + (e.marksObtained ?? 0), 0);
    const maxTotal = entries.reduce((s, e) => s + (e.maxMarks ?? 0), 0);
    return { code: course.courseCode, pct: maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0 };
  }).slice(0, 6);

  // Timetable — derive unique periods from DB data, sorted by periodNumber
  // No hardcoded slots. Whatever is in the DB is what gets shown.
  // cellMap only for class periods
  const cellMap = {};
  timetable.forEach(t => {
    const pt = String(t.periodType ?? 'class').trim().toLowerCase();
    if (pt === 'class' || pt === '') cellMap[`${t.dayOfWeek}-${t.periodNumber}`] = t;
  });

  // Unique period rows — preserve periodType from DB, prefer break/lunch if any day has it
  const periodRows = [...timetable.reduce((map, t) => {
    const periodNumber = t.periodNumber;
    const periodType = String(t.periodType ?? 'class').trim().toLowerCase();
    const existing = map.get(periodNumber);
    if (!existing) {
      map.set(periodNumber, {
        periodNumber,
        periodType,
        startTime: t.startTime,
        endTime: t.endTime,
      });
      return map;
    }

    const precedence = {
      class: 1,
      break: 2,
      lunch: 3,
      "lunch break": 3,
    };
    if ((precedence[periodType] ?? 1) > (precedence[existing.periodType] ?? 1)) {
      existing.periodType = periodType;
      existing.startTime = t.startTime;
      existing.endTime = t.endTime;
    }
    return map;
  }, new Map()).values()].sort((a, b) => a.periodNumber - b.periodNumber);

  const topPending = assignments
    .filter(a => a.submissionStatus === "not_submitted")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  // Stat cards for <Cards />
  const statCards = [
    {
      label: "Avg Attendance", value: avgAtt, unit: "%",
      icon: "event_available", iconBg: "#eff6ff", iconColor: "#0d7ff2",
      progress: avgAtt, progressColor: avgAtt >= 75 ? "#0d7ff2" : "#ef4444",
      subText: avgAtt >= 75 ? "✓ Exam eligible" : "⚠ Below 75%",
      subColor: avgAtt >= 75 ? "#16a34a" : "#dc2626",
      onClick: () => onNav("attendance"),
    },
    {
      label: "Pending", value: pendingCount,
      icon: "pending_actions", iconBg: "#fff7ed", iconColor: "#ea580c",
      subText: `Due this week: ${dueThisWeek}`,
      subColor: dueThisWeek > 0 ? "#ea580c" : "var(--text-muted)",
      onClick: () => onNav("assignments"),
    },
    {
      label: "Overdue", value: overdueCount,
      icon: "event_busy",
      iconBg: overdueCount > 0 ? "#fef2f2" : "#f0fdf4",
      iconColor: overdueCount > 0 ? "#ef4444" : "#16a34a",
      subText: overdueCount > 0 ? "Immediate action required" : "✓ All caught up!",
      subColor: overdueCount > 0 ? "#ef4444" : "#16a34a",
      onClick: () => onNav("assignments"),
    },
  ];

  return (
    <div className="home-layout">

      {/* ── Left column ── */}
      <div className="home-main">

        {/* Attendance Warning */}
        {lowAtt.length > 0 && (
          <div onClick={() => onNav("attendance")}
            style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 20 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.15)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Ic n="warning" size={20} color="#dc2626" fill={1} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#b91c1c", margin: 0 }}>Low Attendance Warning</p>
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 2 }}>
                {lowAtt.map(a => `${a.courseCode} (${Math.round(a.attendancePercentage)}%)`).join("  ·  ")} — below 75%
              </p>
            </div>
            <Ic n="chevron_right" size={18} color="#dc2626" />
          </div>
        )}

        {/* 3 Stat Cards */}
        <div style={{ marginBottom: 20 }}>
          <Cards cards={statCards} />
        </div>

        {/* Marks Snapshot */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>Marks Snapshot</h3>
            <a href="#" onClick={e => { e.preventDefault(); onNav("marks"); }} style={{ fontSize: 12, fontWeight: 600, color: "#0d7ff2", textDecoration: "none" }}>See All →</a>
          </div>
          {marksData.length === 0
            ? <Empty icon="grade" label="No marks data yet" />
            : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150, paddingTop: 8 }}>
                {marksData.map(({ code, pct }) => (
                  <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{pct}%</span>
                    <div style={{ width: "100%", background: "var(--border)", borderRadius: "6px 6px 0 0", height: 110, display: "flex", alignItems: "flex-end" }}>
                      <div style={{
                        width: "100%", borderRadius: "6px 6px 0 0",
                        background: pct >= 75 ? "#0d7ff2" : pct >= 50 ? "#f59e0b" : "#ef4444",
                        height: `${Math.max((pct / 100) * 110, 4)}px`,
                        transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{code}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Enrolled Courses */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>Enrolled Courses</h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--border-light)", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
              {courses.length} courses
            </span>
          </div>
          {courses.length === 0
            ? <Empty icon="auto_stories" label="No courses enrolled" />
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {courses.map((c, i) => {
                  const COLORS = ["#0d7ff2","#7c3aed","#059669","#d97706","#dc2626","#0891b2"];
                  const col = COLORS[i % COLORS.length];
                  const att = attendance.find(a => a.courseCode === c.courseCode);
                  const pct = att?.attendancePercentage ?? null;
                  return (
                    <div key={c.courseId ?? i} style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg)" }}>
                      <div style={{ height: 3, background: col }} />
                      <div style={{ padding: "12px 14px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: col, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.courseCode}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.3 }}>{c.courseName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>{c.facultyName}</p>
                        {pct !== null && (
                          <div>
                            <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                              <div style={{ height: 4, borderRadius: 2, width: `${Math.min(pct,100)}%`, background: pct >= 75 ? "#22c55e" : "#ef4444" }} />
                            </div>
                            <p style={{ fontSize: 10, color: pct >= 75 ? "#16a34a" : "#dc2626", fontWeight: 600, margin: "4px 0 0" }}>{Math.round(pct)}% attendance</p>
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

        {/* Weekly Timetable */}
        <div style={card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 18px" }}>Weekly Timetable</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 10px 8px 0", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, width: 120 }}>PERIOD · TIME</th>
                  {DAYS_FULL.map((day, i) => (
                    <th key={day} style={{
                      padding: "8px 8px", textAlign: "left", fontSize: 11, fontWeight: 700,
                      color: day === today ? "#0d7ff2" : "var(--text-muted)",
                      borderBottom: day === today ? "2px solid #0d7ff2" : "2px solid var(--border)",
                      background: day === today ? "rgba(13,127,242,0.04)" : "transparent",
                    }}>{DAYS_SHORT[i]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periodRows.length === 0
                  ? (
                    <tr><td colSpan={7} style={{ padding: "20px 0", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>No timetable data</td></tr>
                  )
                  : periodRows.map(row => {
                    const normalizedType = String(row.periodType ?? '').trim().toLowerCase();
                    const isBreak = normalizedType === 'break' || normalizedType === 'lunch' || normalizedType === 'lunch break';
                    const typeLabel = normalizedType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    if (isBreak) {
                      return (
                        <tr key={row.periodNumber}>
                          <td colSpan={7} style={{ padding: "5px 0", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--border-light)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                            {typeLabel}{row.startTime ? ` · ${row.startTime} – ${row.endTime}` : ""}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={row.periodNumber} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "9px 10px 9px 0", whiteSpace: "nowrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: "var(--text)" }}>P{row.periodNumber}</span>
                          {row.startTime && <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 5 }}>{row.startTime}–{row.endTime}</span>}
                        </td>
                        {DAYS_FULL.map(day => {
                          const cell = cellMap[`${day}-${row.periodNumber}`];
                          const isTd = day === today;
                          return (
                            <td key={day} style={{ padding: "9px 8px", background: isTd ? "rgba(13,127,242,0.04)" : "transparent", minWidth: 72 }}>
                              {cell
                                ? <div>
                                    <p style={{ fontWeight: 700, fontSize: 12, color: isTd ? "#0d7ff2" : "var(--text)", margin: 0 }}>{cell.courseCode}</p>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{cell.classroom}</p>
                                  </div>
                                : <span style={{ color: "var(--border)", fontSize: 14 }}>–</span>
                              }
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="home-aside">

        {/* Calendar */}
        <div style={card}>
          <h3 style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 12px" }}>Calendar</h3>
          <Calendar assignments={assignments} />
        </div>

        {/* Pending Assignments */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Pending Assignments</span>
            <a href="#" onClick={e => { e.preventDefault(); onNav("assignments"); }} style={{ fontSize: 12, fontWeight: 600, color: "#0d7ff2", textDecoration: "none" }}>See All →</a>
          </div>
          {topPending.length === 0
            ? <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>No pending assignments 🎉</p>
            : topPending.map(a => {
              const d    = a.deadline ? new Date(a.deadline) : null;
              const left = daysLeft(a.deadline);
              const over = left !== null && left < 0;
              return (
                <div key={a.assignmentId} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ borderRadius: 8, padding: "6px 10px", textAlign: "center", minWidth: 46, flexShrink: 0, background: over ? "#fef2f2" : "#fff7ed" }}>
                    {d
                      ? <><p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: over ? "#dc2626" : "#ea580c", margin: 0 }}>{d.toLocaleString("default",{month:"short"})}</p>
                          <p style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, color: over ? "#b91c1c" : "#c2410c", margin: 0 }}>{d.getDate()}</p></>
                      : <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>–</p>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{a.title}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                      {a.courseCode}
                      {left !== null && (
                        <span style={{ color: over ? "#ef4444" : left <= 2 ? "#f59e0b" : "var(--text-muted)" }}>
                          {" · "}{over ? `${Math.abs(left)}d overdue` : left === 0 ? "Due today!" : `${left}d left`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Announcements preview */}
        {announcements.length > 0 && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Announcements</span>
              <a href="#" onClick={e => { e.preventDefault(); onNav("announcements"); }} style={{ fontSize: 12, fontWeight: 600, color: "#0d7ff2", textDecoration: "none" }}>See All →</a>
            </div>
            {announcements.slice(0, 3).map((a, i) => (
              <div key={a.announcementId} style={{ paddingBottom: i < 2 ? 10 : 0, marginBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{a.title}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5 }}>
                  {a.message?.slice(0, 70)}{a.message?.length > 70 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Support */}
        <div style={{ background: "linear-gradient(135deg,#0d7ff2,#0051cc)", borderRadius: 12, padding: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Ic n="support_agent" size={20} color="#fff" fill={1} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: "0 0 3px" }}>Need help with something?</p>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: "0 0 14px" }}>Contact Student Support</p>
          <button style={{ width: "100%", background: "#fff", color: "#0d7ff2", border: "none", borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Get Assistance
          </button>
        </div>

      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

export default function StudentDashboard() {

  const session = getSession();
  const regNo   = session.regNo;
  if (!regNo) { window.location.href = "/login"; return null; }

  const [dark,          setDark]          = useState(() => localStorage.getItem("theme") === "dark");
  const [activeSection, setActiveSection] = useState("home");
  const [loading,       setLoading]       = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [profile,       setProfile]       = useState(null);
  const [courses,       setCourses]       = useState([]);
  const [attendance,    setAttendance]    = useState([]);
  const [assignments,   setAssignments]   = useState([]);
  const [marks,         setMarks]         = useState([]);
  const [timetable,     setTimetable]     = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [quizzes,       setQuizzes]       = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [showNotifDropdown,   setShowNotifDropdown]   = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // ── Single dashboard fetch — uses /dashboard/{regNo} endpoint ───────────────
  // AbortController prevents React StrictMode double-invoke from canceling data
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const data = await axios.get(`${BASE}/dashboard/${regNo}`, {
          timeout: 15000,
          signal: controller.signal,
        }).then(r => r.data);

        setProfile(data.profile           ?? null);
        setCourses(data.courses            ?? []);
        setAttendance(data.attendance      ?? []);
        setAssignments(data.assignments    ?? []);
        setMarks(data.marks               ?? []);
        setTimetable(data.timetable        ?? []);
        setAnnouncements(data.announcements ?? []);
        setQuizzes(data.quizzes            ?? []);
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadNotificationCount ?? 0);

        // Cache profile for sidebar flash prevention
        if (data.profile) sessionStorage.setItem("cachedProfile", JSON.stringify(data.profile));

      } catch (e) {
        if (axios.isCancel(e) || e?.code === "ERR_CANCELED") return; // StrictMode cleanup
        console.error("[Dashboard] fetch failed:", e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort(); // cleanup on unmount / StrictMode second call
  }, [regNo]);

  // home/profile → in-dashboard section switch
  // all other keys → navigate to their own page
  const handleNav = useCallback((key) => {
    if (NAV_ROUTES[key]) {
      window.location.href = NAV_ROUTES[key];
      return;
    }
    if (!ACTIVE_SECTIONS.has(key)) return;
    setActiveSection(key);
    setShowNotifDropdown(false);
    setShowProfileDropdown(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const firstName = profile?.name?.split(" ")[0] ?? session?.name?.split(" ")[0] ?? "Student";

  const vars = dark
    ? `--bg:#0b1120;--card:#101922;--border:#1e293b;--border-light:#162032;--text:#f1f5f9;--text-muted:#94a3b8;`
    : `--bg:#f5f7f8;--card:#ffffff;--border:#e2e8f0;--border-light:#f8fafc;--text:#0f172a;--text-muted:#64748b;`;

  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
    :root { ${vars} }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
    button { font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Layout ── */
    .app-shell { display: flex; min-height: 100vh; }

    /* ── Sidebar mobile ── */
    @media (max-width: 768px) {
      .sidebar { position: fixed !important; left: -260px; top: 0; height: 100vh; transition: left 0.25s ease; z-index: 50; }
      .sidebar-open { left: 0 !important; }
      .sidebar-backdrop { display: block !important; }
      .main-area { width: 100% !important; }
      .hamburger-btn { display: flex !important; }
    }

    /* ── Timetable ── */
    @media (max-width: 768px) {
      .tt-desktop { display: none !important; }
    }

    /* ── Home layout ── */
    .home-layout { display: flex; gap: 24px; align-items: flex-start; }
    .home-main   { flex: 1; min-width: 0; }
    .home-aside  { width: 290px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
    @media (max-width: 1024px) {
      .home-layout { flex-direction: column; }
      .home-aside  { width: 100%; }
    }

    /* ── Profile grid ── */
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
    }

    /* ── Main padding on mobile ── */
    @media (max-width: 768px) {
      .main-content { padding: 16px !important; }
    }
  `;

  function renderSection() {
    switch (activeSection) {
      case "home":
        return <HomeSection
          courses={courses} attendance={attendance} assignments={assignments} marks={marks}
          timetable={timetable} announcements={announcements} onNav={handleNav}
        />;
      default:
        return null;
    }
  }

  return (
    <div className="app-shell" style={{ background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{globalCss}</style>

      {/* Mobile backdrop */}
      {mobileSidebar && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebar(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <Sidebar
        navItems={NAV_ITEMS}
        activeSection={activeSection}
        onNav={handleNav}
        profile={profile}
        onSignOut={() => { sessionStorage.clear(); window.location.href = "/login"; }}
        mobileOpen={mobileSidebar}
        onMobileClose={() => setMobileSidebar(false)}
      />

      {/* Main */}
      <div className="main-area" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Navbar wrapper — dropdowns anchor here */}
        <div style={{ position: "relative" }}>
          <Navbar
            profile={profile}
            unreadCount={unreadCount}
            activeSection={activeSection}
            onNotificationClick={() => { setShowNotifDropdown(p => !p); setShowProfileDropdown(false); }}
            onProfileClick={() => { setShowProfileDropdown(p => !p); setShowNotifDropdown(false); }}
            onDarkModeToggle={() => setDark(p => !p)}
            dark={dark}
            greet={greet()}
            firstName={firstName}
            onMenuClick={() => setMobileSidebar(p => !p)}
          />

          {showNotifDropdown && (
            <NotifDropdown
              notifications={notifications}
              onMarkAllRead={() => { setUnreadCount(0); setShowNotifDropdown(false); }}
              onClose={() => setShowNotifDropdown(false)}
            />
          )}
          {showProfileDropdown && (
            <ProfileDropdown
              profile={profile} regNo={regNo}
              onViewProfile={() => { setActiveSection("profile"); setShowProfileDropdown(false); }}
              onClose={() => setShowProfileDropdown(false)}
            />
          )}
        </div>

        {/* Content */}
        <main className="main-content" style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {loading
            ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
                <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "#0d7ff2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading your dashboard…</p>
              </div>
            )
            : renderSection()
          }
        </main>
      </div>
    </div>
  );
}