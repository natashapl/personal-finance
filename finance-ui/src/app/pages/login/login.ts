import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.error.set('');
    if (!this.email() || !this.password()) {
      this.error.set('Please fill in all fields.');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/overview']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }

  viewDemo() {
    this.loading.set(true);
    this.auth.loginAsDemo().subscribe({
      next: () => this.router.navigate(['/overview']),
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load demo. Please try again.');
      }
    });
  }
}
