# SMARTWAY: Premium NEET & JEE Learning Platform

Smartway is an EdTech platform designed for medical (NEET) and engineering (JEE Main & Advanced) aspirants in India. Built with **Next.js 14+ (React, TypeScript, Tailwind CSS, Framer Motion)** and a **Modular Node.js/Express REST API (Prisma ORM, PostgreSQL/SQLite, Zod, JWT)**.

---

## 🌟 Key Platform Modules & Capabilities

1. **Structured NCERT Curriculum (Biology, Chemistry, Physics, Mathematics)**
   - Complete Class 11 and Class 12 unit and chapter navigation.
   - Comprehensive learning objectives, high-yield summary points, and NCERT references.

2. **High-Yield Notes & In-App PDF Reader**
   - High-yield summary cards with LaTeX/Markdown formulas, tables, and definitions.
   - In-app PDF viewer integration with configurable download permissions.

3. **Previous Year Questions (PYQ) Practice Engine**
   - 15+ years of verified examination papers filtered by Exam (NEET, JEE Main, JEE Advanced), Subject, Chapter, Year, and Difficulty.
   - Real-time examination stopwatch timer.
   - Instant response grading with step-by-step solution derivations and formula references.

4. **Tri-Category Bookmark Vault**
   - **Mistake Questions**: Auto-saved when a problem is answered incorrectly during practice drills.
   - **Revise Later**: Tricky questions flagged for weekend review.
   - **Important Questions**: High-weightage recurring concept questions.
   - Independent practice mode directly from any bookmark folder.

5. **Interactive 3D Flashcard Engine with SRS (Spaced Repetition)**
   - 3D card flip animation.
   - Dual study modes: standard flip & type-your-answer active recall.
   - SuperMemo SM-2 inspired mastery progression (Levels 0–5) with interval review scheduling.
   - Speech-to-Text card drafting via Web Speech API.

6. **Dual Study Planner**
   - **Platform-Curated Master Timetables**: 90-day structured roadmaps for NEET and JEE.
   - **Student Personal Planner**: Custom task scheduling with deadlines, priorities, durations, and completion toggles.

7. **Micro-Concept Video Reels**
   - 30–40 second vertical bite-sized concept capsules.
   - Category filtering, like/favorite toggles, and direct links to connected notes and PYQs.

8. **Diagnostic Student Analytics**
   - Total questions attempted, overall accuracy %, and subject-wise balance meters.
   - Active study streaks and 7-day question practice heatmaps.

9. **Independent Admin Console**
   - Student account directory with activation/deactivation controls.
   - Dynamic chapter creation without source code modification.
   - Study notes and micro-video publishing.
   - PYQ management with manual editor and bulk CSV upload engine (with downloadable template).
   - Real-time platform telemetry and engagement metrics.

---

## 🏗️ Architecture & Technology Stack

```
smartway/
├── backend/               # Modular Express.js & TypeScript API Server
│   ├── src/
│   │   ├── config/        # Environment configurations
│   │   ├── middleware/    # Auth (JWT/RBAC), validation (Zod), rate-limiting
│   │   ├── modules/       # Domain modules (auth, pyq, notes, flashcards, etc.)
│   │   ├── routes/        # Router mounting at /api/v1
│   │   └── server.ts      # HTTP Bootstrap, Helmet, CORS, Error handling
│   ├── prisma/            # Schema (Postgres & SQLite), migrations, and seeds
│   └── dist/              # Production compiled code
├── frontend/              # Next.js 14+ (App Router, Tailwind, TypeScript)
│   ├── src/
│   │   ├── app/           # 11 Public pages, Student portal, Admin portal
│   │   ├── components/    # Reusable UI components, Navbar, Sidebars
│   │   ├── lib/           # API client, Auth Context, token storage
│   │   └── types/         # TypeScript domain interfaces
├── docker-compose.yml     # Multi-container orchestration (PostgreSQL + Redis + App)
└── package.json           # Root workspace orchestrator
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js >= 18.x (v20+ or v24+ recommended)
- npm >= 9.x

### 2. Setup Backend & Seed Database
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
```

*Default Demo Accounts (Seeded):*
- **Student Account:** `student@smartway.com` | Password: `smartway123` (NEET Track, Class 12)
- **Admin Account:** `admin@smartway.com` | Password: `smartway123` (Full Administrator)

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run build
```

### 4. Run Both Servers Concurrently
From the project root:
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
cd backend && npm run dev

# Terminal 2: Frontend App (runs on http://localhost:3000)
cd frontend && npm run dev
```

Visit **`http://localhost:3000`** in your browser to start using Smartway.

