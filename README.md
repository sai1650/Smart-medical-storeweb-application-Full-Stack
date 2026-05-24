# Smart Medical Store — Deployment Guide

This repository contains a simple pharmacy inventory app with a `backend/` (Express + Mongoose) and a static frontend in `frontend/public`.

This README explains an easy, reliable deployment approach.

## Recommended deployment (separate services)

1. Deploy frontend to Netlify (static):
   - In Netlify, create a new site from this GitHub repo.
   - Set the **Publish directory** to `frontend/public`.
   - No build command is required for the current static frontend.

2. Deploy backend to Render:
   - Create a new Web Service and set the Root Directory to `backend`.
   - Build Command: `npm ci`
   - Start Command: `node server.js` (or `npm start`)
   - Add environment variable `MONGODB_URI` with your MongoDB Atlas connection string.
   - Ensure CORS is allowed (the backend already uses `cors()` by default).

3. Use MongoDB Atlas for database:
   - Create a free cluster at https://www.mongodb.com/cloud/atlas.
   - Create a database user and network access (allow your host IP or 0.0.0.0/0 for testing).
   - Copy the connection string and set it as `MONGODB_URI` on your backend host and locally in a `.env` file.

4. Frontend API base URL:
   - The frontend defaults to `https://smart-medical-store-backend.onrender.com` in production.
   - If you rename the Render service, update `frontend/public/script.js` or set `window.API_BASE_URL` before loading `script.js`.

## Quick local start

1. Install dependencies and run MongoDB (local or Atlas):

```bash
cd backend
npm ci
# set MONGODB_URI in .env or use local mongodb
node server.js
```

From the repo root, `npm run build` installs the backend dependencies and `npm start` launches the backend server.

## Why separate deployments

- Netlify is a good fit for the static frontend, while Render handles the long‑running Node backend and persistent MongoDB connection.
- Splitting responsibilities makes configuration and scaling easier.

## Small fixes applied
- Removed an incorrect dependency (`mongod`) from `backend/package.json`.

---
If you want, I can:
- add a `netlify.toml`/`render.yaml` tweak for your exact service names,
- add a small `deploy.md` with Render / Netlify step‑by‑step UI screenshots, or
- help you point the frontend at a custom Render URL if you rename the backend service.

Tell me which option you prefer and I’ll continue.
i have used the 10000 data medicine in my database
