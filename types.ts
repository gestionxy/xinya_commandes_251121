export enum UserRole {
  GUEST = 'guest',
  CLIENT = 'client',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string; // Company Name
  email: string;
  password?: string; // In real app, hashed. Here for mock check.
  role: UserRole;
  phone?: string;
  address?: string;
  paymentMethod?: string; // e.g., "Net 30", "COD"
  discountRate: number; // Default 1.0
}

export interface Product {
  id: string;
  nameCN: string;
  nameFR: string;
  department: string;
  priceUnit: number; // Single item price
  priceCase: number; // Case price
  taxable: boolean; // true = 1, false = 0
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  isCase: boolean; // true if buying by case, false if by unit
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: {
    productNameCN: string;
    productNameFR: string;
    quantity: number;
    unitPrice: number;
    isCase: boolean;
    totalLine: number;
  }[];
  subTotal: number;
  discountAmount: number; // Saved amount
  taxTPS: number;
  taxTVQ: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export const DEPARTMENTS = [
  'Épicerie / 杂货',
  'Congelé / 冻部',
  'Boucherie / 肉部',
  'Légume / 菜部',
  'poissonnerie / 鱼部'
];

export const TAX_RATES = {
  TPS: 0.05,
  TVQ: 0.09975
};