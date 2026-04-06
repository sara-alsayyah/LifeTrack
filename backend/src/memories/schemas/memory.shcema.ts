import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemoryDocument = Memory & Document;

@Schema({ timestamps: true })
export class Memory {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ enum: ['happy', 'stressed', 'reflective', 'calm'], default: 'calm' })
  mood!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: '' })
  location!: string;

  @Prop({ default: '' })
  highlight!: string;

  @Prop({ default: '' })
  coverImage!: string;

  @Prop({ default: 'coast' })
  accent!: string;

  @Prop({ default: false })
  isPrivate!: boolean;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);
