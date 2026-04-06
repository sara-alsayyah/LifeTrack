import { Routes } from '@angular/router';
import { Analytics } from './features/analytics/analytics/analytics';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Timeline } from './features/dashboard/timeline/timeline';
import { AddMemory } from './features/memory/add-memory/add-memory';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'timeline',
  },
  {
    path: 'timeline',
    component: Timeline,
  },
  {
    path: 'analytics',
    component: Analytics,
  },
  {
    path: 'add-memory',
    component: AddMemory,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
];
