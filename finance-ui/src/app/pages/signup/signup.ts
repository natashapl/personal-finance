import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.error.set('');
    if (!this.name() || !this.email() || !this.password()) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.password().length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }

    this.loading.set(true);
    this.auth.signup(this.name(), this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/overview']),
      error: (err) => {
        this.loading.set(false);
        const msgs: string[] = err.error?.errors;
        this.error.set(msgs?.join('. ') || 'Sign up failed. Please try again.');
      }
    });
  }
}
