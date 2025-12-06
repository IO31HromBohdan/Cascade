import { TasksService } from './tasks.service';
import { type CreateTaskDto } from './dto/create-task.dto';
import { type UpdateTaskDto } from './dto/update-task.dto';
import { type QueryTasksDto } from './dto/query-tasks.dto';
import type { PrismaService } from '../prisma/prisma.service';
import type { Prisma, Task, Tag } from '@prisma/client';

type PrismaTxLike = {
  task: {
    create: jest.Mock<Promise<Task>, [unknown]>;
    update: jest.Mock<Promise<Task>, [unknown]>;
    findMany: jest.Mock<Promise<Task[]>, [unknown]>;
    findUnique: jest.Mock<Promise<Task | null>, [unknown]>;
    delete: jest.Mock<Promise<Task>, [unknown]>;
  };
  tag: {
    findMany: jest.Mock<Promise<Tag[]>, [unknown]>;
  };
  taskTag: {
    createMany: jest.Mock<Promise<Prisma.BatchPayload>, [unknown]>;
    deleteMany: jest.Mock<Promise<Prisma.BatchPayload>, [unknown]>;
  };
  $transaction: <T>(fn: (tx: PrismaTxLike) => Promise<T>) => Promise<T>;
};

function createPrismaMock(): PrismaTxLike {
  const prisma: PrismaTxLike = {
    $transaction: jest.fn(),
    task: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
    taskTag: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  (prisma.$transaction as jest.Mock).mockImplementation(
    async <T>(fn: (tx: PrismaTxLike) => Promise<T>): Promise<T> => fn(prisma),
  );

  return prisma;
}

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id ?? 't1',
  title: overrides.title ?? 'A',
  description: overrides.description ?? null,
  status: overrides.status ?? 'planned',
  priority: overrides.priority ?? 'low',
  scheduledDate: overrides.scheduledDate ?? '2025-12-01',
  dueDate: overrides.dueDate ?? null,
  tagIds: overrides.tagIds ?? [],
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
  userId: overrides.userId ?? null,
});

describe('TasksService (unit)', () => {
  let service: TasksService;
  let prisma: PrismaTxLike;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createPrismaMock();
    service = new TasksService(prisma as unknown as PrismaService);
  });

  it('create: створює задачу без тегів (порожній масив)', async () => {
    const dto: CreateTaskDto = {
      title: 'Test task',
      description: 'Desc',
      priority: 'medium',
      scheduledDate: '2025-12-01',
      tagIds: [],
    };

    const created = makeTask({
      id: 'task-1',
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      scheduledDate: dto.scheduledDate,
      tagIds: [],
    });

    prisma.task.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(prisma.tag.findMany).not.toHaveBeenCalled();
    expect(prisma.taskTag.createMany).not.toHaveBeenCalled();

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: dto.title,
        description: dto.description ?? null,
        status: 'planned',
        priority: dto.priority,
        scheduledDate: dto.scheduledDate,
        tagIds: [],
      }),
    });

    expect(result.id).toBe('task-1');
  });

  it('create: створює задачу без тегів (tagIds відсутній)', async () => {
    const dto = {
      title: 'No tags field',
      description: 'Desc',
      priority: 'medium',
      scheduledDate: '2025-12-01',
    } as CreateTaskDto;

    const created = makeTask({
      id: 'task-nt',
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      scheduledDate: dto.scheduledDate,
      tagIds: [],
    });

    prisma.task.create.mockResolvedValue(created);

    await service.create(dto);

    expect(prisma.tag.findMany).not.toHaveBeenCalled();
    expect(prisma.taskTag.createMany).not.toHaveBeenCalled();

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tagIds: [],
      }),
    });
  });

  it('create: створює задачу з тегами та створює звʼязки', async () => {
    const dto: CreateTaskDto = {
      title: 'Task with tags',
      description: 'Desc',
      priority: 'high',
      scheduledDate: '2025-12-01',
      tagIds: ['work', 'study'],
    };

    const tags: Tag[] = [
      {
        id: 'tag-1',
        key: 'work',
        name: 'Робота',
        color: '#111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tag-2',
        key: 'study',
        name: 'Навчання',
        color: '#222',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.tag.findMany.mockResolvedValue(tags);

    const created = makeTask({
      id: 'task-2',
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      scheduledDate: dto.scheduledDate,
      tagIds: dto.tagIds,
    });

    prisma.task.create.mockResolvedValue(created);
    prisma.taskTag.createMany.mockResolvedValue({ count: 2 });

    await service.create(dto);

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: { key: { in: dto.tagIds } },
    });

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: dto.title,
        description: dto.description ?? null,
        status: 'planned',
        priority: dto.priority,
        scheduledDate: dto.scheduledDate,
        tagIds: dto.tagIds,
      }),
    });

    expect(prisma.taskTag.createMany).toHaveBeenCalledWith({
      data: tags.map(t => ({ taskId: 'task-2', tagId: t.id })),
      skipDuplicates: true,
    });
  });

  it('update: кидає NotFoundException з повідомленням, якщо задачі не існує', async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    const dto: UpdateTaskDto = { title: 'x' };

    await expect(service.update('missing-id', dto)).rejects.toThrow('id=missing-id');
    expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 'missing-id' } });
  });

  it('update: оновлює частково, зберігає попередні значення (перевірка ??)', async () => {
    const existing = makeTask({
      id: 'u1',
      title: 'OLD',
      description: 'OLD_DESC',
      status: 'planned',
      priority: 'low',
      scheduledDate: '2025-12-01',
      dueDate: null,
      tagIds: ['old'],
    });

    prisma.task.findUnique.mockResolvedValue(existing);

    const dto: UpdateTaskDto = {
      status: 'done',
      tagIds: ['work'],
      // title/description/priority/scheduledDate/dueDate навмисно відсутні
    };

    const tags: Tag[] = [
      {
        id: 'tag-1',
        key: 'work',
        name: 'Робота',
        color: '#111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.taskTag.deleteMany.mockResolvedValue({ count: 1 });
    prisma.tag.findMany.mockResolvedValue(tags);
    prisma.taskTag.createMany.mockResolvedValue({ count: 1 });

    const updated = makeTask({
      ...existing,
      status: 'done',
      tagIds: ['work'],
    });

    prisma.task.update.mockResolvedValue(updated);

    const res = await service.update('u1', dto);

    expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });

    expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({ where: { taskId: 'u1' } });
    expect(prisma.tag.findMany).toHaveBeenCalledWith({ where: { key: { in: ['work'] } } });

    expect(prisma.taskTag.createMany).toHaveBeenCalledWith({
      data: [{ taskId: 'u1', tagId: 'tag-1' }],
      skipDuplicates: true,
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {
        title: 'OLD',
        description: 'OLD_DESC',
        status: 'done',
        priority: 'low',
        scheduledDate: '2025-12-01',
        dueDate: null,
        tagIds: ['work'],
      },
    });

    expect(res.status).toBe('done');
  });

  it('update: обробляє tagIds як порожній масив (видаляє звʼязки, не створює нові)', async () => {
    const existing = makeTask({ id: 'u2', tagIds: ['x'] });
    prisma.task.findUnique.mockResolvedValue(existing);

    const dto: UpdateTaskDto = { tagIds: [] };

    prisma.taskTag.deleteMany.mockResolvedValue({ count: 1 });

    const updated = makeTask({ ...existing, tagIds: [] });
    prisma.task.update.mockResolvedValue(updated);

    await service.update('u2', dto);

    expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({ where: { taskId: 'u2' } });
    expect(prisma.tag.findMany).not.toHaveBeenCalled();
    expect(prisma.taskTag.createMany).not.toHaveBeenCalled();

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'u2' },
      data: expect.objectContaining({
        tagIds: [],
      }),
    });
  });

  it('findAll: повертає список та використовує сортування', async () => {
    prisma.task.findMany.mockResolvedValue([makeTask({ id: '1', title: 'A' })]);

    const q: QueryTasksDto = {};
    const res = await service.findAll(q);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(res).toHaveLength(1);
  });

  it('findOne: повертає задачу', async () => {
    prisma.task.findUnique.mockResolvedValue(makeTask({ id: 't1' }));

    const task = await service.findOne('t1');

    expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 't1' } });
    expect(task.id).toBe('t1');
  });

  it('findOne: кидає NotFoundException з повідомленням', async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toThrow('id=nope');
  });

  it('remove: видаляє звʼязки та задачу', async () => {
    prisma.taskTag.deleteMany.mockResolvedValue({ count: 1 });
    prisma.task.delete.mockResolvedValue(makeTask({ id: 'r1' }));

    await service.remove('r1');

    expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({ where: { taskId: 'r1' } });
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });
});
