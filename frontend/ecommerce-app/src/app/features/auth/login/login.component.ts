import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <mat-card class="w-full max-w-md shadow-lg">
        <mat-card-header class="pb-4">
          <mat-card-title class="text-2xl font-bold text-primary-700">
            <mat-icon class="mr-2">lock</mat-icon>Connexion
          </mat-card-title>
          <mat-card-subtitle>Accédez à votre compte</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="vous@exemple.com">
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hidePass ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePass = !hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading" class="py-2">
              @if (loading) { <mat-spinner diameter="20" class="inline"></mat-spinner> }
              @else { Se connecter }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center pb-4">
          <p class="text-sm text-gray-600">
            Pas encore de compte ?
            <a routerLink="/auth/register" class="text-primary-600 font-medium">S'inscrire</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  hidePass = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/catalogue']),
      error: () => (this.loading = false),
    });
  }
}
