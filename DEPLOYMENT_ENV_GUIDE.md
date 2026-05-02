# MockMate Pro - Environment Setup for Any Platform

This project is now environment-oriented for both backend and frontend.

## 1. Local Development

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Fill real values
3. Run:

```bash
cd backend
npm install
npm run dev
```

### Frontend
1. Copy `client/.env.example` to `client/.env`
2. Set `VITE_API_BASE_URL`
3. Run:

```bash
cd client
npm install
npm run dev
```

## 2. Required Variables

### Backend (required)
- `MONGO_URI`
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `OPENROUTER_API_URL`
- `OPENROUTER_MODEL`

### Backend (required when features are used)
- OTP email: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### Frontend (required)
- `VITE_API_BASE_URL`
- `VITE_RAZORPAY_KEY_ID` (if payment flow is used)

## 3. CORS Setup

Backend uses `CORS_ORIGIN` and supports:
- Single origin: `https://your-frontend.vercel.app`
- Multiple origins (comma-separated):
  `https://app.example.com,https://www.app.example.com`

Do not use `*` in production if cookies/credentials are involved.

## 4. Platform Mapping

### Render / Railway / Fly.io (backend)
- Set backend env vars from `backend/.env.example`
- Start command: `npm start`
- Ensure `PORT` is read from environment (already handled)

### Vercel / Netlify (frontend)
- Set frontend env vars from `client/.env.example`
- Set `VITE_API_BASE_URL` to deployed backend URL, e.g.:
  `https://mockmate-api.onrender.com/api`

## 5. Production Checklist

- Rotate all previously exposed secrets
- Never commit real `.env` files
- Keep only `.env.example` in git
- Verify `OPENROUTER_SITE_URL` is your frontend production URL
- Verify `CORS_ORIGIN` contains your frontend origin(s)

## 6. Quick Smoke Test

1. Backend health: open `https://<backend>/`
2. Frontend login/register works
3. `POST /api/interview/start` returns 201
4. Payment order creation works (if enabled)
