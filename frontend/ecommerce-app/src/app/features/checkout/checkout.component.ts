import { Component, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../cart/cart.service';
import { CreateOrderRequest } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule, MatStepperModule, MatDividerModule,
            MatProgressSpinnerModule],
  template: `
    <div class="page-container max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        <mat-icon class="mr-2">payment</mat-icon>Commander
      </h1>

      <mat-stepper #stepper linear orientation="vertical">

        <!-- Step 1: Address -->
        <mat-step [stepControl]="addressForm" label="Adresse de livraison">
          <form [formGroup]="addressForm" class="flex flex-col gap-3 mt-4">
            <mat-form-field appearance="outline">
              <mat-label>Adresse</mat-label>
              <mat-icon matPrefix>home</mat-icon>
              <input matInput formControlName="line1" placeholder="123 Rue de la Paix">
              @if (addressForm.get('line1')?.hasError('required') && addressForm.get('line1')?.touched) {
                <mat-error>Requis</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Complément (optionnel)</mat-label>
              <input matInput formControlName="line2" placeholder="Appartement, bâtiment...">
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
              <input matInput formControlName="country" value="France">
            </mat-form-field>
            <div>
              <button mat-raised-button color="primary" matStepperNext
                      [disabled]="addressForm.invalid">
                Continuer <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Review & Confirm -->
        <mat-step label="Récapitulatif de la commande">
          <div class="mt-4 bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold mb-3">Articles ({{ cartItems().length }})</h3>
            @for (item of cartItems(); track item.productId) {
              <div class="flex justify-between py-2">
                <span class="text-gray-700">{{ item.name }} × {{ item.quantity }}</span>
                <span class="font-medium">
                  {{ item.price * item.quantity | currency:'EUR':'symbol':'1.2-2':'fr' }}
                </span>
              </div>
            }
            <mat-divider class="my-3" />
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-primary-700">{{ cartTotal() | currency:'EUR':'symbol':'1.2-2':'fr' }}</span>
            </div>

            <div class="mt-4 p-3 bg-green-50 rounded-lg">
              <p class="text-sm font-semibold text-green-700">
                <mat-icon class="text-base align-middle">check_circle</mat-icon>
                Paiement à la livraison
              </p>
            </div>
          </div>

          <div class="flex gap-3 mt-4">
            <button mat-stroked-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon> Retour
            </button>
            <button mat-raised-button color="primary" (click)="placeOrder()" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { <span class="flex items-center gap-1"><mat-icon>check</mat-icon> Confirmer la commande</span> }
            </button>
          </div>
        </mat-step>

        <!-- Step 3: Confirmation -->
        <mat-step label="Confirmation">
          <div class="text-center py-8">
            <mat-icon class="text-7xl text-green-500">check_circle</mat-icon>
            <h2 class="text-2xl font-bold text-gray-800 mt-4">Commande confirmée !</h2>
            <p class="text-gray-500 mt-2">Merci pour votre achat. Votre commande est en cours de traitement.</p>
            <div class="flex gap-3 justify-center mt-6">
              <a mat-stroked-button routerLink="/mes-commandes">Mes commandes</a>
              <a mat-raised-button color="primary" routerLink="/catalogue">Continuer les achats</a>
            </div>
          </div>
        </mat-step>

      </mat-stepper>
    </div>
  `,
})
export class CheckoutComponent {
  cartItems = computed(() => this.cart.items());
  cartTotal = computed(() => this.cart.total());
  loading = false;

  addressForm = this.fb.group({
    line1:      ['', Validators.required],
    line2:      [''],
    city:       ['', Validators.required],
    postalCode: ['', Validators.required],
    country:    ['France', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private cart: CartService,
    private http: HttpClient,
    private snack: MatSnackBar,
    private router: Router,
  ) {}

  placeOrder() {
    if (this.cart.items().length === 0) return;
    this.loading = true;

    const body: CreateOrderRequest = {
      items: this.cart.items().map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: this.addressForm.value as any,
    };

    this.http.post('/orders', body).subscribe({
      next: () => {
        this.cart.clear();
        this.loading = false;
        // Advance stepper to confirmation step
        setTimeout(() => {
          this.router.navigate(['/mes-commandes']);
          this.snack.open('Commande passée avec succès !', undefined, {
            duration: 3000, panelClass: 'snack-success'
          });
        }, 100);
      },
      error: () => (this.loading = false),
    });
  }
}
