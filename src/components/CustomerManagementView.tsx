import React, { useState } from 'react';
import { 
  Users, Award, Tag, Plus, Search, Trash2, Edit3, 
  RotateCcw, CheckSquare, Square, ShieldCheck, Phone, MapPin
} from 'lucide-react';
import { Customer, MemberLevel, MemberPriceRule, UserRole, FruitProduct } from '../types';
import { formatRupiah } from '../utils/weightUtils';
import { INITIAL_MEMBER_LEVELS, INITIAL_MEMBER_PRICES } from '../data/initialData';

interface CustomerManagementViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: FruitProduct[];
  userRole: UserRole;
  onOpenAddCustomerModal: () => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  customers,
  setCustomers,
  products,
  userRole,
  onOpenAddCustomerModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pelanggan' | 'level' | 'harga'>('pelanggan');
  const [showTrash, setShowTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Member levels state
  const [memberLevels, setMemberLevels] = useState<MemberLevel[]>(INITIAL_MEMBER_LEVELS);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [levelName, setLevelName] = useState('');
  const [levelMinSpend, setLevelMinSpend] = useState(1000000);
  const [levelDiscount, setLevelDiscount] = useState(5);
  const [levelPerks, setLevelPerks] = useState('');

  // Member price rules state
  const [memberPrices, setMemberPrices] = useState<MemberPriceRule[]>(INITIAL_MEMBER_PRICES);

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const trashMatch = showTrash ? c.isDeleted : !c.isDeleted;
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.phone.includes(searchTerm);
    return trashMatch && searchMatch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSoftDelete = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
  };

  const handleRestore = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: false } : c));
  };

  const handleBulkSoftDelete = () => {
    if (showTrash) {
      if (confirm(`Hapus PERMANEN ${selectedIds.length} pelanggan terpilih?`)) {
        setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      }
    } else {
      if (confirm(`Pindahkan ${selectedIds.length} pelanggan ke Tong Sampah?`)) {
        setCustomers(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, isDeleted: true } : c));
        setSelectedIds([]);
      }
    }
  };

  const handleAddMemberLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelName.trim()) return;
    const newLvl: MemberLevel = {
      id: `ml-${Date.now()}`,
      name: levelName.trim(),
      minSpend: levelMinSpend,
      discountPercent: levelDiscount,
      perks: levelPerks.trim() || 'Fasilitas member eksklusif'
    };
    setMemberLevels(prev => [...prev, newLvl]);
    setLevelName('');
    setIsAddingLevel(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Pelanggan & Keanggotaan Member
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen basis data pelanggan toko, tiering level keanggotaan, dan aturan diskon khusus member.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('pelanggan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'pelanggan'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 Pelanggan ({customers.filter(c => !c.isDeleted).length})
          </button>

          {userRole !== 'KASIR' && (
            <button
              onClick={() => setActiveSubTab('level')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'level'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👑 Level Member ({memberLevels.length})
            </button>
          )}

          {userRole !== 'KASIR' && (
            <button
              onClick={() => setActiveSubTab('harga')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'harga'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏷️ Harga Member ({memberPrices.length})
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: PELANGGAN */}
      {activeSubTab === 'pelanggan' && (
        <div className="space-y-4">
          
          {/* Member Points Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">TOTAL MEMBER AKTIF</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {customers.filter(c => !c.isDeleted).length} Orang
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Siap Transaksi & Dapat Poin</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-lg">
                👥
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between bg-gradient-to-br from-amber-50/50 to-white">
              <div>
                <div className="text-[10px] font-bold text-amber-800 uppercase">TOTAL POIN BEREDAR</div>
                <div className="text-2xl font-black text-amber-900 mt-0.5">
                  🪙 {customers.filter(c => !c.isDeleted).reduce((acc, c) => acc + (c.points || 0), 0)} Poin
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Setiap Rp 10.000 = 1 Poin</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-extrabold text-lg">
                🌟
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">TOTAL SPEND MEMBER</div>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">
                  {formatRupiah(customers.filter(c => !c.isDeleted).reduce((acc, c) => acc + (c.totalSpend || 0), 0))}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Akumulasi Belanja Pelanggan</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-lg">
                💳
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama / nomor WA pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setShowTrash(!showTrash);
                  setSelectedIds([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  showTrash ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Tong Sampah
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkSoftDelete}
                  className="px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Hapus {selectedIds.length} Terpilih
                </button>
              )}

              <button
                onClick={onOpenAddCustomerModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Pelanggan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button onClick={toggleSelectAll}>
                        {selectedIds.length > 0 && selectedIds.length === filteredCustomers.length ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">Nama Pelanggan</th>
                    <th className="p-3.5">Telepon / WhatsApp</th>
                    <th className="p-3.5">Level Member</th>
                    <th className="p-3.5 text-center">🌟 Total Poin</th>
                    <th className="p-3.5">Total Belanja</th>
                    <th className="p-3.5">Alamat / Catatan</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Tidak ada data pelanggan.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => {
                      const isSelected = selectedIds.includes(c.id);
                      return (
                        <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}>
                          <td className="p-3.5 text-center">
                            <button onClick={() => toggleSelectId(c.id)}>
                              {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                            </button>
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                          <td className="p-3.5 font-mono text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> {c.phone}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                              {c.memberType || 'Regular'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs">
                              🪙 {c.points || 0} Poin
                            </span>
                          </td>
                          <td className="p-3.5 font-bold font-mono text-emerald-800">
                            {formatRupiah(c.totalSpend || 0)}
                            <div className="text-[10px] text-slate-400 font-normal">{c.totalOrders || 0} Trx</div>
                          </td>
                          <td className="p-3.5 text-slate-600 text-[11px]">{c.address || c.notes || '-'}</td>
                          <td className="p-3.5 text-right">
                            {showTrash ? (
                              <button onClick={() => handleRestore(c.id)} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => handleSoftDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

      {/* SUB-TAB 2: LEVEL MEMBER */}
      {activeSubTab === 'level' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Tingkatan & Syarat Belanja Level Member</h3>
            <button
              onClick={() => setIsAddingLevel(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Level Member
            </button>
          </div>

          {isAddingLevel && (
            <form onSubmit={handleAddMemberLevel} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-emerald-900">Form Level Member Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Level (misal: Diamond Member)"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Min Belanja (Rp)"
                  value={levelMinSpend}
                  onChange={(e) => setLevelMinSpend(parseInt(e.target.value) || 0)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Diskon (%)"
                  value={levelDiscount}
                  onChange={(e) => setLevelDiscount(parseInt(e.target.value) || 0)}
                  className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Fasilitas / Perks (misal: Diskon 12% + hampers ulang tahun)"
                value={levelPerks}
                onChange={(e) => setLevelPerks(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-xl outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingLevel(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-xl">Simpan Level</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {memberLevels.map(lvl => (
              <div key={lvl.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-base">{lvl.name}</div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs">
                    Diskon {lvl.discountPercent}%
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Min Spend: <span className="font-bold text-slate-900">{formatRupiah(lvl.minSpend)}</span>
                </div>
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl font-medium">
                  ✨ {lvl.perks}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HARGA MEMBER */}
      {activeSubTab === 'harga' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Aturan Harga Khusus per Level Member</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Nama Produk</th>
                  <th className="p-3.5">Level Member</th>
                  <th className="p-3.5">Harga Khusus / kg</th>
                  <th className="p-3.5">Diskon Tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {memberPrices.map(mp => (
                  <tr key={mp.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{mp.productName}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {mp.memberLevelName}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-emerald-700">{formatRupiah(mp.customPriceKg)}</td>
                    <td className="p-3.5 font-bold text-slate-700">{mp.discountPercent}% OFF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
