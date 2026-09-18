import React, { useState } from 'react';
import { 
  Package, Plus, Search, AlertTriangle, RefreshCw, 
  Edit3, Trash2, ArrowUpRight, TrendingUp, DollarSign,
  Scale, Tag, Check, X, ShieldAlert, Upload, Image as ImageIcon
} from 'lucide-react';
import { FruitProduct, FruitCategory, RestockLog } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface InventoryViewProps {
  products: FruitProduct[];
  onAddProduct: (product: Omit<FruitProduct, 'id'>) => void;
  onUpdateProduct: (productId: string, updated: Partial<FruitProduct>) => void;
  onDeleteProduct: (productId: string) => void;
  onRestock: (productId: string, amountKg: number, costPerKg: number, supplier: string, notes?: string) => void;
  restockLogs: RestockLog[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestock,
  restockLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'CRITICAL' | 'OUT_OF_STOCK'>('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFruit, setEditingFruit] = useState<FruitProduct | null>(null);
  const [restockFruit, setRestockFruit] = useState<FruitProduct | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FruitCategory>('Lokal');
  const [formBarcode, setFormBarcode] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCostPrice, setFormCostPrice] = useState(15000);
  const [formSellingPriceKg, setFormSellingPriceKg] = useState(25000);
  const [formSellingPriceOns, setFormSellingPriceOns] = useState(2600);
  const [formStockKg, setFormStockKg] = useState(20);
  const [formMinStockKg, setFormMinStockKg] = useState(5);
  const [formOrigin, setFormOrigin] = useState('');

  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran file maksimal 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form state for Restock Modal
  const [restockAmountKg, setRestockAmountKg] = useState(10);
  const [restockCostPerKg, setRestockCostPerKg] = useState(15000);
  const [restockSupplier, setRestockSupplier] = useState('Distributor Buah Segar');

  // Stats Calculations
  const totalStockKg = products.reduce((acc, p) => acc + p.stockKg, 0);
  const totalCostValue = products.reduce((acc, p) => acc + (p.stockKg * p.costPriceKg), 0);
  const totalSellingValue = products.reduce((acc, p) => acc + (p.stockKg * p.sellingPriceKg), 0);
  const lowStockCount = products.filter(p => p.stockKg <= p.minStockKg).length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    if (stockFilter === 'CRITICAL') return matchesSearch && p.stockKg <= p.minStockKg && p.stockKg > 0;
    if (stockFilter === 'OUT_OF_STOCK') return matchesSearch && p.stockKg <= 0;
    return matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingFruit(null);
    setFormName('');
    setFormCategory('Lokal');
    setFormBarcode(`899100${Math.floor(10000 + Math.random() * 90000)}`);
    setFormImage('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80');
    setFormCostPrice(15000);
    setFormSellingPriceKg(25000);
    setFormSellingPriceOns(2600);
    setFormStockKg(25);
    setFormMinStockKg(5);
    setFormOrigin('Jawa Timur');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (fruit: FruitProduct) => {
    setEditingFruit(fruit);
    setFormName(fruit.name);
    setFormCategory(fruit.category);
    setFormBarcode(fruit.barcode);
    setFormImage(fruit.imageUrl);
    setFormCostPrice(fruit.costPriceKg);
    setFormSellingPriceKg(fruit.sellingPriceKg);
    setFormSellingPriceOns(fruit.sellingPriceOns || Math.round(fruit.sellingPriceKg / 10));
    setFormStockKg(fruit.stockKg);
    setFormMinStockKg(fruit.minStockKg);
    setFormOrigin(fruit.origin || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formSellingPriceKg <= 0) return;

    if (editingFruit) {
      onUpdateProduct(editingFruit.id, {
        name: formName,
        category: formCategory,
        barcode: formBarcode,
        imageUrl: formImage,
        costPriceKg: formCostPrice,
        sellingPriceKg: formSellingPriceKg,
        sellingPriceOns: formSellingPriceOns,
        stockKg: formStockKg,
        minStockKg: formMinStockKg,
        origin: formOrigin
      });
    } else {
      onAddProduct({
        name: formName,
        category: formCategory,
        barcode: formBarcode,
        imageUrl: formImage,
        costPriceKg: formCostPrice,
        sellingPriceKg: formSellingPriceKg,
        sellingPriceOns: formSellingPriceOns,
        stockKg: formStockKg,
        minStockKg: formMinStockKg,
        unitType: 'weight',
        origin: formOrigin
      });
    }
    setIsAddModalOpen(false);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockFruit || restockAmountKg <= 0) return;
    onRestock(restockFruit.id, restockAmountKg, restockCostPerKg, restockSupplier);
    setRestockFruit(null);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Stok Buah</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{totalStockKg.toFixed(1)} <span className="text-sm text-slate-500">kg</span></div>
          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">Semua Kategori Tersedia</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Nilai Modal Stok</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatRupiah(totalCostValue)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Modal Aset Produk Buah</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Estimasi Penjualan</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">{formatRupiah(totalSellingValue)}</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Potensi Omset Keseluruhan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Peringatan Stok Kritis</div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} <span className="text-xs">Produk</span>
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-0.5">Perlu Segera Di-Restock</div>
        </div>

      </div>

      {/* Controls & Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama buah atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              stockFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Semua Produk ({products.length})
          </button>

          <button
            onClick={() => setStockFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              stockFilter === 'CRITICAL'
                ? 'bg-amber-500 text-slate-950 border-amber-600'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            ⚠️ Stok Kritis ({lowStockCount})
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 ml-auto"
          >
            <Plus className="w-4 h-4" />
            + Tambah Buah Baru
          </button>
        </div>

      </div>

      {/* Inventory Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Produk Buah</th>
                <th className="p-3.5">Barcode</th>
                <th className="p-3.5">Stok Real-Time</th>
                <th className="p-3.5">Harga Modal / kg</th>
                <th className="p-3.5">Harga Jual / kg</th>
                <th className="p-3.5">Harga Jual / ons</th>
                <th className="p-3.5">Margin (%)</th>
                <th className="p-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredProducts.map((p) => {
                const marginPercent = Math.round(((p.sellingPriceKg - p.costPriceKg) / p.costPriceKg) * 100);
                const isLowStock = p.stockKg <= p.minStockKg;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
                          }}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded-md font-bold">{p.category}</span>
                            {p.origin && <span>📍 {p.origin}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 font-bold">
                      {p.barcode}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                          {p.stockKg.toFixed(1)} kg
                        </span>
                        {isLowStock && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold rounded-md border border-amber-300">
                            Kritis
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-700">
                      {formatRupiah(p.costPriceKg)}
                    </td>

                    <td className="p-3.5 font-extrabold text-emerald-800">
                      {formatRupiah(p.sellingPriceKg)}
                    </td>

                    <td className="p-3.5 font-bold text-amber-700">
                      {formatRupiah(p.sellingPriceOns || Math.round(p.sellingPriceKg / 10))}
                    </td>

                    <td className="p-3.5 font-extrabold text-emerald-600">
                      +{marginPercent}%
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setRestockFruit(p);
                          setRestockCostPerKg(p.costPriceKg);
                          setRestockAmountKg(10);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        + Restock
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="Edit Produk"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingFruit ? 'Edit Data Buah' : 'Tambah Buah Baru Ke Katalog'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Buah:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Apel Fuji Super Impor"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FruitCategory)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Lokal">Lokal</option>
                    <option value="Impor">Impor</option>
                    <option value="Organik">Organik</option>
                    <option value="Potong & Jus">Potong & Jus</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Barcode:</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Modal / kg (Rp):</label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Jual / kg (Rp):</label>
                  <input
                    type="number"
                    value={formSellingPriceKg}
                    onChange={(e) => {
                      const kgPrice = parseFloat(e.target.value) || 0;
                      setFormSellingPriceKg(kgPrice);
                      setFormSellingPriceOns(Math.round(kgPrice / 10));
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Jual / ons (100g) (Rp):</label>
                  <input
                    type="number"
                    value={formSellingPriceOns}
                    onChange={(e) => setFormSellingPriceOns(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Stok Awal (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formStockKg}
                    onChange={(e) => setFormStockKg(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Asal Daerah / Negara:</label>
                <input
                  type="text"
                  placeholder="Contoh: Malang, Jawa Timur / Washington, USA"
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Upload Foto Buah:</label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl p-3">
                  {formImage ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0 group bg-slate-100">
                      <img
                        src={formImage}
                        alt="Preview Buah"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4 text-red-300" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0 text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>{formImage ? 'Ganti Foto Buah' : 'Pilih Foto Buah'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFormFileUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="text-[10px] text-slate-500 font-medium">Format: JPG, PNG, WEBP (Maks 8MB)</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Simpan Produk Buah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK BUAH */}
      {restockFruit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setRestockFruit(null)} />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Restock Stok Masuk - {restockFruit.name}</h3>
              <button onClick={() => setRestockFruit(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <img src={restockFruit.imageUrl} alt={restockFruit.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{restockFruit.name}</div>
                  <div className="text-xs text-slate-600">Stok Saat Ini: <span className="font-bold text-emerald-800">{restockFruit.stockKg} kg</span></div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Jumlah Tambahan Stok (kg):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={restockAmountKg}
                  onChange={(e) => setRestockAmountKg(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-extrabold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Modal Baru / kg (Rp):</label>
                <input
                  type="number"
                  required
                  value={restockCostPerKg}
                  onChange={(e) => setRestockCostPerKg(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Supplier / Pasar Grosir:</label>
                <input
                  type="text"
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockFruit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  + Tambahkan Stok Real-Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
