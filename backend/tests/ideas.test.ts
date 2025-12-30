import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestUser, createTestIdea, cleanupDatabase, TestUser } from './helpers/testUtils.js';

describe('Idea API Endpoints', () => {
  let testUser: TestUser;
  let otherUser: TestUser;

  beforeAll(async () => {
    await cleanupDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    testUser = await createTestUser('testuser', 'test@example.com');
    otherUser = await createTestUser('otheruser', 'other@example.com');
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/ideas', () => {
    it('should create a new idea when authenticated', async () => {
      const ideaData = {
        heading: 'My New Idea',
        description: 'This is a great idea that will change the world',
        status: 'DRAFT',
      };

      const response = await request(app)
        .post('/api/v1/ideas')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(ideaData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.idea).toMatchObject({
        heading: ideaData.heading,
        description: ideaData.description,
        status: ideaData.status,
        userId: testUser.id,
        upvotesCount: 0,
        downvotesCount: 0,
        commentsCount: 0,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const ideaData = {
        heading: 'My New Idea',
        description: 'This is a great idea',
      };

      await request(app).post('/api/v1/ideas').send(ideaData).expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ideas')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ heading: 'Only heading' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create idea with launched status and link', async () => {
      const ideaData = {
        heading: 'Launched Product',
        description: 'This product is live!',
        status: 'LAUNCHED',
        launchedLink: 'https://example.com',
      };

      const response = await request(app)
        .post('/api/v1/ideas')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(ideaData)
        .expect(201);

      expect(response.body.data.idea.launchedLink).toBe(ideaData.launchedLink);
    });
  });

  describe('GET /api/v1/ideas', () => {
    beforeEach(async () => {
      // Create test ideas with different timestamps and vote counts
      const now = Date.now();

      // New idea (recent)
      await createTestIdea(testUser.id, {
        heading: 'New Idea',
        description: 'Very recent idea',
      });

      // Trending idea (recent with upvotes)
      const trendingIdea = await createTestIdea(testUser.id, {
        heading: 'Trending Idea',
        description: 'Recent idea with votes',
      });
      await prisma.idea.update({
        where: { id: trendingIdea.id },
        data: { createdAt: new Date(now - 1000 * 60 * 60) }, // 1 hour ago
      });
      // Create actual vote records for trending logic (each user can only vote once)
      await prisma.vote.create({
        data: {
          userId: testUser.id,
          ideaId: trendingIdea.id,
          voteType: 'UPVOTE',
        },
      });
      await prisma.vote.create({
        data: {
          userId: otherUser.id,
          ideaId: trendingIdea.id,
          voteType: 'UPVOTE',
        },
      });
      // Update vote counts to reflect the votes
      await prisma.idea.update({
        where: { id: trendingIdea.id },
        data: { upvotesCount: 2 },
      });

      // Top idea (older with many upvotes)
      const topIdea = await createTestIdea(otherUser.id, {
        heading: 'Top Idea',
        description: 'Popular idea',
      });
      await prisma.idea.update({
        where: { id: topIdea.id },
        data: { upvotesCount: 50, createdAt: new Date(now - 1000 * 60 * 60 * 48) }, // 2 days ago
      });

      // Old idea (no votes)
      await prisma.idea.create({
        data: {
          userId: otherUser.id,
          heading: 'Old Idea',
          description: 'Old idea without votes',
          upvotesCount: 0,
          createdAt: new Date(now - 1000 * 60 * 60 * 72), // 3 days ago
        },
      });
    });

    it('should get ideas with NEW timeline', async () => {
      const response = await request(app).get('/api/v1/ideas?timeline=new').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ideas).toHaveLength(4);
      expect(response.body.data.ideas[0].heading).toBe('New Idea');
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 4,
      });
    });

    it('should get ideas with TRENDING timeline', async () => {
      const response = await request(app).get('/api/v1/ideas?timeline=trending').expect(200);

      expect(response.body.success).toBe(true);
      // Should only include ideas from last 24 hours
      const trendingIdeas = response.body.data.ideas;
      expect(trendingIdeas.length).toBeGreaterThan(0);
      expect(trendingIdeas[0].heading).toBe('Trending Idea');
    });

    it('should get ideas with TOP timeline', async () => {
      const response = await request(app).get('/api/v1/ideas?timeline=top').expect(200);
      expect(response.body.success).toBe(true);
      const ideas = response.body.data.ideas;
      expect(ideas[0].heading).toBe('Top Idea');
      expect(ideas[0].upvotesCount).toBe(50);
    });

    it('should return 400 for invalid timeline', async () => {
      const response = await request(app).get('/api/v1/ideas?timeline=invalid').expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/ideas?timeline=new&page=1&limit=2')
        .expect(200);

      expect(response.body.data.ideas).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 4,
        total_pages: 2,
      });
    });
  });

  describe('GET /api/v1/ideas/:id', () => {
    it('should get a single idea by id', async () => {
      const idea = await createTestIdea(testUser.id, {
        heading: 'Specific Idea',
        description: 'Detailed description',
      });

      const response = await request(app).get(`/api/v1/ideas/${idea.id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.idea).toMatchObject({
        id: idea.id,
        heading: 'Specific Idea',
        description: 'Detailed description',
        user: {
          username: testUser.username,
        },
      });
    });

    it('should return 404 for non-existent idea', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app).get(`/api/v1/ideas/${fakeId}`).expect(404);
    });

    it('should include user vote when authenticated', async () => {
      const idea = await createTestIdea(testUser.id);

      // Create a vote
      await prisma.vote.create({
        data: {
          userId: testUser.id,
          ideaId: idea.id,
          voteType: 'UPVOTE',
        },
      });

      const response = await request(app)
        .get(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.data.idea.userVote).toBe('upvote');
    });
  });

  describe('PATCH /api/v1/ideas/:id', () => {
    it('should update own idea', async () => {
      const idea = await createTestIdea(testUser.id, {
        heading: 'Original Heading',
        description: 'Original description',
      });

      const updates = {
        heading: 'Updated Heading',
        description: 'Updated description',
        status: 'VALIDATED',
      };

      const response = await request(app)
        .patch(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.idea).toMatchObject(updates);
    });

    it('should not update other user\'s idea', async () => {
      const idea = await createTestIdea(otherUser.id);

      const updates = {
        heading: 'Hacked Heading',
      };

      await request(app)
        .patch(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updates)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      const idea = await createTestIdea(testUser.id);

      await request(app).patch(`/api/v1/ideas/${idea.id}`).send({ heading: 'New' }).expect(401);
    });

    it('should update launched link', async () => {
      const idea = await createTestIdea(testUser.id);

      const updates = {
        status: 'LAUNCHED',
        launchedLink: 'https://my-product.com',
      };

      const response = await request(app)
        .patch(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updates)
        .expect(200);

      expect(response.body.data.idea.launchedLink).toBe(updates.launchedLink);
    });
  });

  describe('DELETE /api/v1/ideas/:id', () => {
    it('should delete own idea', async () => {
      const idea = await createTestIdea(testUser.id);

      await request(app)
        .delete(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(204);

      const deletedIdea = await prisma.idea.findUnique({
        where: { id: idea.id },
      });

      expect(deletedIdea).toBeNull();
    });

    it('should not delete other user\'s idea', async () => {
      const idea = await createTestIdea(otherUser.id);

      await request(app)
        .delete(`/api/v1/ideas/${idea.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(403);

      const stillExists = await prisma.idea.findUnique({
        where: { id: idea.id },
      });

      expect(stillExists).not.toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const idea = await createTestIdea(testUser.id);

      await request(app).delete(`/api/v1/ideas/${idea.id}`).expect(401);
    });

    it('should return 404 for non-existent idea', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .delete(`/api/v1/ideas/${fakeId}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/users/:username/ideas', () => {
    beforeEach(async () => {
      await createTestIdea(testUser.id, { heading: 'User Idea 1' });
      await createTestIdea(testUser.id, { heading: 'User Idea 2' });
      await createTestIdea(otherUser.id, { heading: 'Other User Idea' });
    });

    it('should get all ideas by a specific user', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.username}/ideas`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ideas).toHaveLength(2);
      expect(response.body.data.ideas.every((idea: any) => idea.userId === testUser.id)).toBe(
        true
      );
    });

    it('should return 404 for non-existent user', async () => {
      await request(app).get('/api/v1/users/nonexistentuser/ideas').expect(404);
    });

    it('should support sorting by newest', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.username}/ideas?sort=newest`)
        .expect(200);

      const ideas = response.body.data.ideas;
      expect(ideas[0].heading).toBe('User Idea 2');
    });

    it('should support sorting by popular', async () => {
      const idea = await prisma.idea.findFirst({
        where: { userId: testUser.id, heading: 'User Idea 1' },
      });

      await prisma.idea.update({
        where: { id: idea!.id },
        data: { upvotesCount: 10 },
      });

      const response = await request(app)
        .get(`/api/v1/users/${testUser.username}/ideas?sort=popular`)
        .expect(200);

      const ideas = response.body.data.ideas;
      expect(ideas[0].heading).toBe('User Idea 1');
      expect(ideas[0].upvotesCount).toBe(10);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.username}/ideas?page=1&limit=1`)
        .expect(200);

      expect(response.body.data.ideas).toHaveLength(1);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        total_pages: 2,
      });
    });
  });
});
