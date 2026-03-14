import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const EXERCISES = [
  { id: 1, name: "Bench Press", muscle: "Chest", difficulty: "Intermediate", video: "https://www.youtube.com/embed/SCVCLChPQFY", instructions: "Lie flat on a bench, grip the bar slightly wider than shoulder-width. Lower the bar to your chest with control, then drive it up explosively. Keep your feet flat on the floor and maintain a slight arch in your lower back.", muscles: ["Chest", "Triceps", "Front Delts"] },
  { id: 2, name: "Back Squat", muscle: "Legs", difficulty: "Intermediate", video: "https://www.youtube.com/embed/ultWZbUMPL8", instructions: "Position the bar on your upper traps. Feet shoulder-width apart, toes slightly out. Break at the hips and knees simultaneously, descend until thighs are parallel. Drive through the heels to stand.", muscles: ["Quads", "Glutes", "Hamstrings", "Core"] },
  { id: 3, name: "Deadlift", muscle: "Back", difficulty: "Advanced", video: "https://www.youtube.com/embed/op9kVnSso6Q", instructions: "Stand with bar over mid-foot. Hinge at hips, grip just outside legs. Drive your chest up and pull the slack out of the bar. Push the floor away as you stand, keeping the bar dragging up your shins.", muscles: ["Hamstrings", "Glutes", "Back", "Traps"] },
  { id: 4, name: "Pull-Up", muscle: "Back", difficulty: "Intermediate", video: "https://www.youtube.com/embed/eGo4IYlbE5g", instructions: "Hang from a bar with hands slightly wider than shoulder-width. Engage your lats and pull your chest to the bar. Lower with control. Avoid swinging or using momentum.", muscles: ["Lats", "Biceps", "Rear Delts"] },
  { id: 5, name: "Overhead Press", muscle: "Shoulders", difficulty: "Intermediate", video: "https://www.youtube.com/embed/2yjwXTZQDDI", instructions: "Stand with feet shoulder-width apart. Hold the bar at shoulder level with a grip just outside shoulder-width. Press the bar overhead until arms are fully extended, moving your head back slightly to allow the bar to pass.", muscles: ["Deltoids", "Triceps", "Upper Chest"] },
  { id: 6, name: "Barbell Row", muscle: "Back", difficulty: "Intermediate", video: "https://www.youtube.com/embed/FWJR5Ve8bnQ", instructions: "Hinge forward at hips, spine neutral. Grip the bar and row it to your lower chest/upper abdomen. Keep elbows close to your body. Lower with control.", muscles: ["Lats", "Rhomboids", "Biceps"] },
  { id: 7, name: "Incline Dumbbell Press", muscle: "Chest", difficulty: "Beginner", video: "https://www.youtube.com/embed/DbFgADa2PL8", instructions: "Set bench to 30–45 degrees. Press dumbbells from chest level up and slightly inward. Control the descent to full stretch. Great for upper chest development.", muscles: ["Upper Chest", "Front Delts", "Triceps"] },
  { id: 8, name: "Romanian Deadlift", muscle: "Legs", difficulty: "Intermediate", video: "https://www.youtube.com/embed/JCXUYuzwNrM", instructions: "Hold bar at hip level. Hinge at hips, pushing them back while keeping legs nearly straight. Feel the hamstring stretch, then drive hips forward to return.", muscles: ["Hamstrings", "Glutes", "Lower Back"] },
  { id: 9, name: "Dips", muscle: "Chest", difficulty: "Beginner", video: "https://www.youtube.com/embed/2z8JmcrW-As", instructions: "Support yourself on parallel bars. Lower your body until upper arms are parallel to the floor. Press back up. Lean forward to emphasize chest; stay upright for triceps.", muscles: ["Chest", "Triceps", "Front Delts"] },
  { id: 10, name: "Face Pull", muscle: "Shoulders", difficulty: "Beginner", video: "https://www.youtube.com/embed/rep-qVOkqgk", instructions: "Set cable at head height. Pull the rope to your face, flaring elbows out. Focus on external rotation of the shoulder. Essential for shoulder health.", muscles: ["Rear Delts", "Rotator Cuff", "Traps"] },
];

const RANKS = [
  { name: "Bronze", min: 0, max: 999, color: "#cd7f32", glow: "#cd7f3260" },
  { name: "Silver", min: 1000, max: 2999, color: "#c0c0c0", glow: "#c0c0c060" },
  { name: "Gold", min: 3000, max: 5999, color: "#ffd700", glow: "#ffd70060" },
  { name: "Platinum", min: 6000, max: 9999, color: "#00e5ff", glow: "#00e5ff60" },
  { name: "Diamond", min: 10000, max: 14999, color: "#b9f2ff", glow: "#b9f2ff60" },
  { name: "Monster", min: 15000, max: 24999, color: "#ff4081", glow: "#ff408160" },
  { name: "Olympian", min: 25000, max: Infinity, color: "#aa00ff", glow: "#aa00ff60" },
];

const COMMUNITY_ROUTINES = [
  { id: 1, name: "Apollo's 5x5 Strength", creator: "ZeusLifts", description: "Classic strength program. Five compound lifts, five sets of five reps. Build a legendary foundation.", rating: 4.9, downloads: 12847, exercises: ["Back Squat", "Bench Press", "Barbell Row", "Overhead Press", "Deadlift"], category: "Strength", difficulty: "Intermediate" },
  { id: 2, name: "Olympian PPL", creator: "AthenaFit", description: "Push Pull Legs 6-day split for elite hypertrophy. Sculpt a physique worthy of Olympus.", rating: 4.8, downloads: 9234, exercises: ["Bench Press", "Incline Dumbbell Press", "Overhead Press", "Pull-Up", "Barbell Row"], category: "Hypertrophy", difficulty: "Advanced" },
  { id: 3, name: "Spartan 3-Day Full Body", creator: "LeonaFit", description: "Three days a week, full body compound movements. Perfect for warriors with a busy schedule.", rating: 4.7, downloads: 7621, exercises: ["Back Squat", "Deadlift", "Pull-Up", "Bench Press"], category: "Strength", difficulty: "Beginner" },
  { id: 4, name: "Heracles Power", creator: "TitanStrength", description: "Powerlifting-focused program built around the three big lifts. Maximize your total.", rating: 4.6, downloads: 5489, exercises: ["Back Squat", "Bench Press", "Deadlift"], category: "Powerlifting", difficulty: "Advanced" },
  { id: 5, name: "Ares Shred Protocol", creator: "ArtemisAbs", description: "High volume, low rest. Designed to torch fat while maintaining hard-earned muscle.", rating: 4.5, downloads: 4102, exercises: ["Back Squat", "Pull-Up", "Dips", "Romanian Deadlift", "Face Pull"], category: "Fat Loss", difficulty: "Intermediate" },
  { id: 6, name: "Poseidon Upper/Lower", creator: "WaveRider", description: "4-day upper/lower split. Balanced volume for steady progress in strength and size.", rating: 4.4, downloads: 3267, exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Back Squat", "Romanian Deadlift"], category: "Hypertrophy", difficulty: "Intermediate" },
];

const LEADERBOARD_DATA = [
  { rank: 1, username: "ZeusLifts", ap: 42840, streak: 187, routines: 12, userRank: "Olympian" },
  { rank: 2, username: "AthenaFit", ap: 38210, streak: 143, routines: 8, userRank: "Olympian" },
  { rank: 3, username: "TitanStrength", ap: 31560, streak: 201, routines: 5, userRank: "Olympian" },
  { rank: 4, username: "LeonaFit", ap: 28900, streak: 99, routines: 15, userRank: "Monster" },
  { rank: 5, username: "Catatau", ap: 7840, streak: 22, routines: 3, userRank: "Platinum" },
  { rank: 6, username: "ArtemisAbs", ap: 6200, streak: 45, routines: 7, userRank: "Platinum" },
  { rank: 7, username: "WaveRider", ap: 4980, streak: 31, routines: 4, userRank: "Gold" },
  { rank: 8, username: "HeliosBurn", ap: 3400, streak: 18, routines: 2, userRank: "Gold" },
];

const DEFAULT_USER = {
  username: "Catatau",
  email: "catatau@apollo.fit",
  ap: 7840,
  streak: 22,
  weeklyStreak: 8,
  totalWorkouts: 64,
  routinesCreated: 3,
  joinDate: "Feb 2026",
  prs: { "Bench Press": "100kg × 5", "Back Squat": "140kg × 3", "Deadlift": "180kg × 1", "Pull-Up": "BW+20kg × 8" },
  badges: ["7 Day Streak", "30 Workouts", "First PR", "Community Creator"],
};

const WORKOUT_HISTORY = [
  { id: 1, date: "Mar 12", name: "Push Day", duration: 58, exercises: 5, volume: 8420 },
  { id: 2, date: "Mar 10", name: "Pull Day", duration: 52, exercises: 4, volume: 7180 },
  { id: 3, date: "Mar 8", name: "Leg Day", duration: 65, exercises: 5, volume: 14200 },
  { id: 4, date: "Mar 6", name: "Push Day", duration: 55, exercises: 5, volume: 8100 },
  { id: 5, date: "Mar 4", name: "Pull Day", duration: 49, exercises: 4, volume: 6800 },
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
  <svg width={size} height={size} viewBox="0 0 80 80">
    <defs>
      <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="60%" stopColor="#ff8c00" />
        <stop offset="100%" stopColor="#aa00ff" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Rays */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
      <line key={i} x1="40" y1="40"
        x2={40 + Math.cos((angle * Math.PI) / 180) * 38}
        y2={40 + Math.sin((angle * Math.PI) / 180) * 38}
        stroke={i % 2 === 0 ? "#ffd700" : "#aa00ff"} strokeWidth={i % 2 === 0 ? "1.5" : "0.8"} strokeLinecap="round" opacity="0.7" filter="url(#glow)"
      />
    ))}
    {/* Outer ring */}
    <circle cx="40" cy="40" r="24" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.4" />
    <circle cx="40" cy="40" r="18" fill="none" stroke="#aa00ff" strokeWidth="0.8" opacity="0.6" />
    {/* Core sun */}
    <circle cx="40" cy="40" r="12" fill="url(#sunGrad)" filter="url(#glow)" />
    {/* A letter */}
    <text x="40" y="45" textAnchor="middle" fill="#0b0b0f" fontSize="13" fontWeight="900" fontFamily="serif">A</text>
  </svg>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;700;900&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0b0f;
    --bg2: #111118;
    --bg3: #16161f;
    --card: #13131a;
    --card2: #1a1a24;
    --border: rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.1);
    --purple: #8b5cf6;
    --purple2: #6d28d9;
    --blue: #3b82f6;
    --cyan: #00e5ff;
    --gold: #ffd700;
    --orange: #ff8c00;
    --pink: #ff4081;
    --green: #00e676;
    --text: #e8e8f0;
    --text2: #9898b0;
    --text3: #5a5a70;
    --glow-purple: 0 0 20px rgba(139,92,246,0.4);
    --glow-gold: 0 0 20px rgba(255,215,0,0.4);
    --glow-cyan: 0 0 20px rgba(0,229,255,0.4);
  }

  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

  .app { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
    transition: transform 0.3s ease;
  }
  .sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
  .sidebar-brand { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; background: linear-gradient(135deg, #ffd700, #aa00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 3px; }
  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: var(--text2); font-size: 14px; font-family: 'Rajdhani', sans-serif; font-weight: 500; letter-spacing: 0.5px; border: 1px solid transparent; }
  .nav-item:hover { color: var(--text); background: var(--bg3); }
  .nav-item.active { color: var(--gold); background: rgba(255,215,0,0.08); border-color: rgba(255,215,0,0.2); }
  .nav-item.active svg { filter: drop-shadow(0 0 6px rgba(255,215,0,0.6)); }
  .nav-section { font-size: 10px; color: var(--text3); letter-spacing: 2px; padding: 8px 12px 4px; font-family: 'Orbitron', sans-serif; text-transform: uppercase; }
  .sidebar-user { padding: 16px; border-top: 1px solid var(--border); }
  .user-mini { display: flex; align-items: center; gap: 10px; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #aa00ff, #3b82f6); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; flex-shrink: 0; }
  .user-mini-info { flex: 1; min-width: 0; }
  .user-mini-name { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'Rajdhani', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-mini-rank { font-size: 11px; color: var(--cyan); font-family: 'Orbitron', sans-serif; }

  /* MAIN CONTENT */
  .main { flex: 1; margin-left: 240px; min-height: 100vh; display: flex; flex-direction: column; }
  .topbar { padding: 16px 28px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 90; }
  .page-title { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); letter-spacing: 2px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .ap-badge { display: flex; align-items: center; gap: 6px; background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); border-radius: 20px; padding: 5px 12px; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; color: var(--gold); }
  .content { flex: 1; padding: 28px; overflow-y: auto; }

  /* CARDS */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,215,0,0.03) 0%, transparent 60%); pointer-events: none; }
  .card-glow { box-shadow: 0 0 30px rgba(139,92,246,0.08); }
  .card-title { font-family: 'Orbitron', sans-serif; font-size: 12px; letter-spacing: 2px; color: var(--text2); text-transform: uppercase; margin-bottom: 12px; }
  .card-value { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; color: var(--text); }
  .card-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }

  /* GRID */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'Rajdhani', sans-serif; letter-spacing: 0.5px; transition: all 0.2s; border: none; }
  .btn-primary { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; }
  .btn-primary:hover { filter: brightness(1.15); box-shadow: var(--glow-purple); transform: translateY(-1px); }
  .btn-gold { background: linear-gradient(135deg, #ffd700, #ff8c00); color: #0b0b0f; font-weight: 700; }
  .btn-gold:hover { filter: brightness(1.1); box-shadow: var(--glow-gold); transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
  .btn-outline:hover { border-color: var(--purple); color: var(--text); background: rgba(139,92,246,0.1); }
  .btn-ghost { background: transparent; color: var(--text2); padding: 8px; }
  .btn-ghost:hover { color: var(--text); background: var(--bg3); }
  .btn-danger { background: rgba(255,64,129,0.1); border: 1px solid rgba(255,64,129,0.3); color: var(--pink); }
  .btn-danger:hover { background: rgba(255,64,129,0.2); }
  .btn-sm { padding: 6px 14px; font-size: 12px; }
  .btn-lg { padding: 14px 28px; font-size: 15px; }

  /* RANK BADGE */
  .rank-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 20px; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1px; }

  /* PROGRESS BAR */
  .progress-wrap { background: rgba(255,255,255,0.05); border-radius: 99px; height: 6px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }

  /* STREAK */
  .streak-fire { color: #ff8c00; filter: drop-shadow(0 0 6px rgba(255,140,0,0.6)); }

  /* TABLES */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { font-family: 'Orbitron', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: var(--text3); text-transform: uppercase; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
  td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 14px; color: var(--text2); }
  tr:hover td { background: rgba(255,255,255,0.02); color: var(--text); }
  tr:last-child td { border-bottom: none; }

  /* FORM */
  .form-group { margin-bottom: 16px; }
  label { display: block; font-size: 12px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; }
  input, select, textarea { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
  input:focus, select:focus, textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
  select option { background: var(--bg3); }
  textarea { resize: vertical; min-height: 80px; }

  /* BADGE */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-gold { background: rgba(255,215,0,0.15); color: var(--gold); border: 1px solid rgba(255,215,0,0.2); }
  .badge-purple { background: rgba(139,92,246,0.15); color: var(--purple); border: 1px solid rgba(139,92,246,0.2); }
  .badge-cyan { background: rgba(0,229,255,0.1); color: var(--cyan); border: 1px solid rgba(0,229,255,0.2); }
  .badge-green { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }

  /* EXERCISE CARD */
  .exercise-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
  .exercise-card:hover { border-color: rgba(139,92,246,0.4); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  .exercise-card-img { height: 120px; background: linear-gradient(135deg, var(--bg3), var(--card2)); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .exercise-card-body { padding: 14px; }

  /* ROUTINE CARD */
  .routine-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s; }
  .routine-card:hover { border-color: rgba(255,215,0,0.3); transform: translateY(-2px); }

  /* STARS */
  .stars { display: flex; gap: 2px; }
  .star-filled { color: var(--gold); }
  .star-empty { color: var(--text3); }

  /* STAT ROW */
  .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .stat-row:last-child { border-bottom: none; }

  /* GLOW TEXT */
  .glow-text { text-shadow: 0 0 20px currentColor; }
  .text-gold { color: var(--gold); }
  .text-purple { color: var(--purple); }
  .text-cyan { color: var(--cyan); }
  .text-pink { color: var(--pink); }
  .text-green { color: var(--green); }

  /* DIVIDER */
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .gap-16 { gap: 16px; }
  .gap-20 { gap: 20px; }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .mt-20 { margin-top: 20px; }
  .mb-4 { margin-bottom: 4px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-12 { margin-bottom: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .mb-20 { margin-bottom: 20px; }
  .w-full { width: 100%; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .font-bold { font-weight: 700; }
  .font-orb { font-family: 'Orbitron', sans-serif; }
  .font-raj { font-family: 'Rajdhani', sans-serif; }
  .col-span-2 { grid-column: span 2; }

  /* MODALS */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--card2); border: 1px solid var(--border2); border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; animation: modalIn 0.3s ease; }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

  /* LANDING */
  .landing { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }
  .landing-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; position: relative; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(255,215,0,0.08) 0%, transparent 50%); }
  .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
  .hero-title { font-family: 'Orbitron', sans-serif; font-size: clamp(48px, 10vw, 96px); font-weight: 900; background: linear-gradient(135deg, #ffd700 0%, #ff8c00 40%, #aa00ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 8px; position: relative; z-index: 1; line-height: 1.1; }
  .hero-sub { font-family: 'Rajdhani', sans-serif; font-size: clamp(14px, 2.5vw, 20px); color: var(--text2); max-width: 500px; position: relative; z-index: 1; margin-top: 16px; letter-spacing: 2px; }
  .hero-cta { display: flex; gap: 16px; margin-top: 40px; position: relative; z-index: 1; flex-wrap: wrap; justify-content: center; }
  .hero-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 80px 40px; max-width: 1000px; margin: 0 auto; width: 100%; }
  .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
  .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }

  /* AUTH */
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg); position: relative; }
  .auth-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 60%); }
  .auth-card { background: var(--card); border: 1px solid var(--border2); border-radius: 16px; padding: 40px; width: 100%; max-width: 420px; position: relative; z-index: 1; }

  /* WORKOUT TRACKER */
  .exercise-item { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .set-row { display: grid; grid-template-columns: 32px 1fr 1fr 1fr 40px; gap: 8px; align-items: center; margin-top: 8px; }
  .set-num { font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--text3); text-align: center; }
  .set-input { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; color: var(--text); font-size: 13px; text-align: center; width: 100%; outline: none; }
  .set-input:focus { border-color: var(--purple); }
  .set-header { display: grid; grid-template-columns: 32px 1fr 1fr 1fr 40px; gap: 8px; font-size: 10px; color: var(--text3); font-family: 'Orbitron', sans-serif; letter-spacing: 1px; margin-top: 8px; padding: 0 2px; text-align: center; }

  /* CHART AREA */
  .mini-chart { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
  .chart-bar { flex: 1; background: linear-gradient(to top, var(--purple), var(--blue)); border-radius: 3px 3px 0 0; min-width: 4px; transition: height 0.5s ease; opacity: 0.8; }
  .chart-bar:hover { opacity: 1; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }

  /* MOBILE */
  .mobile-toggle { display: none; }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; }
    .mobile-toggle { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; color: var(--text); }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
    .content { padding: 16px; }
  }

  /* ANIMATIONS */
  @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  .pulse { animation: pulse-glow 2s infinite; }
  .float { animation: float 3s ease-in-out infinite; }
  .tab-bar { display: flex; gap: 4px; background: var(--bg3); padding: 4px; border-radius: 10px; margin-bottom: 20px; }
  .tab { flex: 1; text-align: center; padding: 8px; border-radius: 7px; cursor: pointer; font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600; color: var(--text2); transition: all 0.2s; }
  .tab.active { background: var(--card2); color: var(--text); }
  .modal-sm { max-width: 480px; }
`;

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
  const max = Math.max(...data);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="chart-bar" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(to top, ${color}, ${color}88)` }} />
      ))}
    </div>
  );
}

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

function AuthPage({ mode, onLogin, onNavigate }) {
  const [form, setForm] = useState({ username: "Catatau", email: "catatau@apollo.fit", password: "demo" });
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
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <button className="btn btn-gold w-full" style={{ justifyContent: "center", marginTop: 8 }} onClick={() => onLogin(form)}>
          {mode === "login" ? "ENTER THE ARENA" : "CREATE ACCOUNT"}
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

function Dashboard({ user }) {
  const rank = getRankInfo(user.ap);
  const progress = getRankProgress(user.ap);
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1];
  const volumeData = [62, 71, 58, 84, 75, 91, 78];

  return (
    <div>
      {/* Welcome */}
      <div className="card mb-20" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "var(--text3)", letterSpacing: 2, marginBottom: 6 }}>WELCOME BACK</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{user.username}</h2>
            <div className="flex items-center gap-8 mt-8">
              <RankBadge rankName={rank.name} />
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{user.ap.toLocaleString()} Apollo Points</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="flex items-center gap-8 mb-8">
              <span className="streak-fire"><Icon name="fire" size={20} /></span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#ff8c00" }}>{user.streak}</span>
              <span style={{ color: "var(--text2)", fontSize: 13 }}>day streak</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Weekly: {user.weeklyStreak} weeks</div>
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

      {/* Stats */}
      <div className="grid-4 mb-20">
        {[
          { label: "Total Workouts", value: user.totalWorkouts, icon: "dumbbell", color: "var(--purple)" },
          { label: "Apollo Points", value: user.ap.toLocaleString(), icon: "bolt", color: "var(--gold)" },
          { label: "Day Streak", value: user.streak, icon: "fire", color: "#ff8c00" },
          { label: "Routines Created", value: user.routinesCreated, icon: "book", color: "var(--cyan)" },
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
        {/* Volume Chart */}
        <div className="card">
          <div className="card-title">WEEKLY VOLUME (last 7 sessions)</div>
          <MiniChart data={volumeData} />
          <div className="flex justify-between mt-4">
            {["M","T","W","T","F","S","S"].map((d,i) => <span key={i} style={{ fontSize: 10, color: "var(--text3)", flex: 1, textAlign: "center" }}>{d}</span>)}
          </div>
        </div>

        {/* PRs */}
        <div className="card">
          <div className="card-title">PERSONAL RECORDS</div>
          {Object.entries(user.prs).map(([ex, pr]) => (
            <div key={ex} className="stat-row">
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{ex}</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{pr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workout History */}
      <div className="card mb-20">
        <div className="card-title">RECENT WORKOUTS</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Workout</th><th>Duration</th><th>Exercises</th><th>Volume</th></tr>
            </thead>
            <tbody>
              {WORKOUT_HISTORY.map(w => (
                <tr key={w.id}>
                  <td style={{ color: "var(--text3)" }}>{w.date}</td>
                  <td style={{ fontWeight: 600, color: "var(--text)" }}>{w.name}</td>
                  <td>{w.duration} min</td>
                  <td>{w.exercises} exercises</td>
                  <td style={{ color: "var(--cyan)", fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}>{w.volume.toLocaleString()} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <div className="card-title">ACHIEVEMENTS</div>
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          {user.badges.map((b, i) => (
            <span key={i} className="badge badge-gold">
              <Icon name="medal" size={12} /> {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkoutTracker() {
  const [phase, setPhase] = useState("select"); // select | active | done
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sets, setSets] = useState({});
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

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
  };

  const totalVolume = selectedExercises.reduce((acc, ex) => {
    const exSets = sets[ex.id] || [];
    return acc + exSets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0);
  }, 0);

  if (phase === "done") return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "var(--gold)", marginBottom: 12 }}>WORKOUT COMPLETE</h2>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>You earned <span style={{ color: "var(--gold)", fontWeight: 700 }}>+150 AP</span></p>
      <div className="grid-3" style={{ maxWidth: 500, margin: "0 auto 32px" }}>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{fmt(timer)}</div><div className="card-sub">Duration</div></div>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{selectedExercises.length}</div><div className="card-sub">Exercises</div></div>
        <div className="card" style={{ textAlign: "center" }}><div className="card-value">{Math.round(totalVolume)}</div><div className="card-sub">kg Volume</div></div>
      </div>
      <button className="btn btn-gold btn-lg" onClick={() => { setPhase("select"); setSelectedExercises([]); setSets({}); setTimer(0); setWorkoutName(""); }}>
        START ANOTHER
      </button>
    </div>
  );

  if (phase === "active") return (
    <div>
      {/* Active Header */}
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
              <button className="btn btn-sm btn-gold" onClick={() => { setRunning(false); setPhase("done"); }}>FINISH</button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Tracking */}
      {selectedExercises.map(ex => (
        <div key={ex.id} className="exercise-item">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{ex.name}</span>
              <span className="badge badge-purple" style={{ marginLeft: 8 }}>{ex.muscle}</span>
            </div>
            <button className="btn btn-ghost" onClick={() => removeExercise(ex.id)}><Icon name="x" size={16} /></button>
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
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => updateSet(ex.id, idx, "done", !set.done)}>
                <span style={{ color: set.done ? "var(--green)" : "var(--text3)" }}><Icon name="check" size={16} /></span>
              </button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm mt-8" onClick={() => addSet(ex.id)}><Icon name="plus" size={14} /> Add Set</button>
        </div>
      ))}

      {/* Add Exercise */}
      <div className="card mt-16">
        <div className="card-title">ADD EXERCISE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EXERCISES.filter(e => !selectedExercises.find(s => s.id === e.id)).map(ex => (
            <button key={ex.id} className="btn btn-outline btn-sm" onClick={() => addExercise(ex)}>
              <Icon name="plus" size={12} /> {ex.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Select phase
  return (
    <div>
      <div className="card mb-20">
        <div className="card-title">NEW WORKOUT SESSION</div>
        <div className="form-group">
          <label>Workout Name</label>
          <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="e.g. Push Day, Leg Day..." />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase" }}>Select Exercises</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXERCISES.map(ex => {
              const sel = !!selectedExercises.find(e => e.id === ex.id);
              return (
                <button key={ex.id} className={`btn btn-sm ${sel ? "btn-primary" : "btn-outline"}`} onClick={() => sel ? removeExercise(ex.id) : addExercise(ex)}>
                  {sel && <Icon name="check" size={12} />} {ex.name}
                </button>
              );
            })}
          </div>
        </div>
        {selectedExercises.length > 0 && (
          <div className="mt-12">
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>Selected: <strong style={{ color: "var(--text)" }}>{selectedExercises.map(e => e.name).join(", ")}</strong></div>
            <button className="btn btn-gold btn-lg" onClick={() => { setPhase("active"); setRunning(true); }}>
              <Icon name="play" size={18} /> START WORKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseLibrary() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const muscles = ["All", ...new Set(EXERCISES.map(e => e.muscle))];

  const filtered = filter === "All" ? EXERCISES : EXERCISES.filter(e => e.muscle === filter);

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
              {selected.muscles.map(m => <span key={m} className="badge badge-gold">{m}</span>)}
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

function RoutineBuilder({ user }) {
  const [routines, setRoutines] = useState([
    { id: 1, name: "My PPL Push", description: "Personal push day routine", exercises: [EXERCISES[0], EXERCISES[4], EXERCISES[6]], isPublic: false }
  ]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", exercises: [], isPublic: false });

  const startNew = () => {
    setForm({ name: "", description: "", exercises: [], isPublic: false });
    setEditing("new");
  };

  const toggleExercise = (ex) => {
    setForm(prev => {
      const has = prev.exercises.find(e => e.id === ex.id);
      return { ...prev, exercises: has ? prev.exercises.filter(e => e.id !== ex.id) : [...prev.exercises, ex] };
    });
  };

  const save = () => {
    if (!form.name) return;
    if (editing === "new") {
      setRoutines(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setRoutines(prev => prev.map(r => r.id === editing ? { ...form, id: editing } : r));
    }
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
            {EXERCISES.map(ex => {
              const sel = !!form.exercises.find(e => e.id === ex.id);
              return <button key={ex.id} className={`btn btn-sm ${sel ? "btn-primary" : "btn-outline"}`} onClick={() => toggleExercise(ex)}>{sel && "✓ "}{ex.name}</button>;
            })}
          </div>
        </div>
        <div className="flex items-center gap-8 mb-16">
          <input type="checkbox" id="pub" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} style={{ width: "auto" }} />
          <label htmlFor="pub" style={{ marginBottom: 0, cursor: "pointer", color: "var(--text2)", fontFamily: "Inter", textTransform: "none", fontSize: 14, letterSpacing: 0 }}>Publish to Community</label>
        </div>
        <button className="btn btn-gold" onClick={save}><Icon name="check" size={16} /> Save Routine</button>
      </div>
    </div>
  );

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
        {routines.map(r => (
          <div key={r.id} className="routine-card">
            <div className="flex justify-between items-center mb-8">
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18 }}>{r.name}</h3>
              {r.isPublic && <span className="badge badge-green"><Icon name="share" size={10} /> Public</span>}
            </div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{r.description}</p>
            <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 12 }}>
              {r.exercises.map(e => <span key={e.id} className="badge badge-purple">{e.name}</span>)}
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline btn-sm" onClick={() => { setForm(r); setEditing(r.id); }}><Icon name="edit" size={13} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => setRoutines(prev => prev.filter(x => x.id !== r.id))}><Icon name="trash" size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityRoutines() {
  const [bookmarked, setBookmarked] = useState(new Set());
  const [sort, setSort] = useState("popular");
  const [selected, setSelected] = useState(null);

  const sorted = [...COMMUNITY_ROUTINES].sort((a, b) =>
    sort === "popular" ? b.downloads - a.downloads :
    sort === "rated" ? b.rating - a.rating :
    b.id - a.id
  );

  if (selected) return (
    <div>
      <button className="btn btn-outline btn-sm mb-20" onClick={() => setSelected(null)}>← Back</button>
      <div className="card">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: "var(--text)", marginBottom: 8 }}>{selected.name}</h2>
            <div className="flex gap-8 items-center">
              <Stars rating={selected.rating} />
              <span style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700 }}>{selected.rating}</span>
              <span style={{ color: "var(--text3)", fontSize: 13 }}>by {selected.creator}</span>
            </div>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-outline btn-sm" onClick={() => setBookmarked(prev => { const n = new Set(prev); n.has(selected.id) ? n.delete(selected.id) : n.add(selected.id); return n; })}>
              <span style={{ color: bookmarked.has(selected.id) ? "var(--gold)" : undefined }}><Icon name="bookmark" size={14} /></span>
            </button>
            <button className="btn btn-gold btn-sm"><Icon name="download" size={14} /> Add to Plan</button>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 20 }}>{selected.description}</p>
        <div className="flex gap-8 mb-20">
          <span className="badge badge-purple">{selected.category}</span>
          <span className="badge badge-cyan">{selected.difficulty}</span>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>{selected.downloads.toLocaleString()} athletes training this</span>
        </div>
        <div className="card-title">EXERCISES</div>
        {selected.exercises.map((name, i) => {
          const ex = EXERCISES.find(e => e.name === name);
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
      <div className="grid-2">
        {sorted.map(r => (
          <div key={r.id} className="routine-card" onClick={() => setSelected(r)}>
            <div className="flex justify-between items-center mb-8">
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17 }}>{r.name}</h3>
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={e => { e.stopPropagation(); setBookmarked(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; }); }}>
                <span style={{ color: bookmarked.has(r.id) ? "var(--gold)" : "var(--text3)" }}><Icon name="bookmark" size={16} /></span>
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{r.description}</p>
            <div className="flex items-center gap-8 mb-12">
              <Stars rating={r.rating} />
              <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700 }}>{r.rating}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-8">
                <span className="badge badge-purple">{r.category}</span>
                <span className="badge badge-cyan">{r.difficulty}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text3)" }}><Icon name="download" size={12} style={{ verticalAlign: "middle" }} /> {r.downloads.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboards() {
  const [tab, setTab] = useState("ap");

  const sorted = tab === "ap" ? [...LEADERBOARD_DATA].sort((a,b) => b.ap - a.ap)
    : tab === "streak" ? [...LEADERBOARD_DATA].sort((a,b) => b.streak - a.streak)
    : [...LEADERBOARD_DATA].sort((a,b) => b.routines - a.routines);

  const trophyColor = (i) => i === 0 ? "var(--gold)" : i === 1 ? "var(--text2)" : i === 2 ? "#cd7f32" : "var(--text3)";

  return (
    <div>
      <div className="tab-bar">
        {[["ap","Apollo Points"],["streak","Longest Streak"],["routines","Most Routines"]].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Top 3 */}
      <div className="grid-3 mb-20">
        {sorted.slice(0,3).map((u, i) => {
          const rank = RANKS.find(r => r.name === u.userRank);
          return (
            <div key={u.rank} className="card" style={{ textAlign: "center", border: i === 0 ? "1px solid rgba(255,215,0,0.4)" : "1px solid var(--border)", transform: i === 0 ? "scale(1.04)" : "scale(1)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${rank?.color || "#8b5cf6"}, #3b82f6)`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "white" }}>
                {u.username[0]}
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{u.username}</div>
              <div style={{ marginTop: 4 }}><RankBadge rankName={u.userRank} /></div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: trophyColor(i), marginTop: 8 }}>
                {tab === "ap" ? u.ap.toLocaleString() : tab === "streak" ? `${u.streak}d` : u.routines}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
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
              {sorted.map((u, i) => (
                <tr key={u.rank} style={{ background: u.username === "Catatau" ? "rgba(139,92,246,0.08)" : undefined }}>
                  <td style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: trophyColor(i) }}>#{i+1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>{u.username[0]}</div>
                      <span style={{ fontWeight: 600, color: u.username === "Catatau" ? "var(--cyan)" : "var(--text)" }}>{u.username}{u.username === "Catatau" && " (You)"}</span>
                    </div>
                  </td>
                  <td><RankBadge rankName={u.userRank} /></td>
                  <td style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>
                    {tab === "ap" ? u.ap.toLocaleString() : tab === "streak" ? `${u.streak} days` : `${u.routines} routines`}
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

function ProfilePage({ user }) {
  const rank = getRankInfo(user.ap);
  const progress = getRankProgress(user.ap);
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1];

  return (
    <div>
      {/* Hero Banner */}
      <div className="card mb-20" style={{ background: "linear-gradient(135deg, rgba(170,0,255,0.15), rgba(59,130,246,0.1))", border: "1px solid rgba(170,0,255,0.3)", padding: "32px 24px" }}>
        <div className="flex gap-20 items-center">
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${rank.color}, #3b82f6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "white", flexShrink: 0, boxShadow: `0 0 30px ${rank.glow}` }}>
            {user.username[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900 }}>{user.username}</h2>
            <div className="flex gap-8 items-center mt-4">
              <RankBadge rankName={rank.name} />
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Joined {user.joinDate}</span>
            </div>
            <div className="mt-12">
              <div className="flex justify-between mb-4">
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{rank.name} — {user.ap.toLocaleString()} AP</span>
                {nextRank && <span style={{ fontSize: 12, color: "var(--text3)" }}>→ {nextRank.name}</span>}
              </div>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}88)`, boxShadow: `0 0 10px ${rank.glow}` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-20">
        {[
          { label: "Workouts", value: user.totalWorkouts, icon: "dumbbell", color: "var(--purple)" },
          { label: "AP Earned", value: user.ap.toLocaleString(), icon: "bolt", color: "var(--gold)" },
          { label: "Streak", value: `${user.streak}d`, icon: "fire", color: "#ff8c00" },
          { label: "Routines", value: user.routinesCreated, icon: "book", color: "var(--cyan)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <span style={{ color: s.color }}><Icon name={s.icon} size={24} /></span>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: s.color, margin: "8px 0 4px" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        {/* Personal Records */}
        <div className="card">
          <div className="card-title">PERSONAL RECORDS</div>
          {Object.entries(user.prs).map(([ex, pr]) => (
            <div key={ex} className="stat-row">
              <span style={{ fontSize: 13 }}>{ex}</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{pr}</span>
            </div>
          ))}
        </div>

        {/* Rank Journey */}
        <div className="card">
          <div className="card-title">RANK JOURNEY</div>
          {RANKS.map((r, i) => {
            const achieved = user.ap >= r.min;
            return (
              <div key={r.name} className="flex items-center gap-12 mb-8">
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: achieved ? `${r.glow}` : "rgba(255,255,255,0.05)", border: `2px solid ${achieved ? r.color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {achieved && <Icon name="check" size={14} color={r.color} />}
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

      {/* Badges */}
      <div className="card">
        <div className="card-title">ACHIEVEMENT BADGES</div>
        <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
          {user.badges.map((b, i) => (
            <div key={i} style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏅</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--gold)", letterSpacing: 1 }}>{b}</div>
            </div>
          ))}
          {/* Locked badges */}
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
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "workout", label: "Workout Tracker", icon: "dumbbell" },
  { id: "exercises", label: "Exercise Library", icon: "book" },
  { id: "routines", label: "Routine Builder", icon: "edit" },
  { id: "community", label: "Community", icon: "users" },
  { id: "leaderboard", label: "Leaderboards", icon: "trophy" },
  { id: "profile", label: "My Profile", icon: "user" },
];

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | login | register | app
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(DEFAULT_USER);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (form) => {
    setUser({ ...DEFAULT_USER, username: form.username || DEFAULT_USER.username });
    setScreen("app");
  };

  const pageTitles = { dashboard: "DASHBOARD", workout: "WORKOUT TRACKER", exercises: "EXERCISE LIBRARY", routines: "ROUTINE BUILDER", community: "COMMUNITY", leaderboard: "LEADERBOARDS", profile: "MY PROFILE" };

  if (screen === "landing") return (
    <>
      <style>{styles}</style>
      <LandingPage onNavigate={setScreen} />
    </>
  );

  if (screen === "login" || screen === "register") return (
    <>
      <style>{styles}</style>
      <AuthPage mode={screen} onLogin={handleLogin} onNavigate={setScreen} />
    </>
  );

  const rank = getRankInfo(user.ap);

  return (
    <>
      <style>{styles}</style>
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
            <div className="nav-item" onClick={() => setScreen("landing")}>
              <Icon name="logout" size={16} /> Sign Out
            </div>
          </nav>
          <div className="sidebar-user">
            <div className="user-mini">
              <div className="user-avatar">{user.username[0]}</div>
              <div className="user-mini-info">
                <div className="user-mini-name">{user.username}</div>
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
                {user.ap.toLocaleString()} AP
              </div>
              <div className="flex items-center gap-6">
                <span className="streak-fire"><Icon name="fire" size={18} /></span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "#ff8c00" }}>{user.streak}</span>
              </div>
            </div>
          </div>

          <div className="content">
            {page === "dashboard" && <Dashboard user={user} />}
            {page === "workout" && <WorkoutTracker />}
            {page === "exercises" && <ExerciseLibrary />}
            {page === "routines" && <RoutineBuilder user={user} />}
            {page === "community" && <CommunityRoutines />}
            {page === "leaderboard" && <Leaderboards />}
            {page === "profile" && <ProfilePage user={user} />}
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
      </div>
    </>
  );
}
