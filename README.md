# Travel Destination Guide — Single-Table CRUD API (ICT251 Activity 4)

Chosen theme: **Question 6 — Travel Destination Guide**
Resource / table: `destinations`

## Live links

- Frontend (full app): https://travel-guide-database.onrender.com/
- GET all: https://travel-guide-database.onrender.com/api/destinations
- GET one (example id 1): https://travel-guide-database.onrender.com/api/destinations/1
- POST (create): https://travel-guide-database.onrender.com/api/destinations
- PUT (update, example id 10): https://travel-guide-database.onrender.com/api/destinations/10
- DELETE (delete, example id 10): https://travel-guide-database.onrender.com/api/destinations/10
- Health check: https://travel-guide-database.onrender.com/health

> The Postman video demonstrates the full create → read → update → delete cycle on a *temporary* record, so the 10 seeded sample records (ids 1–10) always remain intact for marking.

## Part A — database note (why PostgreSQL)

The brief names SQLite, but the **deployed** app uses a managed **PostgreSQL** database on Render. Reason: the activity guide itself warns that Render's free web-service disk is temporary, so a file-based SQLite database would be wiped/reset every time the free service sleeps or restarts — which would break the live demo and the recorded Postman evidence. PostgreSQL gives the live app persistent, reliable storage.

The data model still meets every structural requirement in Part A:

- Exactly **one** table: `destinations`.
- **`id`** integer primary key, auto-increment (`SERIAL`).
- **12** theme-relevant fields (destination, country, region, continent, description, best_season, average_budget_usd, visa_required, safety_rating, top_attraction, language, currency) plus a `status` field — well above the minimum of 5.
- **10** seeded sample records, re-created automatically on each deploy.

The only deviation from the brief's literal wording is the storage engine. Converting to SQLite would be a contained change to the data-access layer only (swap the `pg` driver for a SQLite driver in `db.js` and adjust the identity/placeholder syntax); the routes, validation, JSON response shape, CORS setup and `.env` pattern would stay exactly as they are.

## Part B / C — what's implemented

- Node.js + Express REST API exposing GET, GET/:id, POST, PUT, DELETE — all returning JSON (success *and* error).
- CORS enabled; DB config via environment variables (`.env` / Render env vars).
- Single-page HTML + JavaScript frontend: create form, records table, edit (loads a row into the form → PUT), delete (with confirm), and the table refreshes after every operation.

## Run locally (optional)

```
cd travel-destination-crud/backend
npm install
npm start
```

Set the PostgreSQL connection details in `.env` (Render injects them automatically in production). The server creates the table and seeds 10 records on startup.
