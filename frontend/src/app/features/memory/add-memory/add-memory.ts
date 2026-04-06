import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, MemoryDraft, MemoryMood } from '../../../core/services/api';

@Component({
  selector: 'app-add-memory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-memory.html',
  styleUrl: './add-memory.css',
})
export class AddMemory {
  private readonly api = inject(Api);

  readonly draft = signal<MemoryDraft>({
    title: '',
    description: '',
    date: '2026-04-07',
    mood: 'happy',
    tags: [],
    location: '',
  });
  readonly isSaving = signal(false);
  readonly saveState = signal<'idle' | 'success' | 'error'>('idle');
  readonly errorMessage = signal('');

  updateField<K extends keyof MemoryDraft>(field: K, value: MemoryDraft[K]): void {
    this.draft.update((draft) => ({
      ...draft,
      [field]: value,
    }));
  }

  updateTags(value: string): void {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    this.updateField('tags', tags);
  }

  async submit(): Promise<void> {
    const draft = this.draft();
    if (!draft.title.trim() || !draft.description.trim() || !draft.date) {
      this.saveState.set('error');
      this.errorMessage.set('Title, description, and date are required.');
      return;
    }

    this.isSaving.set(true);
    this.saveState.set('idle');
    this.errorMessage.set('');

    try {
      await this.api.addMemory({
        ...draft,
        mood: draft.mood as MemoryMood,
      });

      this.draft.set({
        title: '',
        description: '',
        date: '2026-04-07',
        mood: 'happy',
        tags: [],
        location: '',
      });
      this.saveState.set('success');
    } catch (error) {
      this.saveState.set('error');
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to save memory.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
