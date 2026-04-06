import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfileSummary() {
    return {
      id: 'demo-user',
      fullName: 'LifeTrack User',
      preferredView: 'timeline',
      reminderStyle: 'gentle',
    };
  }
}
