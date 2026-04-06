import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory, MemoryDocument } from './schemas/memory.shcema';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';

@Injectable()
export class MemoriesService {
  constructor(@InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>) {}

  async create(memory: CreateMemoryDto): Promise<Memory> {
    const newMemory = new this.memoryModel({
      ...memory,
      date: new Date(memory.date),
      tags: memory.tags ?? [],
      location: memory.location ?? '',
      highlight: memory.highlight ?? '',
      coverImage: memory.coverImage ?? '',
      accent: memory.accent ?? 'coast',
      isPrivate: memory.isPrivate ?? false,
    });
    return newMemory.save();
  }

  async findAll(): Promise<Memory[]> {
    return this.memoryModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<Memory> {
    const memory = await this.memoryModel.findById(id).exec();
    if (!memory) {
      throw new NotFoundException(`Memory ${id} not found`);
    }
    return memory;
  }

  async update(id: string, memory: UpdateMemoryDto): Promise<Memory> {
    const updatedMemory = await this.memoryModel
      .findByIdAndUpdate(
        id,
        {
          ...memory,
          ...(memory.date ? { date: new Date(memory.date) } : {}),
        },
        { new: true },
      )
      .exec();

    if (!updatedMemory) {
      throw new NotFoundException(`Memory ${id} not found`);
    }

    return updatedMemory;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const deletedMemory = await this.memoryModel.findByIdAndDelete(id).exec();
    if (!deletedMemory) {
      throw new NotFoundException(`Memory ${id} not found`);
    }

    return { deleted: true, id };
  }
}
