import { useState, useEffect, useRef } from "react";
import apolloLogo from "./assets/APOLLOLOGO.png";
import { useAuth } from "./hooks/useAuth";
import { useWorkouts } from "./hooks/useWorkouts";
import { useRoutines } from "./hooks/useRoutines";
import { useCommunityRoutines } from "./hooks/useCommunityRoutines";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { supabase } from "./lib/supabase";
import "./styles/apollo.css";

// ─── DATA (kept as constants — display-only, not stored in DB) ───────────────

const RANKS = [
  { name: "Bronze",   min: 0,     max: 999,      color: "#cd7f32", glow: "#cd7f3260" },
  { name: "Silver",   min: 1000,  max: 2999,     color: "#c0c0c0", glow: "#c0c0c060" },
  { name: "Gold",     min: 3000,  max: 5999,     color: "#ffd700", glow: "#ffd70060" },
  { name: "Platinum", min: 6000,  max: 9999,     color: "#00e5ff", glow: "#00e5ff60" },
  { name: "Diamond",  min: 10000, max: 14999,    color: "#b9f2ff", glow: "#b9f2ff60" },
  { name: "Monster",  min: 15000, max: 24999,    color: "#ff4081", glow: "#ff408160" },
  { name: "Olympian", min: 25000, max: Infinity, color: "#aa00ff", glow: "#aa00ff60" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getRankInfo(ap) {
  return RANKS.find(r => ap >= r.min && ap <= r.max) || RANKS[0];
}

function getRankProgress(ap) {
  const rank = getRankInfo(ap);
  if (rank.max === Infinity) return 100;
  return Math.round(((ap - rank.min) / (rank.max - rank.min)) * 100);
}

// Normalize DB exercise shape to UI shape
function normalizeExercise(ex) {
  return {
    ...ex,
    muscle: ex.muscle_group || ex.muscle || "",
    video: ex.video_url || ex.video || "",
  };
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 18 }) => {
  const icons = {
    home: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z",
    dumbbell: "M6.5 6.5h11M6.5 17.5h11M4 6.5h1.5v11H4zM18.5 6.5H20v11h-1.5zM9 10h6v4H9z",
    fire: "M12 2C8 6 6 9 8 13c-2-1-3-3-2-5C3 11 2 15 5 18a7 7 0 0014 0c1-4-1-8-4-10 0 2-1 4-3 5z",
    trophy: "M6 2h12v6a6 6 0 01-12 0V2zM9 18h6M12 14v4M6 2H3v3a3 3 0 003 3M18 2h3v3a3 3 0 01-3 3",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    book: "M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14zM6.5 17H20",
    plus: "M12 5v14M5 12h14",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    chart: "M3 3v18h18M7 16l4-4 4 4 4-8",
    medal: "M12 15a6 6 0 100-12 6 6 0 000 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    x: "M18 6L6 18M6 6l12 12",
    check: "M20 6L9 17l-5-5",
    play: "M5 3l14 9-14 9V3z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    bookmark: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
    target: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
    arrow: "M5 12h14M12 5l7 7-7 7",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
    share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
    weight: "M12 2a2 2 0 012 2v1h3a1 1 0 011 1v2a1 1 0 01-1 1h-1v8a2 2 0 01-2 2H8a2 2 0 01-2-2V9H5a1 1 0 01-1-1V6a1 1 0 011-1h3V4a2 2 0 012-2z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name] || icons.bolt} />
    </svg>
  );
};

// ─── APOLLO LOGO ─────────────────────────────────────────────────────────────

const ApolloLogo = ({ size = 40 }) => (
  <img src={apolloLogo} alt="Apollo Logo" width={size} height={size} style={{ objectFit: "contain" }} />
);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#ffd700" : "none"} stroke={i <= Math.round(rating) ? "#ffd700" : "#5a5a70"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function RankBadge({ rankName }) {
  const rank = RANKS.find(r => r.name === rankName);
  if (!rank) return null;
  return (
    <span className="rank-badge" style={{ background: `${rank.glow}`, border: `1px solid ${rank.color}40`, color: rank.color }}>
      {rankName}
    </span>
  );
}

function MiniChart({ data, color = "#8b5cf6" }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="chart-bar" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(to top, ${color}, ${color}88)` }} />
      ))}
    </div>
  );
}

const REST_OPTIONS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 300];
const fmtRestLabel  = s => !s ? "OFF" : s < 60 ? `${s}s` : `${Math.floor(s/60)}min${s%60 ? ` ${s%60}s` : ""}`;
const fmtRestOption = s => s === 0 ? "No Rest" : s < 60 ? `${s}s` : `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const fmtRestClock  = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

// ─── PAGES ───────────────────────────────────────────────────────────────────

function LandingPage({ onNavigate }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="float" style={{ marginBottom: 32 }}>
          <ApolloLogo size={80} />
        </div>
        <h1 className="hero-title">APOLLO</h1>
        <p className="hero-sub">THE OLYMPIAN FITNESS PLATFORM<br />TRACK · COMPETE · ASCEND</p>
        <div className="hero-cta">
          <button className="btn btn-gold btn-lg" onClick={() => onNavigate("register")}>BEGIN YOUR ASCENT</button>
          <button className="btn btn-outline btn-lg" onClick={() => onNavigate("login")}>SIGN IN</button>
        </div>
      </div>
      <div className="hero-features">
        {[
          { icon: "chart", color: "#8b5cf6", title: "PERFORMANCE TRACKING", desc: "Log workouts, track PRs, visualize progress over time." },
          { icon: "trophy", color: "#ffd700", title: "GAMIFIED RANKING", desc: "Earn Apollo Points. Rise from Bronze to Olympian." },
          { icon: "fire", color: "#ff8c00", title: "STREAK SYSTEM", desc: "Build habits with daily and weekly consistency streaks." },
          { icon: "users", color: "#00e5ff", title: "COMMUNITY ROUTINES", desc: "Share and discover workouts from elite athletes." },
        ].map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
              <span style={{ color: f.color }}><Icon name={f.icon} size={22} /></span>
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 2, color: f.color, marginBottom: 8 }}>{f.title}</div>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

function AuthPage({ mode, onSignIn, onSignUp, onNavigate, authError, onSignUpSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (mode === "login") {
        await onSignIn(form.email, form.password);
      } else {
        const success = await onSignUp(form.email, form.password, form.username);
        if (success) onSignUpSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <ApolloLogo size={48} />
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #ffd700, #aa00ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 4, marginTop: 12 }}>APOLLO</h2>
          <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{mode === "login" ? "Welcome back, Champion" : "Begin your ascent"}</p>
        </div>
        {mode === "register" && (
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Choose your warrior name" />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        {authError && (
          <p style={{ color: "var(--pink)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</p>
        )}
        <button className="btn btn-gold w-full" style={{ justifyContent: "center", marginTop: 8 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? "..." : mode === "login" ? "ENTER THE ARENA" : "CREATE ACCOUNT"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)", marginTop: 16 }}>
          {mode === "login" ? "No account? " : "Already a champion? "}
          <span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => onNavigate(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}

function Dashboard({ profile, workouts }) {
  const ap = profile?.ap_points || 0;
  const rank = getRankInfo(ap);
  const progress = getRankProgress(ap);
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1];
  const prs = profile?.prs || {};
  const badges = profile?.badges || [];

  // Volume chart: last 7 workouts' total_volume
  const volumeData = workouts.slice(0, 7).map(w => parseFloat(w.total_volume) || 0).reverse();
  const chartData = volumeData.length > 0 ? volumeData : [0];

  return (
    <div>
      <div className="card mb-20" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "var(--text3)", letterSpacing: 2, marginBottom: 6 }}>WELCOME BACK</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{profile?.username}</h2>
            <div className="flex items-center gap-8 mt-8">
              <RankBadge rankName={rank.name} />
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{ap.toLocaleString()} Apollo Points</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="flex items-center gap-8 mb-8">
              <span className="streak-fire"><Icon name="fire" size={20} /></span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#ff8c00" }}>{profile?.streak || 0}</span>
              <span style={{ color: "var(--text2)", fontSize: 13 }}>day streak</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Weekly: {profile?.weekly_streak || 0} weeks</div>
          </div>
        </div>
        <div className="mt-16">
          <div className="flex justify-between mb-4">
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Rank Progress — {rank.name}</span>
            {nextRank && <span style={{ fontSize: 12, color: "var(--text3)" }}>Next: {nextRank.name}</span>}
          </div>
          <div className="progress-wrap">
            <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}88)` }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{progress}% to {nextRank?.name || "MAX"}</div>
        </div>
      </div>

      <div className="grid-4 mb-20">
        {[
          { label: "Total Workouts", value: profile?.total_workouts || 0, icon: "dumbbell", color: "var(--purple)" },
          { label: "Apollo Points", value: ap.toLocaleString(), icon: "bolt", color: "var(--gold)" },
          { label: "Day Streak", value: profile?.streak || 0, icon: "fire", color: "#ff8c00" },
          { label: "Routines Created", value: profile?.routines_created || 0, icon: "book", color: "var(--cyan)" },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-8">
              <span style={{ color: s.color }}><Icon name={s.icon} size={20} /></span>
              <span className="card-title" style={{ margin: 0 }}>{s.label}</span>
            </div>
            <div className="card-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-title">WEEKLY VOLUME (last sessions)</div>
          <MiniChart data={chartData} />
          <div className="flex justify-between mt-4">
            {["1","2","3","4","5","6","7"].map((d,i) => <span key={i} style={{ fontSize: 10, color: "var(--text3)", flex: 1, textAlign: "center" }}>{d}</span>)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">PERSONAL RECORDS</div>
          {Object.keys(prs).length === 0 && <div style={{ color: "var(--text3)", fontSize: 13 }}>No PRs recorded yet.</div>}
          {Object.entries(prs).map(([ex, pr]) => (
            <div key={ex} className="stat-row">
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{ex}</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{pr}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-20">
        <div className="card-title">RECENT WORKOUTS</div>
        {workouts.length === 0 && <div style={{ color: "var(--text3)", fontSize: 13, padding: "16px 0" }}>No workouts yet. Start your first session!</div>}
        {workouts.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Workout</th><th>Duration</th><th>Volume</th><th>AP</th></tr>
              </thead>
              <tbody>
                {workouts.map(w => (
                  <tr key={w.id}>
                    <td style={{ color: "var(--text3)" }}>{new Date(w.finished_at || w.started_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{w.name}</td>
                    <td>{w.duration_sec ? `${Math.round(w.duration_sec / 60)} min` : "—"}</td>
                    <td style={{ color: "var(--cyan)", fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}>{w.total_volume ? `${Math.round(w.total_volume).toLocaleString()} kg` : "—"}</td>
                    <td style={{ color: "var(--gold)", fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}>+{w.ap_earned || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">ACHIEVEMENTS</div>
        {badges.length === 0 && <div style={{ color: "var(--text3)", fontSize: 13 }}>No badges yet. Keep training!</div>}
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <span key={i} className="badge badge-gold">
              <Icon name="medal" size={12} /> {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkoutTracker({ exercises, userId, onWorkoutSaved, onPhaseChange }) {
  const [phase, setPhase] = useState("select");
  const changePhase = (p) => { setPhase(p); onPhaseChange?.(p); };
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sets, setSets] = useState({});
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apJustEarned, setApJustEarned] = useState(0);
  const [restTimes, setRestTimes] = useState({});
  const [activeRest, setActiveRest] = useState(null);
  const [restPickerEx, setRestPickerEx] = useState(null);
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const { saveWorkout } = useWorkouts(userId);
  const { routines: communityRoutines, bookmarked } = useCommunityRoutines(userId);
  const bookmarkedRoutines = communityRoutines.filter(r => bookmarked.has(r.id));

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (!activeRest) { clearInterval(restTimerRef.current); return; }
    restTimerRef.current = setInterval(() => {
      setActiveRest(prev => {
        if (!prev || prev.timeLeft <= 1) { clearInterval(restTimerRef.current); return null; }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(restTimerRef.current);
  }, [!!activeRest]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const addExercise = (ex) => {
    if (selectedExercises.find(e => e.id === ex.id)) return;
    setSelectedExercises(prev => [...prev, ex]);
    setSets(prev => ({ ...prev, [ex.id]: [{ weight: "", reps: "", done: false }] }));
  };

  const addSet = (exId) => {
    setSets(prev => ({ ...prev, [exId]: [...prev[exId], { weight: "", reps: "", done: false }] }));
  };

  const removeExercise = (exId) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exId));
    setSets(prev => { const n = { ...prev }; delete n[exId]; return n; });
  };

  const updateSet = (exId, idx, field, val) => {
    setSets(prev => {
      const copy = [...prev[exId]];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, [exId]: copy };
    });
    if (field === "done" && val === true && (restTimes[exId] || 0) > 0) {
      clearInterval(restTimerRef.current);
      setActiveRest({ exId, timeLeft: restTimes[exId], totalTime: restTimes[exId] });
    }
  };

  const removeSet = (exId, idx) => {
    setSets(prev => {
      const copy = [...prev[exId]];
      copy.splice(idx, 1);
      return { ...prev, [exId]: copy };
    });
  };

  function discard() {
    setRunning(false);
    setActiveRest(null);
    changePhase("select");
    setSelectedExercises([]);
    setSets({});
    setTimer(0);
    setWorkoutName("");
    setRestTimes({});
  }

  function startFromRoutine(routine) {
    const routineExs = (routine.exercises || []).map(re => {
      const full = exercises.find(e => e.id === re.exercise_id);
      return full || { id: re.exercise_id, name: re.exercise_name, muscle: "", video: "" };
    });
    setWorkoutName(routine.name);
    setSelectedExercises(routineExs);
    const initSets = {};
    const initRest = {};
    routine.exercises.forEach((re, i) => {
      const ex = routineExs[i];
      initSets[ex.id] = [{ weight: "", reps: "", done: false }];
      initRest[ex.id] = re.rest_time || 0;
    });
    setSets(initSets);
    setRestTimes(initRest);
    changePhase("active");
    setRunning(true);
  }

  const totalVolume = selectedExercises.reduce((acc, ex) => {
    const exSets = sets[ex.id] || [];
    return acc + exSets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0);
  }, 0);

  async function handleFinish() {
    setRunning(false);
    setSaving(true);
    const { apEarned, error } = await saveWorkout({
      name: workoutName || "Workout",
      exercises: selectedExercises,
      sets,
      durationSec: timer,
    });
    setSaving(false);
    if (!error) {
      setApJustEarned(apEarned);
      changePhase("done");
      onWorkoutSaved();
    }
  }

  if (saving) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: "var(--text2)" }}>SAVING WORKOUT...</div>
    </div>
  );

  if (phase === "done") return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "var(--gold)", marginBottom: 12 }}>WORKOUT COMPLETE</h2>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>You earned <span style={{ color: "var(--gold)", fontWeight: 700 }}>+{apJustEarned} AP</span></p>
      <div className="grid-3" style={{ maxWidth: 500, margin: "0 auto 32px" }}>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{fmt(timer)}</div><div className="card-sub">Duration</div></div>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{selectedExercises.length}</div><div className="card-sub">Exercises</div></div>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{Math.round(totalVolume)}</div><div className="card-sub">kg Volume</div></div>
      </div>
      <button className="btn btn-gold btn-lg" onClick={() => { changePhase("select"); setSelectedExercises([]); setSets({}); setTimer(0); setWorkoutName(""); setApJustEarned(0); }}>
        START ANOTHER
      </button>
    </div>
  );

  if (phase === "active") return (
    <div>
      <div className="card mb-20" style={{ background: "linear-gradient(135deg, rgba(0,230,118,0.1), rgba(59,130,246,0.08))", border: "1px solid rgba(0,230,118,0.3)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{workoutName || "Untitled Workout"}</div>
            <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>{selectedExercises.length} exercises · {Math.round(totalVolume)} kg volume</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--green)" }}>{fmt(timer)}</div>
            <div className="flex gap-8 mt-4">
              <button className="btn btn-sm btn-outline" onClick={() => setRunning(r => !r)}>{running ? "PAUSE" : "RESUME"}</button>
              <button className="btn btn-sm btn-gold" onClick={handleFinish}>FINISH</button>
              <button className="btn btn-sm" style={{ background: "rgba(255,64,81,0.15)", border: "1px solid rgba(255,64,81,0.4)", color: "var(--pink)" }} onClick={discard}>DISCARD</button>
            </div>
          </div>
        </div>
      </div>

      {selectedExercises.map(ex => (
        <div key={ex.id} className="exercise-item">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{ex.name}</span>
              <span className="badge badge-purple" style={{ marginLeft: 8 }}>{ex.muscle}</span>
            </div>
            <button className="btn btn-ghost" onClick={() => removeExercise(ex.id)}><Icon name="x" size={16} /></button>
          </div>
          <div onClick={() => setRestPickerEx(ex.id)} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold)", fontSize: 13, cursor: "pointer", marginBottom: 10 }}>
            <Icon name="clock" size={13} />
            <span>Rest Timer: {fmtRestLabel(restTimes[ex.id] || 0)}</span>
          </div>
          <div className="set-header"><span>#</span><span>WEIGHT (kg)</span><span>REPS</span><span>VOL</span><span></span></div>
          {(sets[ex.id] || []).map((set, idx) => (
            <div key={idx} className="set-row">
              <span className="set-num">{idx + 1}</span>
              <input className="set-input" type="number" placeholder="0" value={set.weight} onChange={e => updateSet(ex.id, idx, "weight", e.target.value)} />
              <input className="set-input" type="number" placeholder="0" value={set.reps} onChange={e => updateSet(ex.id, idx, "reps", e.target.value)} />
              <span className="set-num" style={{ color: "var(--cyan)", fontSize: 12 }}>
                {set.weight && set.reps ? `${(parseFloat(set.weight)*parseInt(set.reps)).toFixed(0)}kg` : "—"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => updateSet(ex.id, idx, "done", !set.done)}>
                  <span style={{ color: set.done ? "var(--green)" : "var(--text3)" }}><Icon name="check" size={16} /></span>
                </button>
                <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => removeSet(ex.id, idx)}>
                  <span style={{ color: "var(--text3)" }}><Icon name="x" size={14} /></span>
                </button>
              </span>
            </div>
          ))}
          <button className="btn btn-outline btn-sm mt-8" onClick={() => addSet(ex.id)}><Icon name="plus" size={14} /> Add Set</button>
        </div>
      ))}

      <div className="card mt-16">
        <div className="card-title">ADD EXERCISE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {exercises.filter(e => !selectedExercises.find(s => s.id === e.id)).map(ex => (
            <button key={ex.id} className="btn btn-outline btn-sm" onClick={() => addExercise(ex)}>
              <Icon name="plus" size={12} /> {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rest time picker modal */}
      {restPickerEx && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setRestPickerEx(null)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, minWidth: 260 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, letterSpacing: 1, color: "var(--text2)", marginBottom: 16 }}>SET REST TIMER</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {REST_OPTIONS.map(s => (
                <button key={s} className={`btn btn-sm ${(restTimes[restPickerEx] || 0) === s ? "btn-primary" : "btn-outline"}`} onClick={() => { setRestTimes(prev => ({ ...prev, [restPickerEx]: s })); setRestPickerEx(null); }}>
                  {fmtRestOption(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active rest timer banner */}
      {activeRest && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 250, background: "#13131f", borderTop: "2px solid var(--gold)", paddingBottom: 24 }}>
          <div style={{ height: 3, background: `linear-gradient(to right, var(--gold) ${Math.round((activeRest.timeLeft / activeRest.totalTime) * 100)}%, rgba(255,215,0,0.15) 0%)` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, paddingTop: 18 }}>
            <button onClick={() => setActiveRest(prev => prev ? { ...prev, timeLeft: Math.max(1, prev.timeLeft - 15) } : null)} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, width: 60, height: 60, color: "var(--gold)", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>-15</button>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 44, fontWeight: 900, color: "var(--gold)", minWidth: 120, textAlign: "center", letterSpacing: 2 }}>{fmtRestClock(activeRest.timeLeft)}</div>
            <button onClick={() => setActiveRest(prev => prev ? { ...prev, timeLeft: prev.timeLeft + 15 } : null)} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, width: 60, height: 60, color: "var(--gold)", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>+15</button>
            <button onClick={() => setActiveRest(null)} style={{ background: "var(--gold)", border: "none", borderRadius: 14, padding: "14px 24px", color: "#0b0b0f", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>Skip</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
          Workout <span style={{ color: "var(--gold)" }}>Tracker</span>
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>Start a new session and log your lifts.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0 28px" }}>
        <div style={{ width: 180, height: 180, borderRadius: "50%", background: "rgba(15,15,24,0.9)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 128, height: 128, borderRadius: "50%", border: "2px solid rgba(255,215,0,0.45)", boxShadow: "0 0 24px rgba(255,215,0,0.18), inset 0 0 20px rgba(255,215,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="52" height="52" viewBox="0 0 48 48" fill="var(--gold)">
              <rect x="4" y="19" width="5" height="10" rx="1.5"/>
              <rect x="9" y="13" width="7" height="22" rx="2"/>
              <rect x="16" y="21" width="16" height="6" rx="1"/>
              <rect x="32" y="13" width="7" height="22" rx="2"/>
              <rect x="39" y="19" width="5" height="10" rx="1.5"/>
            </svg>
          </div>
        </div>
        <button className="btn btn-gold btn-lg" style={{ minWidth: 200, justifyContent: "center" }} onClick={() => { setWorkoutName(""); setSelectedExercises([]); setSets({}); changePhase("active"); setRunning(true); }}>
          <Icon name="play" size={18} /> Start Workout
        </button>
      </div>

      <div className="card">
        <div className="card-title">BOOKMARKED ROUTINES</div>
        {bookmarkedRoutines.length === 0 ? (
          <p style={{ color: "var(--text2)", fontSize: 13, margin: 0 }}>No bookmarked routines yet. Visit <strong style={{ color: "var(--text)" }}>Community</strong> to discover and bookmark routines.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookmarkedRoutines.map(r => (
              <button key={r.id} onClick={() => startFromRoutine(r)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", cursor: "pointer", color: "var(--text)", textAlign: "left", width: "100%" }}>
                <span>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 15 }}>{r.name}</span>
                  <span style={{ color: "var(--text2)", fontSize: 13, marginLeft: 8 }}>— {(r.exercises || []).length} exercises</span>
                </span>
                <span style={{ color: "var(--gold)" }}><Icon name="play" size={14} /></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseLibrary({ exercises }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const muscles = ["All", ...new Set(exercises.map(e => e.muscle))];
  const filtered = filter === "All" ? exercises : exercises.filter(e => e.muscle === filter);

  if (selected) return (
    <div>
      <button className="btn btn-outline btn-sm mb-20" onClick={() => setSelected(null)}><Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} /> Back to Library</button>
      <div className="grid-2">
        <div>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{selected.name}</h2>
          <div className="flex gap-8 mb-16">
            <span className="badge badge-purple">{selected.muscle}</span>
            <span className="badge badge-cyan">{selected.difficulty}</span>
          </div>
          <div className="card mb-16">
            <div className="card-title">INSTRUCTIONS</div>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>{selected.instructions}</p>
          </div>
          <div className="card">
            <div className="card-title">MUSCLES TARGETED</div>
            <div className="flex gap-8" style={{ flexWrap: "wrap", marginTop: 8 }}>
              {(selected.muscles || []).map(m => <span key={m} className="badge badge-gold">{m}</span>)}
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--bg3)", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <iframe width="100%" height="100%" style={{ border: "none", minHeight: 220 }} src={selected.video} title={selected.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Video demonstration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-8 mb-20" style={{ flexWrap: "wrap" }}>
        {muscles.map(m => (
          <button key={m} className={`btn btn-sm ${filter === m ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(m)}>{m}</button>
        ))}
      </div>
      <div className="grid-auto">
        {filtered.map(ex => (
          <div key={ex.id} className="exercise-card" onClick={() => setSelected(ex)}>
            <div className="exercise-card-img">
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.05))" }} />
              <span style={{ color: "var(--purple)", opacity: 0.5 }}><Icon name="dumbbell" size={48} /></span>
            </div>
            <div className="exercise-card-body">
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{ex.name}</div>
              <div className="flex gap-8">
                <span className="badge badge-purple">{ex.muscle}</span>
                <span className="badge" style={{ background: "rgba(0,230,118,0.1)", color: "var(--green)", border: "1px solid rgba(0,230,118,0.2)" }}>{ex.difficulty}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ex.instructions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutineBuilder({ exercises, userId }) {
  const { routines, loading, createRoutine, updateRoutine, deleteRoutine } = useRoutines(userId);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", exercises: [], isPublic: false });
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setForm({ name: "", description: "", exercises: [], isPublic: false });
    setEditing("new");
  };

  const toggleExercise = (ex) => {
    setForm(prev => {
      const has = prev.exercises.find(e => e.id === ex.id);
      return { ...prev, exercises: has ? prev.exercises.filter(e => e.id !== ex.id) : [...prev.exercises, { ...ex, rest_time: 0 }] };
    });
  };

  const updateExRestTime = (exId, seconds) => {
    setForm(prev => ({ ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, rest_time: seconds } : e) }));
  };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    if (editing === "new") {
      await createRoutine(form);
    } else {
      await updateRoutine(editing, form);
    }
    setSaving(false);
    setEditing(null);
  };

  if (editing !== null) return (
    <div>
      <button className="btn btn-outline btn-sm mb-20" onClick={() => setEditing(null)}><Icon name="x" size={14} /> Cancel</button>
      <div className="card">
        <div className="card-title">{editing === "new" ? "CREATE ROUTINE" : "EDIT ROUTINE"}</div>
        <div className="form-group"><label>Routine Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Olympian Push Day" /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your routine..." /></div>
        <div className="mb-16">
          <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase" }}>Exercises</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {exercises.map(ex => {
              const sel = !!form.exercises.find(e => e.id === ex.id);
              return <button key={ex.id} className={`btn btn-sm ${sel ? "btn-primary" : "btn-outline"}`} onClick={() => toggleExercise(ex)}>{sel && "✓ "}{ex.name}</button>;
            })}
          </div>
        </div>
        {form.exercises.length > 0 && (
          <div className="mb-16">
            <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase" }}>Rest Times</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.exercises.map(ex => (
                <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{ex.name}</span>
                  <select value={ex.rest_time || 0} onChange={e => updateExRestTime(ex.id, parseInt(e.target.value))} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>
                    {REST_OPTIONS.map(s => <option key={s} value={s}>{fmtRestOption(s)}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-8 mb-16">
          <input type="checkbox" id="pub" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} style={{ width: "auto" }} />
          <label htmlFor="pub" style={{ marginBottom: 0, cursor: "pointer", color: "var(--text2)", fontFamily: "Inter", textTransform: "none", fontSize: 14, letterSpacing: 0 }}>Publish to Community</label>
        </div>
        <button className="btn btn-gold" onClick={save} disabled={saving}><Icon name="check" size={16} /> {saving ? "Saving..." : "Save Routine"}</button>
      </div>
    </div>
  );

  if (loading) return <div style={{ color: "var(--text2)", padding: 20 }}>Loading routines...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-20">
        <div style={{ color: "var(--text2)", fontSize: 14 }}>{routines.length} routine{routines.length !== 1 ? "s" : ""} created</div>
        <button className="btn btn-gold" onClick={startNew}><Icon name="plus" size={16} /> New Routine</button>
      </div>
      {routines.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Icon name="book" size={48} />
          <p style={{ color: "var(--text2)", marginTop: 16 }}>No routines yet. Create your first!</p>
        </div>
      )}
      <div className="grid-2">
        {routines.map(r => {
          const exList = (r.exercises || []).map(e => e.exercise_name || e.name).filter(Boolean);
          return (
            <div key={r.id} className="routine-card">
              <div className="flex justify-between items-center mb-8">
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18 }}>{r.name}</h3>
                {r.is_public && <span className="badge badge-green"><Icon name="share" size={10} /> Public</span>}
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{r.description}</p>
              <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 12 }}>
                {exList.map(name => <span key={name} className="badge badge-purple">{name}</span>)}
              </div>
              <div className="flex gap-8">
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const formExercises = (r.exercises || []).map(e => ({ ...(exercises.find(ex => ex.id === e.exercise_id) || { id: e.exercise_id, name: e.exercise_name }), rest_time: e.rest_time || 0 })).filter(Boolean);
                  setForm({ name: r.name, description: r.description || "", exercises: formExercises, isPublic: r.is_public });
                  setEditing(r.id);
                }}><Icon name="edit" size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteRoutine(r.id)}><Icon name="trash" size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommunityRoutines({ userId, exercises }) {
  const { routines, bookmarked, loading, sort, setSort, toggleBookmark, incrementDownload } = useCommunityRoutines(userId);
  const [selected, setSelected] = useState(null);

  if (selected) {
    const exList = (selected.exercises || []).map(e => e.exercise_name || e.name).filter(Boolean);
    return (
      <div>
        <button className="btn btn-outline btn-sm mb-20" onClick={() => setSelected(null)}>← Back</button>
        <div className="card">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: "var(--text)", marginBottom: 8 }}>{selected.name}</h2>
              <div className="flex gap-8 items-center">
                <Stars rating={selected.rating || 0} />
                <span style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700 }}>{selected.rating}</span>
                <span style={{ color: "var(--text3)", fontSize: 13 }}>by {selected.profiles?.username || selected.creator || "Unknown"}</span>
              </div>
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline btn-sm" onClick={() => toggleBookmark(selected.id)}>
                <span style={{ color: bookmarked.has(selected.id) ? "var(--gold)" : undefined }}><Icon name="bookmark" size={14} /></span>
              </button>
              <button className="btn btn-gold btn-sm" onClick={() => incrementDownload(selected.id)}><Icon name="download" size={14} /> Add to Plan</button>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 20 }}>{selected.description}</p>
          <div className="flex gap-8 mb-20">
            <span className="badge badge-purple">{selected.category}</span>
            <span className="badge badge-cyan">{selected.difficulty}</span>
            <span style={{ fontSize: 13, color: "var(--text3)" }}>{(selected.downloads || 0).toLocaleString()} athletes training this</span>
          </div>
          <div className="card-title">EXERCISES</div>
          {exList.map((name, i) => {
            const ex = exercises.find(e => e.name === name);
            return (
              <div key={i} className="stat-row">
                <span style={{ fontSize: 14, color: "var(--text)" }}>{i+1}. {name}</span>
                {ex && <span className="badge badge-purple">{ex.muscle}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-8 mb-20">
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {["popular","rated","newest"].map(s => (
            <button key={s} className={`tab ${sort === s ? "active" : ""}`} onClick={() => setSort(s)}>
              {s === "popular" ? "Most Popular" : s === "rated" ? "Top Rated" : "Newest"}
            </button>
          ))}
        </div>
      </div>
      {loading && <div style={{ color: "var(--text2)", padding: 20 }}>Loading routines...</div>}
      {!loading && routines.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "var(--text2)" }}>No community routines yet. Be the first to publish one!</p>
        </div>
      )}
      <div className="grid-2">
        {routines.map(r => (
          <div key={r.id} className="routine-card" onClick={() => setSelected(r)}>
            <div className="flex justify-between items-center mb-8">
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17 }}>{r.name}</h3>
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={e => { e.stopPropagation(); toggleBookmark(r.id); }}>
                <span style={{ color: bookmarked.has(r.id) ? "var(--gold)" : "var(--text3)" }}><Icon name="bookmark" size={16} /></span>
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{r.description}</p>
            <div className="flex items-center gap-8 mb-12">
              <Stars rating={r.rating || 0} />
              <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700 }}>{r.rating}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-8">
                <span className="badge badge-purple">{r.category}</span>
                <span className="badge badge-cyan">{r.difficulty}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text3)" }}><Icon name="download" size={12} /> {(r.downloads || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboards({ session }) {
  const { leaders, loading, tab, setTab } = useLeaderboard();

  const trophyColor = (i) => i === 0 ? "var(--gold)" : i === 1 ? "var(--text2)" : i === 2 ? "#cd7f32" : "var(--text3)";
  const myId = session?.user?.id;

  const getValue = (u) => tab === "ap" ? u.ap_points?.toLocaleString() : tab === "streak" ? `${u.streak}d` : u.routines_created;

  if (loading) return <div style={{ color: "var(--text2)", padding: 20 }}>Loading leaderboard...</div>;

  return (
    <div>
      <div className="tab-bar">
        {[["ap","Apollo Points"],["streak","Longest Streak"],["routines","Most Routines"]].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="grid-3 mb-20">
        {leaders.slice(0,3).map((u, i) => {
          const rank = RANKS.find(r => r.name === u.rank_name);
          return (
            <div key={u.id} className="card" style={{ textAlign: "center", border: i === 0 ? "1px solid rgba(255,215,0,0.4)" : "1px solid var(--border)", transform: i === 0 ? "scale(1.04)" : "scale(1)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${rank?.color || "#8b5cf6"}, #3b82f6)`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "white" }}>
                {u.username[0]}
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{u.username}</div>
              <div style={{ marginTop: 4 }}><RankBadge rankName={u.rank_name} /></div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: trophyColor(i), marginTop: 8 }}>
                {getValue(u)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Athlete</th><th>Rank</th>
                <th>{tab === "ap" ? "Apollo Points" : tab === "streak" ? "Streak" : "Routines"}</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((u, i) => (
                <tr key={u.id} style={{ background: u.id === myId ? "rgba(139,92,246,0.08)" : undefined }}>
                  <td style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: trophyColor(i) }}>#{i+1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>{u.username?.[0] || "?"}</div>
                      <span style={{ fontWeight: 600, color: u.id === myId ? "var(--cyan)" : "var(--text)" }}>{u.username}{u.id === myId && " (You)"}</span>
                    </div>
                  </td>
                  <td><RankBadge rankName={u.rank_name} /></td>
                  <td style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>
                    {tab === "ap" ? u.ap_points?.toLocaleString() : tab === "streak" ? `${u.streak} days` : `${u.routines_created} routines`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ profile }) {
  const ap = profile?.ap_points || 0;
  const rank = getRankInfo(ap);
  const progress = getRankProgress(ap);
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1];
  const prs = profile?.prs || {};
  const badges = profile?.badges || [];
  const joinDate = profile?.join_date ? new Date(profile.join_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";

  return (
    <div>
      <div className="card mb-20" style={{ background: "linear-gradient(135deg, rgba(170,0,255,0.15), rgba(59,130,246,0.1))", border: "1px solid rgba(170,0,255,0.3)", padding: "32px 24px" }}>
        <div className="flex gap-20 items-center">
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${rank.color}, #3b82f6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "white", flexShrink: 0, boxShadow: `0 0 30px ${rank.glow}` }}>
            {profile?.username?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900 }}>{profile?.username}</h2>
            <div className="flex gap-8 items-center mt-4">
              <RankBadge rankName={rank.name} />
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Joined {joinDate}</span>
            </div>
            <div className="mt-12">
              <div className="flex justify-between mb-4">
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{rank.name} — {ap.toLocaleString()} AP</span>
                {nextRank && <span style={{ fontSize: 12, color: "var(--text3)" }}>→ {nextRank.name}</span>}
              </div>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}88)`, boxShadow: `0 0 10px ${rank.glow}` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-20">
        {[
          { label: "Workouts", value: profile?.total_workouts || 0, icon: "dumbbell", color: "var(--purple)" },
          { label: "AP Earned", value: ap.toLocaleString(), icon: "bolt", color: "var(--gold)" },
          { label: "Streak", value: `${profile?.streak || 0}d`, icon: "fire", color: "#ff8c00" },
          { label: "Routines", value: profile?.routines_created || 0, icon: "book", color: "var(--cyan)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <span style={{ color: s.color }}><Icon name={s.icon} size={24} /></span>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: s.color, margin: "8px 0 4px" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-title">PERSONAL RECORDS</div>
          {Object.keys(prs).length === 0 && <div style={{ color: "var(--text3)", fontSize: 13 }}>No PRs yet.</div>}
          {Object.entries(prs).map(([ex, pr]) => (
            <div key={ex} className="stat-row">
              <span style={{ fontSize: 13 }}>{ex}</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{pr}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">RANK JOURNEY</div>
          {RANKS.map((r) => {
            const achieved = ap >= r.min;
            return (
              <div key={r.name} className="flex items-center gap-12 mb-8">
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: achieved ? `${r.glow}` : "rgba(255,255,255,0.05)", border: `2px solid ${achieved ? r.color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {achieved && <Icon name="check" size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: achieved ? r.color : "var(--text3)", fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{r.min.toLocaleString()}+ AP</div>
                </div>
                {r.name === rank.name && <span style={{ fontSize: 10, color: "var(--cyan)", fontFamily: "'Orbitron', sans-serif" }}>CURRENT</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">ACHIEVEMENT BADGES</div>
        <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <div key={i} style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏅</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--gold)", letterSpacing: 1 }}>{b}</div>
            </div>
          ))}
          {["100 Workouts", "Diamond Rank", "1000 Day Streak"].map((b, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", textAlign: "center", opacity: 0.4 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--text3)", letterSpacing: 1 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const PAGES = [
  { id: "dashboard",   label: "Dashboard",        icon: "home"    },
  { id: "workout",     label: "Workout Tracker",   icon: "dumbbell"},
  { id: "exercises",   label: "Exercise Library",  icon: "book"    },
  { id: "routines",    label: "Routine Builder",   icon: "edit"    },
  { id: "community",   label: "Community",         icon: "users"   },
  { id: "leaderboard", label: "Leaderboards",      icon: "trophy"  },
  { id: "profile",     label: "My Profile",        icon: "user"    },
];

export default function App() {
  const { session, profile, loading, authError, signIn, signUp, signOut, refreshProfile } = useAuth();
  const [authScreen, setAuthScreen] = useState("landing"); // landing | login | register
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [workoutPhase, setWorkoutPhase] = useState("select");
  const [fabHover, setFabHover] = useState(false);
  const [exercises, setExercises] = useState([]);

  // Fetch exercises once on mount (public table, no auth needed)
  useEffect(() => {
    supabase
      .from('exercises')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setExercises(data.map(normalizeExercise));
      });
  }, []);

  const { workouts, refetch: refetchWorkouts } = useWorkouts(session?.user?.id);

  const pageTitles = { dashboard: "DASHBOARD", workout: "WORKOUT TRACKER", exercises: "EXERCISE LIBRARY", routines: "ROUTINE BUILDER", community: "COMMUNITY", leaderboard: "LEADERBOARDS", profile: "MY PROFILE" };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", color: "#ffd700", fontSize: 14, letterSpacing: 4 }}>LOADING...</div>
    </div>
  );

  if (!session) {
    if (authScreen === "landing") return <LandingPage onNavigate={setAuthScreen} />;
    return (
      <>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <AuthPage
          mode={authScreen}
          onSignIn={signIn}
          onSignUp={signUp}
          onNavigate={setAuthScreen}
          authError={authError}
          onSignUpSuccess={() => setToast("Confirmation link sent — check your email to activate your account.")}
        />
      </>
    );
  }

  const ap = profile?.ap_points || 0;
  const rank = getRankInfo(ap);

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <ApolloLogo size={36} />
          <span className="sidebar-brand">APOLLO</span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section">MAIN</span>
          {PAGES.slice(0, 3).map(p => (
            <div key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`} onClick={() => { setPage(p.id); setSidebarOpen(false); }}>
              <Icon name={p.icon} size={16} /> {p.label}
            </div>
          ))}
          <span className="nav-section" style={{ marginTop: 8 }}>COMMUNITY</span>
          {PAGES.slice(3, 6).map(p => (
            <div key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`} onClick={() => { setPage(p.id); setSidebarOpen(false); }}>
              <Icon name={p.icon} size={16} /> {p.label}
            </div>
          ))}
          <span className="nav-section" style={{ marginTop: 8 }}>ACCOUNT</span>
          <div className={`nav-item ${page === "profile" ? "active" : ""}`} onClick={() => { setPage("profile"); setSidebarOpen(false); }}>
            <Icon name="user" size={16} /> My Profile
          </div>
          <div className="nav-item" onClick={signOut}>
            <Icon name="logout" size={16} /> Sign Out
          </div>
        </nav>
        <div className="sidebar-user">
          <div className="user-mini">
            <div className="user-avatar">{profile?.username?.[0]}</div>
            <div className="user-mini-info">
              <div className="user-mini-name">{profile?.username}</div>
              <div className="user-mini-rank">{rank.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="flex items-center gap-12">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <Icon name="settings" size={18} />
            </button>
            <span className="page-title">{pageTitles[page]}</span>
          </div>
          <div className="topbar-right">
            <div className="ap-badge">
              <Icon name="bolt" size={14} />
              {ap.toLocaleString()} AP
            </div>
            <div className="flex items-center gap-6">
              <span className="streak-fire"><Icon name="fire" size={18} /></span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "#ff8c00" }}>{profile?.streak || 0}</span>
            </div>
          </div>
        </div>

        <div className="content">
          {page === "dashboard"   && <Dashboard profile={profile} workouts={workouts} />}
          <div style={{ display: page === "workout" ? "block" : "none" }}>
            <WorkoutTracker exercises={exercises} userId={session.user.id} onWorkoutSaved={() => { refetchWorkouts(); refreshProfile(); }} onPhaseChange={setWorkoutPhase} />
          </div>
          {page === "exercises"   && <ExerciseLibrary exercises={exercises} />}
          {page === "routines"    && <RoutineBuilder exercises={exercises} userId={session.user.id} />}
          {page === "community"   && <CommunityRoutines userId={session.user.id} exercises={exercises} />}
          {page === "leaderboard" && <Leaderboards session={session} />}
          {page === "profile"     && <ProfilePage profile={profile} />}
        </div>
      </div>

      {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}

      {page !== "workout" && (
        <button
          onMouseEnter={() => setFabHover(true)}
          onMouseLeave={() => setFabHover(false)}
          onClick={() => setPage("workout")}
          style={{
            position: "fixed", bottom: 32, right: 32, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: fabHover ? 10 : 0,
            background: "var(--gold)", color: "#0b0b0f", border: "none",
            borderRadius: 28, height: 52,
            width: fabHover ? "auto" : 52,
            padding: fabHover ? "0 20px 0 14px" : 0,
            cursor: "pointer", overflow: "hidden",
            transition: "width 0.2s ease, padding 0.2s ease",
            boxShadow: "0 4px 24px rgba(255,215,0,0.35)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ flexShrink: 0 }}>
            <rect x="4" y="19" width="5" height="10" rx="1.5"/>
            <rect x="9" y="13" width="7" height="22" rx="2"/>
            <rect x="16" y="21" width="16" height="6" rx="1"/>
            <rect x="32" y="13" width="7" height="22" rx="2"/>
            <rect x="39" y="19" width="5" height="10" rx="1.5"/>
          </svg>
          {fabHover && (
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>
              {workoutPhase === "active" ? "CONTINUE WORKOUT" : "START WORKOUT"}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
