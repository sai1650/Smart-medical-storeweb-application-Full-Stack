// Default frontend environment bootstrap
// This file can be overwritten at deploy time to inject the correct backend URL.
// Example (Netlify build command):
//   echo "window.API_BASE_URL='${API_BASE_URL}'" > frontend/public/env.js

window.API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL)
  ? window.API_BASE_URL
  : 'https://smart-medical-store-backend.onrender.com';
