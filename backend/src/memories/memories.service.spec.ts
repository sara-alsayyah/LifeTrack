import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MemoriesService } from './memories.service';
import { Memory } from './schemas/memory.shcema';

describe('MemoriesService', () => {
  let service: MemoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoriesService,
        {
          provide: getModelToken(Memory.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MemoriesService>(MemoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
