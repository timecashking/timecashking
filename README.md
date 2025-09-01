# TimeCash King

Minimal API (Express + Prisma + Neon) with Google OAuth, categories and transactions, deployed on Render, and a static landing on Netlify.

## Environment variables (GitHub/Render)
- NEON_DATABASE_URL: Postgres connection string (Neon, pooler host)
- JWT_SECRET: strong secret (already generated and set)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET: OAuth credentials
- GOOGLE_REDIRECT_URI: https://timecashking-api.onrender.com/integrations/google/callback
- RENDER_SERVICE_HOST: https://timecashking-api.onrender.com
- NEXT_PUBLIC_API_URL: https://timecashking-api.onrender.com
- FRONTEND_URL: https://timecashking.netlify.app
- RENDER_DEPLOY_HOOK: Render Deploy Hook URL
- NETLIFY_BUILD_HOOK: Netlify Build Hook URL (optional)

## Auth flow
1) GET /integrations/google/auth → Google consent
2) GET /integrations/google/callback → upsert user, set cookie httpOnly (tck_jwt) and optional token redirect
3) GET /me (auth) → current user
4) POST /auth/logout → clear cookie

## Finance endpoints (auth required)
- Categories
  - POST /categories { name }
  - GET  /categories [?paginate=true&page=1&pageSize=10]
  - PATCH /categories/:id { name }
  - DELETE /categories/:id
- Transactions
  - POST /transactions { type: INCOME|EXPENSE, amount, categoryId?, description? }
  - GET  /transactions [?paginate=true&page=1&pageSize=10]
  - PATCH /transactions/:id { type?, amount?, categoryId?, description? }
  - DELETE /transactions/:id
- Summary / Export
  - GET /summary [?start=YYYY-MM-DD&end=YYYY-MM-DD]
  - GET /transactions/csv [?start=YYYY-MM-DD&end=YYYY-MM-DD]

## Local development
```bash
npm install
npx prisma generate
npx prisma db push
npm start
```

## Deploy
- Render: auto-deploy via `RENDER_DEPLOY_HOOK` or Git push
- Netlify: publish `public/`, optional auto-build via `NETLIFY_BUILD_HOOK`

