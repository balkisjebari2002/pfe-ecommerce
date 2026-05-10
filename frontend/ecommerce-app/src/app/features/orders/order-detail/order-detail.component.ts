import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule,
            MatDividerModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div class="page-container max-w-2xl mx-auto">
      <a routerLink="/mes-commandes" class="text-primary-600 flex items-center gap-1 mb-6 text-sm">
        <mat-icon class="text-base">arrow_back</mat-icon> Mes commandes
      </a>

      @if (loading) {
        <div class="flex justify-center py-24"><mat-spinner></mat-spinner></div>
      } @else if (order) {
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-xl font-bold text-gray-800">
                Commande #{{ order.id.substring(0, 8).toUpperCase() }}
              </h1>
              <p class="text-gray-500 text-sm">
                {{ order.createdAt | date:'d MMMM yyyy à HH:mm':'':'fr' }}
              </p>
            </div>
            <mat-chip>{{ statusLabel(order.status) }}</mat-chip>
          </div>

          <mat-divider class="mb-4" />

          <!-- Items -->
          <h3 class="font-semibold text-gray-700 mb-3">Articles</h3>
          @for (item of order.items; track item.id) {
            <div class="flex justify-between py-2">
              <div>
                <p class="font-medium text-gray-800">{{ item.productName }}</p>
                <p class="text-sm text-gray-500">
                  {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2':'fr' }} × {{ item.quantity }}
                </p>
              </div>
              <span class="font-semibold">
                {{ item.subtotal | currency:'EUR':'symbol':'1.2-2':'fr' }}
              </span>
            </div>
          }

          <mat-divider class="my-4" />

          <div class="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span class="text-primary-700">
              {{ order.totalAmount | currency:'EUR':'symbol':'1.2-2':'fr' }}
            </span>
          </div>

          <!-- Shipping -->
          @if (order.shippingAddress) {
            <mat-divider class="my-4" />
            <h3 class="font-semibold text-gray-700 mb-2">Adresse de livraison</h3>
            <p class="text-gray-600">{{ order.shippingAddress.line1 }}</p>
            @if (order.shippingAddress.line2) { <p class="text-gray-600">{{ order.shippingAddress.line2 }}</p> }
            <p class="text-gray-600">{{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}</p>
            <p class="text-gray-600">{{ order.shippingAddress.country }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Order>(`/orders/${id}`).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  statusLabel(status: string): string {
    return { CONFIRMED: 'Confirmée', SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée' }[status] ?? status;
  }
}
