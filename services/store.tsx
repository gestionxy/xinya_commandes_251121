import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Order, CartItem, UserRole, TAX_RATES } from '../types';
import { INITIAL_ADMIN, INITIAL_CLIENTS, INITIAL_PRODUCTS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  addToCart: (product: Product, quantity: number, isCase: boolean) => void;
  removeFromCart: (productId: string, isCase: boolean) => void;
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  // Admin functions
  updateUser: (user: User) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [users, setUsers] = useState<User[]>([...INITIAL_CLIENTS, INITIAL_ADMIN]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data from Supabase if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchData = async () => {
        setIsLoading(true);
        
        // Fetch Products
        const { data: dbProducts } = await supabase.from('products').select('*');
        if (dbProducts) {
          const formattedProducts = dbProducts.map((p: any) => ({
            ...p,
            nameCN: p.name_cn,
            nameFR: p.name_fr,
            priceUnit: p.price_unit,
            priceCase: p.price_case,
            imageUrl: p.image_url
          }));
          setProducts(formattedProducts);
        }

        // Fetch Clients (Profiles) - usually restricted in real app, simplified here
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles) {
           const formattedUsers = dbProfiles.map((p: any) => ({
             id: p.id,
             name: p.company_name || 'Unknown',
             email: p.email,
             role: p.role,
             phone: p.phone,
             address: p.address,
             paymentMethod: p.payment_method,
             discountRate: p.discount_rate || 1,
             password: 'encrypted' // Won't support real login in this mock-hybrid view without full Auth rewrite
           }));
           // Merge with Admin for login check purposes in this simple version
           setUsers([...formattedUsers, INITIAL_ADMIN]);
        }

        // Fetch Orders
        const { data: dbOrders } = await supabase.from('orders').select('*');
        if (dbOrders) {
          const formattedOrders = dbOrders.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            userName: o.user_name,
            date: o.created_at,
            subTotal: o.sub_total,
            taxTPS: o.tax_tps,
            taxTVQ: o.tax_tvq,
            total: o.total,
            status: o.status,
            items: o.order_details, // JSONB column
            discountAmount: 0
          }));
          setOrders(formattedOrders);
        }
        
        setIsLoading(false);
      };
      fetchData();
    }
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser: User = {
      id: `client-${Date.now()}`,
      name,
      email,
      password,
      role: UserRole.CLIENT,
      discountRate: 1.0,
      address: '',
      phone: '',
      paymentMethod: 'COD',
    };

    if (isSupabaseConfigured && supabase) {
      // In a real app, use supabase.auth.signUp
      // For this hybrid demo, we insert into a profiles table
      await supabase.from('profiles').insert({
        id: newUser.id, // In real auth this comes from auth.users
        email: email,
        company_name: name,
        role: 'client',
        discount_rate: 1.0
      });
    }

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const addToCart = (product: Product, quantity: number, isCase: boolean) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id && item.isCase === isCase);
      
      if (existingIndex > -1) {
        const newQuantity = prev[existingIndex].quantity + quantity;
        if (newQuantity <= 0) {
          return prev.filter((_, index) => index !== existingIndex);
        }
        const newCart = [...prev];
        newCart[existingIndex] = { ...newCart[existingIndex], quantity: newQuantity };
        return newCart;
      } else {
        if (quantity <= 0) return prev;
        return [...prev, { productId: product.id, quantity, isCase }];
      }
    });
  };

  const removeFromCart = (productId: string, isCase: boolean) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.isCase === isCase)));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async () => {
    if (!currentUser) return;

    let subTotal = 0;
    let tpsTotal = 0;
    let tvqTotal = 0;
    const discountRate = currentUser.discountRate || 1;

    const orderItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;

      const basePrice = item.isCase ? product.priceCase : product.priceUnit;
      const discountedPrice = basePrice * discountRate;
      const lineTotal = discountedPrice * item.quantity;

      subTotal += lineTotal;

      if (product.taxable) {
        tpsTotal += lineTotal * TAX_RATES.TPS;
        tvqTotal += lineTotal * TAX_RATES.TVQ;
      }

      return {
        productNameCN: product.nameCN,
        productNameFR: product.nameFR,
        quantity: item.quantity,
        unitPrice: discountedPrice,
        isCase: item.isCase,
        totalLine: lineTotal
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    const total = subTotal + tpsTotal + tvqTotal;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
      items: orderItems,
      subTotal,
      discountAmount: 0,
      taxTPS: tpsTotal,
      taxTVQ: tvqTotal,
      total: total,
      status: 'pending'
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').insert({
        user_id: currentUser.id, // Ideally use actual UUID from auth
        user_name: currentUser.name,
        sub_total: subTotal,
        tax_tps: tpsTotal,
        tax_tvq: tvqTotal,
        total: total,
        status: 'pending',
        order_details: orderItems
      });
      if (error) console.error("Supabase Order Error:", error);
    }

    setOrders([newOrder, ...orders]);
    clearCart();
  };

  // Admin Actions
  const updateUser = async (updatedUser: User) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update({
        phone: updatedUser.phone,
        address: updatedUser.address,
        discount_rate: updatedUser.discountRate,
        payment_method: updatedUser.paymentMethod
      }).eq('id', updatedUser.id);
    }
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addProduct = async (product: Product) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert({
        name_cn: product.nameCN,
        name_fr: product.nameFR,
        department: product.department,
        price_unit: product.priceUnit,
        price_case: product.priceCase,
        taxable: product.taxable,
        image_url: product.imageUrl,
        stock: product.stock
      }).select();
      
      if (data) {
        // Use the real ID from DB
        product.id = data[0].id; 
      }
    }
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = async (product: Product) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').update({
        name_cn: product.nameCN,
        name_fr: product.nameFR,
        department: product.department,
        price_unit: product.priceUnit,
        price_case: product.priceCase,
        taxable: product.taxable,
        image_url: product.imageUrl
      }).eq('id', product.id);
    }
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, products, orders, cart, isLoading,
      login, logout, register,
      addToCart, removeFromCart, clearCart, placeOrder,
      updateUser, addProduct, updateProduct, deleteProduct
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};