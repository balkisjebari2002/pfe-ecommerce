import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="product-card h-full flex flex-col">
      <a [routerLink]="['/catalogue', product.id]" class="no-underline">
        <img mat-card-image [src]="product.images[0] || 'https://placehold.co/400x300'"
             [alt]="product.name"
             class="h-52 object-cover w-full">
        <mat-card-content class="flex-1 p-4">
          <p class="text-xs text-primary-500 font-medium mb-1">{{ product.category }}</p>
          <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{{ product.name }}</h3>
          <p class="text-lg font-bold text-primary-700">{{ product.price | currency:'EUR':'symbol':'1.2-2':'fr' }}</p>
          @if (product.stock === 0) {
            <span class="text-xs text-red-500 font-medium">Rupture de stock</span>
          } @else if (product.stock < 5) {
            <span class="text-xs text-orange-500 font-medium">Plus que {{ product.stock }} en stock</span>
          }
        </mat-card-content>
      </a>
      <mat-card-actions class="p-4 pt-0">
        <button mat-raised-button color="primary" class="w-full"
                [disabled]="product.stock === 0"
                (click)="addToCart.emit(product)">
          <mat-icon>add_shopping_cart</mat-icon>
          Ajouter au panier
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
}
