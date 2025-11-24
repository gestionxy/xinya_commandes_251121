import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Product, DEPARTMENTS, Order, CartItem } from '../types';
import {
  Search, ShoppingCart, User as UserIcon, LogOut, Menu,
  X, Plus, Minus, History, ChevronRight, Tag
} from 'lucide-react';

export const ClientShop: React.FC<{ isGuest: boolean, onExitGuest: () => void }> = ({ isGuest, onExitGuest }) => {
  const { products, cart, currentUser, logout, addToCart, removeFromCart, placeOrder, orders } = useStore();
  const [activeDept, setActiveDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesDept = activeDept === 'All' || p.department === activeDept;
    const matchesSearch = p.nameCN.includes(searchQuery) || p.nameFR.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Cart Calculations
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate cart total (approximate for display, real calc is in store)
  const cartTotalDisplay = cart.reduce((acc, item) => {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return acc;
    const price = item.isCase ? p.priceCase : p.priceUnit;
    const discount = currentUser?.discountRate || 1;
    return acc + (price * discount * item.quantity);
  }, 0);

  const handleLogout = () => {
    if (isGuest) onExitGuest();
    else logout();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShoppingCart className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden md:block">
            Supermarché Xinya
          </h1>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isGuest && (
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative group">
              <History size={20} />
              <span className="absolute top-full right-0 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Orders</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full transition-all font-medium relative"
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs flex items-center justify-center rounded-full shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>

          <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Departments Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto hidden md:block pb-20">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Departments</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveDept('All')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeDept === 'All' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                All Products
              </button>
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeDept === dept ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          {!isGuest && (
            <div className="p-4 mt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800">{currentUser?.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{currentUser?.email}</p>
                <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded border border-emerald-100">
                  {currentUser?.discountRate && ((1 - currentUser.discountRate) * 100).toFixed(0)}% Discount Active
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                cart={cart}
                onAdd={addToCart}
                discount={currentUser?.discountRate || 1}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Search size={48} className="mb-4 opacity-50" />
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart size={20} className="text-indigo-600" />
                Your Order
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const price = item.isCase ? product.priceCase : product.priceUnit;
                  const finalPrice = price * (currentUser?.discountRate || 1);

                  return (
                    <div key={`${item.productId}-${item.isCase}`} className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <img src={product.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-white" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800">{product.nameCN}</h4>
                        <div className="text-xs text-slate-500">{product.nameFR}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 uppercase">
                            {item.isCase ? 'Case' : 'Unit'}
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            ${finalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <button onClick={() => addToCart(product, 1, item.isCase)} className="p-1 bg-white rounded-full shadow-sm hover:bg-indigo-50 text-indigo-600"><Plus size={14} /></button>
                        <span className="font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => addToCart(product, -1, item.isCase)} className="p-1 bg-white rounded-full shadow-sm hover:bg-rose-50 text-rose-600">
                          {item.quantity === 1 ? <X size={14} /> : <Minus size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-slate-500 text-sm">Estimated Total (Before Tax)</span>
                  <span className="text-2xl font-bold text-slate-800">${cartTotalDisplay.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    if (isGuest) {
                      alert("Please login to place an order.");
                      onExitGuest();
                    } else {
                      placeOrder();
                      setIsCartOpen(false);
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Place Order <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Order History Drawer */}
      {isHistoryOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History size={20} className="text-indigo-600" />
                Order History
              </h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {orders.filter(o => o.userId === currentUser?.id).length === 0 ? (
                <div className="text-center text-slate-400 mt-20">No past orders.</div>
              ) : (
                orders.filter(o => o.userId === currentUser?.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700">{new Date(order.date).toLocaleDateString()}</span>
                        <span className="font-bold text-indigo-600">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-xs text-slate-500">ID: {order.id}</div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-indigo-100 text-indigo-700' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-500'
                          }`}>
                          {order.status === 'pending' ? '已下单' :
                            order.status === 'processing' ? '处理中' :
                              order.status === 'completed' ? '已完成订单' :
                                '已取消'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-slate-600">
                            <span>{item.quantity}x {item.productNameCN} ({item.isCase ? 'Case' : 'Unit'})</span>
                            <span>${item.totalLine.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                        <span>TPS: ${order.taxTPS.toFixed(2)}</span>
                        <span>TVQ: ${order.taxTVQ.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, cart: CartItem[], onAdd: any, discount: number }> = ({ product, cart, onAdd, discount }) => {
  const unitPrice = product.priceUnit * discount;
  const casePrice = product.priceCase * discount;

  // Find quantity in cart
  const unitItem = cart.find(i => i.productId === product.id && !i.isCase);
  const caseItem = cart.find(i => i.productId === product.id && i.isCase);
  const unitQty = unitItem ? unitItem.quantity : 0;
  const caseQty = caseItem ? caseItem.quantity : 0;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full ${unitQty > 0 || caseQty > 0 ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-100'}`}>
      <div className="aspect-square relative overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.nameFR}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.taxable && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-amber-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
            TAX
          </div>
        )}
        {discount < 1 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
            SAVINGS
          </div>
        )}

        {/* Active Indicator Overlay */}
        {(unitQty > 0 || caseQty > 0) && (
          <div className="absolute inset-0 bg-indigo-900/10 pointer-events-none"></div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs font-medium text-indigo-600 mb-1">{product.department}</div>
        <h3 className="font-bold text-slate-900 leading-tight">{product.nameCN}</h3>
        <p className="text-sm text-slate-500 mb-4">{product.nameFR}</p>

        <div className="mt-auto space-y-2">
          {/* UNIT ROW */}
          <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${unitQty > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <div className={`text-[10px] uppercase font-bold ${unitQty > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>Unit</div>
              <div className={`font-mono font-bold ${unitQty > 0 ? 'text-indigo-700' : 'text-slate-700'}`}>${unitPrice.toFixed(2)}</div>
            </div>

            {unitQty === 0 ? (
              <button onClick={() => onAdd(product, 1, false)} className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 rounded-md p-1.5 transition-colors shadow-sm">
                <Plus size={16} />
              </button>
            ) : (
              <div className="flex items-center bg-white rounded-lg border border-indigo-100 shadow-sm">
                <button onClick={() => onAdd(product, -1, false)} className="p-1.5 hover:bg-rose-50 text-indigo-600 rounded-l-lg"><Minus size={14} /></button>
                <span className="w-6 text-center text-sm font-bold text-indigo-700">{unitQty}</span>
                <button onClick={() => onAdd(product, 1, false)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-r-lg"><Plus size={14} /></button>
              </div>
            )}
          </div>

          {/* CASE ROW */}
          <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${caseQty > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <div className={`text-[10px] uppercase font-bold ${caseQty > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>Case</div>
              <div className={`font-mono font-bold ${caseQty > 0 ? 'text-indigo-700' : 'text-slate-700'}`}>${casePrice.toFixed(2)}</div>
            </div>

            {caseQty === 0 ? (
              <button onClick={() => onAdd(product, 1, true)} className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 rounded-md p-1.5 transition-colors shadow-sm">
                <Plus size={16} />
              </button>
            ) : (
              <div className="flex items-center bg-white rounded-lg border border-indigo-100 shadow-sm">
                <button onClick={() => onAdd(product, -1, true)} className="p-1.5 hover:bg-rose-50 text-indigo-600 rounded-l-lg"><Minus size={14} /></button>
                <span className="w-6 text-center text-sm font-bold text-indigo-700">{caseQty}</span>
                <button onClick={() => onAdd(product, 1, true)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-r-lg"><Plus size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = `
  .animate-slide-in {
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .animate-slide-in-left {
    animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);