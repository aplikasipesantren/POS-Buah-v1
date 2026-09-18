import React from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag, Package, 
  AlertTriangle, Users, ArrowUpRight, ArrowDownRight, RefreshCw, 
  Plus, QrCode, Building2, UserCheck, ShieldCheck, Lock, 
  Calendar, CheckCircle2, ChevronRight, Store, Sparkles, Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Transaction, FruitProduct, Customer, UserRole, Branch } from '../types';
import { formatRupiah, convertToKg } from '../utils/weightUtils';

interface DashboardViewProps {
  transactions: Transaction[];
  products: FruitProduct[];
  customers: Customer[];
  branches: Branch[];
  currentBranchId: string;
  userRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onOpenReceipt: (tx: Transaction) => void;
  onOpenShiftModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  products,
  customers,
  branches,
  currentBranchId,
  userRole,
  onNavigateTab,
  onOpenReceipt,
  onOpenShiftModal
}) => {
  // 1. Date Calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTransactions = transactions.filter(tx => {
    return tx.timestamp.startsWith(todayStr) && tx.status === 'COMPLETED';
  });

  // Today Revenue & Profit
  const todayRevenue = todayTransactions.reduce((acc, tx) => acc + tx.totalAmount, 0);

  // Today Cost of Goods Sold (HPP) & Profit calculation
  let todayCost = 0;
  todayTransactions.forEach(tx => {
    tx.items.forEach(item => {
      const kgQty = convertToKg(item.quantity, item.unit);
      const costPerKg = item.product.costPriceKg || (item.product.sellingPriceKg * 0.7);
      todayCost += kgQty * costPerKg;
    });
  });

  const todayProfit = Math.max(0, todayRevenue - todayCost);
  const todayProfitMargin = todayRevenue > 0 ? ((todayProfit / todayRevenue) * 100).toFixed(1) : '0';

  // 2. Stock Metrics
  const activeProducts = products.filter(p => !p.isDeleted);
  const totalStockKg = activeProducts.reduce((acc, p) => acc + (p.stockKg || 0), 0);
  const lowStockProducts = activeProducts.filter(p => p.stockKg <= p.minStockKg);
  const totalInventoryValue = activeProducts.reduce((acc, p) => acc + (p.stockKg * p.costPriceKg), 0);

  // 3. Weekly Sales Data (7 Days)
  const getWeeklyData = () => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      const dayTxs = transactions.filter(tx => tx.timestamp.startsWith(dateString) && tx.status === 'COMPLETED');
      const omzet = dayTxs.reduce((acc, t) => acc + t.totalAmount, 0);
      
      let modal = 0;
      dayTxs.forEach(tx => {
        tx.items.forEach(item => {
          const kgQty = convertToKg(item.quantity, item.unit);
          const cost = item.product.costPriceKg || (item.product.sellingPriceKg * 0.7);
          modal += kgQty * cost;
        });
      });

      const laba = Math.max(0, omzet - modal);

      list.push({
        day: dayName,
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        omzet: omzet,
        laba: laba,
        txCount: dayTxs.length
      });
    }
    return list;
  };

  const weeklyData = getWeeklyData();

  // 4. Top Selling Products Analysis
  const productSalesMap: { [key: string]: { product: FruitProduct; totalKg: number; revenue: number; txCount: number } } = {};

  transactions.filter(t => t.status === 'COMPLETED').forEach(tx => {
    tx.items.forEach(item => {
      const pId = item.product.id;
      const kgQty = convertToKg(item.quantity, item.unit);
      if (!productSalesMap[pId]) {
        const foundProd = activeProducts.find(p => p.id === pId) || item.product;
        productSalesMap[pId] = { product: foundProd, totalKg: 0, revenue: 0, txCount: 0 };
      }
      productSalesMap[pId].totalKg += kgQty;
      productSalesMap[pId].revenue += item.totalPrice;
      productSalesMap[pId].txCount += 1;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 5. Top Loyal Customers
  const activeCustomers = customers.filter(c => !c.isDeleted);
  const topLoyalCustomers = [...activeCustomers]
    .sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
    .slice(0, 5);

  // 6. Recent Transactions
  const recentTransactions = transactions.slice(0, 5);

  const currentBranch = branches.find(b => b.id === currentBranchId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner & Quick Overview Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
          <Store className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-emerald-100 backdrop-blur-md border border-white/20 uppercase tracking-wider">
                {userRole === 'OWNER' ? '👑 Owner Dashboard' : userRole === 'ADMIN' ? '🛡️ Admin Overview' : '🛒 Kasir Shift Active'}
              </span>
              <span className="text-xs text-emerald-200 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                {currentBranch?.name || 'Cabang Utama'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Ringkasan Operasional & Performansi Toko
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Pantau transaksi real-time, statistik penjualan harian, laba bersih, serta status stok buah segar.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onNavigateTab('pos')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-slate-900" />
              <span>Buka POS Kasir</span>
            </button>
            <button
              onClick={onOpenShiftModal}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Shift Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MENU (Menu Aksi Cepat) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Menu Aksi Cepat Operasional
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Transaksi POS</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Penjualan Timbangan</div>
          </button>

          <button
            onClick={() => onNavigateTab('master')}
            className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Master Katalog</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kelola Buah & Stok</div>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Inventori PO</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Restock & Opname</div>
          </button>

          <button
            onClick={() => onNavigateTab('barcodes')}
            className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Cetak Barcode</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stiker Harga Timbangan</div>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="p-3 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Laporan Keuangan</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Rekapitulasi Omset</div>
          </button>

          <button
            onClick={() => onNavigateTab('customers')}
            className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-xs text-slate-900 leading-tight">Data Member</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Level & Diskon VIP</div>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (Informasi Transaksi, Stok, Laba Harian) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Omzet Transaksi Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Omset Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(todayRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{todayTransactions.length} Transaksi Sukses Hari Ini</span>
            </div>
          </div>
        </div>

        {/* Card 2: Laba Harian (Daily Profit) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Laba Harian</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-900 tracking-tight">
              {formatRupiah(todayProfit)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-purple-700">
              <span className="px-1.5 py-0.5 bg-purple-100 rounded text-[10px] font-black">Margin {todayProfitMargin}%</span>
              <span>Bersih setelah Modal HPP</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Stok Produk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stok Tersedia</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStockKg.toFixed(1)} <span className="text-sm font-bold text-slate-500">Kg</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {activeProducts.length} Varietas Buah Segar dalam Katalog
            </div>
          </div>
        </div>

        {/* Card 4: Peringatan Stok Menipis */}
        <div className={`p-5 rounded-2xl border shadow-2xs hover:shadow-md transition-shadow ${
          lowStockProducts.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Peringatan Stok</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {lowStockProducts.length} <span className="text-sm font-bold text-slate-500">Produk</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-amber-800">
                {lowStockProducts.length > 0 ? 'Membutuhkan Restock PO!' : 'Semua Stok Aman'}
              </span>
              {lowStockProducts.length > 0 && (
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="text-xs font-extrabold text-amber-900 underline hover:text-amber-700"
                >
                  Restock
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* WEEKLY CHART (Grafik Penjualan Mingguan) & TOP SELLING PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Grafik Omset & Laba Mingguan (7 Hari)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Trend perbandingan total penjualan kasar dan estimasi keuntungan bersih</p>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Omset
              </span>
              <span className="flex items-center gap-1 text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Laba
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  labelFormatter={(label, items) => {
                    const item = items[0]?.payload;
                    return `${label} (${item?.date || ''})`;
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="omzet" name="Omset" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="laba" name="Laba Bersih" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products Analysis (1 Column) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Produk Terlaris
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Top 5</span>
            </div>

            <div className="mt-4 space-y-3">
              {topSellingProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">Belum ada data penjualan tercatat</div>
              ) : (
                topSellingProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-amber-400 text-slate-900' : index === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.product.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{item.totalKg.toFixed(1)} Kg Terjual ({item.txCount} Transaksi)</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-700">{formatRupiah(item.revenue)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('master')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 mt-3"
          >
            <span>Lihat Semua Katalog Produk</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* RECENT TRANSACTIONS & LOW STOCK WARNINGS & LOYAL CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Feed (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Transaksi Terbaru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi kasir yang baru saja diproses</p>
            </div>

            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Lihat Laporan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Belum ada transaksi hari ini</div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200">
                      🛒
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{tx.receiptNumber}</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <span>{tx.customerName || 'Pelanggan Umum'}</span>
                        <span>•</span>
                        <span>{new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{formatRupiah(tx.totalAmount)}</div>
                      <div className="text-[10px] text-slate-500">{tx.items.length} Barang ({tx.cashierName})</div>
                    </div>

                    <button
                      onClick={() => onOpenReceipt(tx)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Cetak / Lihat Struk"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Loyal Customers & Low Stock Column (1 Column) */}
        <div className="space-y-6">
          
          {/* Low Stock Warning Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stok Menipis (Warning)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                {lowStockProducts.length} Kritis
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-3 bg-emerald-50 rounded-xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Semua stok buah dalam kondisi aman!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-2 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-amber-800">Sisa: <span className="font-black">{p.stockKg} Kg</span> (Min: {p.minStockKg} Kg)</div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shadow-2xs"
                    >
                      Order PO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Loyal Customers Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Pelanggan Loyal
              </h2>
              <button
                onClick={() => onNavigateTab('customers')}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2.5">
              {topLoyalCustomers.map((cust, i) => (
                <div key={cust.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[10px] text-slate-500">{cust.phone}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                    {cust.memberType || 'REGULAR'} ({cust.totalOrders || 0} Order)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
