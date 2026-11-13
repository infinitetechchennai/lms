import request from 'supertest';
import { app } from './server.js';
import { prisma } from './db.js';

describe('Smartway Backend API Test Suite', () => {
  let studentToken: string;
  let adminToken: string;
  let studentProfileId: string;
  let testQuestionId: string;

  beforeAll(async () => {
    // Authenticate demo student
    const studentRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student@smartway.com',
      password: 'smartway123',
    });
    expect(studentRes.status).toBe(200);
    studentToken = studentRes.body.data.token;
    studentProfileId = studentRes.body.data.user.profile.id;

    // Authenticate demo admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@smartway.com',
      password: 'smartway123',
    });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Health check returns healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('2. Fetch subjects list', async () => {
    const res = await request(app).get('/api/v1/subjects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('3. Fetch chapters for Physics', async () => {
    const res = await request(app).get('/api/v1/subjects/PHYSICS/chapters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.chapters.length).toBeGreaterThanOrEqual(1);
  });

  it('4. Query PYQ Questions with filters', async () => {
    const res = await request(app)
      .get('/api/v1/pyq/questions?examType=NEET')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    testQuestionId = res.body.data[0].id;
  });

  it('5. Attempt question and receive explanation and marks', async () => {
    const questionRes = await request(app)
      .get(`/api/v1/pyq/questions/${testQuestionId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    const optionAId = questionRes.body.data.options[0].id;

    const attemptRes = await request(app)
      .post(`/api/v1/pyq/questions/${testQuestionId}/attempt`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        selectedOptionId: optionAId,
        timeSpentSeconds: 25,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.success).toBe(true);
    expect(attemptRes.body.data).toHaveProperty('isCorrect');
    expect(attemptRes.body.data).toHaveProperty('explanation');
  });

  it('6. Test Tri-Category Bookmarks (MISTAKE, REVISE_LATER, IMPORTANT)', async () => {
    // Add to REVISE_LATER
    const bookmarkRes = await request(app)
      .post('/api/v1/bookmarks/toggle')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        questionId: testQuestionId,
        category: 'REVISE_LATER',
        notes: 'Review before Saturday mock exam',
      });
    expect(bookmarkRes.status).toBe(201);
    expect(bookmarkRes.body.data.bookmarked).toBe(true);

    // Fetch bookmarks
    const getRes = await request(app)
      .get('/api/v1/bookmarks?category=REVISE_LATER')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.bookmarks.length).toBeGreaterThanOrEqual(1);
  });

  it('7. Interactive Flashcards: list & review spaced repetition', async () => {
    const listRes = await request(app)
      .get('/api/v1/flashcards')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.flashcards.length).toBeGreaterThanOrEqual(1);

    const card = listRes.body.data.flashcards[0];
    const reviewRes = await request(app)
      .post(`/api/v1/flashcards/${card.id}/review`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        remembered: true,
        responseTimeSeconds: 4,
      });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.card.masteryLevel).toBeGreaterThan(0);
  });

  it('8. Study Planner: create personal task and toggle completion', async () => {
    const createRes = await request(app)
      .post('/api/v1/planner/tasks')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Master Calculus King Property',
        subjectCode: 'MATHEMATICS',
        dueDate: new Date().toISOString(),
        estimatedMinutes: 60,
        priority: 'HIGH',
      });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body.data.id;

    // Toggle complete
    const toggleRes = await request(app)
      .patch(`/api/v1/planner/tasks/${taskId}/toggle`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.isCompleted).toBe(true);
  });

  it('9. Student Analytics Dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overview');
    expect(res.body.data).toHaveProperty('subjectBreakdown');
    expect(res.body.data.subjectBreakdown.length).toBe(4);
  });

  it('10. Admin Access Control: Student is blocked from Admin endpoints', async () => {
    const blockedRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(blockedRes.status).toBe(403);

    // Admin has access
    const adminRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data).toHaveProperty('totalStudents');
  });
});

