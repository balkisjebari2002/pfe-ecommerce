export interface Order {
  id: string;
  userId: string;
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}
