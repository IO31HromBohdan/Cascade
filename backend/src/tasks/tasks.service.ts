/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTasksDto): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (query.date) {
      where.scheduledDate = query.date;
    } else if (query.from || query.to) {
      where.scheduledDate = {};
      if (query.from) {
        (where.scheduledDate as Prisma.StringFilter).gte = query.from;
      }
      if (query.to) {
        (where.scheduledDate as Prisma.StringFilter).lte = query.to;
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const now = new Date();
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        scheduledDate: dto.scheduledDate,
        dueDate: dto.dueDate,
        priority: dto.priority,
        status: dto.status ?? 'planned',
        tagIds: dto.tagIds ?? [],
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.ensureExists(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Task not found');
    }
  }
}
