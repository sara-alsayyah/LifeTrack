import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getOverview() {
    return {
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
  }
}
