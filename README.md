# Apollo Fitness

A React fitness app built with Vite and Supabase.

## Prerequisites

- **Node.js** 18+ (recommend LTS)
- **npm** 9+ (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd APOLLOV2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root with your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

| Variable               | Description                    |
| ---------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`    | Your Supabase project URL      |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

Get these from your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Start dev server with hot reload |
| `npm run build`| Production build to `dist/`    |
| `npm run preview` | Preview the production build locally |

---

## Project Structure

```
APOLLOV2/
├── src/
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── lib/
│   │   └── supabase.js   # Supabase client
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   └── ...
├── supabase/             # Supabase config & migrations
├── .env.example          # Example env vars (copy to .env)
└── package.json
```

---

## Tech Stack

- **React 18** – UI
- **Vite 5** – Build tooling
- **Supabase** – Backend (auth, database)

---

## Troubleshooting

- **"Missing Supabase env vars"** – Ensure `.env` exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Port 5173 in use** – Vite will suggest another port, or set `--port` in the dev script.
