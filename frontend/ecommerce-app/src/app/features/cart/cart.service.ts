import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'pfe_cart';

  private _items = signal<CartItem[]>(this.load());

  readonly items  = computed(() => this._items());
  readonly count  = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly total  = computed(() =>
    this._items().reduce((s, i) => s + i.price * i.quantity, 0)
  );

  addItem(item: Omit<CartItem, 'quantity'>) {
    this._items.update(current => {
      const idx = current.findIndex(i => i.productId === item.productId);
      let next: CartItem[];
      if (idx >= 0) {
        next = current.map((i, ix) =>
          ix === idx ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        next = [...current, { ...item, quantity: 1 }];
      }
      this.save(next);
      return next;
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this._items.update(current => {
      const next = quantity <= 0
        ? current.filter(i => i.productId !== productId)
        : current.map(i => i.productId === productId ? { ...i, quantity } : i);
      this.save(next);
      return next;
    });
  }

  removeItem(productId: string) {
    this._items.update(current => {
      const next = current.filter(i => i.productId !== productId);
      this.save(next);
      return next;
    });
  }

  clear() {
    this._items.set([]);
    localStorage.removeItem(this.CART_KEY);
  }

  private save(items: CartItem[]) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.CART_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
