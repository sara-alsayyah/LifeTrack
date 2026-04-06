import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/services/api';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {
  private readonly api = inject(Api);

  readonly overview = this.api.analytics;
  readonly strongestMonth = computed(() =>
    [...this.overview().moodTrend].sort((left, right) => right.happy - left.happy)[0],
  );
  readonly calmAverage = computed(() => {
    const points = this.overview().moodTrend;
    const total = points.reduce((sum, point) => sum + point.calm, 0);
    return Math.round(total / Math.max(points.length, 1));
  });

  constructor() {
    this.api.loadAnalyticsOverview();
  }
}
