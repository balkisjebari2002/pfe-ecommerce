import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogue', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
    ]
  },

  {
    path: 'catalogue',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'catalogue/:id',
    loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },

  {
    path: 'panier',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },

  {
    path: 'commande',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },

  {
    path: 'mes-commandes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
    ]
  },

  {
    path: 'compte',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'produits',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      { path: '', redirectTo: 'produits', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/catalogue' }
];
