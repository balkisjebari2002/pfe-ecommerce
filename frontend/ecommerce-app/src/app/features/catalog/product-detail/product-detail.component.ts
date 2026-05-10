import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { CartService } from '../../cart/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, MatButtonModule, MatIconModule,
            MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div class="page-container">
      <a routerLink="/catalogue" class="text-primary-600 flex items-center gap-1 mb-6 text-sm">
        <mat-icon class="text-base">arrow_back</mat-icon> Retour au catalogue
      </a>

      @if (loading) {
        <div class="flex justify-center py-24"><mat-spinner></mat-spinner></div>
      } @else if (product) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm p-6">
          <!-- Image -->
          <div>
            <img [src]="product.images[0] || 'https://placehold.co/600x400'"
                 [alt]="product.name"
                 class="w-full rounded-lg object-cover max-h-96">
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-4">
            <span class="text-sm text-primary-500 font-medium">{{ product.category }}</span>
            <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
            <p class="text-3xl font-bold text-primary-700">
              {{ product.price | currency:'EUR':'symbol':'1.2-2':'fr' }}
            </p>
            <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>

            @if (product.attributes && objectKeys(product.attributes).length > 0) {
              <div class="mt-2">
                <h3 class="font-semibold text-gray-700 mb-2">Caractéristiques</h3>
                <div class="flex flex-wrap gap-2">
                  @for (key of objectKeys(product.attributes); track key) {
                    <mat-chip>{{ key }}: {{ product.attributes[key] }}</mat-chip>
                  }
                </div>
              </div>
            }

            <div class="flex items-center gap-2 mt-2">
              @if (product.stock === 0) {
                <span class="text-red-500 font-medium">Rupture de stock</span>
              } @else {
                <mat-icon class="text-green-500">check_circle</mat-icon>
                <span class="text-green-600 font-medium">En stock ({{ product.stock }} disponibles)</span>
              }
            </div>

            <button mat-raised-button color="primary" class="py-3 text-base"
                    [disabled]="product.stock === 0"
                    (click)="addToCart()">
              <mat-icon>add_shopping_cart</mat-icon>
              Ajouter au panier
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cart: CartService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Product>(`/products/${id}`).subscribe({
      next: p => { this.product = p; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  addToCart() {
    if (!this.product) return;
    this.cart.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0] ?? '',
    });
    this.snack.open('Produit ajouté au panier !', 'Voir le panier', {
      duration: 3000,
      panelClass: 'snack-success',
    });
  }
}
