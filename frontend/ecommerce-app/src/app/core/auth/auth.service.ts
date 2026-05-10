import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'pfe_token';
  private readonly USER_KEY  = 'pfe_user';

  private _token  = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user   = signal<AuthResponse | null>(this.loadUser());

  readonly isLoggedIn = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: { email: string; password: string; firstName: string; lastName: string }) {
    return this.http.post<AuthResponse>('/auth/register', payload).pipe(
      tap(res => this.persist(res))
    );
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>('/auth/login', payload).pipe(
      tap(res => this.persist(res))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    this._token.set(res.token);
    this._user.set(res);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
