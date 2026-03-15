# CLAUDE.md — Apollo Fitness

Development guide for Claude Code working on the Apollo Fitness platform.

---

## Project Overview

Apollo Fitness is a React workout-tracking app with an Olympian/ascension theme. Users earn **Apollo Points (AP)** by logging workouts and climb a ranked ladder: Bronze → Silver → Gold → Platinum → Diamond → Monster → Olympian.

**Stack:** React 18 · Vite 5 · Supabase (auth + database)

---

## Getting Started

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Project Structure

```
src/
├── App.jsx                  # Main app — all views and UI logic
├── main.jsx                 # Entry point
├── styles/apollo.css        # Global styles (Apollo theme)
├── lib/
│   └── supabase.js          # Supabase client (singleton)
├── hooks/
│   ├── useAuth.js           # Auth state (session, user)
│   ├── useWorkouts.js       # Workout CRUD + history
│   ├── useRoutines.js       # User's saved routines
│   ├── useCommunityRoutines.js  # Public/community routines
│   └── useLeaderboard.js    # AP-based leaderboard
└── services/
    ├── apService.js         # AP computation + Supabase RPC calls
    └── streakService.js     # Workout streak logic
```

---

## Architecture Rules

- **Single Supabase client** — always import from `src/lib/supabase.js`. Never create a new client.
- **Hooks for data** — use existing hooks (`useAuth`, `useWorkouts`, etc.) for data access. Do not fetch directly inside components when a hook exists.
- **RLS is enforced** — Supabase Row Level Security is active. Never bypass auth checks or write queries that assume elevated privileges.
- **No N+1 queries** — batch or join data at the Supabase level; avoid looping API calls.
- **AP logic lives in `apService.js`** — `computeAP`, `computeVolume`, `awardWorkoutAP`. Keep AP computation centralized there.
- **Ranks are display-only** — the `RANKS` array in `App.jsx` is a UI constant, not stored in the DB.

---

## Code Conventions

- Follow patterns already present in `App.jsx` — component structure, hook usage, icon rendering.
- Styles go in `apollo.css`. Keep the Olympian/dark aesthetic (deep backgrounds, glowing accents).
- Use plain SVG path icons via the existing `Icon` component before reaching for an icon library.
- Prefer editing existing files over creating new ones.
- No unnecessary abstractions — if it's used once, keep it inline.

---

## AI Behavioral Constraints

These apply when adding AI features to the app (e.g., workout suggestions, progress interpretation):

### Must Do
- Clearly label AI-generated content so users know it is AI output.
- Personalize using available context (workout history, goals, current rank).
- Encourage consistency and sustainability — celebrate streaks and PRs without guaranteeing outcomes.
- Use Apollo's voice where fitting: "Champion," "arena," "ascend" — but stay genuine, not hype-y.
- Acknowledge uncertainty plainly ("I'm not sure" is fine).

### Must Not Do
- Provide medical advice, diagnoses, or nutritional prescriptions — always direct to a professional.
- Body-shame or frame progress purely in terms of weight or appearance.
- Guarantee specific outcomes ("you will lose X lbs").
- Access or infer user data beyond what is explicitly consented to within the app.
- Promote extreme, unsafe, or unsustainable training practices.
- Make account-level changes (data, purchases) without explicit user confirmation.

---

## Security

- Never expose `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` in code, logs, or output.
- Never bypass authentication or authorization logic.
- Validate at system boundaries (user input, external API responses) — trust internal framework guarantees elsewhere.
- Avoid command injection, XSS, and other OWASP top-10 vulnerabilities.

---

## Tone (In-App AI)

| Do | Don't |
|----|-------|
| Encouraging, direct, plain language | Fake hype, excessive superlatives |
| Supportive, respectful | Condescending, pushy, guilt-tripping |
| Consistent with Apollo's Olympian theme | Jargon the user hasn't demonstrated familiarity with |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-03-14 | Initial CLAUDE.md |
