import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../cart/cart.service';
import { Product, ProductPage } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
            MatButtonModule, MatIconModule, MatPaginatorModule,
            MatProgressSpinnerModule, MatChipsModule, ProductCardComponent],
  template: `
    <div class="page-container">
      <!-- Filters bar -->
      <div class="flex flex-wrap gap-3 mb-6 items-end bg-white p-4 rounded-lg shadow-sm">
        <mat-form-field appearance="outline" class="flex-1 min-w-48">
          <mat-label>Rechercher</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQ" (keyup.enter)="load()"
                 placeholder="Nom, description...">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-48">
          <mat-label>Catégorie</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="load()">
            <mat-option value="">Toutes</mat-option>
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{ cat }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-44">
          <mat-label>Trier par</mat-label>
          <mat-select [(ngModel)]="sortBy" (selectionChange)="load()">
            <mat-option value="newest">Plus récents</mat-option>
            <mat-option value="price_asc">Prix croissant</mat-option>
            <mat-option value="price_desc">Prix décroissant</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="reset()">
          <mat-icon>clear</mat-icon> Réinitialiser
        </button>
      </div>

      <!-- Results info -->
      @if (!loading) {
        <p class="text-sm text-gray-500 mb-4">
          {{ totalElements }} produit{{ totalElements > 1 ? 's' : '' }} trouvé{{ totalElements > 1 ? 's' : '' }}
        </p>
      }

      <!-- Grid -->
      @if (loading) {
        <div class="flex justify-center py-24">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (products.length === 0) {
        <div class="text-center py-24 text-gray-400">
          <mat-icon class="text-6xl">inventory_2</mat-icon>
          <p class="text-xl mt-4">Aucun produit trouvé</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products; track product.id) {
            <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
          }
        </div>

        <mat-paginator [length]="totalElements" [pageSize]="pageSize"
                       [pageSizeOptions]="[8, 12, 24]"
                       [pageIndex]="pageIndex"
                       (page)="onPage($event)" class="mt-6 rounded-lg shadow-sm">
        </mat-paginator>
      }
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  products: Product[]  = [];
  categories: string[] = [];
  searchQ = '';
  selectedCategory = '';
  sortBy = 'newest';
  loading = false;
  totalElements = 0;
  pageSize  = 12;
  pageIndex = 0;

  constructor(private http: HttpClient, private cart: CartService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.http.get<string[]>('/products/categories').subscribe(cats => this.categories = cats);
    this.load();
  }

  load() {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.pageIndex)
      .set('size', this.pageSize)
      .set('sort', this.sortBy);
    if (this.searchQ) params = params.set('q', this.searchQ);
    if (this.selectedCategory) params = params.set('category', this.selectedCategory);

    this.http.get<ProductPage>('/products', { params }).subscribe({
      next: page => {
        this.products = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize  = e.pageSize;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset() {
    this.searchQ = '';
    this.selectedCategory = '';
    this.sortBy = 'newest';
    this.pageIndex = 0;
    this.load();
  }

  onAddToCart(product: Product) {
    this.cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? '',
    });
    this.snack.open(`"${product.name}" ajouté au panier`, 'Voir le panier', {
      duration: 3000,
      panelClass: 'snack-success',
    });
  }
}
