import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="page-container max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        <mat-icon class="mr-2">shopping_cart</mat-icon>Mon Panier
      </h1>

      @if (items().length === 0) {
        <div class="text-center py-24 text-gray-400 bg-white rounded-xl shadow-sm">
          <mat-icon class="text-6xl">remove_shopping_cart</mat-icon>
          <p class="text-xl mt-4">Votre panier est vide</p>
          <a mat-raised-button color="primary" routerLink="/catalogue" class="mt-6">
            Continuer les achats
          </a>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          @for (item of items(); track item.productId) {
            <div class="flex items-center gap-4 p-4">
              <img [src]="item.image || 'https://placehold.co/80x80'"
                   [alt]="item.name"
                   class="w-20 h-20 object-cover rounded-lg">
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ item.name }}</p>
                <p class="text-primary-700 font-bold">{{ item.price | currency:'EUR':'symbol':'1.2-2':'fr' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="updateQty(item.productId, item.quantity - 1)">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                <button mat-icon-button (click)="updateQty(item.productId, item.quantity + 1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <p class="w-24 text-right font-bold">
                {{ item.price * item.quantity | currency:'EUR':'symbol':'1.2-2':'fr' }}
              </p>
              <button mat-icon-button color="warn" (click)="remove(item.productId)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <mat-divider />
          }

          <!-- Total -->
          <div class="p-4 flex justify-between items-center bg-gray-50">
            <span class="text-lg font-semibold">Total</span>
            <span class="text-2xl font-bold text-primary-700">
              {{ total() | currency:'EUR':'symbol':'1.2-2':'fr' }}
            </span>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <a mat-stroked-button routerLink="/catalogue">
            <mat-icon>arrow_back</mat-icon> Continuer les achats
          </a>
          <a mat-raised-button color="primary" routerLink="/commande">
            Commander <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  items = computed(() => this.cart.items());
  total = computed(() => this.cart.total());

  constructor(private cart: CartService) {}

  updateQty(id: string, qty: number) { this.cart.updateQuantity(id, qty); }
  remove(id: string) { this.cart.removeItem(id); }
}
