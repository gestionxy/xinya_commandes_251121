import { Product, User, UserRole } from '../types';

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'Super Admin',
  email: 'admin',
  password: 'xinya-888',
  role: UserRole.ADMIN,
  discountRate: 1,
};

export const INITIAL_CLIENTS: User[] = [
  {
    id: 'client-1',
    name: 'Resto Montreal',
    email: 'buyer@resto.com',
    password: '123',
    role: UserRole.CLIENT,
    phone: '514-555-0101',
    address: '123 St Catherine St',
    paymentMethod: 'Credit Card',
    discountRate: 0.95, // 5% off
  },
  {
    id: 'client-2',
    name: 'Super Marche Laval',
    email: 'manager@laval.com',
    password: '123',
    role: UserRole.CLIENT,
    phone: '450-555-0102',
    address: '456 Blvd des Laurentides',
    paymentMethod: 'Net 30',
    discountRate: 0.90, // 10% off
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    nameCN: '上海白菜',
    nameFR: 'Bok Choy Shanghai',
    department: 'Légume / 菜部',
    priceUnit: 2.50,
    priceCase: 45.00,
    taxable: false,
    stock: 100,
    imageUrl: 'https://picsum.photos/300/300?random=1',
  },
  {
    id: 'prod-2',
    nameCN: 'AA级牛排',
    nameFR: 'Steak de boeuf AA',
    department: 'Boucherie / 肉部',
    priceUnit: 15.99,
    priceCase: 150.00,
    taxable: false,
    stock: 50,
    imageUrl: 'https://picsum.photos/300/300?random=2',
  },
  {
    id: 'prod-3',
    nameCN: '可口可乐',
    nameFR: 'Coca Cola',
    department: 'Épicerie / 杂货',
    priceUnit: 1.99,
    priceCase: 22.50,
    taxable: true,
    stock: 200,
    imageUrl: 'https://picsum.photos/300/300?random=3',
  },
  {
    id: 'prod-4',
    nameCN: '冷冻虾仁',
    nameFR: 'Crevettes surgelées',
    department: 'poissonnerie / 鱼部',
    priceUnit: 12.99,
    priceCase: 120.00,
    taxable: false,
    stock: 80,
    imageUrl: 'https://picsum.photos/300/300?random=4',
  },
  {
    id: 'prod-5',
    nameCN: '茉莉香米',
    nameFR: 'Riz au jasmin',
    department: 'Épicerie / 杂货',
    priceUnit: 18.99,
    priceCase: 180.00,
    taxable: false,
    stock: 150,
    imageUrl: 'https://picsum.photos/300/300?random=5',
  }
];