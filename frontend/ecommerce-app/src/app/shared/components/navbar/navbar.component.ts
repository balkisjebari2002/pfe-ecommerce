import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../features/cart/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule],
  template: `
    <mat-toolbar class="shadow-md sticky top-0 z-50">
      <a routerLink="/" class="font-bold text-xl no-underline flex items-center gap-2" style="color: #000000;">
        <mat-icon>store</mat-icon>
        PFE Market
      </a>

      <span class="flex-1"></span>

      <a mat-button routerLink="/catalogue" routerLinkActive="bg-primary-600 rounded"
         class="text-white">Catalogue</a>

      @if (isAdmin()) {
        <a mat-button routerLink="/admin/produits" class="text-white">Admin</a>
      }

      <a mat-icon-button routerLink="/panier">
        <mat-icon [matBadge]="cartCount() || null" matBadgeColor="accent">shopping_cart</mat-icon>
      </a>

      @if (isLoggedIn()) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu>
          <a mat-menu-item routerLink="/compte">
            <mat-icon>person</mat-icon> Mon compte
          </a>
          <a mat-menu-item routerLink="/mes-commandes">
            <mat-icon>receipt_long</mat-icon> Mes commandes
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Déconnexion
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/auth/login" class="text-white">Connexion</a>
      }
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  isLoggedIn = computed(() => this.auth.isLoggedIn());
  isAdmin    = computed(() => this.auth.isAdmin());
  cartCount  = computed(() => this.cart.count());

  constructor(private auth: AuthService, private cart: CartService) {}

  logout() { this.auth.logout(); }
}
