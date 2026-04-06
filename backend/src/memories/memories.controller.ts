import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { Memory } from './schemas/memory.shcema';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';

@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post()
  create(@Body() memory: CreateMemoryDto): Promise<Memory> {
    return this.memoriesService.create(memory);
  }

  @Get()
  findAll(): Promise<Memory[]> {
    return this.memoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Memory> {
    return this.memoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() memory: UpdateMemoryDto): Promise<Memory> {
    return this.memoriesService.update(id, memory);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: true; id: string }> {
    return this.memoriesService.remove(id);
  }
}
