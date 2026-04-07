import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "./Layout.jsx";

const BASE = "http://localhost:8080/api/student";

function getSession() {
  try {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    return { ...u, regNo: (u.regNo || "").toString().trim() };
  } catch { return { regNo: "" }; }
}

async function api(url, opts = {}) {
  try {
    const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? "Request failed"); }
    return r.json();
  } catch (e) { throw e; }
}

function Ic({ n, fill = 0, size = 20, color }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}`, lineHeight: 1, display: "inline-flex", alignItems: "center", userSelect: "none", color: color || "inherit", flexShrink: 0 }}>{n}</span>;
}

const card = { background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: 20 };

function Spinner({ color = "#0d7ff2" }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}><div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
}

function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

// ── Quiz Attempt — true fullscreen, camera malpractice detection ──────────────
function QuizAttempt({ quiz, questions, submissionId, regNo, onComplete }) {
  const [current,     setCurrent]     = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [timeLeft,    setTimeLeft]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [camError,    setCamError]    = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [malpractice, setMalpractice] = useState(null); // null | "tab" | "camera"
  const [faceWarnings, setFaceWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);
  const faceRef    = useRef(null);
  const totalQ     = questions.length;

  // ── Submit handler (must be declared before effects that use it) ──────────
  const handleSubmit = useCallback(async (auto = false, reason = null) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(faceRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const responses = questions.map(q => ({
      questionId:     q.questionId,
      selectedOption: answers[q.questionId] ?? null,
    }));
    try {
      const res = await api(`${BASE}/quiz/submission/${submissionId}/submit`, {
        method: "POST",
        body: JSON.stringify({ responses }),
      });
      setResult({ ...res, malpracticeReason: reason });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitted, answers, questions, submissionId]);

  // ── Enter fullscreen on mount ──────────────────────────────────────────────
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      setIsFullscreen(true);
    }
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // ── Camera setup + face detection via pixel analysis ─────────────────────
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        // Start face presence check every 3 seconds with improved detection
        faceRef.current = setInterval(() => {
          if (!videoRef.current || !canvasRef.current || submitted) return;
          const ctx = canvasRef.current.getContext("2d");
          canvasRef.current.width  = 64;
          canvasRef.current.height = 48;
          ctx.drawImage(videoRef.current, 0, 0, 64, 48);
          const frame = ctx.getImageData(0, 0, 64, 48).data;
          
          // Improved multi-method face detection
          let skinPixels = 0;
          let edgePixels = 0;
          let totalBrightness = 0;
          
          for (let i = 0; i < frame.length; i += 4) {
            const r = frame[i], g = frame[i+1], b = frame[i+2];
            
            // Enhanced skin tone detection - supports various skin tones
            // Light skin tones: R > 95, G > 40, B > 20
            // Medium skin tones: R > 80, G > 30, B > 15
            // Dark skin tones: R > 60, G > 20, B > 10
            const isLightSkin = r > 95 && g > 40 && b > 20 && r > g && r > b;
            const isMediumSkin = r > 80 && g > 30 && b > 15 && r > g && r > b && Math.abs(r-g) > 10;
            const isDarkSkin = r > 60 && g > 20 && b > 10 && r > g && r > b;
            
            if (isLightSkin || isMediumSkin || isDarkSkin) skinPixels++;
            
            // Detect edges (face boundaries)
            if ((r + g + b) > 150 && (r + g + b) < 700) edgePixels++;
            
            totalBrightness += (r + g + b) / 3;
          }
          
          const pixelCount = 64 * 48;
          const skinRatio = skinPixels / pixelCount;
          const edgeRatio = edgePixels / pixelCount;
          const avgBrightness = totalBrightness / pixelCount;
          
          // Check if frame is valid (not completely black or white)
          const isValidFrame = avgBrightness > 20 && avgBrightness < 235;
          
          // Face detected if: sufficient skin pixels OR sufficient edges AND valid brightness
          const faceDetected = isValidFrame && (skinRatio > 0.02 || edgeRatio > 0.15);
          
          if (!faceDetected) {
            setFaceWarnings(p => {
              const next = p + 1;
              if (next >= 5 && !submitted) {
                setMalpractice("camera");
                handleSubmit(true, "camera");
              }
              return next;
            });
          }
        }, 3000);
      })
      .catch(() => setCamError(true));
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(faceRef.current);
    };
  }, []);

  // ── Deadline / timer countdown ──────────────────────────────────────────
  useEffect(() => {
    const timerSeconds = quiz.timer != null && Number(quiz.timer) > 0 ? Number(quiz.timer) : null;
    if (timerSeconds != null) {
      setTimeLeft(timerSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const left = Math.max(0, (prev ?? timerSeconds) - 1);
          if (left === 0 && !submitted) handleSubmit(true, "timeout");
          return left;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    if (!quiz.deadline) return;
    const deadline = new Date(quiz.deadline).getTime();
    const tick = () => {
      const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0 && !submitted) handleSubmit(true, "timeout");
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [quiz.deadline, quiz.timer, submitted, handleSubmit]);

  // ── Tab visibility / focus detection ─────────────────────────────────────
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && !submitted) {
        setTabWarnings(p => {
          const next = p + 1;
          if (next >= 2) {
            setMalpractice("tab");
            handleSubmit(true, "tab");
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [submitted]);

  const formatTime = (s) => {
    if (s === null) return "";
    return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  };

  const answered = Object.keys(answers).length;
  const isLow    = timeLeft !== null && timeLeft < 120;

  // ── Malpractice / submitted result screen ────────────────────────────────
  if (submitted) {
    const isMalpractice = result?.malpracticeReason === "tab" || result?.malpracticeReason === "camera";
    const show = result?.showResult;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ ...card, maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: isMalpractice ? "#fee2e2" : show ? "#dcfce7" : "rgba(13,127,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Ic n={isMalpractice ? "gpp_bad" : show ? "check_circle" : "hourglass_empty"} size={36} color={isMalpractice ? "#dc2626" : show ? "#16a34a" : "#0d7ff2"} fill={1} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: isMalpractice ? "#dc2626" : "var(--text)", margin: "0 0 8px" }}>
            {isMalpractice
              ? "Malpractice Detected"
              : show ? "Quiz Completed!" : "Submitted!"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
            {isMalpractice
              ? result.malpracticeReason === "tab"
                ? "Your quiz was auto-submitted due to repeated tab switching. Results will be reviewed by faculty."
                : "Your quiz was auto-submitted due to suspicious camera activity (face not detected). Results will be reviewed by faculty."
              : show
                ? "Your result is available below."
                : "Your responses have been recorded. Results will be released by your faculty."}
          </p>
          {show && !isMalpractice && result?.totalMarks > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[["Score",`${result.obtainedMarks} / ${result.totalMarks}`],["Percentage",`${result.percentage?.toFixed(1)}%`],["Attempted",`${answered} / ${totalQ}`]].map(([l,v]) => (
                <div key={l} style={{ background: "var(--border-light)", borderRadius: 10, padding: "12px 8px" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>{l}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={onComplete} style={{ width: "100%", padding: "12px 0", background: isMalpractice ? "#dc2626" : "#0d7ff2", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  // ── Fullscreen attempt UI ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Malpractice warning banner */}
      {(tabWarnings > 0 || faceWarnings > 0) && (
        <div style={{ background: "#fef2f2", borderBottom: "2px solid #ef4444", padding: "8px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <Ic n="warning" size={18} color="#dc2626" fill={1} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>
            {tabWarnings > 0 && `⚠ Tab switch detected (${tabWarnings}/2 — auto-submit at 2)`}
            {tabWarnings > 0 && faceWarnings > 0 && "  ·  "}
            {faceWarnings > 0 && `⚠ Face not detected (${faceWarnings}/5 — auto-submit at 5)`}
          </span>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>QUIZ IN PROGRESS</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.title}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {timeLeft !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: isLow ? "#fef2f2" : "rgba(13,127,242,0.08)", border: `1px solid ${isLow ? "#fecaca" : "rgba(13,127,242,0.15)"}` }}>
              <Ic n="timer" size={16} color={isLow ? "#dc2626" : "#0d7ff2"} fill={1} />
              <span style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: isLow ? "#dc2626" : "#0d7ff2" }}>{formatTime(timeLeft)}</span>
            </div>
          )}
          {/* Camera feed */}
          <div style={{ position: "relative" }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: 72, height: 54, borderRadius: 8, objectFit: "cover", border: `2px solid ${camError ? "#ef4444" : faceWarnings > 0 ? "#f59e0b" : "#22c55e"}` }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {camError && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic n="videocam_off" size={16} color="#fff" fill={1} />
              </div>
            )}
            {!camError && faceWarnings > 0 && (
              <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", borderRadius: 10, padding: "1px 6px", fontSize: 9, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                LOOK AT SCREEN
              </div>
            )}
          </div>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            style={{ padding: "9px 20px", background: "#0d7ff2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--border)" }}>
        <div style={{ height: 3, background: "#0d7ff2", width: `${(answered/totalQ)*100}%`, transition: "width 0.3s" }} />
      </div>

      <div style={{ flex: 1, display: "flex", gap: 20, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "24px 20px" }}>

        {/* Question */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Question {current+1} of {totalQ}</span>
              {q.marks && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "rgba(13,127,242,0.08)", color: "#0d7ff2" }}>{q.marks} mark{q.marks>1?"s":""}</span>}
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, marginBottom: 24 }}>{q.questionText}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["A","B","C","D"].map(opt => {
                const text = q[`option${opt.toLowerCase()}`] ?? q[`option${opt}`];
                if (!text) return null;
                const sel = answers[q.questionId] === opt;
                return (
                  <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.questionId]: opt }))}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, border: `2px solid ${sel ? "#0d7ff2" : "var(--border)"}`, background: sel ? "rgba(13,127,242,0.08)" : "var(--bg)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "#0d7ff2" : "var(--border-light)", fontWeight: 800, fontSize: 13, color: sel ? "#fff" : "var(--text-muted)" }}>{opt}</div>
                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: sel ? 600 : 400 }}>{text}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setCurrent(p => Math.max(0,p-1))} disabled={current===0}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: current===0?"not-allowed":"pointer", opacity: current===0?0.5:1 }}>
                <Ic n="arrow_back" size={16} color="var(--text-muted)" /> Previous
              </button>
              <button onClick={() => setCurrent(p => Math.min(totalQ-1,p+1))} disabled={current===totalQ-1}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", background: "#0d7ff2", color: "#fff", fontSize: 13, fontWeight: 600, cursor: current===totalQ-1?"not-allowed":"pointer", opacity: current===totalQ-1?0.5:1 }}>
                Next <Ic n="arrow_forward" size={16} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigator */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Questions</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 16 }}>
              {questions.map((qItem, idx) => {
                const isAns = !!answers[qItem.questionId];
                const isCur = idx === current;
                return (
                  <button key={qItem.questionId} onClick={() => setCurrent(idx)}
                    style={{ width: "100%", aspectRatio: "1", borderRadius: 6, border: `2px solid ${isCur?"#0d7ff2":isAns?"#22c55e":"var(--border)"}`, background: isCur?"#0d7ff2":isAns?"#dcfce7":"var(--bg)", color: isCur?"#fff":isAns?"#15803d":"var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {idx+1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["#22c55e","#dcfce7","Answered",answered],["var(--border)","var(--bg)","Not Answered",totalQ-answered]].map(([border,bg,label,count]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${border}`, background: bg, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}: <strong style={{ color: "var(--text)" }}>{count}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quiz List Page ─────────────────────────────────────────────────────────────
export default function QuizPage() {
  const session = getSession();
  const regNo   = session.regNo;

  const [profile,    setProfile]    = useState(() => { try { return JSON.parse(sessionStorage.getItem("cachedProfile")||"null"); } catch { return null; } });
  const [quizzes,    setQuizzes]    = useState([]);
  const [submissions,setSubmissions]= useState({}); // quizId → submission data
  const [loading,    setLoading]    = useState(true);
  const [starting,   setStarting]   = useState(null);
  const [startError, setStartError] = useState({});
  const [attempt,    setAttempt]    = useState(null);
  const [activeTab,  setActiveTab]  = useState("upcoming"); // upcoming | expired | attempted

  useEffect(() => {
    if (!regNo) { window.location.href = "/login"; return; }
    Promise.all([
      profile ? Promise.resolve(profile) : fetch(`${BASE}/profile/${regNo}`).then(r=>r.json()).catch(()=>null),
      fetch(`${BASE}/quizzes/${regNo}`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/quiz/submissions/${regNo}`).then(r=>r.json()).catch(()=>[]),
    ]).then(([prof, qz, subs]) => {
      if (prof) { setProfile(prof); sessionStorage.setItem("cachedProfile", JSON.stringify(prof)); }
      setQuizzes(Array.isArray(qz) ? qz : []);
      // Build submission map by quizId
      const subMap = {};
      (Array.isArray(subs) ? subs : []).forEach(s => { subMap[s.quizId] = s; });
      setSubmissions(subMap);
      setLoading(false);
    });
  }, [regNo]);

  const startQuiz = async (quiz) => {
    setStarting(quiz.quizId);
    setStartError(p => ({ ...p, [quiz.quizId]: null }));
    try {
      const data = await api(`${BASE}/quiz/${quiz.quizId}/start`, {
        method: "POST", body: JSON.stringify({ regNo }),
      });
      setAttempt({ quiz: { ...quiz, timer: data.timer ?? quiz.timer }, questions: data.questions, submissionId: data.submissionId });
    } catch (e) {
      setStartError(p => ({ ...p, [quiz.quizId]: e.message }));
    } finally {
      setStarting(null);
    }
  };

  if (attempt) {
    return (
      <QuizAttempt
        quiz={attempt.quiz}
        questions={attempt.questions}
        submissionId={attempt.submissionId}
        regNo={regNo}
        onComplete={() => { setAttempt(null); setActiveTab("attempted"); window.location.reload(); }}
      />
    );
  }

  const now = new Date();

  // Categorize quizzes
  const upcoming = quizzes.filter(q => {
    if (submissions[q.quizId]?.isSubmitted) return false;
    return !q.deadline || new Date(q.deadline) > now;
  });
  const expired = quizzes.filter(q => {
    if (submissions[q.quizId]?.isSubmitted) return false;
    return q.deadline && new Date(q.deadline) <= now;
  });
  const attempted = quizzes.filter(q => submissions[q.quizId]?.isSubmitted);

  const tabData = { upcoming, expired, attempted };
  const current = tabData[activeTab] ?? [];

  const TABS = [
    { key: "upcoming",  label: "Upcoming",  icon: "schedule",      count: upcoming.length  },
    { key: "expired",   label: "Expired",   icon: "event_busy",    count: expired.length   },
    { key: "attempted", label: "Attempted", icon: "check_circle",  count: attempted.length },
  ];

  return (
    <Layout activeKey="quizzes" title="Quizzes" subtitle="Online assessments for your enrolled courses" profile={profile}>
      {loading ? <Spinner /> : (
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {TABS.map(({ key, label, icon, count }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 20, border: `1px solid ${activeTab===key?"#0d7ff2":"var(--border)"}`, cursor: "pointer", fontSize: 13, fontWeight: activeTab===key?700:400, background: activeTab===key?"#0d7ff2":"var(--card)", color: activeTab===key?"#fff":"var(--text-muted)", transition: "all 0.15s" }}>
                <Ic n={icon} size={15} color={activeTab===key?"#fff":"var(--text-muted)"} fill={activeTab===key?1:0} />
                {label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: activeTab===key?"rgba(255,255,255,0.25)":"var(--border-light)", color: activeTab===key?"#fff":"var(--text-muted)" }}>{count}</span>
              </button>
            ))}
          </div>

          {current.length === 0
            ? <div style={card}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}><Ic n="quiz" size={40} color="var(--border)" fill={1} /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>No {activeTab} quizzes</span></div></div>
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {current.map(q => {
                  const sub  = submissions[q.quizId];
                  const left = daysLeft(q.deadline);
                  const err  = startError[q.quizId];

                  return (
                    <div key={q.quizId} style={card}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0d7ff2", background: "rgba(13,127,242,0.08)", padding: "2px 10px", borderRadius: 20 }}>{q.courseCode}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, textTransform: "uppercase",
                          background: activeTab==="attempted"?"#dcfce7":activeTab==="expired"?"#fee2e2":"#f0fdf4",
                          color:      activeTab==="attempted"?"#15803d":activeTab==="expired"?"#dc2626":"#15803d" }}>
                          {activeTab==="attempted"?"Completed":activeTab==="expired"?"Expired":"Upcoming"}
                        </span>
                      </div>

                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{q.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px" }}>{q.courseName}</p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                        <Ic n="event" size={14} color="var(--text-muted)" />
                        Deadline: {q.deadline ? new Date(q.deadline).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                      </div>

                      {/* Result if available */}
                      {sub?.isSubmitted && sub?.showResult && sub?.obtainedMarks != null && (
                        <div style={{ padding: "10px 14px", background: "rgba(13,127,242,0.06)", borderRadius: 8, marginBottom: 14 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                            Score: <span style={{ color: "#0d7ff2" }}>{sub.obtainedMarks} / {sub.totalMarks}</span>
                            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> ({sub.percentage?.toFixed(1)}%)</span>
                          </p>
                        </div>
                      )}

                      {err && <p style={{ fontSize: 11, color: "#dc2626", margin: "0 0 10px" }}>{err}</p>}

                      {activeTab === "upcoming" && (
                        <button onClick={() => startQuiz(q)} disabled={starting===q.quizId}
                          style={{ width: "100%", padding: "11px 0", background: starting===q.quizId?"#94a3b8":"#0d7ff2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: starting===q.quizId?"not-allowed":"pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <Ic n={starting===q.quizId?"hourglass_empty":"play_arrow"} size={18} color="#fff" fill={1} />
                          {starting===q.quizId?"Starting...":"Start Quiz"}
                        </button>
                      )}
                      {activeTab === "attempted" && !sub?.showResult && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--border-light)", borderRadius: 8 }}>
                          <Ic n="hourglass_empty" size={16} color="var(--text-muted)" />
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Result pending faculty release.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
}