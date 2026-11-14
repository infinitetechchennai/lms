export type ExamType = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
export type ClassLevel = 'CLASS_11' | 'CLASS_12' | 'BOTH';
export type Role = 'STUDENT' | 'ADMIN';
export type BookmarkCategory = 'MISTAKE' | 'REVISE_LATER' | 'IMPORTANT';

export interface User {
  id: string;
  email: string;
  role: Role;
  profile?: StudentProfile | AdminProfile;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  targetExam: ExamType;
  targetClass: ClassLevel;
  streakDays: number;
  totalStudyMinutes: number;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  department: string;
  permissions: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  _count?: {
    chapters: number;
    questions: number;
    videos: number;
  };
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  targetClass: string;
  orderIndex: number;
  isPublished: boolean;
  subject?: Subject;
  topics?: Topic[];
  notes?: Note[];
  _count?: {
    notes: number;
    questions: number;
    flashcards: number;
    videos: number;
  };
}

export interface Topic {
  id: string;
  chapterId: string;
  title: string;
  learningObjectives?: string | null;
  orderIndex: number;
}

export interface Note {
  id: string;
  chapterId: string;
  topicId?: string | null;
  title: string;
  summary: string;
  contentMarkdown: string;
  allowDownload: boolean;
  viewsCount: number;
  createdAt: string;
  chapter?: Chapter;
  topic?: Topic;
  files?: NoteFile[];
}

export interface NoteFile {
  id: string;
  noteId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  isDownloadable: boolean;
}

export interface QuestionOption {
  id: string;
  questionId?: string;
  label: string;
  content: string;
  isCorrect?: boolean;
}

export interface QuestionExplanation {
  id: string;
  content: string;
  formula?: string | null;
  diagramUrl?: string | null;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  topicId?: string | null;
  content: string;
  imageUrl?: string | null;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
  examType: ExamType;
  examYear: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  negativeMarks: number;
  options: QuestionOption[];
  explanation?: QuestionExplanation;
  subject?: Subject;
  chapter?: Chapter;
  bookmarks?: { id: string; category: BookmarkCategory }[];
  attempts?: { id: string; selectedOptionIds: string; isCorrect: boolean; createdAt: string }[];
}

export interface Bookmark {
  id: string;
  studentId: string;
  questionId: string;
  category: BookmarkCategory;
  notes?: string | null;
  createdAt: string;
  question: Question;
}

export interface Flashcard {
  id: string;
  studentId: string;
  folderId?: string | null;
  chapterId?: string | null;
  frontContent: string;
  backContent: string;
  hint?: string | null;
  masteryLevel: number;
  nextReviewAt: string;
  folder?: { id: string; name: string; color: string };
  chapter?: { id: string; title: string; subject?: Subject };
}

export interface FlashcardFolder {
  id: string;
  name: string;
  color: string;
  _count?: {
    cards: number;
  };
}

export interface PersonalTask {
  id: string;
  title: string;
  subjectCode?: string | null;
  chapterName?: string | null;
  dueDate: string;
  estimatedMinutes: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface Video {
  id: string;
  subjectId: string;
  chapterId?: string | null;
  title: string;
  description: string;
  videoType?: 'SHORT' | 'FULL';
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl?: string | null;
  viewsCount: number;
  isFavorited?: boolean;
  subject?: Subject;
  chapter?: {
    id?: string;
    title?: string;
    notes?: { id: string; title: string }[];
    questions?: { id: string; content: string; examYear: number }[];
  };
}

export interface StudentAnalytics {
  profile: StudentProfile;
  overview: {
    totalQuestionsAttempted: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercentage: number;
    totalBookmarks: number;
    totalFlashcards: number;
    completedTasks: number;
    pendingTasks: number;
    studyDurationMinutes: number;
    currentStreakDays: number;
  };
  subjectBreakdown: {
    subjectCode: string;
    name: string;
    color: string;
    totalQuestionsInSubject: number;
    attemptsCount: number;
    correctCount: number;
    accuracyPercentage: number;
  }[];
  weeklyActivity: {
    day: string;
    questionsAttempted: number;
    studyMinutes: number;
  }[];
  recentActivities: {
    id: string;
    actionType: string;
    title: string;
    createdAt: string;
  }[];
}

