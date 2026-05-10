import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User, Address } from '../../core/models/user.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        <mat-icon class="mr-2">manage_accounts</mat-icon>Mon Compte
      </h1>

      @if (loading) {
        <div class="flex justify-center py-24"><mat-spinner></mat-spinner></div>
      } @else if (user) {

        <!-- Profile card -->
        <mat-card class="shadow-sm mb-6">
          <mat-card-header>
            <mat-card-title>Informations personnelles</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="flex flex-col gap-3">
              <div class="grid grid-cols-2 gap-3">
                <mat-form-field appearance="outline">
                  <mat-label>Prénom</mat-label>
                  <input matInput formControlName="firstName">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="lastName">
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput [value]="user.email" disabled>
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid">
                Enregistrer
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Addresses card -->
        <mat-card class="shadow-sm">
          <mat-card-header>
            <mat-card-title>Mes Adresses</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            @for (addr of user.addresses; track addr.id) {
              <div class="p-3 border border-gray-200 rounded-lg mb-3 flex justify-between">
                <div class="text-sm text-gray-700">
                  <p class="font-medium">{{ addr.line1 }}</p>
                  @if (addr.line2) { <p>{{ addr.line2 }}</p> }
                  <p>{{ addr.postalCode }} {{ addr.city }} — {{ addr.country }}</p>
                  @if (addr.isDefault) { <span class="badge mt-1 inline-block">Par défaut</span> }
                </div>
                <button mat-icon-button color="warn" (click)="deleteAddress(addr.id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }

            <mat-divider class="my-4" />
            <h3 class="font-semibold text-gray-700 mb-3">Ajouter une adresse</h3>
            <form [formGroup]="addressForm" (ngSubmit)="addAddress()" class="flex flex-col gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Adresse</mat-label>
                <input matInput formControlName="line1">
              </mat-form-field>
              <div class="grid grid-cols-2 gap-3">
                <mat-form-field appearance="outline">
                  <mat-label>Ville</mat-label>
                  <input matInput formControlName="city">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Code postal</mat-label>
                  <input matInput formControlName="postalCode">
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Pays</mat-label>
                <input matInput formControlName="country">
              </mat-form-field>
              <button mat-stroked-button color="primary" type="submit" [disabled]="addressForm.invalid">
                <mat-icon>add</mat-icon> Ajouter
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class AccountComponent implements OnInit {
  user: User | null = null;
  loading = true;

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
  });

  addressForm = this.fb.group({
    line1:      ['', Validators.required],
    line2:      [''],
    city:       ['', Validators.required],
    postalCode: ['', Validators.required],
    country:    ['France', Validators.required],
    isDefault:  [false],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<User>('/users/me').subscribe(u => {
      this.user = u;
      this.loading = false;
      this.profileForm.patchValue({ firstName: u.firstName, lastName: u.lastName });
    });
  }

  saveProfile() {
    this.http.put<User>('/users/me', this.profileForm.value).subscribe(u => {
      this.user = u;
      this.snack.open('Profil mis à jour', undefined, { duration: 2000, panelClass: 'snack-success' });
    });
  }

  addAddress() {
    this.http.post<Address>('/users/me/addresses', this.addressForm.value).subscribe(() => {
      this.addressForm.reset({ country: 'France', isDefault: false });
      this.loadProfile();
      this.snack.open('Adresse ajoutée', undefined, { duration: 2000, panelClass: 'snack-success' });
    });
  }

  deleteAddress(id: string) {
    this.http.delete(`/users/me/addresses/${id}`).subscribe(() => this.loadProfile());
  }
}
