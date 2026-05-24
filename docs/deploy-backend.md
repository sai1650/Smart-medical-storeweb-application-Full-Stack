# Deploying the backend (Render)

This document walks through deploying the `backend/` service to a host that supports long‑running Node apps.

Recommended: Render (free tier).

## Prepare

1. Create a MongoDB Atlas cluster and obtain the connection string. Fill in `MONGODB_URI`.
2. In your repo root add a `.env` (locally) using `.env.example` as template (do NOT commit secrets).

## Render (quick)

1. Go to https://dashboard.render.com and create a new **Web Service**.
2. Connect your GitHub repository and select the `smart-medical-store` repo.
3. Set the **Root Directory** to `backend`.
4. Set the Build Command to `npm ci` and Start Command to `npm start`.
5. Under Environment, add an environment variable named `MONGODB_URI` with your Atlas URI.
6. Create the service — Render will build and start the server. Note the HTTPS endpoint it provides.

## After deployment

- The frontend is already configured to use the Render backend URL by default.
- If you rename the Render service, update `frontend/public/script.js` or set `window.API_BASE_URL` before loading `script.js`.
- Make sure CORS is allowed — `backend/server.js` already uses `cors()`.
