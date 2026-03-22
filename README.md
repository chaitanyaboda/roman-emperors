# Roman Emperors Timeline

A full-stack web app visualizing the Roman Emperors from Augustus to the fall of the Western Roman Empire. Features a Gantt-style reign chart, a vertical timeline with dynasty color coding, and detailed modal views with Wikipedia portraits and summaries.

## Tech Stack

- **Backend**: Node.js + Express, SQLite via `better-sqlite3`
- **Frontend**: React + Vite
- **Data**: Scraped from Wikipedia (List of Roman Emperors + individual emperor pages)

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

The defaults work out of the box for local development:
- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`

### 3. Seed the database

This scrapes Wikipedia and populates the SQLite database (takes ~2–3 minutes due to rate limiting):

```bash
cd backend
npm run seed
```

### 4. Start the servers

In two separate terminals:

```bash
# Terminal 1 — Backend
cd backend
npm start
# or for auto-reload: npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
roman-emperors/
  backend/
    src/
      db/
        index.js        # DB factory — reads DB_TYPE env var, delegates to implementation
        sqlite.js       # SQLite implementation using better-sqlite3
      services/
        emperors.js     # Business logic: getAllEmperors, getEmperorById, upsertEmperor
      routes/
        emperors.js     # Express routes: GET /api/emperors, GET /api/emperors/:id
      seed/
        scraper.js      # Wikipedia scraper (axios + cheerio)
        seed.js         # Run scraper → upsert into DB
      app.js            # Express app factory (no listen, for testability)
      server.js         # Entry point: app.listen
    data/               # SQLite database file (created on first seed)
  frontend/
    src/
      api/
        client.js       # All fetch calls; BASE_URL from VITE_API_URL env var
      components/
        Timeline.jsx    # Gantt chart + vertical timeline list
        EmperorCard.jsx # Individual emperor card with dynasty color
        EmperorModal.jsx # Full-detail modal with portrait + summary
      App.jsx
      main.jsx
      index.css         # Dark parchment theme
```

## Switching to a Real Server / Different Database

The DB layer is designed for easy swapping:

1. **Change the backend URL** (e.g. deploy to Railway, Render, etc.): Just set `VITE_API_URL=https://your-api.example.com` in the frontend `.env`.

2. **Switch to PostgreSQL**:
   - Add `backend/src/db/postgres.js` implementing `{ query, run, close }` using `pg` or `postgres`
   - In `db/index.js`, add a `case 'postgres':` that calls it
   - Set `DB_TYPE=postgres` and `DATABASE_URL=...` in backend `.env`
   - No other code changes needed

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/emperors` | All emperors, ordered by reign start |
| GET | `/api/emperors/:id` | Single emperor by ID |
| GET | `/health` | Health check |
