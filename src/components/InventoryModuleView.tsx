import React, { useState } from 'react';
import { 
  Building2, Warehouse as WarehouseIcon, Truck, ShoppingCart, 
  ClipboardCheck, ScrollText, Layers, Plus, Search, Trash2, Edit3, RotateCcw,
  CheckSquare, Square, Store, MapPin, Phone, Calendar, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { 
  Branch, Warehouse, Supplier, PurchaseOrder, StockOpname, 
  StockCardItem, ProductionItem, UserRole, FruitProduct 
} from '../types';
import { formatRupiah } from '../utils/weightUtils';
import { 
  INITIAL_BRANCHES, INITIAL_WAREHOUSES, INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, INITIAL_STOCK_OPNAMES, INITIAL_PRODUCTION_ITEMS 
} from '../data/initialData';

interface InventoryModuleViewProps {
  products: FruitProduct[];
  userRole: UserRole;
  currentBranchId: string;
}

export const InventoryModuleView: React.FC<InventoryModuleViewProps> = ({
  products,
  userRole,
  currentBranchId
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cabang' | 'gudang' | 'supplier' | 'pembelian' | 'opname' | 'kartustok' | 'produksi'
  >('cabang');

  // Multi-branch state
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(INITIAL_STOCK_OPNAMES);
  const [productions, setProductions] = useState<ProductionItem[]>(INITIAL_PRODUCTION_ITEMS);

  // Sample Stock Card logs
  const [stockCardLogs] = useState<StockCardItem[]>([
    {
      id: 'sc-1',
      productId: '1',
      productName: 'Apel Fuji Super Impor',
      type: 'IN',
      qtyKg: 50,
      unit: 'kg',
      referenceNo: 'PO-202607-001',
      timestamp: '2026-07-28T10:30:00Z',
      branchId: 'b1',
      notes: 'Penerimaan PO Supplier PT Agro Buah'
    },
    {
      id: 'sc-2',
      productId: '1',
      productName: 'Apel Fuji Super Impor',
      type: 'SALE',
      qtyKg: 2.5,
      unit: 'kg',
      referenceNo: 'TX-89211',
      timestamp: '2026-07-31T14:20:00Z',
      branchId: 'b1',
      notes: 'Penjualan Kasir POS'
    },
    {
      id: 'sc-3',
      productId: '1',
      productName: 'Apel Fuji Super Impor',
      type: 'ADJUSTMENT',
      qtyKg: -0.5,
      unit: 'kg',
      referenceNo: 'SO-202607-01',
      timestamp: '2026-07-30T16:00:00Z',
      branchId: 'b1',
      notes: 'Penyesuaian Stok Opname (Busuk)'
    }
  ]);

  // Forms
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [suppName, setSuppName] = useState('');
  const [suppContact, setSuppContact] = useState('');
  const [suppPhone, setSuppPhone] = useState('');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    const bObj: Branch = {
      id: `b-${Date.now()}`,
      name: branchName.trim(),
      code: branchCode.trim() || `CBG-${branches.length + 1}`,
      address: branchAddress.trim() || 'Jl. Raya Buah Segar',
      phone: '0812-9900-1122',
      isMain: false
    };
    setBranches(prev => [...prev, bObj]);
    setBranchName('');
    setBranchCode('');
    setBranchAddress('');
    setIsAddingBranch(false);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    const sObj: Supplier = {
      id: `s-${Date.now()}`,
      name: suppName.trim(),
      contactPerson: suppContact.trim() || 'Admin Supplier',
      phone: suppPhone.trim() || '0812-3456-7890',
      address: 'Kota Supplier Buah'
    };
    setSuppliers(prev => [...prev, sObj]);
    setSuppName('');
    setSuppContact('');
    setSuppPhone('');
    setIsAddingSupplier(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Manajemen Inventori, Cabang & Gudang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan multi-cabang, pergudangan, pemasok supplier, order pembelian PO, stok opname, dan produksi bundling.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('cabang')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'cabang' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏪 Cabang ({branches.length})
          </button>

          <button
            onClick={() => setActiveSubTab('gudang')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'gudang' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏬 Gudang ({warehouses.length})
          </button>

          <button
            onClick={() => setActiveSubTab('supplier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'supplier' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚚 Supplier ({suppliers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('pembelian')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'pembelian' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛒 Pembelian PO ({purchaseOrders.length})
          </button>

          <button
            onClick={() => setActiveSubTab('opname')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'opname' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Stok Opname
          </button>

          <button
            onClick={() => setActiveSubTab('kartustok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'kartustok' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📜 Kartu Stok
          </button>

          <button
            onClick={() => setActiveSubTab('produksi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'produksi' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Produksi Bundling
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CABANG */}
      {activeSubTab === 'cabang' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Daftar Toko / Cabang Operasional POS</h3>
            {userRole === 'OWNER' && (
              <button
                onClick={() => setIsAddingBranch(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Cabang Baru
              </button>
            )}
          </div>

          {isAddingBranch && (
            <form onSubmit={handleAddBranch} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-blue-900">Form Cabang Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Cabang (misal: Cabang Semarang Central)"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Kode Cabang (misal: SMG-01)"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Alamat Cabang"
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingBranch(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white font-bold text-xs rounded-xl">Simpan Cabang</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {branches.map(b => (
              <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-blue-600" />
                    {b.name}
                  </div>
                  {b.isMain && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Pusat</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono">Kode: {b.code}</div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {b.address}
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {b.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GUDANG */}
      {activeSubTab === 'gudang' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Daftar Gudang Penyimpanan & Cold Storage</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {warehouses.map(w => {
              const bObj = branches.find(b => b.id === w.branchId);
              return (
                <div key={w.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <WarehouseIcon className="w-4 h-4 text-purple-600" />
                      {w.name}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Cabang: <span className="font-bold text-slate-800">{bObj?.name || 'Cabang Utama'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {w.address}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SUPPLIER */}
      {activeSubTab === 'supplier' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Daftar Supplier / Pemasok Buah Segar</h3>
            {userRole !== 'KASIR' && (
              <button
                onClick={() => setIsAddingSupplier(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Supplier
              </button>
            )}
          </div>

          {isAddingSupplier && (
            <form onSubmit={handleAddSupplier} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-blue-900">Form Supplier Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama PT / CV / Koperasi Supplier"
                  value={suppName}
                  onChange={(e) => setSuppName(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Person (Sales)"
                  value={suppContact}
                  onChange={(e) => setSuppContact(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="No HP / Whatsapp"
                  value={suppPhone}
                  onChange={(e) => setSuppPhone(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-blue-300 rounded-xl outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingSupplier(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white font-bold text-xs rounded-xl">Simpan Supplier</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="font-extrabold text-slate-900 text-base">{s.name}</div>
                <div className="text-xs text-slate-600 font-medium">Sales: <span className="font-bold">{s.contactPerson}</span></div>
                <div className="text-xs text-slate-600 font-mono">WA: {s.phone}</div>
                <div className="text-[11px] text-slate-500">{s.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PEMBELIAN PO */}
      {activeSubTab === 'pembelian' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Daftar Purchase Order (PO) Pembelian Buah</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">No. PO</th>
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Detail Item Buah</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5 text-center">Status PO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{po.poNumber}</td>
                    <td className="p-3.5 font-bold text-slate-800">{po.supplierName}</td>
                    <td className="p-3.5 text-slate-600">{new Date(po.timestamp).toLocaleDateString('id-ID')}</td>
                    <td className="p-3.5">
                      {po.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          • {it.productName} ({it.quantityKg} kg @ {formatRupiah(it.costPriceKg)})
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 font-extrabold font-mono text-emerald-700">{formatRupiah(po.grandTotal)}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px]">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: STOK OPNAME */}
      {activeSubTab === 'opname' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Stok Opname Penyesuaian Fisik vs Sistem</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">No. Opname</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Pemeriksa</th>
                  <th className="p-3.5">Hasil Penyesuaian</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockOpnames.map(so => (
                  <tr key={so.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{so.opnameNumber}</td>
                    <td className="p-3.5 text-slate-600">{so.date}</td>
                    <td className="p-3.5 font-bold text-slate-800">{so.inspectorName}</td>
                    <td className="p-3.5">
                      {so.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          • {it.productName}: Sistem {it.systemQtyKg}kg, Fisik {it.physicalQtyKg}kg (Selisih {it.differenceKg}kg)
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-[10px]">
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: KARTU STOK */}
      {activeSubTab === 'kartustok' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Kartu Stok (Mutasi Masuk / Keluar Barang)</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Produk Buah</th>
                  <th className="p-3.5">Tipe Mutasi</th>
                  <th className="p-3.5">Jumlah</th>
                  <th className="p-3.5">No. Referensi</th>
                  <th className="p-3.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockCardLogs.map(sc => (
                  <tr key={sc.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(sc.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{sc.productName}</td>
                    <td className="p-3.5 font-bold">
                      {sc.type === 'IN' && <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">MASUK (PO)</span>}
                      {sc.type === 'SALE' && <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">TERJUAL (POS)</span>}
                      {sc.type === 'ADJUSTMENT' && <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ADJUSTMENT</span>}
                    </td>
                    <td className="p-3.5 font-bold font-mono">{sc.qtyKg > 0 ? `+${sc.qtyKg}` : sc.qtyKg} {sc.unit}</td>
                    <td className="p-3.5 font-mono text-slate-600">{sc.referenceNo}</td>
                    <td className="p-3.5 text-slate-600 text-[11px]">{sc.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PRODUKSI BUNDLING */}
      {activeSubTab === 'produksi' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Produksi Barang (Parsel Buah & Potong Jus)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productions.map(prd => (
              <div key={prd.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-sm">{prd.name}</div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-full">{prd.status}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Hasil: <span className="font-bold text-slate-900">{prd.resultQty} {prd.resultUnit} {prd.resultProductName}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Komposisi: {prd.ingredients.map(i => `${i.productName} (${i.qtyKg}kg)`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
