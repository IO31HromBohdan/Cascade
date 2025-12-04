import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('App e2e (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / повертає 200', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
  });

  it('створює та повертає задачу через /tasks', async () => {
    const createDto = {
      title: 'e2e task',
      description: 'from e2e test',
      priority: 'medium',
      scheduledDate: '2025-12-01',
      dueDate: null,
      tagIds: [],
    };

    const res = await request(app.getHttpServer()).post('/tasks').send(createDto).expect(201);

    expect(res.body.id).toBeDefined();

    const listRes = await request(app.getHttpServer()).get('/tasks').expect(200);
    const items = listRes.body as Array<{ id: string }>;
    expect(items.some(t => t.id === res.body.id)).toBe(true);
  });
});
