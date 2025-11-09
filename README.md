# IndiShare — Deployable Beta (Express + MongoDB)

**Founder:** Aman Alam  
**Email:** amanalam9115@gmail.com  
**Tagline:** Connecting India through shared data  
**Funding Ask:** INR 2 Crore (pre-seed)

## What is this
A deployable demo of IndiShare — a platform to transfer mobile data balance between users. This demo simulates operator transfers (async) and stores data in MongoDB.

## Quickstart (local)
1. Install Node.js (v16+): https://nodejs.org/
2. Install MongoDB locally (or use Atlas). For quick local test, run `mongod`.
3. In project directory, install deps:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and edit if needed.
5. Start server:
   ```bash
   npm start
   ```
6. Open browser: http://localhost:8000  (front page)  
   Admin dashboard: http://localhost:8000/admin/admin.html  
   API docs (live): interact with endpoints using Postman or direct calls.

## Deploy (Render.com)
1. Create a GitHub repo and push this project (see instructions below).
2. On Render, create a new **Web Service** (Connect GitHub -> select this repo).
3. Root Directory: (leave empty if repo root contains server.js)
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add the environment variable `MONGO_URL` (use MongoDB Atlas or managed DB).
7. Deploy — after deploy, Render gives a public URL.

## Frontend hosting
- The backend serves the static frontend from `/public` and admin from `/admin` by default. If you prefer separate static hosting, deploy `/public` to Vercel or Netlify.

## Notes
- OTP is mocked in this demo and returned in API response for convenience. Replace with Twilio/MSG91 for production.
- Operator transfer is simulated; for real transfers integrate with telco APIs or reseller top-up providers.

## GitHub push example (after creating a repo)
```bash
git init
git add .
git commit -m "Initial IndiShare deployable beta"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/indishare-beta.git
git push -u origin main
```

---
Contact: Aman Alam — amanalam9115@gmail.com
