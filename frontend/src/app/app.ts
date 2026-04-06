import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface BackgroundScene {
  kind: 'image';
  src: string;
}

type SceneMood = 'day' | 'night';
type SceneRoute = 'timeline' | 'analytics' | 'add-memory' | 'auth';

interface SceneCollection {
  day: BackgroundScene[];
  night: BackgroundScene[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly sceneLibrary: Record<SceneRoute, SceneCollection> = {
    timeline: {
      day: [
        { kind: 'image', src: '/images/bg1.png' },
        { kind: 'image', src: '/images/bg2.png' },
        { kind: 'image', src: '/images/bg3.png' },
      ],
      night: [
        { kind: 'image', src: '/images/bg4.png' },
        { kind: 'image', src: '/images/bg5.png' },
        { kind: 'image', src: '/images/bg6.png' },
      ],
    },
    analytics: {
      day: [
        { kind: 'image', src: '/images/bg2.png' },
        { kind: 'image', src: '/images/bg7.png' },
        { kind: 'image', src: '/images/bg3.png' },
      ],
      night: [
        { kind: 'image', src: '/images/bg5.png' },
        { kind: 'image', src: '/images/bg8.png' },
        { kind: 'image', src: '/images/bg4.png' },
      ],
    },
    'add-memory': {
      day: [
        { kind: 'image', src: '/images/bg3.png' },
        { kind: 'image', src: '/images/bg1.png' },
        { kind: 'image', src: '/images/bg7.png' },
      ],
      night: [
        { kind: 'image', src: '/images/bg6.png' },
        { kind: 'image', src: '/images/bg4.png' },
        { kind: 'image', src: '/images/bg8.png' },
      ],
    },
    auth: {
      day: [
        { kind: 'image', src: '/images/bg7.png' },
        { kind: 'image', src: '/images/bg1.png' },
        { kind: 'image', src: '/images/bg2.png' },
      ],
      night: [
        { kind: 'image', src: '/images/bg8.png' },
        { kind: 'image', src: '/images/bg5.png' },
        { kind: 'image', src: '/images/bg6.png' },
      ],
    },
  };

  readonly currentRouteKey = signal<SceneRoute>('timeline');
  readonly currentMood = signal<SceneMood>('day');
  readonly activeSceneIndex = signal(0);
  readonly stagedSceneIndex = signal<number | null>(null);
  readonly isTransitioning = signal(false);
  readonly currentScenes = computed(
    () => this.sceneLibrary[this.currentRouteKey()][this.currentMood()],
  );
  readonly activeScene = computed(() => this.currentScenes()[this.activeSceneIndex()]);
  readonly stagedScene = computed(() => {
    const index = this.stagedSceneIndex();
    return index === null ? null : this.currentScenes()[index];
  });
  readonly overlayClass = computed(
    () => `overlay-${this.currentRouteKey()} overlay-${this.currentMood()}`,
  );

  private rotateTimer: number | null = null;
  private swapTimer: number | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.currentMood.set(this.resolveMood());
    this.applyRouteScene(this.router.url);

    if (!isPlatformBrowser(this.platformId) || !window.matchMedia) {
      return;
    }

    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.applyRouteScene((event as NavigationEnd).urlAfterRedirects);
      });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      return;
    }

    this.rotateTimer = window.setInterval(() => {
      this.currentMood.set(this.resolveMood());
      this.queueNextScene();
    }, 24000);
  }

  ngOnDestroy(): void {
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
    }

    if (this.swapTimer) {
      clearTimeout(this.swapTimer);
    }

    this.routeSubscription?.unsubscribe();
  }

  private queueNextScene(): void {
    if (this.isTransitioning()) {
      return;
    }

    const nextIndex = (this.activeSceneIndex() + 1) % this.currentScenes().length;
    this.stagedSceneIndex.set(nextIndex);
    this.isTransitioning.set(true);

    this.swapTimer = window.setTimeout(() => {
      this.activeSceneIndex.set(nextIndex);
      this.stagedSceneIndex.set(null);
      this.isTransitioning.set(false);
    }, 1800);
  }

  private applyRouteScene(url: string): void {
    const routeKey = this.resolveRouteKey(url);
    const routeChanged = routeKey !== this.currentRouteKey();

    this.currentRouteKey.set(routeKey);
    this.currentMood.set(this.resolveMood());

    if (routeChanged) {
      this.activeSceneIndex.set(0);
      this.stagedSceneIndex.set(null);
      this.isTransitioning.set(false);
    }
  }

  private resolveMood(): SceneMood {
    if (!isPlatformBrowser(this.platformId)) {
      return 'day';
    }

    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? 'night' : 'day';
  }

  private resolveRouteKey(url: string): SceneRoute {
    if (url.includes('/analytics')) {
      return 'analytics';
    }

    if (url.includes('/add-memory')) {
      return 'add-memory';
    }

    if (url.includes('/login') || url.includes('/register')) {
      return 'auth';
    }

    return 'timeline';
  }
}
