import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav {
  private auth = inject(AuthService);

  minimized = signal(false);
  isDemo = this.auth.isDemo;
  user = this.auth.user;

  toggleMinimize() {
    this.minimized.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }
}
