// API base — uses Vite proxy in dev (/api → localhost:3001/api)
// In production, set VITE_API_BASE in .env.production
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
