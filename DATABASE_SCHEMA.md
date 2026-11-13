# SMARTWAY Database Architecture & Schema Specification

## Database Engine: PostgreSQL via Prisma ORM

This document details the relational schema, tables, foreign keys, indexes, and constraints for the Smartway NEET & JEE Learning Platform.

---

### Entity Relationship Overview

```
[User] ──<1:1>── [StudentProfile] ──<1:N>── [QuestionAttempt]
  │                       │
  │                       ├──<1:N>── [Bookmark] ──<N:1>── [Question]
  │                       ├──<1:N>── [FlashcardFolder] ──<1:N>── [Flashcard]
  │                       ├──<1:N>── [PersonalTask]
  │                       ├──<1:N>── [UserActivity]
  │                       └──<1:N>── [VideoFavorite]
  │
  └──<1:1>── [AdminProfile]

[Subject] ──<1:N>── [Chapter] ──<1:N>── [Topic]
                         │
                         ├──<1:N>── [Note] ──<1:N>── [NoteFile]
                         ├──<1:N>── [Question] ──<1:N>── [QuestionOption]
                         │                 └──<1:1>── [QuestionExplanation]
                         ├──<1:N>── [Flashcard]
                         └──<1:N>── [Video]

[StudyPlan] ──<1:N>── [StudyPlanTask]
```

---

### Core Data Models

#### 1. `User` & Profiles
- **`User`**: Core authentication record (id, email, passwordHash, role: STUDENT|ADMIN, isVerified, createdAt, updatedAt).
- **`StudentProfile`**: Exam targets (NEET, JEE_MAIN, JEE_ADVANCED), targetClass (CLASS_11, CLASS_12, BOTH), fullName, avatarUrl, streakDays, totalStudyMinutes.
- **`AdminProfile`**: Admin permissions, department, audit logs link.

#### 2. Curriculum Hierarchy
- **`Subject`**: Code (PHYSICS, CHEMISTRY, BIOLOGY, MATHEMATICS), name, icon, color, description, orderIndex.
- **`Chapter`**: Title, slug, description, subjectId, targetClass (CLASS_11 | CLASS_12), orderIndex, isPublished.
- **`Topic`**: Title, chapterId, orderIndex, learningObjectives (JSON/text).

#### 3. Notes System
- **`Note`**: Title, summary, contentMarkdown, chapterId, topicId, authorId, isPublished, allowDownload, viewsCount.
- **`NoteFile`**: Document attachments (fileUrl, fileType, fileSizeBytes, isDownloadable).

#### 4. PYQ (Previous Year Questions) Engine
- **`Question`**: Content, questionType (SINGLE_CHOICE, MULTIPLE_CHOICE, NUMERICAL), examType (NEET, JEE_MAIN, JEE_ADVANCED), examYear, subjectId, chapterId, topicId, difficulty (EASY, MEDIUM, HARD), marks, negativeMarks, isPublished.
- **`QuestionOption`**: Option label (A, B, C, D), content, isCorrect.
- **`QuestionExplanation`**: Detailed solution markdown, diagramUrl, keyFormula.
- **`QuestionAttempt`**: studentId, questionId, selectedOptionIds, numericalAnswer, isCorrect, timeSpentSeconds, createdAt.

#### 5. Bookmarks (3 Distinct Folders)
- **`Bookmark`**: studentId, questionId, category: `MISTAKE` | `REVISE_LATER` | `IMPORTANT`, notes, createdAt. Unique on `[studentId, questionId, category]`.

#### 6. Flashcard System
- **`FlashcardFolder`**: studentId, title, color, icon.
- **`Flashcard`**: studentId, folderId, chapterId, frontContent, backContent, hint, masteryLevel (0-5), nextReviewDate.
- **`FlashcardAttempt`**: studentId, flashcardId, remembered (boolean), responseTimeSeconds.

#### 7. Study Planner
- **`StudyPlan`**: Master platform templates created by admins (targetExam, durationWeeks, isPublished).
- **`StudyPlanTask`**: planId, dayNumber, subjectId, chapterId, taskType (STUDY, PYQ_PRACTICE, REVISION).
- **`PersonalTask`**: studentId, title, subjectId, chapterId, dueDate, estimatedMinutes, priority (LOW, MEDIUM, HIGH), isCompleted, completedAt.

#### 8. Short Educational Videos
- **`Video`**: Title, description, durationSeconds, videoUrl, cloudflareStreamId, thumbnailUrl, subjectId, chapterId, viewsCount.
- **`VideoFavorite`**: studentId, videoId.

#### 9. Platform Telemetry & Subscriptions
- **`UserActivity`**: studentId, activityType (READ_NOTE, ATTEMPT_PYQ, PRACTICE_FLASHCARD, WATCH_VIDEO), metadata, timestamp.
- **`Notification`**: userId, title, message, isRead, type, link.
- **`Subscription`**: studentId, planType (FREE, PRO_MONTHLY, PRO_ANNUAL), status (ACTIVE, EXPIRED), expiresAt.

