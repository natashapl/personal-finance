import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Nav } from './components/nav/nav';
import { Toast } from './components/toast/toast';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { computed } from '@angular/core';

const AUTH_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Nav, Toast],
  template: `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    @if (showNav()) {
      <div class="app-layout">
        <app-nav />
        <main class="main-content" id="main-content">
          <router-outlet />
        </main>
      </div>
    } @else {
      <router-outlet />
    }
    <app-toast />
  `,
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  showNav = computed(() => !AUTH_ROUTES.some(r => this.currentUrl().startsWith(r)));
}
