import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../services/store';
import { User, Product, DEPARTMENTS, Order, CompanyInfo } from '../types';
import { Filter, Trash2, Upload, Plus, Edit, X, Check, ChevronDown, ChevronUp, Users, Package, FileText, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminDashboard: React.FC = () => {
  const { logout } = useStore();
  const [activeTab, setActiveTab] = useState<'clients' | 'products' | 'orders' | 'company'>('orders');

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
            icon={<FileText size={20} />}
            label="Company Info"
            active={activeTab === 'company'}
            onClick={() => setActiveTab('company')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Clients"
            active={activeTab === 'clients'}
            onClick={() => setActiveTab('clients')}
          />
          <SidebarItem
            icon={<Package size={20} />}
            label="Products"
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
        {activeTab === 'company' && <CompanyInfoManager />}
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

// --- Company Info Manager ---
const CompanyInfoManager: React.FC = () => {
  const { companyInfo, updateCompanyInfo } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    postalCode: '',
    email: '',
    phone: '',
    gst: '',
    qst: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name,
        address: companyInfo.address,
        postalCode: companyInfo.postalCode,
        email: companyInfo.email,
        phone: companyInfo.phone,
        gst: companyInfo.gst,
        qst: companyInfo.qst
      });
    }
  }, [companyInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await updateCompanyInfo({
        id: companyInfo?.id,
        ...formData
      });
      setMessage('Company information saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving company info:', error);
      setMessage('Error saving information.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="text-indigo-600" />
        Company Information / 公司信息
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Company Name / 公司名称</label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Address / 地址</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Postal Code / 邮编</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.postalCode}
              onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email / 电子邮箱</label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone / 电话 (TELE)</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">GST Number</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.gst}
              onChange={e => setFormData({ ...formData, gst: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">QST Number</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={formData.qst}
              onChange={e => setFormData({ ...formData, qst: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Information / 保存信息'}
          </button>
        </div>
      </form>
    </div>
  );
};

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
                  <span className={`px - 2 py - 1 rounded - lg text - xs font - bold ${client.discountRate < 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} `}>
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
                      if (window.confirm(`Are you sure you want to delete client "${client.name}" ? This action cannot be undone.`)) {
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
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Company Name</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
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
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} products ? `)) {
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
              className={`px - 3 py - 1.5 rounded - lg text - sm font - bold transition - colors ${activeDept === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} `}
            >
              All
            </button>
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px - 3 py - 1.5 rounded - lg text - sm font - bold transition - colors ${activeDept === dept ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} `}
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
              <tr key={product.id} className={`hover: bg - slate - 50 transition - colors group ${selectedIds.has(product.id) ? 'bg-indigo-50/30' : ''} `}>
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
                  {product.priceCase > 0 ? `$${product.priceCase.toFixed(2)} ` : '-'}
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

// --- Invoice Modal ---
const InvoiceModal: React.FC<{ order: Order, companyInfo: CompanyInfo | null, users: User[], onClose: () => void }> = ({ order, companyInfo, users, onClose }) => {
  const client = users.find(u => u.id === order.userId);

  // Initial State from Props
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: order.id,
    invoiceDate: new Date().toISOString().split('T')[0],
    orderDate: new Date(order.date).toISOString().split('T')[0],

    // Admin Info (From Company Info)
    adminName: companyInfo?.name || '',
    adminAddress: companyInfo?.address || '',
    adminPhone: companyInfo?.phone || '',
    adminEmail: companyInfo?.email || '',
    adminGst: companyInfo?.gst || '',
    adminQst: companyInfo?.qst || '',

    // Sold To (Client Profile)
    soldToName: client?.name || order.userName || '',
    soldToAddress: (client?.address || '').replace(/;/g, '\n'),
    soldToPhone: client?.phone || '',

    // Ship To (Delivery Info)
    shipToName: client?.name || order.userName || '',
    shipToAddress: (order.deliveryMethod === 'delivery' ? (client?.deliveryAddress || client?.address || '') : 'Pickup').replace(/;/g, '\n'),
    shipToPhone: client?.phone || ''
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("FACTURE", pageWidth - 20, 20, { align: 'right' });

    // Admin Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    let yPos = 20;
    doc.text(invoiceData.adminName, 20, yPos); yPos += 5;
    doc.text(invoiceData.adminAddress, 20, yPos); yPos += 5;
    doc.text(`Tel: ${invoiceData.adminPhone}`, 20, yPos); yPos += 5;
    doc.text(`Email: ${invoiceData.adminEmail}`, 20, yPos); yPos += 5;
    if (invoiceData.adminGst) { doc.text(`GST: ${invoiceData.adminGst}`, 20, yPos); yPos += 5; }
    if (invoiceData.adminQst) { doc.text(`QST: ${invoiceData.adminQst}`, 20, yPos); yPos += 5; }

    // Invoice Details Box
    yPos = 55;
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 255);
    doc.rect(pageWidth - 90, yPos - 5, 70, 25, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Facture #:", pageWidth - 85, yPos);
    doc.text(invoiceData.invoiceNumber, pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;
    doc.text("Date:", pageWidth - 85, yPos);
    doc.text(invoiceData.invoiceDate, pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;
    doc.text("Date de commande:", pageWidth - 85, yPos);
    doc.text(invoiceData.orderDate, pageWidth - 25, yPos, { align: 'right' });

    // Addresses
    // Addresses
    yPos = 90;
    // Sold To
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text("Vendu à:", 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(invoiceData.soldToName, 20, yPos + 6);

    // Split address by newline or semicolon for manual line breaks, then wrap if needed
    const soldAddressParts = invoiceData.soldToAddress.split(/[\n;]/).map(part => part.trim()).filter(part => part);
    let currentY = yPos + 12;
    soldAddressParts.forEach(part => {
      const lines = doc.splitTextToSize(part, 80);
      doc.text(lines, 20, currentY);
      currentY += (lines.length * 5);
    });
    doc.text(`Tel: ${invoiceData.soldToPhone}`, 20, currentY);
    const soldToEndY = currentY + 5;

    // Ship To
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text("Livraison à:", pageWidth / 2 + 10, yPos);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(invoiceData.shipToName, pageWidth / 2 + 10, yPos + 6);

    const shipAddressParts = invoiceData.shipToAddress.split(/[\n;]/).map(part => part.trim()).filter(part => part);
    currentY = yPos + 12;
    shipAddressParts.forEach(part => {
      const lines = doc.splitTextToSize(part, 80);
      doc.text(lines, pageWidth / 2 + 10, currentY);
      currentY += (lines.length * 5);
    });
    doc.text(`Tel: ${invoiceData.shipToPhone}`, pageWidth / 2 + 10, currentY);
    const shipToEndY = currentY + 5;

    // Table
    const tableStartY = Math.max(soldToEndY, shipToEndY) + 10;

    const tableRows = order.items.map((item, index) => {
      const description = item.productNameCN || item.productNameFR || 'Item';
      const unit = item.isCase ? 'Case' : 'Unit';
      // item.unitPrice is now the ORIGINAL price
      const discountText = (!item.isSpecialPrice && (order.discountRate || 1) < 1)
        ? `-${((1 - (order.discountRate || 1)) * 100).toFixed(0)}%`
        : '';

      return [
        index + 1,
        item.isSpecialPrice ? `${description} *` : description,
        `${item.quantity} (${unit})`,
        `$${item.unitPrice.toFixed(2)}`,
        discountText,
        `$${item.totalLine.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [['No.', 'Description', 'QTY', 'Prix', 'Disc.', 'Montant']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' }
      },
      foot: (() => {
        const originalSubTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const discountAmount = originalSubTotal - order.subTotal;
        const footerRows = [];

        // Use colSpan to give labels more space (merging columns 3 and 4)
        // Columns: 0(No), 1(Desc), 2(Qty), 3(Price), 4(Disc), 5(Total)
        // We merge 0-2 (3 cols) for empty space, then 3-4 (2 cols) for Label, then 5 for Value

        footerRows.push([
          { content: '', colSpan: 3, styles: { cellWidth: 'auto' } },
          { content: 'Prix Original:', colSpan: 2, styles: { halign: 'right' } },
          `$${originalSubTotal.toFixed(2)}`
        ]);

        if (discountAmount > 0.01) {
          footerRows.push([
            { content: '', colSpan: 3 },
            { content: 'Rabais:', colSpan: 2, styles: { halign: 'right', textColor: [220, 38, 38] } }, // Red color for discount
            `-$${discountAmount.toFixed(2)}`
          ]);
        }

        footerRows.push([
          { content: '', colSpan: 3 },
          { content: 'Sous-total:', colSpan: 2, styles: { halign: 'right' } },
          `$${order.subTotal.toFixed(2)}`
        ]);

        footerRows.push([
          { content: '', colSpan: 3 },
          { content: 'TPS (5%):', colSpan: 2, styles: { halign: 'right' } },
          `$${order.taxTPS.toFixed(2)}`
        ]);

        footerRows.push([
          { content: '', colSpan: 3 },
          { content: 'TVQ (9.975%):', colSpan: 2, styles: { halign: 'right' } },
          `$${order.taxTVQ.toFixed(2)}`
        ]);

        footerRows.push([
          { content: '', colSpan: 3 },
          { content: 'Total:', colSpan: 2, styles: { halign: 'right', fontSize: 12 } },
          { content: `$${order.total.toFixed(2)}`, styles: { fontSize: 12, textColor: [79, 70, 229] } }
        ]);

        return footerRows;
      })(),
      footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' },
      didDrawPage: (data) => {
        // Footer Note
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("* Prix Spécial / Special Price: Non soumis au rabais / Excluded from discount.", 20, pageHeight - 10);
      }
    });

    doc.save(`Facture_${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Generate Invoice / 生成发票
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Admin Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">From (Admin)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 block mb-1">Company Name</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminName} onChange={e => setInvoiceData({ ...invoiceData, adminName: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 block mb-1">Address</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminAddress} onChange={e => setInvoiceData({ ...invoiceData, adminAddress: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Phone</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminPhone} onChange={e => setInvoiceData({ ...invoiceData, adminPhone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Email</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminEmail} onChange={e => setInvoiceData({ ...invoiceData, adminEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">GST</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminGst} onChange={e => setInvoiceData({ ...invoiceData, adminGst: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">QST</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.adminQst} onChange={e => setInvoiceData({ ...invoiceData, adminQst: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Invoice Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Invoice Number</label>
                    <input type="text" className="w-full text-sm border-slate-200 rounded-lg font-mono font-bold" value={invoiceData.invoiceNumber} onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Date de facture</label>
                    <input type="date" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.invoiceDate} onChange={e => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Date de commande</label>
                    <input type="date" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.orderDate} onChange={e => setInvoiceData({ ...invoiceData, orderDate: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sold To */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vendu à (Sold To)</h3>
                <div className="space-y-3">
                  <input type="text" className="w-full text-sm border-slate-200 rounded-lg font-bold" value={invoiceData.soldToName} onChange={e => setInvoiceData({ ...invoiceData, soldToName: e.target.value })} placeholder="Client Name" />
                  <textarea className="w-full text-sm border-slate-200 rounded-lg" rows={2} value={invoiceData.soldToAddress} onChange={e => setInvoiceData({ ...invoiceData, soldToAddress: e.target.value })} placeholder="Address" />
                  <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.soldToPhone} onChange={e => setInvoiceData({ ...invoiceData, soldToPhone: e.target.value })} placeholder="Phone" />
                </div>
              </div>

              {/* Ship To */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Livraison à (Ship To)</h3>
                <div className="space-y-3">
                  <input type="text" className="w-full text-sm border-slate-200 rounded-lg font-bold" value={invoiceData.shipToName} onChange={e => setInvoiceData({ ...invoiceData, shipToName: e.target.value })} placeholder="Client Name" />
                  <textarea className="w-full text-sm border-slate-200 rounded-lg" rows={2} value={invoiceData.shipToAddress} onChange={e => setInvoiceData({ ...invoiceData, shipToAddress: e.target.value })} placeholder="Delivery Address" />
                  <input type="text" className="w-full text-sm border-slate-200 rounded-lg" value={invoiceData.shipToPhone} onChange={e => setInvoiceData({ ...invoiceData, shipToPhone: e.target.value })} placeholder="Phone" />
                </div>
              </div>
            </div>

            {/* Items Preview (Read Only) */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Items Preview</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-12">No.</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 w-32">QTY</th>
                      <th className="px-4 py-3 w-24 text-right">Prix</th>
                      <th className="px-4 py-3 w-24 text-center">Disc.</th>
                      <th className="px-4 py-3 w-24 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{item.productNameCN || item.productNameFR}</div>
                          {item.isSpecialPrice && <div className="text-xs text-amber-600 font-medium">* Prix Special</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.quantity} <span className="text-xs text-slate-400">({item.isCase ? 'Case' : 'Unit'})</span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-medium">
                          {!item.isSpecialPrice && (order.discountRate || 1) < 1 ? `-${((1 - (order.discountRate || 1)) * 100).toFixed(0)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">${item.totalLine.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-800">
                    {(() => {
                      const originalSubTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
                      const discountAmount = originalSubTotal - order.subTotal;
                      return (
                        <>
                          <tr>
                            <td colSpan={5} className="px-4 py-1 text-right text-slate-500 font-normal">Prix Original:</td>
                            <td className="px-4 py-1 text-right text-slate-500 font-normal">${originalSubTotal.toFixed(2)}</td>
                          </tr>
                          {discountAmount > 0.01 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-1 text-right text-emerald-600 font-normal">Rabais:</td>
                              <td className="px-4 py-1 text-right text-emerald-600 font-normal">-${discountAmount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={5} className="px-4 py-1 text-right text-slate-600">Sous-total:</td>
                            <td className="px-4 py-1 text-right text-slate-600">${order.subTotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="px-4 py-1 text-right text-slate-400 font-normal">TPS (5%):</td>
                            <td className="px-4 py-1 text-right text-slate-400 font-normal">${order.taxTPS.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="px-4 py-1 text-right text-slate-400 font-normal">TVQ (9.975%):</td>
                            <td className="px-4 py-1 text-right text-slate-400 font-normal">${order.taxTVQ.toFixed(2)}</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td colSpan={5} className="px-4 py-3 text-right text-lg">Total:</td>
                            <td className="px-4 py-3 text-right text-indigo-600 text-lg">${order.total.toFixed(2)}</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={generatePDF} className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
            <Upload size={18} className="rotate-180" />
            Download PDF / 下载发票
          </button>
        </div>
      </div>
    </div>
  );
};

// Define OrderItem locally since it's not exported from types
interface OrderItem {
  productNameCN: string;
  productNameFR: string;
  quantity: number;
  unitPrice: number;
  isCase: boolean;
  totalLine: number;
  imageUrl?: string;
  department?: string;
  taxable?: boolean;
  addedByAdmin?: boolean;
  isSpecialPrice?: boolean;
}

// --- Edit Order Modal ---
const EditOrderModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { products, updateOrderDetails, users } = useStore();
  const [items, setItems] = useState<OrderItem[]>(order.items);
  // Initialize discount rate: use order's rate if valid (< 1), otherwise try to find client's current rate
  const [discountRate, setDiscountRate] = useState<number>(() => {
    if (order.discountRate && order.discountRate < 1) {
      return order.discountRate;
    }
    // Fallback: try to find client's current discount rate
    const client = users.find(u => u.id === order.userId || u.name === order.userName);
    return client?.discountRate || 1;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  // Calculate totals
  const calculateTotals = (currentItems: any[], currentDiscount: number) => {
    let originalSubTotal = 0;
    let subTotal = 0;
    let tpsTotal = 0;
    let tvqTotal = 0;

    currentItems.forEach(item => {
      const lineOriginalTotal = item.unitPrice * item.quantity;
      originalSubTotal += lineOriginalTotal;

      // Calculate line total based on special price status
      // If special price, NO discount. If normal, apply discount.
      const effectivePrice = item.isSpecialPrice ? item.unitPrice : (item.unitPrice * currentDiscount);
      const lineTotal = effectivePrice * item.quantity;

      subTotal += lineTotal;
      if (item.taxable) {
        tpsTotal += lineTotal * 0.05;
        tvqTotal += lineTotal * 0.09975;
      }
    });

    return {
      originalSubTotal,
      subTotal,
      taxTPS: tpsTotal,
      taxTVQ: tvqTotal,
      total: subTotal + tpsTotal + tvqTotal
    };
  };

  const totals = calculateTotals(items, discountRate);

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity') {
      item.quantity = value;
    } else if (field === 'unitPrice') {
      item.unitPrice = value;
    } else if (field === 'isSpecialPrice') {
      item.isSpecialPrice = value;
    }

    // Recalculate line total immediately for UI feedback
    const effectivePrice = item.isSpecialPrice ? item.unitPrice : (item.unitPrice * discountRate);
    item.totalLine = effectivePrice * item.quantity;

    newItems[index] = item;
    setItems(newItems);
  };

  // Update all items when discount rate changes
  useEffect(() => {
    setItems(prev => prev.map(item => ({
      ...item,
      totalLine: (item.isSpecialPrice ? item.unitPrice : (item.unitPrice * discountRate)) * item.quantity
    })));
  }, [discountRate]);

  const handleDeleteItem = (index: number) => {
    if (window.confirm('Remove this item?')) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleAddItem = (product: Product, isCase: boolean) => {
    const price = isCase ? product.priceCase : product.priceUnit;
    const newItem = {
      productNameCN: product.nameCN,
      productNameFR: product.nameFR,
      quantity: 1,
      unitPrice: price,
      isCase: isCase,
      totalLine: price,
      imageUrl: product.imageUrl,
      department: product.department,
      taxable: product.taxable,
      addedByAdmin: true
    };
    setItems([...items, newItem]);
    setIsAdding(false);
    setSearch('');
  };

  const filteredProducts = products.filter(p =>
    p.nameCN.toLowerCase().includes(search.toLowerCase()) ||
    p.nameFR.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    await updateOrderDetails(order.id, items, totals, discountRate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Edit Order: {order.id}</h3>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Client Discount Rate:</label>
              <input
                type="number"
                step="0.01"
                max="1"
                min="0.1"
                value={discountRate}
                onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                className="w-20 p-1 text-sm border border-slate-300 rounded text-center font-bold text-indigo-600"
              />
              <span className="text-xs text-slate-400">({((1 - discountRate) * 100).toFixed(0)}% Off)</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border ${item.addedByAdmin ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl || 'placeholder'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-slate-800 truncate">{item.productNameCN}</div>
                    {item.isSpecialPrice && <span className="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">Prix Special</span>}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{item.productNameFR}</div>
                  {item.addedByAdmin && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded mt-1 inline-block">Admin Added</span>}

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`special-${idx}`}
                      checked={!!item.isSpecialPrice}
                      onChange={(e) => handleUpdateItem(idx, 'isSpecialPrice', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor={`special-${idx}`} className="text-xs font-bold text-slate-600 select-none cursor-pointer">Prix Special (No Discount)</label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Qty ({item.isCase ? 'Case' : 'Unit'})</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value))}
                      className="w-20 p-2 border border-slate-200 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                      className="w-24 p-2 border border-slate-200 rounded-lg font-bold text-right"
                    />
                  </div>
                  <div className="text-right w-24">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                    <div className="font-bold text-slate-700">${item.totalLine.toFixed(2)}</div>
                    {!item.isSpecialPrice && discountRate < 1 && (
                      <div className="text-[10px] text-emerald-600 font-bold">-{((1 - discountRate) * 100).toFixed(0)}%</div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteItem(idx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isAdding ? (
            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/50">
              <div className="flex justify-between items-center mb-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search product to add..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button onClick={() => setIsAdding(false)} className="ml-4 text-slate-500 hover:text-slate-700">Cancel</button>
              </div>
              <div className="max-h-60 overflow-y-auto grid grid-cols-1 gap-2">
                {filteredProducts.slice(0, 10).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden flex-shrink-0"><img src={p.imageUrl} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-700">{p.nameCN}</div>
                      <div className="text-xs text-slate-500 truncate">{p.nameFR}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(p, false)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Unit ${p.priceUnit.toFixed(2)}
                      </button>
                      <button
                        onClick={() => handleAddItem(p, true)}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Case ${p.priceCase.toFixed(2)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Add Item
            </button>
          )}

          <div className="bg-slate-50 p-6 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Original Price</span>
              <span>${totals.originalSubTotal.toFixed(2)}</span>
            </div>
            {discountRate < 1 && (
              <div className="flex justify-between text-emerald-600 text-sm font-bold">
                <span>Discount ({((1 - discountRate) * 100).toFixed(0)}%)</span>
                <span>-${(totals.originalSubTotal - totals.subTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-200">
              <span>Subtotal (After Discount)</span>
              <span>${totals.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600"><span>TPS</span><span>${totals.taxTPS.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600"><span>TVQ</span><span>${totals.taxTVQ.toFixed(2)}</span></div>
            <div className="flex justify-between text-xl font-bold text-indigo-600 pt-2 border-t border-slate-200"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Order History Manager ---

const OrderHistoryManager: React.FC = () => {
  const { orders, users, products, deleteOrder, updateOrderStatus, updateOrderDetails, companyInfo } = useStore();
  const [filterClient, setFilterClient] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [invoicingOrder, setInvoicingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => filterClient === 'all' || o.userId === filterClient);
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper to convert image URL to Base64 with timeout
  const getDataUrl = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      const timeout = setTimeout(() => {
        console.warn('Image load timed out:', url);
        resolve(createPlaceholderImage());
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
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
            resolve(createPlaceholderImage());
          }
        } else {
          resolve(createPlaceholderImage());
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.error('Image load failed', url);
        resolve(createPlaceholderImage());
      };

      img.src = url;
    });
  };

  // Helper to create a placeholder image
  const createPlaceholderImage = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f1f5f9'; // slate-100
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Image', 50, 50);
      return canvas.toDataURL('image/jpeg');
    }
    return ''; // Should not happen
  };

  // Helper to sanitize text for PDF
  const sanitizeForPdf = (str: string | undefined | null) => {
    if (!str) return '';
    // 1. Replace common full-width characters with ASCII equivalents
    let s = String(str)
      .replace(/\uFF08/g, '(')  // （
      .replace(/\uFF09/g, ')')  // ）
      .replace(/\u3002/g, '.')  // 。
      .replace(/\uFF0C/g, ',')  // ，
      .replace(/\uFF1A/g, ':')  // ：
      .replace(/\uFF1B/g, ';')  // ；
      .replace(/\u201C/g, '"')  // “
      .replace(/\u201D/g, '"')  // ”
      .replace(/\u2018/g, "'")  // ‘
      .replace(/\u2019/g, "'"); // ’

    // 2. Remove remaining non-Latin-1 characters to prevent garbage
    // Note: This means actual Chinese characters will be removed, but punctuation will be fixed.
    // If we want to keep Chinese, we MUST embed a font. For now, we clean it up.
    return s.replace(/[^\x00-\xFF]/g, '').trim();
  };

  const generatePDF = async (order: Order) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text(`Order ${order.id} `, 14, 22);

      doc.setFontSize(12);
      // Sanitize user name just in case
      doc.text(`Client: ${sanitizeForPdf(order.userName)} `, 14, 32);
      doc.text(`Date: ${new Date(order.date).toLocaleDateString()} `, 14, 38);

      if (order.deliveryMethod) {
        const method = order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery';
        const time = order.deliveryTime ? order.deliveryTime.replace('T', ' ') : '';
        doc.text(`Delivery: ${method} @${time} `, 14, 44);
        doc.text(`Total: $${order.total.toFixed(2)} `, 14, 50);
      } else {
        doc.text(`Total: $${order.total.toFixed(2)} `, 14, 44);
      }

      // Sort items by Department
      const sortedItems = [...order.items].sort((a, b) => {
        const deptA = a.department || '';
        const deptB = b.department || '';
        return deptA.localeCompare(deptB);
      });

      // Pre-load images and details
      const itemsWithImages = await Promise.all(sortedItems.map(async (item) => {
        // 1. Try item.imageUrl, department, taxable
        // 2. Fallback to finding product in store
        let imageUrl = item.imageUrl;
        let department = item.department;
        let taxable = item.taxable;
        let productExists = true;

        if (!imageUrl || !department || taxable === undefined) {
          const p = products.find(prod => prod.nameCN === item.productNameCN); // Try matching by name if ID not available in item
          if (p) {
            if (!imageUrl) imageUrl = p.imageUrl;
            if (!department) department = p.department;
            if (taxable === undefined) taxable = p.taxable;
          } else {
            // Product not found in current inventory
            if (!imageUrl) productExists = false;
          }
        }

        let imageData = null;
        if (imageUrl) {
          try {
            imageData = await getDataUrl(imageUrl);
          } catch (err) {
            console.error("Failed to load image for PDF:", imageUrl, err);
            // Continue without image
          }
        }

        return {
          ...item,
          imageData,
          department,
          taxable,
          productExists
        };
      }));

      const tableRows = itemsWithImages.map(item => {
        const name = sanitizeForPdf(item.productNameCN);
        const dept = item.department ? `Dept: ${sanitizeForPdf(item.department)}` : '';
        const taxInfo = `Tax: ${item.taxable ? 'Yes' : 'No'}`;
        const status = !item.productExists ? ' (Deleted)' : '';

        // Combine details into one cell with newlines
        const details = `${name}${status}\n${dept}\n${taxInfo}`;

        const qty = `${item.quantity} ${item.isCase ? '(Case)' : '(Unit)'} `;
        const price = `$${item.unitPrice.toFixed(2)} `;
        const total = `$${item.totalLine.toFixed(2)} `;

        // Pass imageData in the cell object for safe access in didDrawCell
        return [
          { content: '', imageData: item.imageData },
          details,
          qty,
          price,
          total
        ];
      });

      autoTable(doc, {
        startY: 60,
        margin: { bottom: 60 }, // Reserve space for footer summary
        head: [['Image', 'Product Details', 'Qty', 'Price', 'Total']],
        body: tableRows,
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const raw = data.cell.raw as any;
            if (raw && raw.imageData) {
              try {
                // Image in dedicated column, size 35x35
                doc.addImage(raw.imageData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 35, 35);
              } catch (e) {
                // Ignore image errors
              }
            }
          }
        },
        didDrawPage: (data) => {
          // Footer Note
          const pageHeight = doc.internal.pageSize.height;
          const pageWidth = doc.internal.pageSize.width;

          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text("* Prix Spécial / Special Price: Non soumis au rabais / Excluded from discount.", 20, pageHeight - 10);

          // Draw Summary on EVERY page
          const summaryY = pageHeight - 55;
          const rightMargin = 20;
          const valueX = pageWidth - rightMargin;
          const labelX = pageWidth - rightMargin - 40;

          doc.setFontSize(10);
          doc.setTextColor(0);

          // Calculate totals (these are order totals, not page totals)
          // We use the order object directly
          // Calculate original subtotal from items since it's not on the order object
          const originalSubTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
          const discountAmount = originalSubTotal - order.subTotal;

          // Helper to right align text
          const drawLine = (label: string, value: string, y: number, isBold: boolean = false, color: string = '#000000') => {
            doc.setFont(undefined, isBold ? 'bold' : 'normal');
            doc.setTextColor(color);
            doc.text(label, labelX, y, { align: 'right' });
            doc.text(value, valueX, y, { align: 'right' });
          };

          let currentY = summaryY;
          const lineHeight = 5;

          drawLine("Prix Original:", `$${originalSubTotal.toFixed(2)}`, currentY, true);
          currentY += lineHeight;

          if (discountAmount > 0.01) {
            drawLine("Rabais:", `-$${discountAmount.toFixed(2)}`, currentY, true, '#dc2626'); // Red color
            currentY += lineHeight;
          }

          drawLine("Sous-total:", `$${order.subTotal.toFixed(2)}`, currentY, true);
          currentY += lineHeight;

          drawLine("TPS (5%):", `$${order.taxTPS.toFixed(2)}`, currentY, true);
          currentY += lineHeight;

          drawLine("TVQ (9.975%):", `$${order.taxTVQ.toFixed(2)}`, currentY, true);
          currentY += lineHeight + 2;

          doc.setFontSize(12);
          drawLine("Total:", `$${order.total.toFixed(2)}`, currentY, true, '#4f46e5'); // Indigo color
        },
        styles: { valign: 'middle' },
        headStyles: { minCellHeight: 10 }, // Standard height for header
        bodyStyles: { minCellHeight: 40 }, // Increased height for body rows (images)
        columnStyles: {
          0: { cellWidth: 40 }, // Dedicated Image column
          1: { cellWidth: 80 }  // Product Details column (wider)
        }
      });

      doc.save(`Order_${order.id}.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error?.message || error}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Order History</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            >
              <option value="all">All Clients</option>
              {users.filter(u => u.role === 'client').map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedOrders.map(order => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{order.id}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span>{new Date(order.date).toLocaleString()}</span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">{order.userName}</span>
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
                    onClick={() => setInvoicingOrder(order)}
                    className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-bold flex items-center gap-1"
                  >
                    <FileText size={14} /> Invoice
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
                    <th className="p-2 font-medium text-right">Prix (Orig.)</th>
                    <th className="p-2 font-medium text-center">Disc.</th>
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

                      const discountRate = order.discountRate || 1;
                      const isDiscounted = !item.isSpecialPrice && discountRate < 1;

                      return (
                        <tr key={idx} className="border-b border-slate-50 last:border-0">
                          <td className="p-2 pl-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center text-center">
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
                            {item.isSpecialPrice && (
                              <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded mt-1 ml-1">
                                Special Price *
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
                          <td className="p-2 text-center font-mono text-emerald-600 font-bold text-xs">
                            {isDiscounted ? `-${((1 - discountRate) * 100).toFixed(0)}%` : '-'}
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
                {/* Calculate Original Subtotal for display */}
                {(() => {
                  const originalSubTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
                  const discountAmount = originalSubTotal - order.subTotal;

                  return (
                    <>
                      <div className="text-slate-500">Original Price: <span className="font-mono font-bold text-slate-700">${originalSubTotal.toFixed(2)}</span></div>
                      {discountAmount > 0.01 && (
                        <div className="text-emerald-600">Discount: <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span></div>
                      )}
                      <div className="text-slate-500 pt-1 border-t border-slate-100 mt-1">Subtotal (Net): <span className="font-mono font-bold text-slate-700">${order.subTotal.toFixed(2)}</span></div>
                    </>
                  );
                })()}

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

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {invoicingOrder && (
        <InvoiceModal
          order={invoicingOrder}
          companyInfo={companyInfo}
          users={users}
          onClose={() => setInvoicingOrder(null)}
        />
      )}
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
              from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);