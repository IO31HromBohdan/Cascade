/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from '@prisma/client';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }
}
