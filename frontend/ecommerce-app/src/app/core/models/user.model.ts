export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  addresses: Address[];
}

export interface Address {
  id?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
