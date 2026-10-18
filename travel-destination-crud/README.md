# Travel Destination Guide CRUD

A single-table CRUD app for the ICT251 Activity 4 assignment.

## Stack
- Node.js
- Express
- PostgreSQL
- pg
- dotenv
- cors

## Project layout
- `backend/server.js` — Express app and API routes
- `backend/db.js` — PostgreSQL pool
- `backend/schema.sql` — table schema and seed data
- `backend/public/index.html` — UI
- `backend/public/app.js` — frontend logic

## Run locally
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env` from `backend/.env.example` and set your PostgreSQL password.
3. Create the database and load the schema:
   ```bash
   psql "postgresql://postgres:YOUR_PASSWORD@localhost:5432/travel_db" -f backend/schema.sql
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`

## API endpoints
- `GET /api/destinations`
- `GET /api/destinations/:id`
- `POST /api/destinations`
- `PUT /api/destinations/:id`
- `DELETE /api/destinations/:id`
