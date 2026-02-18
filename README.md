# MediMap — AI-Powered Indoor Navigation

MediMap is a professional indoor navigation system designed for modern hospitals. It leverages AI to predict patient journeys, monitors crowd density in real-time, and provides interactive 3D mapping.

## 🚀 Production Deployment Guide

### 1. Frontend (Vercel)
- **Deployment**: Connect this repository to Vercel.
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: Your Supabase Project URL.
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
  - `VITE_POSTHOG_KEY`: PostHog Project API Key.
  - `VITE_SENTRY_DSN`: Sentry Project DSN.
  - `VITE_API_BASE_URL`: URL of the deployed Railway backend.

### 2. Backend (Railway)
- **Deployment**: Link the `server/` subdirectory to a Railway service.
- **Redis**: Add a Redis plugin to your Railway project. The server will automatically detect `REDIS_URL`.
- **Sentry**: Add `SENTRY_DSN` to enable backend error tracking.
- **Supabase**: Ensure `SUPABASE_URL` and `SUPABASE_KEY` (service role) are set.

### 3. Database (Supabase)
- **Migrations**: Run the contents of `supabase/migrations/20240218_production_hardening.sql` in the Supabase SQL Editor.
- **Realtime**: Ensure the `department_metrics` table has 'Realtime' enabled in the Supabase Dashboard.

## 🏗️ Architecture

MediMap uses a distributed architecture for high availability:
- **Client**: React + Three.js + Vite.
- **Cache**: Redis for shared crowd metrics across backend instances.
- **Database**: Postgres (Supabase) with Realtime extensions.
- **Monitoring**: Sentry (Errors) + PostHog (Analytics).

## 🔨 Development

```bash
# Install dependencies
npm install
cd server && npm install

# Start development servers
npm run dev
cd server && npm run dev
```
