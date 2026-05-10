import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Product, ProductPage } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, MatCardModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule,
            MatSelectModule, MatChipsModule],
  template: `
    <div class="page-container">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        <mat-icon class="mr-2">admin_panel_settings</mat-icon>Gestion des Produits
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Form -->
        <mat-card class="shadow-sm">
          <mat-card-header>
            <mat-card-title>{{ editingId ? 'Modifier' : 'Nouveau' }} produit</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Nom du produit</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
              <div class="grid grid-cols-2 gap-2">
                <mat-form-field appearance="outline">
                  <mat-label>Prix (€)</mat-label>
                  <input matInput type="number" formControlName="price" min="0" step="0.01">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Stock</mat-label>
                  <input matInput type="number" formControlName="stock" min="0">
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Catégorie</mat-label>
                <mat-select formControlName="category">
                  @for (cat of categories; track cat) {
                    <mat-option [value]="cat">{{ cat }}</mat-option>
                  }
                  <mat-option value="Autre">Autre</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>URL Image</mat-label>
                <input matInput formControlName="imageUrl" placeholder="https://...">
              </mat-form-field>
              <div class="flex gap-2">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid" class="flex-1">
                  <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon>
                  {{ editingId ? 'Enregistrer' : 'Créer' }}
                </button>
                @if (editingId) {
                  <button mat-stroked-button type="button" (click)="cancelEdit()">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Table -->
        <div class="lg:col-span-2">
          @if (loading) {
            <div class="flex justify-center py-24"><mat-spinner></mat-spinner></div>
          } @else {
            <mat-card class="shadow-sm">
              <mat-card-content class="p-0">
                <table mat-table [dataSource]="products" class="w-full">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Produit</th>
                    <td mat-cell *matCellDef="let p">
                      <div class="py-2">
                        <p class="font-medium text-gray-800">{{ p.name }}</p>
                        <p class="text-xs text-gray-400">{{ p.category }}</p>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Prix</th>
                    <td mat-cell *matCellDef="let p" class="font-semibold">
                      {{ p.price | currency:'EUR':'symbol':'1.2-2':'fr' }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="stock">
                    <th mat-header-cell *matHeaderCellDef>Stock</th>
                    <td mat-cell *matCellDef="let p">
                      <mat-chip [class]="p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                        {{ p.stock }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let p">
                      <button mat-icon-button (click)="edit(p)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="delete(p.id)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['name','price','stock','actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['name','price','stock','actions'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  loading = true;
  editingId: string | null = null;

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    price:       [0, [Validators.required, Validators.min(0)]],
    stock:       [0, [Validators.required, Validators.min(0)]],
    category:    ['', Validators.required],
    imageUrl:    [''],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadCategories();
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<ProductPage>('/products?size=100').subscribe(page => {
      this.products = page.content;
      this.loading = false;
    });
  }

  loadCategories() {
    this.http.get<string[]>('/products/categories').subscribe(cats => this.categories = cats);
  }

  save() {
    const v = this.form.value;
    const body = {
      name: v.name, description: v.description, price: v.price, stock: v.stock,
      category: v.category, currency: 'EUR', active: true,
      images: v.imageUrl ? [v.imageUrl] : [],
    };

    const req = this.editingId
      ? this.http.put(`/products/${this.editingId}`, body)
      : this.http.post('/products', body);

    req.subscribe({
      next: () => {
        this.snack.open(this.editingId ? 'Produit mis à jour' : 'Produit créé', undefined,
          { duration: 2000, panelClass: 'snack-success' });
        this.cancelEdit();
        this.load();
      },
    });
  }

  edit(p: Product) {
    this.editingId = p.id;
    this.form.patchValue({
      name: p.name, description: p.description, price: p.price, stock: p.stock,
      category: p.category, imageUrl: p.images?.[0] ?? '',
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ stock: 0, price: 0 });
  }

  delete(id: string) {
    if (confirm('Supprimer ce produit ?')) {
      this.http.delete(`/products/${id}`).subscribe(() => {
        this.snack.open('Produit supprimé', undefined, { duration: 2000 });
        this.load();
      });
    }
  }
}
