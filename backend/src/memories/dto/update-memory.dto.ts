import { CreateMemoryDto } from './create-memory.dto';

export class UpdateMemoryDto implements Partial<CreateMemoryDto> {
  title?: string;
  description?: string;
  date?: string;
  mood?: 'happy' | 'stressed' | 'reflective' | 'calm';
  tags?: string[];
  location?: string;
  highlight?: string;
  coverImage?: string;
  accent?: string;
  isPrivate?: boolean;
}
