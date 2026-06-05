# 💰 My Budget — Personal Spending Tracker

A simple, secure, mobile-first budgeting PWA for iPhone. Open it and instantly see where money is going.

## What It Does

- 📊 Total spending vs. budget for the month
- 🏷️ Breaks spending into 8 simple categories (Rent, Groceries, Dining, etc.)
- 📈 6-month spending trend chart
- 📋 Detects and shows upcoming recurring bills automatically
- 🔄 Syncs with Chase automatically every 8 hours — no user action needed
- 📱 Works as an iPhone home screen app (PWA)
- 🎭 Runs in demo mode until bank is connected

---

## STEP 1 — Set Up Plaid (Free)

Plaid securely connects to Chase. Free for personal use.

### 1a. Create Plaid account
1. Go to https://dashboard.plaid.com/signup
2. Sign up — select "Personal project" when asked
3. You'll be in Sandbox mode (free, fake data for testing)

### 1b. Get your API keys
1. Plaid Dashboard → Team Settings → Keys
2. Copy: client_id and Sandbox secret

### 1c. Request Development access (for real Chase)
1. Plaid Dashboard → API → Request Development access
2. Explain it's a personal budgeting app
3. Approval takes 1-3 business days
4. Once approved: use Development secret + set PLAID_ENV=development

While waiting: the app works perfectly in Sandbox with realistic fake Chase data.

---

## STEP 2 — Run Locally

Prerequisites: Node.js 18+ (https://nodejs.org)

```bash
cd budget-app
npm install
cp .env.example .env.local
# Edit .env.local with your Plaid keys
npm run dev
```

Open http://localhost:3000

---

## STEP 3 — Deploy to Railway (Free)

### 3a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial budget app"
git remote add origin https://github.com/YOUR_USERNAME/budget-app.git
git push -u origin main
```

### 3b. Deploy
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your budget-app repo
3. Railway auto-detects Next.js and deploys

### 3c. Add persistent volume (IMPORTANT — keeps database across deploys)
Railway dashboard → your service → Volumes → Add Volume
Mount path: /data

### 3d. Add environment variables
In Railway → your service → Variables:
```
PLAID_CLIENT_ID = your_client_id
PLAID_SECRET    = your_sandbox_secret
PLAID_ENV       = sandbox
DB_PATH         = /data
NODE_ENV        = production
```

---

## STEP 4 — iPhone Setup

Tell your mom:
1. Open Safari (not Chrome) on iPhone
2. Go to your Railway URL
3. Tap the Share button (bottom of screen)
4. Tap "Add to Home Screen"
5. Tap "Add"

The app appears on her home screen and opens fullscreen like a native app.

---

## Customizing Budgets

Edit defaults in src/lib/db.ts → initSchema() → defaults array.
Or via API: PUT /api/budgets with {"category": "Groceries", "monthlyLimit": 500}

---

## How Auto-Sync Works

- On app open: syncs immediately
- Every 8 hours: background sync in browser
- Incremental: Plaid cursor-based sync — only fetches NEW transactions
- Deduplicates: handles pending→posted correctly, never double-counts
- No user action needed ever

---

## Security

- Plaid access_token NEVER sent to browser (server-only)
- All Plaid API calls are server-side (Next.js API routes)
- No secrets in frontend code
- No sensitive data logged

---

## Costs: $0/month

Railway free tier + Plaid free tier + SQLite = completely free for personal use.

---

## Troubleshooting

"Failed to create link token"
→ Check PLAID_CLIENT_ID and PLAID_SECRET are set in Railway variables
→ Verify PLAID_ENV matches your secret (sandbox secret → PLAID_ENV=sandbox)

App shows demo data only
→ Click "Connect Chase Account" to link via Plaid Link

Database lost after redeploy
→ Confirm Volume is mounted at /data and DB_PATH=/data is set

iPhone not fullscreen
→ Must use Safari, not Chrome. Tap Share → Add to Home Screen.
# budget-app
