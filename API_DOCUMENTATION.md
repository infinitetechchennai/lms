# SMARTWAY REST API Documentation

Base URL: `http://localhost:5000/api/v1`

All responses follow the standardized envelope:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

---

## 1. Authentication & Profiles (`/auth`)
- `POST /auth/register` - Create new student account (Email, Password, Name, Target Exam, Class).
- `POST /auth/login` - Authenticate user, returns access token (JWT) and user profile.
- `POST /auth/logout` - Clear session/tokens.
- `GET /auth/me` - Retrieve authenticated user profile and target exam preferences.
- `PUT /auth/profile` - Update student profile (Exam, Class, Name, Avatar).

## 2. Subjects & Curriculum (`/subjects`, `/chapters`)
- `GET /subjects` - List all subjects (Physics, Chemistry, Biology, Mathematics) with stats.
- `GET /subjects/:id/chapters` - List chapters filtered by subject and class (Class 11 / Class 12).
- `GET /chapters/:id` - Detailed chapter view with topics, notes count, PYQ counts.

## 3. Notes Management (`/notes`)
- `GET /notes` - Query notes with filters (`subjectId`, `chapterId`, `class`, `search`).
- `GET /notes/:id` - Retrieve full note content with attached documents.
- `POST /notes/:id/view` - Increment note view telemetry.

## 4. Previous Year Questions Engine (`/pyq`)
- `GET /pyq/questions` - Query PYQs with multi-level filtering (`examType`, `subjectId`, `chapterId`, `year`, `difficulty`, `type`).
- `GET /pyq/questions/:id` - Fetch single question with options (excluding hidden answer in exam mode).
- `POST /pyq/questions/:id/attempt` - Submit answer, validate correctness, receive full solution & step-by-step explanation.
- `GET /pyq/attempts/history` - User's previous question attempts and accuracy summary.

## 5. Bookmark System (`/bookmarks`)
- `GET /bookmarks` - List bookmarks filtered by category (`MISTAKE`, `REVISE_LATER`, `IMPORTANT`).
- `POST /bookmarks` - Add/toggle bookmark for a question in a specific category.
- `DELETE /bookmarks/:id` - Remove question from bookmark category.

## 6. Flashcard System (`/flashcards`)
- `GET /flashcards` - List flashcards with folder/subject/chapter filters.
- `POST /flashcards` - Create student flashcard (Front, Back, Hint, Chapter).
- `PUT /flashcards/:id` - Update flashcard.
- `DELETE /flashcards/:id` - Delete flashcard.
- `POST /flashcards/:id/review` - Record review outcome (remembered: true/false), updates spaced repetition schedule.

## 7. Study Planner (`/planner`)
- `GET /planner/tasks` - List personal study tasks by date range and status.
- `POST /planner/tasks` - Create new study task (title, subjectId, chapterId, dueDate, priority, estimatedMinutes).
- `PATCH /planner/tasks/:id/toggle` - Mark task completed / pending.
- `DELETE /planner/tasks/:id` - Delete task.
- `GET /planner/templates` - Browse platform-curated master study timetables.

## 8. Short Educational Videos (`/videos`)
- `GET /videos` - Fetch micro-learning video feed (30-40s duration) with pagination and subject filter.
- `POST /videos/:id/favorite` - Toggle favorite video.

## 9. Analytics & Progress (`/analytics`)
- `GET /analytics/dashboard` - High-level summary (Total questions attempted, accuracy rate, study streak, hours spent).
- `GET /analytics/subjects` - Subject-wise breakdown (accuracy, questions attempted).
- `GET /analytics/weekly` - Day-by-day learning activity over the past 7 days.

## 10. Administrator Endpoints (`/admin`)
- `GET /admin/students` - Paginated list of registered students with search and status toggle.
- `POST /admin/chapters` - Create new chapter without code deployment.
- `POST /admin/notes` - Upload and publish study notes.
- `POST /admin/questions` - Create question manually or bulk import via CSV.
- `POST /admin/videos` - Publish short educational video.
- `GET /admin/stats` - Platform health, daily active learners, engagement metrics.

