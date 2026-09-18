import React, { useState } from 'react';
import { 
  Package, Tag, Scale, Plus, Search, Trash2, RotateCcw, 
  Edit3, Check, X, ShieldAlert, CheckSquare, Square, Download
} from 'lucide-react';
import { FruitProduct, FruitCategory, UnitDefinition, UserRole } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface MasterDataViewProps {
  products: FruitProduct[];
  setProducts: React.Dispatch<React.SetStateAction<FruitProduct[]>>;
  units: UnitDefinition[];
  setUnits: React.Dispatch<React.SetStateAction<UnitDefinition[]>>;
  userRole: UserRole;
  onOpenAddProductModal: () => void;
  onEditProduct: (product: FruitProduct) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  products,
  setProducts,
  units,
  setUnits,
  userRole,
  onOpenAddProductModal,
  onEditProduct
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'produk' | 'kategori' | 'satuan'>('produk');
  const [showTrash, setShowTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Categories list state
  const [categories, setCategories] = useState<{ id: string; name: string; count: number; isDeleted?: boolean }[]>([
    { id: 'cat-1', name: 'Lokal', count: 4 },
    { id: 'cat-2', name: 'Impor', count: 4 },
    { id: 'cat-3', name: 'Organik', count: 2 },
    { id: 'cat-4', name: 'Potong & Jus', count: 2 },
    { id: 'cat-5', name: 'Premium', count: 1 }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Unit Form
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');
  const [newUnitMultiplier, setNewUnitMultiplier] = useState(1);
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  // Filter products by search, trash state, category
  const filteredProducts = products.filter(p => {
    const isDeletedMatch = showTrash ? p.isDeleted : !p.isDeleted;
    const catMatch = selectedCategory === 'ALL' || p.category === selectedCategory;
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.barcode.includes(searchTerm);
    return isDeletedMatch && catMatch && searchMatch;
  });

  // Bulk selection logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Soft Delete / Restore / Bulk Delete
  const handleSoftDeleteProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleRestoreProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handlePermanentDeleteProduct = (id: string) => {
    if (confirm('Hapus produk ini secara PERMANEN? Data tidak dapat dikembalikan.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkSoftDelete = () => {
    if (selectedIds.length === 0) return;
    if (showTrash) {
      if (confirm(`Hapus PERMANEN ${selectedIds.length} produk terpilih?`)) {
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      }
    } else {
      if (confirm(`Pindahkan ${selectedIds.length} produk terpilih ke Tong Sampah?`)) {
        setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isDeleted: true } : p));
        setSelectedIds([]);
      }
    }
  };

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isDeleted: false } : p));
    setSelectedIds([]);
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      count: 0
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setIsAddingCat(false);
  };

  // Add Unit Handler
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;
    const unitObj: UnitDefinition = {
      id: `u-${Date.now()}`,
      name: newUnitName.trim(),
      symbol: newUnitSymbol.trim().toLowerCase(),
      description: `Satuan kustom ${newUnitName.trim()}`,
      baseMultiplier: newUnitMultiplier
    };
    setUnits(prev => [...prev, unitObj]);
    setNewUnitName('');
    setNewUnitSymbol('');
    setNewUnitMultiplier(1);
    setIsAddingUnit(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* View Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Master Data Produk & Satuan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan katalog produk buah, kategori rasa/asal, dan definisi satuan timbangan POS.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('produk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'produk'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Produk Buah ({products.filter(p => !p.isDeleted).length})
          </button>

          <button
            onClick={() => setActiveSubTab('kategori')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'kategori'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏷️ Kategori ({categories.filter(c => !c.isDeleted).length})
          </button>

          <button
            onClick={() => setActiveSubTab('satuan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'satuan'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ Satuan ({units.filter(u => !u.isDeleted).length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PRODUK */}
      {activeSubTab === 'produk' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama produk / barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Trash Bin Toggle */}
              <button
                onClick={() => {
                  setShowTrash(!showTrash);
                  setSelectedIds([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  showTrash
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tong Sampah ({products.filter(p => p.isDeleted).length})</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 px-2">{selectedIds.length} Terpilih</span>
                  {showTrash ? (
                    <button
                      onClick={handleBulkRestore}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Pulihkan
                    </button>
                  ) : null}
                  <button
                    onClick={handleBulkSoftDelete}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {showTrash ? 'Hapus Permanen' : 'Hapus Terpilih'}
                  </button>
                </div>
              )}

              {userRole !== 'KASIR' && !showTrash && (
                <button
                  onClick={onOpenAddProductModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Buah Baru
                </button>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button onClick={toggleSelectAll} className="p-1">
                        {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">Produk Buah</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Harga Modal</th>
                    <th className="p-3.5">Harga Jual / kg</th>
                    <th className="p-3.5">Harga Jual / ons</th>
                    <th className="p-3.5 text-center">Stok Sistem</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        {showTrash ? 'Tong sampah kosong.' : 'Tidak ada data produk buah yang cocok.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}>
                          <td className="p-3.5 text-center">
                            <button onClick={() => toggleSelectId(p.id)} className="p-1">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </button>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
                                }}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">{formatRupiah(p.costPriceKg)}</td>
                          <td className="p-3.5 font-bold font-mono text-slate-900">{formatRupiah(p.sellingPriceKg)}</td>
                          <td className="p-3.5 font-bold font-mono text-emerald-700">{formatRupiah(p.sellingPriceOns)}</td>
                          <td className="p-3.5 text-center">
                            <span className={`font-bold font-mono px-2 py-1 rounded-lg text-xs ${
                              p.stockKg <= p.minStockKg ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {p.stockKg} kg
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {showTrash ? (
                                <>
                                  <button
                                    onClick={() => handleRestoreProduct(p.id)}
                                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Pulihkan dari Sampah"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteProduct(p.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Permanen"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {userRole !== 'KASIR' && (
                                    <button
                                      onClick={() => onEditProduct(p)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Produk"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {userRole !== 'KASIR' && (
                                    <button
                                      onClick={() => handleSoftDeleteProduct(p.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Hapus ke Tong Sampah"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KATEGORI */}
      {activeSubTab === 'kategori' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Daftar Kategori Rasa & Jenis Buah</h3>
            {userRole !== 'KASIR' && (
              <button
                onClick={() => setIsAddingCat(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Kategori
              </button>
            )}
          </div>

          {isAddingCat && (
            <form onSubmit={handleAddCategory} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-emerald-900">Form Kategori Baru</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Kategori (misal: Tropis, Organik, Import Special)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl">Simpan</button>
                <button type="button" onClick={() => setIsAddingCat(false)} className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const productCount = products.filter(p => p.category === cat.name && !p.isDeleted).length;
              return (
                <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{productCount} Produk Buah Terdaftar</div>
                  </div>
                  <Tag className="w-5 h-5 text-emerald-600" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SATUAN */}
      {activeSubTab === 'satuan' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Definisi Satuan Timbangan & Kemasan POS</h3>
            {userRole !== 'KASIR' && (
              <button
                onClick={() => setIsAddingUnit(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Satuan
              </button>
            )}
          </div>

          {isAddingUnit && (
            <form onSubmit={handleAddUnit} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-emerald-900">Form Satuan Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Satuan (misal: Keranjang)"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Simbol (misal: krj)"
                  value={newUnitSymbol}
                  onChange={(e) => setNewUnitSymbol(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.001"
                  placeholder="Multiplier dari Base (kg)"
                  value={newUnitMultiplier}
                  onChange={(e) => setNewUnitMultiplier(parseFloat(e.target.value) || 1)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingUnit(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-xl">Simpan Satuan</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {units.map((u) => (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{u.name} ({u.symbol})</div>
                  <Scale className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs text-slate-500">{u.description}</div>
                <div className="text-[10px] text-slate-400 font-mono">Faktor Multiplier: {u.baseMultiplier}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
