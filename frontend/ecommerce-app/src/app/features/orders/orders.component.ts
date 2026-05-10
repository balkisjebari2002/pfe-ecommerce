import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule,
            MatCardModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        <mat-icon class="mr-2">receipt_long</mat-icon>Mes Commandes
      </h1>

      @if (loading) {
        <div class="flex justify-center py-24"><mat-spinner></mat-spinner></div>
      } @else if (orders.length === 0) {
        <div class="text-center py-24 bg-white rounded-xl shadow-sm text-gray-400">
          <mat-icon class="text-6xl">receipt_long</mat-icon>
          <p class="text-xl mt-4">Aucune commande pour le moment</p>
          <a mat-raised-button color="primary" routerLink="/catalogue" class="mt-6">
            Commencer mes achats
          </a>
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          @for (order of orders; track order.id) {
            <mat-card class="shadow-sm">
              <mat-card-header>
                <mat-card-title class="text-base">
                  Commande #{{ order.id.substring(0, 8).toUpperCase() }}
                </mat-card-title>
                <mat-card-subtitle>
                  {{ order.createdAt | date:'d MMMM yyyy à HH:mm':'':'fr' }}
                </mat-card-subtitle>
                <span class="ml-auto">
                  <mat-chip [class]="statusClass(order.status)">{{ statusLabel(order.status) }}</mat-chip>
                </span>
              </mat-card-header>
              <mat-card-content class="pt-2">
                <p class="text-gray-600 text-sm">{{ order.items.length }} article(s)</p>
                <p class="text-lg font-bold text-primary-700">
                  {{ order.totalAmount | currency:'EUR':'symbol':'1.2-2':'fr' }}
                </p>
              </mat-card-content>
              <mat-card-actions>
                <a mat-stroked-button [routerLink]="['/mes-commandes', order.id]">
                  Voir le détail <mat-icon>arrow_forward</mat-icon>
                </a>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Order[]>('/orders/me').subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  statusLabel(status: string): string {
    return { CONFIRMED: 'Confirmée', SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée' }[status] ?? status;
  }

  statusClass(status: string): string {
    return { CONFIRMED: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-yellow-100 text-yellow-700',
             DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' }[status] ?? '';
  }
}
