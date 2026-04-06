import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'LifeTrack API',
      status: 'online',
      endpoints: ['/memories', '/analytics/overview', '/auth/login', '/auth/register'],
    };
  }
}
