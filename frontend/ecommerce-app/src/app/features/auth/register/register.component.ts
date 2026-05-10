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
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <mat-card class="w-full max-w-md shadow-lg">
        <mat-card-header class="pb-4">
          <mat-card-title class="text-2xl font-bold text-primary-700">
            <mat-icon class="mr-2">person_add</mat-icon>Créer un compte
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="firstName">
                @if (form.get('firstName')?.hasError('required')) {
                  <mat-error>Requis</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email">
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe (min. 6 caractères)</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hidePass ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePass = !hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('minlength')) {
                <mat-error>6 caractères minimum</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading" class="py-2">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { Créer mon compte }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center pb-4">
          <p class="text-sm text-gray-600">
            Déjà un compte ?
            <a routerLink="/auth/login" class="text-primary-600 font-medium">Se connecter</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  hidePass = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/catalogue']),
      error: () => (this.loading = false),
    });
  }
}
