import React, { useState } from 'react';
import { useStore } from '../services/store';
import { User, Product, DEPARTMENTS, Order } from '../types';
import { Filter, Trash2, Upload, Plus, Edit, X, Check, ChevronDown, ChevronUp, Users, Package, FileText, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            XINYA ADMIN
          </h2>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <SidebarItem
            icon={<Users size={20} />}
            label="Clients"
            active={activeTab === 'clients'}
            onClick={() => setActiveTab('clients')}
          />
          <SidebarItem
            icon={<Package size={20} />}
            label="Inventory"
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label="Orders"
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            badge={useStore().orders.filter(o => o.status === 'pending').length}
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
          <button onClick={logout} className="text-slate-500"><LogOut size={24} /></button>
        </div>

        {activeTab === 'clients' && <ClientManager />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderHistoryManager />}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void, badge?: number }> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
      }`}
  >
    {icon}
    {label}
    {badge !== undefined && badge > 0 && (
      <span className="absolute right-4 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

// --- Client Manager ---
const ClientManager: React.FC = () => {
  const { users, updateUser, deleteUser } = useStore();
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
              <th className="p-4 font-semibold">Livraison</th>
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
                <td className="p-4 text-slate-600 max-w-xs break-words">{client.address || '-'}</td>
                <td className="p-4 text-slate-600 max-w-xs break-words">
                  {client.deliveryAddress || <span className="text-slate-300 italic">Same as address</span>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${client.discountRate < 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {client.discountRate} ({((1 - client.discountRate) * 100).toFixed(0)}% Off)
                  </span>
                </td>
                <td className="p-4 text-slate-600">{client.paymentMethod}</td>
                <td className="p-4">
                  <button onClick={() => setEditingUser(client)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`)) {
                        deleteUser(client.id);
                      }
                    }}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 size={18} />
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
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateUser(editingUser);
              setEditingUser(null);
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone</label>
                  <input required type="text" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Discount (0.1 - 1.0)</label>
                  <input required type="number" step="0.01" max="1" min="0.1" value={editingUser.discountRate} onChange={e => setEditingUser({ ...editingUser, discountRate: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Address</label>
                <input required type="text" value={editingUser.address || ''} onChange={e => setEditingUser({ ...editingUser, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Delivery Address (Livraison)</label>
                <textarea
                  rows={2}
                  value={editingUser.deliveryAddress || ''}
                  onChange={e => setEditingUser({ ...editingUser, deliveryAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder="Leave empty if same as billing address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Payment Method</label>
                <select value={editingUser.paymentMethod || 'COD'} onChange={e => setEditingUser({ ...editingUser, paymentMethod: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none">
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
  const { products, addProduct, updateProduct, deleteProduct, bulkDeleteProducts, bulkImportProducts } = useStore();
  const [isEditing, setIsEditing] = useState<Partial<Product> | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDept, setActiveDept] = useState('All');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Sort
  const filteredProducts = products.filter(p => {
    const matchesDept = activeDept === 'All' || p.department === activeDept;
    const matchesSearch = searchQuery === '' ||
      p.nameCN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameFR.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.nameCN.localeCompare(b.nameCN);
    }
    return a.priceUnit - b.priceUnit;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(products.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
      await bulkDeleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    // If it has an ID and exists in products, update it. Otherwise add it.
    // Note: For new products we generate a temp ID in openNew, but check if it exists.
    const existing = products.find(p => p.id === isEditing.id);

    if (existing) {
      await updateProduct(isEditing as Product);
    } else {
      await addProduct(isEditing as Product);
    }
    setIsEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} /> Delete ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setIsBulkOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          <button
            onClick={() => setIsEditing({
              id: crypto.randomUUID(),
              nameCN: '',
              nameFR: '',
              priceUnit: 0,
              priceCase: 0,
              imageUrl: '',
              department: activeDept === 'All' ? DEPARTMENTS[0] : activeDept,
              taxable: false,
              stock: 100
            })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters & Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDept('All')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeDept === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeDept === dept ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm font-bold text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'name')}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-bold outline-none"
          >
            <option value="price">Price (Low to High)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="p-4 text-left text-sm font-bold text-slate-600">Image</th>
              <th className="p-4 text-left text-sm font-bold text-slate-600">Name (CN / FR)</th>
              <th className="p-4 text-left text-sm font-bold text-slate-600">Department</th>
              <th className="p-4 text-center text-sm font-bold text-slate-600">Tax</th>
              <th className="p-4 text-right text-sm font-bold text-slate-600">Price (Unit)</th>
              <th className="p-4 text-right text-sm font-bold text-slate-600">Price (Case)</th>
              <th className="p-4 text-right text-sm font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedProducts.map(product => (
              <tr key={product.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.has(product.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => handleSelect(product.id)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/300'}
                      alt={product.nameCN}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{product.nameCN}</div>
                  <div className="text-sm text-slate-500">{product.nameFR}</div>
                </td>
                <td className="p-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {product.department}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {product.taxable ? (
                    <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold">Tax</span>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="p-4 text-right font-bold text-indigo-600">
                  ${product.priceUnit.toFixed(2)}
                </td>
                <td className="p-4 text-right text-slate-600">
                  {product.priceCase > 0 ? `$${product.priceCase.toFixed(2)}` : '-'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setIsEditing(product)}
                      className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p>No products found. Add a product or use Bulk Upload.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">{products.find(p => p.id === isEditing.id) ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name (Chinese)</label>
                  <input required type="text" className="form-input" value={isEditing.nameCN || ''} onChange={e => setIsEditing({ ...isEditing, nameCN: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Name (French)</label>
                  <input required type="text" className="form-input" value={isEditing.nameFR || ''} onChange={e => setIsEditing({ ...isEditing, nameFR: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Department</label>
                  <select className="form-input" value={isEditing.department || DEPARTMENTS[0]} onChange={e => setIsEditing({ ...isEditing, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Image URL</label>
                  <input type="text" className="form-input" value={isEditing.imageUrl || ''} onChange={e => setIsEditing({ ...isEditing, imageUrl: e.target.value })} placeholder="http://..." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="form-label">Unit Price ($)</label>
                  <input required type="number" step="0.01" className="form-input bg-white" value={isEditing.priceUnit || ''} onChange={e => setIsEditing({ ...isEditing, priceUnit: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="form-label">Case Price ($)</label>
                  <input required type="number" step="0.01" className="form-input bg-white" value={isEditing.priceCase || ''} onChange={e => setIsEditing({ ...isEditing, priceCase: parseFloat(e.target.value) })} />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked={isEditing.taxable || false} onChange={e => setIsEditing({ ...isEditing, taxable: e.target.checked })} />
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

      {isBulkOpen && (
        <BulkUploadModal onClose={() => setIsBulkOpen(false)} onImport={bulkImportProducts} />
      )}
    </div>
  );
};

// --- Order History Manager ---

const OrderHistoryManager: React.FC = () => {
  const { orders, users, products, deleteOrder, updateOrderStatus, updateOrderDetails } = useStore();
  const [filterClient, setFilterClient] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => filterClient === 'all' || o.userId === filterClient);
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper to convert image URL to Base64
  const getDataUrl = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL('image/jpeg'));
          } catch (e) {
            console.error('Canvas toDataURL failed', e);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        console.error('Image load failed', url);
        resolve(null);
      };
    });
  };

  // Helper to sanitize text for PDF
  const sanitizeForPdf = (str: string) => {
    // 1. Replace common full-width characters with ASCII equivalents
    let s = str
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/，/g, ',')
      .replace(/：/g, ':')
      .replace(/；/g, ';')
      .replace(/“/g, '"')
      .replace(/”/g, '"')
      .replace(/‘/g, "'")
      .replace(/’/g, "'");

    // 2. Remove remaining non-Latin-1 characters to prevent garbage
    // Note: This means actual Chinese characters will be removed, but punctuation will be fixed.
    // If we want to keep Chinese, we MUST embed a font. For now, we clean it up.
    return s.replace(/[^\x00-\xFF]/g, '').trim();
  };

  const generatePDF = async (order: Order) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(`Order #${order.id}`, 14, 22);

    doc.setFontSize(12);
    // Sanitize user name just in case
    doc.text(`Client: ${sanitizeForPdf(order.userName)}`, 14, 32);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 14, 38);

    if (order.deliveryMethod) {
      const method = order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery';
      const time = order.deliveryTime ? order.deliveryTime.replace('T', ' ') : '';
      doc.text(`Delivery: ${method} @ ${time}`, 14, 44);
      doc.text(`Total: $${order.total.toFixed(2)}`, 14, 50);
    } else {
      doc.text(`Total: $${order.total.toFixed(2)}`, 14, 44);
    }

    // Sort items by Department
    const sortedItems = [...order.items].sort((a, b) => {
      const deptA = a.department || '';
      const deptB = b.department || '';
      return deptA.localeCompare(deptB);
    });

    // Pre-load images
    const itemsWithImages = await Promise.all(sortedItems.map(async (item) => {
      // 1. Try item.imageUrl
      // 2. Fallback to finding product in store
      let imageUrl = item.imageUrl;
      let productExists = true;

      if (!imageUrl) {
        const product = products.find(p => p.nameCN === item.productNameCN);
        if (product) {
          imageUrl = product.imageUrl;
        } else {
          productExists = false;
        }
      }

      let base64Img: string | null = null;
      if (imageUrl && !imageUrl.includes('placeholder')) {
        base64Img = await getDataUrl(imageUrl);
      }

      // Determine department text for PDF (Strip Chinese)
      // Department format is usually "French / Chinese"
      let deptText = item.department || (products.find(p => p.nameCN === item.productNameCN)?.department) || '-';
      if (deptText.includes('/')) {
        deptText = deptText.split('/')[0].trim(); // Take the first part (French)
      }

      // Fallback for taxable status
      // If item.taxable is false/undefined, check if the product exists and is taxable.
      // This fixes legacy orders where taxable status might not have been saved but tax was collected.
      let isTaxable = item.taxable;
      if (!isTaxable) {
        const product = products.find(p => p.nameCN === item.productNameCN);
        if (product && product.taxable) {
          isTaxable = true;
        }
      }

      return {
        ...item,
        base64Img,
        finalDepartment: deptText,
        productExists,
        finalTaxable: isTaxable
      };
    }));

    const tableBody = itemsWithImages.map((item) => {
      // Use CN name for PDF as requested, but sanitize it to avoid garbage
      const rawName = item.productNameCN || item.productNameFR;
      const nameDisplay = sanitizeForPdf(rawName);

      return [
        '', // Image placeholder
        `${nameDisplay}\nDept: ${sanitizeForPdf(item.finalDepartment)}\nTax: ${item.finalTaxable ? 'Yes' : 'No'}`,
        item.isCase ? 'Case' : 'Unit',
        item.quantity,
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.totalLine.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      head: [['Image', 'Product Details', 'Type', 'Qty', 'Price', 'Total']],
      body: tableBody,
      startY: order.deliveryMethod ? 56 : 50,
      rowPageBreak: 'avoid',
      // 5 items per page -> A4 (297mm) - margins (~40mm) = 250mm / 5 = 50mm per row
      bodyStyles: { minCellHeight: 45, valign: 'middle', fontSize: 12 },
      columnStyles: {
        0: { cellWidth: 45 }, // Big image column
        1: { cellWidth: 'auto' },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const item = itemsWithImages[data.row.index];
          if (item.base64Img) {
            try {
              // Draw image centered in cell
              const dim = 40; // 40mm square
              const x = data.cell.x + (data.cell.width - dim) / 2;
              const y = data.cell.y + (data.cell.height - dim) / 2;
              doc.addImage(item.base64Img, 'JPEG', x, y, dim, dim);
            } catch (err) {
              console.error('PDF addImage failed', err);
            }
          } else {
            // Draw "No Image" text
            doc.setFontSize(8);
            doc.text("Image N/A", data.cell.x + 10, data.cell.y + 20);
          }
        }
      }
    });

    doc.save(`order_${order.id}.pdf`);
  };

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
                <div className="text-sm text-slate-500">
                  ID: {order.id} • {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}
                  {order.deliveryMethod && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                      {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'} • {order.deliveryTime?.split('T').join(' ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">${order.total.toFixed(2)}</div>

                {/* Status Controls */}
                <div className="flex items-center gap-4 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer" onClick={() => updateOrderStatus(order.id, 'pending')}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${order.status === 'pending' || order.status === 'processing' || order.status === 'completed' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {(order.status === 'pending' || order.status === 'processing' || order.status === 'completed') && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${order.status === 'pending' ? 'text-indigo-600' : 'text-slate-500'}`}>New Order</span>
                  </label>

                  <div className={`h-0.5 w-8 ${order.status === 'processing' || order.status === 'completed' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                  <label className="flex items-center gap-2 cursor-pointer" onClick={() => updateOrderStatus(order.id, 'processing')}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${order.status === 'processing' || order.status === 'completed' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {(order.status === 'processing' || order.status === 'completed') && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${order.status === 'processing' ? 'text-indigo-600' : 'text-slate-500'}`}>Processing</span>
                  </label>

                  <div className={`h-0.5 w-8 ${order.status === 'completed' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                  <label className="flex items-center gap-2 cursor-pointer" onClick={() => updateOrderStatus(order.id, 'completed')}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${order.status === 'completed' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {order.status === 'completed' && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${order.status === 'completed' ? 'text-indigo-600' : 'text-slate-500'}`}>Completed</span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => generatePDF(order)}
                    className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors font-bold"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                        deleteOrder(order.id);
                      }
                    }}
                    className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors font-bold flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400 bg-slate-50 rounded-lg">
                  <tr>
                    <th className="p-2 font-medium pl-4">Image</th>
                    <th className="p-2 font-medium">Product Details</th>
                    <th className="p-2 font-medium">Department</th>
                    <th className="p-2 font-medium text-center">Tax</th>
                    <th className="p-2 font-medium text-right">Qty</th>
                    <th className="p-2 font-medium text-right">Price</th>
                    <th className="p-2 font-medium text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...order.items]
                    .sort((a, b) => (a.department || '').localeCompare(b.department || ''))
                    .map((item, idx) => {
                      // Fallback logic for UI display
                      let displayImage = item.imageUrl;
                      let displayDept = item.department;
                      let displayTax = item.taxable;
                      let productExists = true;

                      if (!displayImage || !displayDept || displayTax === undefined) {
                        const product = products.find(p => p.nameCN === item.productNameCN);
                        if (product) {
                          if (!displayImage) displayImage = product.imageUrl;
                          if (!displayDept) displayDept = product.department;
                          if (displayTax === undefined) displayTax = product.taxable;
                        } else {
                          // Product not found in current inventory
                          if (!displayImage) productExists = false;
                        }
                      }

                      return (
                        <tr key={idx} className="border-b border-slate-50 last:border-0">
                          <td className="p-2 pl-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center text-center">
                              {productExists && displayImage ? (
                                <img src={displayImage} alt="Product" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-slate-400 leading-tight p-1">
                                  图片已无或商品已失效
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-slate-800 font-medium">{item.productNameCN}</div>
                            <div className="text-xs text-slate-500">{item.productNameFR}</div>
                            {item.addedByAdmin && (
                              <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded mt-1">
                                Admin Added / 后加
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-slate-600 text-xs">
                            {displayDept}
                          </td>
                          <td className="p-2 text-center">
                            {displayTax ? (
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">Tax</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono">
                            {item.quantity} <span className="text-xs text-slate-400">{item.isCase ? 'cs' : 'un'}</span>
                          </td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-700 pr-4">
                            ${item.totalLine.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-4 text-sm">
              <div className="text-right space-y-1">
                <div className="text-slate-500">Subtotal: <span className="font-mono font-bold text-slate-700">${order.subTotal.toFixed(2)}</span></div>
                <div className="text-slate-500">TPS (5%): <span className="font-mono font-bold text-slate-700">${order.taxTPS.toFixed(2)}</span></div>
                <div className="text-slate-500">TVQ (9.975%): <span className="font-mono font-bold text-slate-700">${order.taxTVQ.toFixed(2)}</span></div>
                <div className="text-lg font-bold text-indigo-600 mt-2">Total: ${order.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setEditingOrder(order)}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-md shadow-indigo-200"
              >
                Edit Order / 修改订单
              </button>
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

const BulkUploadModal: React.FC<{ onClose: () => void, onImport: (excel: File, zip: File | null, onProgress: (msg: string) => void) => Promise<any> }> = ({ onClose, onImport }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!excelFile) return;
    setIsUploading(true);
    setProgress('Starting import...');

    try {
      const res = await onImport(excelFile, zipFile, (msg) => setProgress(msg));
      setResult(res);
    } catch (e: any) {
      setResult({ success: 0, failed: 1, errors: [e.message] });
    }

    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Bulk Upload Products</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {!result ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">1. Excel File (.xlsx)</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-slate-400 mt-1">Columns: nameCN, priceUnit, department, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">2. Images Zip (Optional)</label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-slate-400 mt-1">Contains images matching 'imageFilename' in Excel.</p>
                </div>
              </div>

              {progress && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-sm text-indigo-600 font-medium animate-pulse">{progress}</div>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!excelFile || isUploading}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all ${!excelFile || isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}`}
              >
                {isUploading ? 'Processing...' : 'Start Import'}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className={`text-xl font-bold ${result.failed === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Import Completed
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-emerald-50 p-3 rounded-lg text-emerald-700">
                  <div className="font-bold text-2xl">{result.success}</div>
                  <div>Success</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg text-rose-700">
                  <div className="font-bold text-2xl">{result.failed}</div>
                  <div>Failed</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="text-left bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto text-xs text-rose-600 font-mono">
                  {result.errors.map((e: string, i: number) => <div key={i}>• {e}</div>)}
                </div>
              )}

              <button onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all">
                Close
              </button>
            </div>
          )}
        </div>
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
              from {opacity: 0; transform: translateY(10px); }
            to {opacity: 1; transform: translateY(0); }
  }
            `;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);