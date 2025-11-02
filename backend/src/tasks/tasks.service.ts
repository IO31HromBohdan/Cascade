/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, Tag } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from '@/tasks/dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    return this.prisma.$transaction(async tx => {
      const tagKeys: string[] = dto.tagIds ?? [];

      let tags: Tag[] = [];
      if (tagKeys.length > 0) {
        tags = await tx.tag.findMany({
          where: { key: { in: tagKeys } },
        });
      }

      const task = await tx.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status ?? 'planned',
          priority: dto.priority,
          scheduledDate: dto.scheduledDate,
          dueDate: dto.dueDate,
          tagIds: tagKeys,
        },
      });

      if (tags.length > 0) {
        await tx.taskTag.createMany({
          data: tags.map(tag => ({
            taskId: task.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      return task;
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    return this.prisma.$transaction(async tx => {
      const existing = await tx.task.findUnique({ where: { id } });

      if (!existing) {
        throw new NotFoundException(`Task with id=${id} not found`);
      }

      let tagKeys: string[] = existing.tagIds;

      if (dto.tagIds) {
        tagKeys = dto.tagIds;

        await tx.taskTag.deleteMany({ where: { taskId: id } });

        if (dto.tagIds.length > 0) {
          const tags: Tag[] = await tx.tag.findMany({
            where: { key: { in: dto.tagIds } },
          });

          await tx.taskTag.createMany({
            data: tags.map(tag => ({
              taskId: id,
              tagId: tag.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      const updated = await tx.task.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          status: dto.status ?? existing.status,
          priority: dto.priority ?? existing.priority,
          scheduledDate: dto.scheduledDate ?? existing.scheduledDate,
          dueDate: dto.dueDate ?? existing.dueDate,
          tagIds: tagKeys,
        },
      });

      return updated;
    });
  }

  async findAll(_query: QueryTasksDto): Promise<Task[]> {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with id=${id} not found`);
    }

    return task;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await tx.taskTag.deleteMany({
        where: { taskId: id },
      });

      await tx.task.delete({
        where: { id },
      });
    });
  }
}
