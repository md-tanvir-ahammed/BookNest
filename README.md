# 📚 BookNest — Version 3 (Final Release)

A community-driven online book review and reading platform, built for the Software Development Lab final submission.

This version upgrades BookNest from a `localStorage`-only demo (v2) into a real client–server web app:
**Node.js + Express REST API, MySQL database, bcrypt password hashing, and JWT authentication**, exactly as outlined in the "Roadmap" slide of the progress presentation.

---

## 1. Project Proposal

### 1.1 The Problem
General-purpose review platforms like Goodreads are crowded and feature-heavy. University students and local reading communities need a simple, distraction-free space to log, rate, and discuss books — without recommendation algorithms or social-feed clutter. Existing options give no lightweight way to:
- Run a small peer-review space for a class or a local group
- Filter books by genre, rating, or author
- Combine structured ratings with written feedback in one clean UI

### 1.2 Objective
Build a secure, full-stack web application that lets registered users:
1. Register and log in securely (hashed passwords, token-based sessions)
2. Upload, browse, search, and delete books (full CRUD)
3. Read PDF books directly in the browser with zoom and eye-friendly themes
4. Rate books from 1–5 stars and see a live community average
5. Comment on books and manage their own comments
6. Track reading progress and revisit it from a personal profile dashboard
7. Bookmark favorite titles for quick access

### 1.3 Target Users
University students and local reading communities who want a fast, no-clutter way to log, rate, and discuss books together.

### 1.4 Technology Stack (Version 3)

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript (ES6), PDF.js |
| Backend | Node.js, Express.js (REST API) |
| Database | MySQL (`mysql2` driver, connection pooling) |
| Auth | bcrypt (password hashing) + JSON Web Tokens (sessions) |
| File Storage | PDF files stored on server disk, referenced by path in DB |
| Version Control | Git & GitHub |
| Deployment | Render.com |

### 1.5 What changed from Version 2 → Version 3

| Version 2 (Prototype) | Version 3 (Final) |
|---|---|
| Data stored in browser `localStorage` | Data stored in a real MySQL database |
| Plaintext passwords | Passwords hashed with bcrypt |
| No real session/security | JWT-based authentication, sent as `Authorization: Bearer <token>` |
| PDFs stored as giant Base64 strings in `localStorage` | PDFs uploaded via `multipart/form-data`, stored as files, served by the API |
| Everything ran in one browser only — no sharing between users/devices | Multi-user, multi-device — everyone hits the same backend |
| No backend at all | Full Express REST API (`/api/...`) documented in §5 |

---

## 2. Folder Structure

```
booknest-v3/
├── backend/
│   ├── server.js                # Express app entry point
│   ├── package.json
│   ├── .env.example             # copy to .env and fill in your own values
│   ├── db/
│   │   ├── schema.sql           # run this to create tables
│   │   ├── seed.js              # loads the 8 sample books
│   │   └── connection.js        # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js              # register / login / me
│   │   ├── books.js             # list / upload / delete / serve PDF
│   │   ├── ratings.js           # get / set a book rating
│   │   ├── comments.js          # get / post / delete comments
│   │   ├── favorites.js         # list / toggle favorites
│   │   ├── progress.js          # save / load reading progress
│   │   └── profile.js           # aggregated profile-dashboard stats
│   └── uploads/                 # uploaded PDF files land here (git-ignored)
└── frontend/
    ├── index.html / style.css / script.js      # Login & Register
    ├── home.html  / home.css  / home.js        # Library, reader, comments
    ├── profile.html / profile.css / profile.js # User dashboard
    └── config.js                               # API_BASE_URL — edit this for deployment
```

---

## 3. Prerequisites

- [Node.js](https://nodejs.org) v18 or newer
- [MySQL](https://dev.mysql.com/downloads/) Server (or MariaDB) running locally
- Git
- A code editor (VS Code recommended)
- A free [GitHub](https://github.com) account

---

## 4. Step-by-Step Setup (Run Locally)

### Step 1 — Get the code onto your machine
If you already have this folder, just open a terminal inside `booknest-v3/`. Otherwise clone it (see §7 once it's pushed to your own GitHub).

### Step 2 — Create the database
```bash
mysql -u root -p
```
Inside the MySQL prompt:
```sql
SOURCE backend/db/schema.sql;
EXIT;
```
This creates the `booknest` database and all six tables (`users`, `books`, `ratings`, `comments`, `favorites`, `reading_progress`).

### Step 3 — Configure environment variables
```bash
cd backend
cp .env.example .env
```
Open `.env` and set your real MySQL password and a random `JWT_SECRET` (any long random string — e.g. generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

### Step 4 — Install backend dependencies
```bash
npm install
```

### Step 5 — Seed the 8 sample books
```bash
node db/seed.js
```

### Step 6 — Start the backend API
```bash
npm start
```
You should see: `BookNest API listening on http://localhost:5000`.
Leave this terminal running.

### Step 7 — Run the frontend
Open a **second** terminal:
```bash
cd frontend
npx serve .
```
(or simply open `index.html` in your browser via the VS Code "Live Server" extension — any static file server works, since the frontend just calls the API over `fetch`).

If your API is not on `http://localhost:5000`, update the `API_BASE_URL` constant in `frontend/config.js` first.

### Step 8 — Use the app
Open the frontend URL shown in your terminal, register a new account, and you're in. Try uploading a small PDF, rating a book, commenting, favoriting, and reading with different zoom levels/themes — then check the Profile page to see your stats update.

---

## 5. REST API Reference

Base URL: `http://localhost:5000/api`
Protected routes require header: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create account, returns `{ token, user }` |
| POST | `/auth/login` | – | Log in, returns `{ token, user }` |
| GET | `/auth/me` | ✅ | Returns the current decoded user |
| GET | `/books` | – | List all books with average rating |
| POST | `/books` | ✅ | Upload a book (`multipart/form-data`: title, author, category, pdf) |
| DELETE | `/books/:id` | ✅ | Delete a book you uploaded |
| GET | `/books/:id/pdf` | – | Stream the PDF file |
| GET | `/books/:id/rating` | ✅ | Your rating for a book |
| POST | `/books/:id/rating` | ✅ | Set/update your rating `{ value: 1-5 }` |
| GET | `/books/:id/comments` | – | List comments on a book |
| POST | `/books/:id/comments` | ✅ | Post a comment `{ text }` |
| DELETE | `/comments/:id` | ✅ | Delete your own comment |
| GET | `/favorites` | ✅ | Your favorite book IDs |
| POST | `/favorites/:bookId` | ✅ | Toggle favorite on/off |
| GET | `/progress` | ✅ | Your reading progress across all books |
| POST | `/progress/:bookId` | ✅ | Save current page `{ page, totalPages }` |
| GET | `/profile/stats` | ✅ | Aggregated dashboard: uploads, comments, favorites, progress |

---

## 6. Deployment (matches Roadmap Phase 4)

**Database:** create a free MySQL instance (e.g. Railway, Clever Cloud, or Render's managed Postgres if you switch drivers). Note the host/user/password/db name.

**Backend on Render.com:**
1. Push this repo to GitHub (§7).
2. On Render → New → Web Service → connect your GitHub repo, root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT) in Render's dashboard.
5. Once deployed, note your live API URL, e.g. `https://booknest-api.onrender.com`.

**Frontend:**
1. Update `frontend/config.js` → `API_BASE_URL = 'https://booknest-api.onrender.com/api'`.
2. Deploy the `frontend/` folder as a static site (Render "Static Site", GitHub Pages, or Netlify all work).

---

## 7. Publishing to GitHub (so anyone can use your project)

Run these from inside the `booknest-v3/` folder.

```bash
# 1. Initialize git (skip if already a repo)
git init

# 2. Confirm the .gitignore is in place (keeps node_modules, .env, and uploaded PDFs out of git)
cat .gitignore

# 3. Stage and commit everything
git add .
git commit -m "BookNest v3: Node.js + Express + MySQL backend, JWT auth, real API"

# 4. Create a new empty repository on GitHub.com named "BookNest"
#    (github.com → New repository → don't initialize with README, since you already have one)

# 5. Connect your local repo to GitHub and push
git branch -M main
git remote add origin https://github.com/<your-username>/BookNest.git
git push -u origin main
```

After this, your project page at `https://github.com/<your-username>/BookNest` will show the full source. Anyone can then:
```bash
git clone https://github.com/<your-username>/BookNest.git
cd BookNest
```
and follow **Section 4** of this README to run it themselves — that's exactly what "anyone can use it" means for a course submission: a clean repo + a README that gets a stranger from clone to running app.

### Ongoing updates
Whenever you make more changes:
```bash
git add .
git commit -m "Describe what you changed"
git push
```

### (Optional) Keep the feature-branch workflow from your proposal
```bash
git checkout -b feature/backend-api
# ... work, commit ...
git push -u origin feature/backend-api
# then open a Pull Request on GitHub into main
```

---

## 8. Demo / Viva Checklist

Walk through these live during your presentation to show every proposal item is delivered:
- [ ] Register a new account → show the row appear in the `users` table with a hashed password
- [ ] Log out and log back in → JWT stored in `localStorage`, decode it at jwt.io to show the payload
- [ ] Upload a PDF book → show the file appear in `backend/uploads/` and a new row in `books`
- [ ] Search and filter by category
- [ ] Open a book → change zoom and theme, flip pages, show the progress bar update
- [ ] Rate the book, refresh, confirm the rating persisted (from MySQL, not the browser)
- [ ] Post a comment, delete it
- [ ] Favorite a book, filter by "❤️ Favorites"
- [ ] Open Profile → show uploaded count, comments, favorites, and reading progress all pulled live from `/api/profile/stats`
- [ ] Show the GitHub repository and a clean `git log`

---

## 9. Future Improvements (post-course ideas)
- Refresh tokens / logout-everywhere support
- Pagination and combined advanced search (title + author + genre + rating)
- Image book covers (currently a placeholder icon)
- Automated tests (Jest + Supertest for the API)
- Dockerize backend + MySQL for one-command setup

---

## Author
Md. Tanvir Ahammed · Md. Sabbir Hasan
Made with ❤️ for the reading community.
