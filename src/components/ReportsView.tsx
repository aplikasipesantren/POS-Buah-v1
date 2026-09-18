import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, Download, 
  Sparkles, RefreshCw, ShoppingBag, Eye, RotateCcw,
  CreditCard, Banknote, Building, QrCode, FileText, Lock
} from 'lucide-react';
import { Transaction, FruitProduct, UserRole } from '../types';
import { formatRupiah, convertToKg } from '../utils/weightUtils';

interface ReportsViewProps {
  transactions: Transaction[];
  products: FruitProduct[];
  userRole?: UserRole;
  onOpenReceipt: (tx: Transaction) => void;
  onRefundTransaction: (txId: string) => void;
  onOpenAdminPinModal?: (callback: () => void) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  products,
  userRole = 'OWNER',
  onOpenReceipt,
  onRefundTransaction,
  onOpenAdminPinModal
}) => {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [endDate, setEndDate] = useState<string>(getTodayString());
  const [aiInsightText, setAiInsightText] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const handleRefundClick = (txId: string) => {
    if (userRole === 'KASIR' && onOpenAdminPinModal) {
      onOpenAdminPinModal(() => {
        onRefundTransaction(txId);
      });
    } else {
      if (confirm('Batalkan transaksi ini dan kembalikan stok buah?')) {
        onRefundTransaction(txId);
      }
    }
  };

  // Filter Transactions by Custom Date Range (Tanggal Awal s/d Tanggal Akhir)
  const filteredTransactions = transactions.filter(tx => {
    if (tx.status === 'REFUNDED') return false; // Exclude refunded for revenue calculation
    const txTime = new Date(tx.timestamp).getTime();

    if (startDate) {
      const startMs = new Date(`${startDate}T00:00:00`).getTime();
      if (txTime < startMs) return false;
    }
    if (endDate) {
      const endMs = new Date(`${endDate}T23:59:59.999`).getTime();
      if (txTime > endMs) return false;
    }

    return true;
  });

  // Financial Calculations
  const totalGrossSales = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);

  // Calculate COGS (HPP / Modal)
  let totalCostOfGoods = 0;
  let totalKgSold = 0;

  filteredTransactions.forEach(tx => {
    tx.items.forEach(item => {
      const qtyKg = convertToKg(item.quantity, item.unit);
      totalKgSold += qtyKg;
      totalCostOfGoods += qtyKg * item.product.costPriceKg;
    });
  });

  const totalNetProfit = totalGrossSales - totalCostOfGoods;
  const profitMarginPercent = totalGrossSales > 0 ? Math.round((totalNetProfit / totalGrossSales) * 100) : 0;
  const avgBasketSize = filteredTransactions.length > 0 ? totalGrossSales / filteredTransactions.length : 0;

  // Calculate Top Selling Fruits
  const fruitSalesMap: { [productId: string]: { fruit: FruitProduct; totalRevenue: number; totalKg: number } } = {};

  filteredTransactions.forEach(tx => {
    tx.items.forEach(item => {
      const pId = item.product.id;
      const qtyKg = convertToKg(item.quantity, item.unit);

      if (!fruitSalesMap[pId]) {
        fruitSalesMap[pId] = {
          fruit: item.product,
          totalRevenue: 0,
          totalKg: 0
        };
      }
      fruitSalesMap[pId].totalRevenue += item.totalPrice;
      fruitSalesMap[pId].totalKg += qtyKg;
    });
  });

  const topSellingFruits = Object.values(fruitSalesMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Load AI Insights
  useEffect(() => {
    fetchAiInsights();
  }, [startDate, endDate, transactions.length]);

  const fetchAiInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesData: {
            totalGrossSales,
            totalNetProfit,
            totalTransactions: filteredTransactions.length,
            totalKgSold
          },
          inventoryData: products.map(p => ({ name: p.name, stockKg: p.stockKg }))
        })
      });
      const data = await res.json();
      setAiInsightText(data.insight || 'Penjualan berjalan baik dan perputaran buah dalam batas optimal.');
    } catch (e) {
      setAiInsightText('Laporan Otomatis: Penjualan stabil. Pastikan stok buah berkadar air tinggi seperti Semangka dan Jeruk tetap dingin.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Export CSV Report Function
  const handleExportCSV = () => {
    const headers = ['No. Struk', 'Tanggal', 'Kasir', 'Pelanggan', 'Metode Pembayaran', 'Total Belanja (Rp)', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.receiptNumber,
      new Date(tx.timestamp).toLocaleString('id-ID'),
      tx.cashierName,
      tx.customerName || 'Umum',
      tx.paymentMethod,
      tx.totalAmount,
      tx.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_FruitKasir_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Date Filter & Export Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h2 className="font-extrabold text-base text-slate-900">Laporan Keuangan Real-Time</h2>
        </div>

        {/* Concise Date Range Picker (Tanggal Awal s/d Tanggal Akhir) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Awal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            />
          </div>

          <span className="text-slate-400 font-bold text-xs">s/d</span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Akhir:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setStartDate(getTodayString());
              setEndDate(getTodayString());
            }}
            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-xl transition-colors"
            title="Reset ke Hari Ini"
          >
            Hari Ini
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 ml-1 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Omset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Omset (Gross Sales)</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatRupiah(totalGrossSales)}</div>
          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
            {filteredTransactions.length} Transaksi Selesai
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Laba Bersih (Net Profit)</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{formatRupiah(totalNetProfit)}</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            Margin Keuntungan: +{profitMarginPercent}%
          </div>
        </div>

        {/* Total Buah Terjual */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Volume Buah Terjual</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            {totalKgSold.toFixed(1)} <span className="text-xs">kg</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Timbangan Kilo & Ons</div>
        </div>

        {/* Rata-rata Basket Size */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Rata-Rata Per Transaksi</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatRupiah(avgBasketSize)}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Struk Pembelian Pelanggan</div>
        </div>

      </div>

      {/* AI STORE INSIGHTS BANNER */}
      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-700 animate-pulse" />
            <h3 className="font-extrabold text-sm text-purple-900">Analisis Keuangan & Saran AI Gemini</h3>
          </div>
          <button
            onClick={fetchAiInsights}
            disabled={loadingAi}
            className="text-xs font-bold text-purple-800 hover:text-purple-900 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            Perbarui
          </button>
        </div>
        <p className="text-xs font-medium text-purple-950 leading-relaxed italic">
          "{aiInsightText || 'Memuat analisis keuangan AI...'}"
        </p>
      </div>

      {/* TOP SELLING FRUITS LIST */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          5 Buah Terlaris (Berdasarkan Omset)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topSellingFruits.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <img src={item.fruit.imageUrl} alt={item.fruit.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-[10px] font-extrabold text-purple-700">RANK #{idx + 1}</div>
                <div className="font-bold text-xs text-slate-900 truncate">{item.fruit.name}</div>
                <div className="text-xs font-extrabold text-emerald-800 mt-0.5">{formatRupiah(item.totalRevenue)}</div>
                <div className="text-[10px] text-slate-500">{item.totalKg.toFixed(1)} kg terjual</div>
              </div>
            </div>
          ))}

          {topSellingFruits.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-500 italic">
              Belum ada data transaksi pada periode tanggal ini.
            </div>
          )}
        </div>
      </div>

      {/* DETAILED TRANSACTIONS HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-2">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            Riwayat Transaksi Penjualan ({filteredTransactions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">No. Struk</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Kasir</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Total Belanja</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">
                    {tx.receiptNumber}
                  </td>

                  <td className="p-3.5 text-slate-600">
                    {new Date(tx.timestamp).toLocaleString('id-ID')}
                  </td>

                  <td className="p-3.5 font-semibold text-slate-800">
                    {tx.cashierName}
                  </td>

                  <td className="p-3.5 text-slate-700">
                    {tx.customerName || 'Umum'}
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-bold text-[10px]">
                      {tx.paymentMethod}
                    </span>
                  </td>

                  <td className="p-3.5 font-extrabold text-emerald-800">
                    {formatRupiah(tx.totalAmount)}
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => onOpenReceipt(tx)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Struk
                    </button>

                    <button
                      onClick={() => handleRefundClick(tx.id)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      title="Batalkan & Kembalikan Stok"
                    >
                      {userRole === 'KASIR' && <Lock className="w-3 h-3 text-red-500" />}
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
