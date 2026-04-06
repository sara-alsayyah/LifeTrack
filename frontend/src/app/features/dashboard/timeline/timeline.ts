import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Api,
  MemoryDraft,
  MemoryEntry,
  MemoryMood,
} from '../../../core/services/api';

interface TimelineGroup {
  label: string;
  count: number;
  memories: MemoryEntry[];
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline {
  private readonly api = inject(Api);

  readonly searchTerm = signal('');
  readonly selectedMood = signal<'all' | MemoryMood>('all');
  readonly selectedTag = signal('all');
  readonly selectedRange = signal<'all' | '90' | '180' | '365'>('180');
  readonly privacyMode = signal(true);
  readonly sensitiveLock = signal(false);
  readonly showComposer = signal(false);
  readonly selectedMemory = signal<MemoryEntry | null>(null);
  readonly saveError = signal('');
  readonly deleteError = signal('');
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);

  readonly draft = signal<MemoryDraft>({
    title: '',
    description: '',
    date: '2026-04-05',
    mood: 'happy',
    tags: [],
    location: '',
  });

  readonly memories = this.api.memories;
  readonly availableTags = this.api.availableTags;
  readonly isLoading = this.api.isLoading;
  readonly loadError = this.api.error;
  readonly usingFallback = this.api.usingFallback;

  readonly filteredMemories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const mood = this.selectedMood();
    const tag = this.selectedTag();
    const range = this.selectedRange();
    const cutoffDays = range === 'all' ? Infinity : Number(range);
    const referenceDate = new Date('2026-04-05T00:00:00');

    return this.memories().filter((memory) => {
      const memoryDate = new Date(memory.date);
      const dayDelta =
        (referenceDate.getTime() - memoryDate.getTime()) / (1000 * 60 * 60 * 24);
      const matchesRange = dayDelta <= cutoffDays;
      const matchesMood = mood === 'all' || memory.mood === mood;
      const matchesTag = tag === 'all' || memory.tags.includes(tag);
      const matchesSearch =
        term.length === 0 ||
        `${memory.title} ${memory.description} ${memory.location} ${memory.tags.join(' ')}`
          .toLowerCase()
          .includes(term);
      const matchesPrivacy = !this.privacyMode() || !memory.isPrivate;

      return matchesRange && matchesMood && matchesTag && matchesSearch && matchesPrivacy;
    });
  });

  readonly groupedMemories = computed<TimelineGroup[]>(() => {
    const grouped = new Map<string, MemoryEntry[]>();

    this.filteredMemories().forEach((memory) => {
      const key = this.formatMonth(memory.date);
      const bucket = grouped.get(key) ?? [];
      bucket.push(memory);
      grouped.set(key, bucket);
    });

    return [...grouped.entries()].map(([label, memories]) => ({
      label,
      count: memories.length,
      memories,
    }));
  });

  readonly moodSeries = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const happy = [38, 46, 34, 58, 42, 67];
    const stressed = [18, 12, 29, 21, 37, 31];
    const calm = [26, 31, 28, 34, 24, 41];

    return {
      months,
      happy,
      stressed,
      calm,
      happyPath: this.buildLinePath(happy),
      stressedPath: this.buildLinePath(stressed),
      calmPath: this.buildLinePath(calm),
    };
  });

  readonly topInsight = computed(() => {
    const total = Math.max(this.memories().length, 1);
    const travelMemories = this.memories().filter((memory) => memory.tags.includes('Travel'));
    const studyStress = this.memories().filter(
      (memory) => memory.tags.includes('Study') && memory.mood === 'stressed',
    );

    return {
      happyTravelShare: Math.round((travelMemories.length / total) * 100),
      studyStressShare: Math.round((studyStress.length / total) * 100),
    };
  });

  readonly statCards = computed(() => {
    const memories = this.memories();
    const total = Math.max(memories.length, 1);
    const positive = memories.filter(
      (memory) => memory.mood === 'happy' || memory.mood === 'calm',
    ).length;
    const privateCount = memories.filter((memory) => memory.isPrivate).length;
    const tagCounts = new Map<string, number>();

    memories.forEach((memory) => {
      memory.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    const topTheme =
      [...tagCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Personal';

    return [
      {
        title: 'Emotional Balance',
        value: `${Math.round((positive / total) * 100)}%`,
        note: 'Share of memories that feel positive or restorative.',
      },
      {
        title: 'Most Active Theme',
        value: topTheme,
        note: 'The most recurring theme across your current timeline.',
      },
      {
        title: 'Private Memories',
        value: `${privateCount}`,
        note: 'Sensitive moments currently marked private.',
      },
    ];
  });

  constructor() {
    this.api.loadMemories();
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateMood(value: string): void {
    this.selectedMood.set(value as 'all' | MemoryMood);
  }

  updateTag(value: string): void {
    this.selectedTag.set(value);
  }

  updateRange(value: string): void {
    this.selectedRange.set(value as 'all' | '90' | '180' | '365');
  }

  toggleComposer(): void {
    this.showComposer.update((state) => !state);
    this.saveError.set('');
  }

  togglePrivacy(): void {
    this.privacyMode.update((state) => !state);
  }

  toggleSensitiveLock(): void {
    this.sensitiveLock.update((state) => !state);
  }

  updateDraft<K extends keyof MemoryDraft>(field: K, value: MemoryDraft[K]): void {
    this.draft.update((draft) => ({
      ...draft,
      [field]: value,
    }));
  }

  async saveMemory(): Promise<void> {
    const draft = this.draft();
    if (!draft.title.trim() || !draft.description.trim() || !draft.date) {
      this.saveError.set('Please fill in the title, description, and date before saving.');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    try {
      await this.api.addMemory({
        ...draft,
        tags: draft.tags.length ? draft.tags : ['Personal'],
      });

      this.draft.set({
        title: '',
        description: '',
        date: '2026-04-05',
        mood: 'happy',
        tags: [],
        location: '',
      });
      this.showComposer.set(false);
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'Unable to save memory.');
    } finally {
      this.isSaving.set(false);
    }
  }

  openMemory(memory: MemoryEntry): void {
    this.selectedMemory.set(memory);
    this.deleteError.set('');
  }

  closeMemory(): void {
    this.selectedMemory.set(null);
    this.deleteError.set('');
  }

  async deleteSelectedMemory(): Promise<void> {
    const memory = this.selectedMemory();
    if (!memory) {
      return;
    }

    if (memory.id.startsWith('seed-')) {
      this.deleteError.set('Demo memories can only be removed after the backend is connected.');
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set('');

    try {
      await this.api.deleteMemory(memory.id);
      this.selectedMemory.set(null);
    } catch (error) {
      this.deleteError.set(error instanceof Error ? error.message : 'Unable to delete memory.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  reloadMemories(): void {
    this.api.loadMemories();
  }

  trackGroup(_: number, group: TimelineGroup): string {
    return group.label;
  }

  trackMemory(_: number, memory: MemoryEntry): string {
    return memory.id;
  }

  parseTags(rawValue: string): void {
    const tags = rawValue
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    this.updateDraft('tags', tags);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatMonth(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  }

  private buildLinePath(points: number[]): string {
    return points
      .map((point, index) => {
        const x = index * 62 + 12;
        const y = 90 - point;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }
}
