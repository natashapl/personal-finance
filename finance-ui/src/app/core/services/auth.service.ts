import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  is_demo: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'finance_token';
const IS_DEMO_KEY = 'finance_is_demo';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _isDemoStored = signal<boolean>(localStorage.getItem(IS_DEMO_KEY) === 'true');

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isDemo = computed(() => this._user()?.is_demo ?? this._isDemoStored());

  constructor() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this.fetchCurrentUser();
    }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  signup(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, { name, email, password }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  loginAsDemo() {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/demo`, {}).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IS_DEMO_KEY);
    this._token.set(null);
    this._user.set(null);
    this._isDemoStored.set(false);
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(IS_DEMO_KEY, String(res.user.is_demo));
    this._token.set(res.token);
    this._user.set(res.user);
    this._isDemoStored.set(res.user.is_demo);
  }

  private fetchCurrentUser() {
    this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).subscribe({
      next: res => this._user.set(res.user),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.logout();
        }
        // On network errors (server down, etc.) keep the token so the
        // user stays logged in and data loads once the server is available.
      }
    });
  }
}
