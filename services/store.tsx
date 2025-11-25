import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Order, CartItem, UserRole, TAX_RATES } from '../types';
import { INITIAL_ADMIN, INITIAL_CLIENTS, INITIAL_PRODUCTS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';
import { parseAndImport, BulkImportResult } from './bulkImport';

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
  placeOrder: (deliveryMethod: string, deliveryTime: string) => Promise<void>;
  // Admin functions
  updateUser: (user: User) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') => Promise<void>;
  bulkImportProducts: (excelFile: File, zipFile: File | null, onProgress: (msg: string) => void) => Promise<BulkImportResult>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  // State initialization with localStorage fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nova_users');
    let initialUsers = saved ? JSON.parse(saved) : [...INITIAL_CLIENTS];

    // FORCE UPDATE ADMIN: Remove old admin and add the fresh one
    initialUsers = initialUsers.filter((u: User) => u.id !== INITIAL_ADMIN.id);
    initialUsers.push(INITIAL_ADMIN);

    return initialUsers;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nova_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nova_orders');
    return saved ? JSON.parse(saved) : [];
  });
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
            password: p.password || 'encrypted' // Now fetching actual password for demo login check
          }));
          // Merge with Admin for login check purposes in this simple version
          setUsers([...formattedUsers, INITIAL_ADMIN]);
        }

        // Fetch Orders
        const { data: dbOrders, error: ordersError } = await supabase.from('orders').select('*');
        if (ordersError) console.error("Error fetching orders:", ordersError);
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
            deliveryMethod: o.delivery_method,
            deliveryTime: o.delivery_time,
            discountAmount: 0
          }));
          setOrders(formattedOrders);
        }

        setIsLoading(false);
      };
      fetchData().catch(err => console.error("Error in initial fetch:", err));
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('nova_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('nova_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('nova_orders', JSON.stringify(orders));
    }
  }, [orders]);

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
      const { error } = await supabase.from('profiles').insert({
        id: newUser.id, // In real auth this comes from auth.users
        email: email,
        password: password, // Storing plain text for demo login compatibility
        company_name: name,
        role: 'client',
        discount_rate: 1.0
      });
      if (error) {
        console.error("Error registering user:", error);
        alert("Registration failed to save to database. Please check console.");
      }
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

  const placeOrder = async (deliveryMethod: string, deliveryTime: string) => {
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
        totalLine: lineTotal,
        imageUrl: product.imageUrl,
        department: product.department,
        taxable: product.taxable
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    const total = subTotal + tpsTotal + tvqTotal;

    // Generate ID: ClientName_yyyymmddmmss
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); // yyyymmddmmss
    const safeName = currentUser.name.replace(/\s+/g, ''); // Remove spaces for cleaner ID
    const newOrderId = `${safeName}_${timestamp}`;

    const newOrder: Order = {
      id: newOrderId,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
      items: orderItems,
      subTotal,
      discountAmount: 0,
      taxTPS: tpsTotal,
      taxTVQ: tvqTotal,
      total: total,
      status: 'pending',
      deliveryMethod,
      deliveryTime
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').insert({
        id: newOrderId, // Explicitly set the ID to match local state
        user_id: currentUser.id, // Ideally use actual UUID from auth
        user_name: currentUser.name,
        sub_total: subTotal,
        tax_tps: tpsTotal,
        tax_tvq: tvqTotal,
        total: total,
        status: 'pending',
        delivery_method: deliveryMethod,
        delivery_time: deliveryTime,
        order_details: orderItems
      });
      if (error) {
        console.error("Supabase Order Error:", error);
        alert(`Failed to save order to database: ${error.message}`);
      }
      // Email sending removed as per user request
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

  const deleteUser = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', id);
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const deleteOrder = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order from database");
        return;
      }
    }
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateOrderStatus = async (id: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) {
        console.error("Error updating order status:", error);
        alert(`Failed to update order status: ${error.message}`);
        return;
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const bulkImportProducts = async (excelFile: File, zipFile: File | null, onProgress: (msg: string) => void) => {
    const result = await parseAndImport(excelFile, zipFile, onProgress);
    // Refresh products from DB if successful
    if (result.success > 0 && isSupabaseConfigured && supabase) {
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
    }
    return result;
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

  const bulkDeleteProducts = async (ids: string[]) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Error bulk deleting products:', error);
        return;
      }
    }

    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, products, orders, cart, isLoading,
      login, logout, register,
      addToCart, removeFromCart, clearCart, placeOrder,
      updateUser, addProduct, updateProduct, deleteProduct, bulkDeleteProducts, deleteUser, deleteOrder, updateOrderStatus,
      bulkImportProducts
    }}>
      {children}
    </StoreContext.Provider >
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};