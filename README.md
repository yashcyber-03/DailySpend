# DailySpend
Personal expense tracker: React + Vite + Tailwind + Firebase (Auth + Firestore) + Recharts.

## 1. Firebase
1. console.firebase.google.com → Add project → Build → Authentication → Get started → enable **Email/Password**.
2. Build → Firestore Database → Create database (production mode, pick a region).
3. Project settings → General → Your apps → Web (`</>`) → register → copy the config values.
4. Authentication → Settings → Authorized domains: add your Vercel domain after deploying.

## 2. Run locally
```
npm install
cp .env.example .env      # fill the 6 VITE_FIREBASE_* values from step 1.3
npm run dev
```
## 3. Deploy rules and indexes
```
npm i -g firebase-tools
firebase login
firebase init firestore   # choose your project; keep firestore.rules and firestore.indexes.json
firebase deploy --only firestore:rules,firestore:indexes
```
Index builds take a few minutes. Until done, lists may show an index error.

## 4. GitHub + Vercel
```
git init && git add . && git commit -m "DailySpend"
git remote add origin <your-repo-url> && git push -u origin main
```
Vercel → Add New Project → import repo (Vite preset) → Environment Variables: add the 6 `VITE_FIREBASE_*` values → Deploy. `vercel.json` handles SPA routing. Never commit `.env`.
