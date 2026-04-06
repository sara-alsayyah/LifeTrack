import { Injectable, computed, signal } from '@angular/core';

export type MemoryMood = 'happy' | 'stressed' | 'reflective' | 'calm';

export interface MemoryEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: MemoryMood;
  moodLabel: string;
  tags: string[];
  location: string;
  highlight: string;
  coverImage: string;
  accent: string;
  isPrivate: boolean;
}

export interface MemoryDraft {
  title: string;
  description: string;
  date: string;
  mood: MemoryMood;
  tags: string[];
  location: string;
}

interface MemoryResponse {
  _id: string;
  title: string;
  description: string;
  date: string;
  mood: MemoryMood;
  tags?: string[];
  location?: string;
  highlight?: string;
  coverImage?: string;
  accent?: string;
  isPrivate?: boolean;
}

export interface AnalyticsPoint {
  month: string;
  happy: number;
  stressed: number;
  calm: number;
}

export interface AnalyticsOverview {
  moodTrend: AnalyticsPoint[];
  highlights: string[];
  summary: {
    emotionalBalance: number;
    topTheme: string;
    privateMemories: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly fallbackAnalytics: AnalyticsOverview = {
    moodTrend: [
      { month: 'Jan', happy: 38, stressed: 18, calm: 26 },
      { month: 'Feb', happy: 46, stressed: 12, calm: 31 },
      { month: 'Mar', happy: 34, stressed: 29, calm: 28 },
      { month: 'Apr', happy: 58, stressed: 21, calm: 34 },
      { month: 'May', happy: 42, stressed: 37, calm: 24 },
      { month: 'Jun', happy: 67, stressed: 31, calm: 41 },
    ],
    highlights: [
      'Travel memories show the highest emotional positivity.',
      'Stress spikes are mostly grouped around study and work periods.',
      'Reflective and calm events often happen in nature-focused memories.',
    ],
    summary: {
      emotionalBalance: 78,
      topTheme: 'Study',
      privateMemories: 2,
    },
  };

  private readonly fallbackMemories: MemoryEntry[] = [
    {
      id: 'seed-1',
      title: 'Graduation Day',
      description: 'A soft proud moment that felt like the beginning of a more beautiful chapter.',
      date: '2025-04-10',
      mood: 'happy',
      moodLabel: 'Hopeful start',
      tags: ['Study', 'Milestone'],
      location: 'Beirut',
      highlight: 'Confidence slowly grew as the day became gentler.',
      coverImage: '/images/graduation.png',
      accent: 'sunrise',
      isPrivate: false,
    },
    {
      id: 'seed-2',
      title: 'Birthday Glow',
      description: 'A light happy day full of soft colors, warm wishes, and pretty details.',
      date: '2025-07-15',
      mood: 'happy',
      moodLabel: 'Deeply relaxed',
      tags: ['Celebration', 'Joy'],
      location: 'Home',
      highlight: 'Soft joyful moments keep returning with a gentle warmth.',
      coverImage: '/images/myBirthday.png',
      accent: 'coast',
      isPrivate: false,
    },
    {
      id: 'seed-3',
      title: 'Young Me',
      description: 'A reflective memory that carries innocence, softness, and quiet nostalgia.',
      date: '2025-10-02',
      mood: 'reflective',
      moodLabel: 'Inner clarity',
      tags: ['Reflection', 'Childhood'],
      location: 'Family album',
      highlight: 'Stillness and wide open skies seem to calm your thoughts quickly.',
      coverImage: '/images/YoungMe.png',
      accent: 'forest',
      isPrivate: false,
    },
    {
      id: 'seed-4',
      title: 'Best Friend',
      description: 'A warm memory of closeness, laughter, and feeling understood without effort.',
      date: '2025-09-03',
      mood: 'calm',
      moodLabel: 'Soft recovery',
      tags: ['Friendship', 'Love'],
      location: 'City walk',
      highlight: 'Gentle company helps your emotions settle into comfort.',
      coverImage: '/images/BestFriend.png',
      accent: 'coast',
      isPrivate: false,
    },
    {
      id: 'seed-5',
      title: 'Quiet Comfort',
      description: 'A tiny peaceful moment that made the whole day feel softer and more alive.',
      date: '2025-11-11',
      mood: 'calm',
      moodLabel: 'Soft recovery',
      tags: ['Calm', 'Home'],
      location: 'Evening',
      highlight: 'Small comforting details bring your mood back to rest.',
      coverImage: '/images/cat.png',
      accent: 'forest',
      isPrivate: false,
    },
  ];

  private readonly memoriesState = signal<MemoryEntry[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly usingFallback = signal(false);
  readonly analyticsState = signal<AnalyticsOverview>(this.fallbackAnalytics);

  readonly memories = computed(() =>
    [...this.memoriesState()].sort((left, right) => right.date.localeCompare(left.date)),
  );

  readonly availableTags = computed(() => {
    const tags = new Set(this.memories().flatMap((memory) => memory.tags));
    return [...tags].sort((left, right) => left.localeCompare(right));
  });

  readonly analytics = computed(() => this.analyticsState());

  async loadMemories(): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      const response = await fetch(`${this.baseUrl}/memories`);
      if (!response.ok) {
        throw new Error('Unable to load memories');
      }

      const memories = (await response.json()) as MemoryResponse[];
      this.memoriesState.set(memories.map((memory) => this.mapMemory(memory)));
      this.usingFallback.set(false);
    } catch {
      this.memoriesState.set(this.fallbackMemories);
      this.usingFallback.set(true);
      this.error.set('API unavailable. Showing local demo memories until the backend is running.');
    } finally {
      this.isLoading.set(false);
    }
  }

  addMemory(draft: MemoryDraft): Promise<void> {
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      date: draft.date,
      mood: draft.mood,
      tags: draft.tags.filter(Boolean),
      location: draft.location.trim() || 'Personal space',
      highlight: this.resolveHighlight(draft.mood),
      coverImage: this.resolveCoverImage(draft.mood),
      accent: this.resolveAccent(draft.mood),
      isPrivate: false,
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Unable to save memory. Check that the backend is running.');
          }

          const memory = (await response.json()) as MemoryResponse;
          this.memoriesState.update((memories) => [this.mapMemory(memory), ...memories]);
          this.usingFallback.set(false);
          resolve();
        })
        .catch(() => {
          reject(new Error('Unable to save memory. Check that the backend is running.'));
        });
    });
  }

  deleteMemory(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Unable to delete memory right now.');
          }

          this.memoriesState.update((memories) => memories.filter((memory) => memory.id !== id));
          resolve();
        })
        .catch(() => reject(new Error('Unable to delete memory right now.')));
    });
  }

  async loadAnalyticsOverview(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/overview`);
      if (!response.ok) {
        throw new Error('Unable to load analytics overview.');
      }

      const overview = (await response.json()) as AnalyticsOverview;
      this.analyticsState.set(overview);
    } catch {
      this.analyticsState.set(this.fallbackAnalytics);
    }
  }

  private mapMemory(memory: MemoryResponse): MemoryEntry {
    return {
      id: memory._id,
      title: memory.title,
      description: memory.description,
      date: new Date(memory.date).toISOString().slice(0, 10),
      mood: memory.mood,
      moodLabel: this.resolveMoodLabel(memory.mood),
      tags: memory.tags ?? [],
      location: memory.location ?? 'Personal space',
      highlight: memory.highlight ?? this.resolveHighlight(memory.mood),
      coverImage: memory.coverImage ?? this.resolveCoverImage(memory.mood),
      accent: memory.accent ?? this.resolveAccent(memory.mood),
      isPrivate: memory.isPrivate ?? false,
    };
  }

  private resolveMoodLabel(mood: MemoryMood): string {
    switch (mood) {
      case 'happy':
        return 'Bright moment';
      case 'stressed':
        return 'Pressure point';
      case 'reflective':
        return 'Inner clarity';
      case 'calm':
        return 'Soft recovery';
    }
  }

  private resolveHighlight(mood: MemoryMood): string {
    switch (mood) {
      case 'happy':
        return 'Positive energy stands out strongly in this memory.';
      case 'stressed':
        return 'Stress intensity is elevated around this event.';
      case 'reflective':
        return 'Reflection and self-awareness are central here.';
      case 'calm':
        return 'This memory supports your sense of peace and balance.';
    }
  }

  private resolveCoverImage(mood: MemoryMood): string {
    switch (mood) {
      case 'happy':
        return '/images/graduation.png';
      case 'stressed':
        return '/images/myBirthday.png';
      case 'reflective':
        return '/images/YoungMe.png';
      case 'calm':
        return '/images/BestFriend.png';
    }
  }

  private resolveAccent(mood: MemoryMood): string {
    switch (mood) {
      case 'happy':
        return 'sunrise';
      case 'stressed':
        return 'ember';
      case 'reflective':
        return 'forest';
      case 'calm':
        return 'coast';
    }
  }
}
