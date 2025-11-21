import React, { useState } from 'react';
import { useStore } from '../services/store';
import { User, Product, DEPARTMENTS, Order } from '../types';
import { 
  Users, Package, FileText, Plus, Edit, Trash2, 
  Search, Upload, LogOut, ChevronDown, Check, X, Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout } = useStore();
  const [activeTab, setActiveTab] = useState<'clients' | 'products' | 'orders'>('clients');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2 tracking-tight">
            <span className="w-3 h-3 bg-indigo-600 rounded-full shadow-indigo-500/50 shadow-lg"></span>
            NOVA ADMIN
          </h2>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <SidebarItem 
            icon={<Users size={20}/>} 
            label="Clients" 
            active={activeTab === 'clients'} 
            onClick={() => setActiveTab('clients')} 
          />
          <SidebarItem 
            icon={<Package size={20}/>} 
            label="Inventory" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={<FileText size={20}/>} 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative">
        {/* Header for mobile/general */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <button onClick={logout} className="text-slate-500"><LogOut size={24}/></button>
        </div>

        {activeTab === 'clients' && <ClientManager />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderHistoryManager />}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{icon: any, label: string, active: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

// --- Client Manager ---
const ClientManager: React.FC = () => {
  const { users, updateUser } = useStore();
  const clients = users.filter(u => u.role === 'client');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Client Directory</h2>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-500">
          {clients.length} Active Clients
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold">Contact Info</th>
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold">Discount Rate</th>
              <th className="p-4 font-semibold">Payment</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{client.name}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-slate-700">{client.email}</span>
                    <span className="text-xs text-slate-400 mt-1">{client.phone || 'No Phone'}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 max-w-xs truncate">{client.address || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${client.discountRate < 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {client.discountRate} ({( (1 - client.discountRate) * 100 ).toFixed(0)}% Off)
                  </span>
                </td>
                <td className="p-4 text-slate-600">{client.paymentMethod}</td>
                <td className="p-4">
                  <button onClick={() => setEditingUser(client)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Client Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Edit Client: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateUser(editingUser);
              setEditingUser(null);
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone</label>
                  <input required type="text" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Discount (0.1 - 1.0)</label>
                   <input required type="number" step="0.01" max="1" min="0.1" value={editingUser.discountRate} onChange={e => setEditingUser({...editingUser, discountRate: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Address</label>
                <input required type="text" value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Payment Method</label>
                <select value={editingUser.paymentMethod || 'COD'} onChange={e => setEditingUser({...editingUser, paymentMethod: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none">
                  <option value="COD">Cash on Delivery</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Product Manager ---
const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct.id) {
      updateProduct(currentProduct as Product);
    } else {
      addProduct({
        ...currentProduct,
        id: `prod-${Date.now()}`,
        stock: currentProduct.stock || 100,
        imageUrl: currentProduct.imageUrl || 'https://via.placeholder.com/300'
      } as Product);
    }
    setIsModalOpen(false);
    setCurrentProduct({});
  };

  const openEdit = (p: Product) => {
    setCurrentProduct(p);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setCurrentProduct({
      taxable: false,
      priceUnit: 0,
      priceCase: 0,
      department: DEPARTMENTS[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Inventory</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all text-sm font-medium">
            <Upload size={18}/> Bulk Upload (Zip/Excel)
          </button>
          <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium">
            <Plus size={18}/> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-4 w-20">Image</th>
              <th className="p-4 font-semibold">Name (CN / FR)</th>
              <th className="p-4 font-semibold">Department</th>
              <th className="p-4 font-semibold text-right">Unit Price</th>
              <th className="p-4 font-semibold text-right">Case Price</th>
              <th className="p-4 font-semibold text-center">Tax</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    <img src={p.imageUrl} alt={p.nameFR} className="w-full h-full object-cover"/>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-900">{p.nameCN}</div>
                  <div className="text-slate-500 text-xs">{p.nameFR}</div>
                </td>
                <td className="p-4 text-slate-600">
                  <span className="inline-block px-2 py-1 bg-slate-100 rounded-md text-xs">
                    {p.department}
                  </span>
                </td>
                <td className="p-4 text-right font-mono">${p.priceUnit.toFixed(2)}</td>
                <td className="p-4 text-right font-mono">${p.priceCase.toFixed(2)}</td>
                <td className="p-4 text-center">
                  {p.taxable ? 
                    <span className="text-amber-500 font-bold text-xs">TAX</span> : 
                    <span className="text-slate-300 text-xs">NO</span>
                  }
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg">
                      <Edit size={18}/>
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name (Chinese)</label>
                  <input required type="text" className="form-input" value={currentProduct.nameCN || ''} onChange={e => setCurrentProduct({...currentProduct, nameCN: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Name (French)</label>
                  <input required type="text" className="form-input" value={currentProduct.nameFR || ''} onChange={e => setCurrentProduct({...currentProduct, nameFR: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Department</label>
                  <select className="form-input" value={currentProduct.department || DEPARTMENTS[0]} onChange={e => setCurrentProduct({...currentProduct, department: e.target.value})}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Image URL</label>
                  <input type="text" className="form-input" value={currentProduct.imageUrl || ''} onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} placeholder="http://..." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="form-label">Unit Price ($)</label>
                  <input required type="number" step="0.01" className="form-input bg-white" value={currentProduct.priceUnit || ''} onChange={e => setCurrentProduct({...currentProduct, priceUnit: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="form-label">Case Price ($)</label>
                  <input required type="number" step="0.01" className="form-input bg-white" value={currentProduct.priceCase || ''} onChange={e => setCurrentProduct({...currentProduct, priceCase: parseFloat(e.target.value)})} />
                </div>
                <div className="flex items-center h-full pt-6">
                   <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked={currentProduct.taxable || false} onChange={e => setCurrentProduct({...currentProduct, taxable: e.target.checked})} />
                     <span className="text-sm font-medium text-slate-700">Taxable (1)</span>
                   </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Order History Manager ---
const OrderHistoryManager: React.FC = () => {
  const { orders, users } = useStore();
  const [filterClient, setFilterClient] = useState<string>('all');
  
  const filteredOrders = orders.filter(o => filterClient === 'all' || o.userId === filterClient);
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Order History</h2>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filterClient} 
            onChange={(e) => setFilterClient(e.target.value)}
            className="bg-white border border-slate-200 text-sm rounded-lg p-2.5 focus:border-indigo-500 outline-none"
          >
            <option value="all">All Clients</option>
            {users.filter(u => u.role === 'client').map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOrders.map(order => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{order.userName}</h4>
                <div className="text-sm text-slate-500">ID: {order.id} • {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">${order.total.toFixed(2)}</div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{order.status}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400 bg-slate-50 rounded-lg">
                  <tr>
                    <th className="p-2 font-medium pl-4">Product</th>
                    <th className="p-2 font-medium">Type</th>
                    <th className="p-2 font-medium text-right">Qty</th>
                    <th className="p-2 font-medium text-right">Unit Price (Disc)</th>
                    <th className="p-2 font-medium text-right pr-4">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-0">
                      <td className="p-2 pl-4">
                        <span className="text-slate-800 font-medium">{item.productNameCN}</span>
                        <span className="text-slate-400 text-xs ml-2">{item.productNameFR}</span>
                      </td>
                      <td className="p-2 text-slate-500 text-xs uppercase">{item.isCase ? 'Case' : 'Unit'}</td>
                      <td className="p-2 text-right text-slate-700">{item.quantity}</td>
                      <td className="p-2 text-right text-slate-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium pr-4">${item.totalLine.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end text-sm text-slate-600 gap-6 bg-slate-50 p-3 rounded-xl">
               <div>Subtotal: <span className="font-bold">${order.subTotal.toFixed(2)}</span></div>
               <div>TPS (5%): <span className="font-bold">${order.taxTPS.toFixed(2)}</span></div>
               <div>TVQ (9.975%): <span className="font-bold">${order.taxTVQ.toFixed(2)}</span></div>
               <div className="text-indigo-600">Total: <span className="font-bold">${order.total.toFixed(2)}</span></div>
            </div>
          </div>
        ))}
        {sortedOrders.length === 0 && (
          <div className="text-center py-12 text-slate-400">No orders found</div>
        )}
      </div>
    </div>
  );
};

// CSS Utility
const styles = `
  .form-label {
    @apply block text-xs font-bold text-slate-500 mb-1 uppercase;
  }
  .form-input {
    @apply w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);