import { Injectable } from '@nestjs/common';

interface AuthPayload {
  fullName?: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  register(payload: AuthPayload) {
    return {
      message: 'Registration flow is ready for database wiring.',
      user: {
        id: 'demo-user',
        fullName: payload.fullName ?? 'LifeTrack User',
        email: payload.email,
      },
    };
  }

  login(payload: AuthPayload) {
    return {
      message: 'Login flow is ready for JWT/session wiring.',
      token: 'demo-token',
      user: {
        id: 'demo-user',
        email: payload.email,
      },
    };
  }

  getSession() {
    return {
      authenticated: false,
      message: 'No persistent auth has been connected yet.',
    };
  }
}
