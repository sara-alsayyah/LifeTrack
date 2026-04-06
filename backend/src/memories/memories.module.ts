import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Memory, MemorySchema } from './schemas/memory.shcema';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Memory.name, schema: MemorySchema }])],
  providers: [MemoriesService],
  controllers: [MemoriesController],
})
export class MemoriesModule {}