import React from 'react';
import { X, Printer, Share2, UserCheck, Store, CheckCircle2, FileText, Banknote } from 'lucide-react';
import { ShiftInfo, Transaction } from '../types';
import { formatRupiah } from '../utils/weightUtils';

export interface ShiftReportData {
  shiftInfo: ShiftInfo;
  actualCash: number;
  cashierNotes?: string;
  closedAt: string;
  transactions: Transaction[];
}

interface ShiftReceiptModalProps {
  reportData: ShiftReportData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftReceiptModal: React.FC<ShiftReceiptModalProps> = ({
  reportData,
  isOpen,
  onClose
}) => {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && reportData && receiptRef.current) {
      let printArea = document.getElementById('thermal-print-area');
      if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'thermal-print-area';
        document.body.appendChild(printArea);
      }
      printArea.innerHTML = receiptRef.current.innerHTML;
    }

    return () => {
      const printArea = document.getElementById('thermal-print-area');
      if (printArea) {
        printArea.innerHTML = '';
      }
    };
  }, [isOpen, reportData]);

  if (!isOpen || !reportData) return null;

  const { shiftInfo, actualCash, cashierNotes, closedAt, transactions } = reportData;

  // Filter completed transactions for this shift
  const shiftStartTime = new Date(shiftInfo.startTime).getTime();
  let shiftTxs = transactions.filter(t => {
    if (t.status !== 'COMPLETED') return false;
    const txTime = new Date(t.timestamp).getTime();
    return txTime >= shiftStartTime;
  });

  // Fallback if no matching timestamp range found
  if (shiftTxs.length === 0) {
    shiftTxs = transactions.filter(t => t.status === 'COMPLETED');
  }

  // Aggregate product sales
  const productSalesMap = new Map<string, {
    name: string;
    category: string;
    unitsMap: { [unit: string]: number };
    totalRevenue: number;
    count: number;
  }>();

  shiftTxs.forEach(tx => {
    tx.items.forEach(item => {
      const key = item.product.id || item.product.name;
      const existing = productSalesMap.get(key) || {
        name: item.product.name,
        category: item.product.category || 'Buah',
        unitsMap: {},
        totalRevenue: 0,
        count: 0
      };

      existing.unitsMap[item.unit] = (existing.unitsMap[item.unit] || 0) + item.quantity;
      existing.totalRevenue += item.totalPrice;
      existing.count += 1;

      productSalesMap.set(key, existing);
    });
  });

  const soldProducts = Array.from(productSalesMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalOmset = shiftInfo.totalCashSales + shiftInfo.totalNonCashSales;
  const cashDiscrepancy = actualCash - shiftInfo.expectedCashInDrawer;
  const grandTotalPhysicalPlusDigital = actualCash + shiftInfo.totalNonCashSales;

  const formatQtyString = (unitsMap: { [unit: string]: number }) => {
    return Object.entries(unitsMap)
      .map(([unit, qty]) => `${qty % 1 === 0 ? qty : qty.toFixed(2)} ${unit}`)
      .join(', ');
  };

  const handlePrint = () => {
    if (receiptRef.current) {
      let printArea = document.getElementById('thermal-print-area');
      if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'thermal-print-area';
        document.body.appendChild(printArea);
      }
      printArea.innerHTML = receiptRef.current.innerHTML;
    }
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*LAPORAN CLOSING SHIFT KASIR*%0A` +
      `TOKO BUAH SEGAR NUSANTARA%0A` +
      `--------------------------------%0A` +
      `Kasir: ${shiftInfo.cashierName}%0A` +
      `Buka Shift: ${new Date(shiftInfo.startTime).toLocaleString('id-ID')}%0A` +
      `Tutup Shift: ${new Date(closedAt).toLocaleString('id-ID')}%0A` +
      `Total Transaksi: ${shiftTxs.length} Tx%0A` +
      `--------------------------------%0A` +
      `*RINCIAN OMZET:*%0A` +
      `• Modal Awal Kas: ${formatRupiah(shiftInfo.initialCash)}%0A` +
      `• Penjualan Tunai: ${formatRupiah(shiftInfo.totalCashSales)}%0A` +
      `• Penjualan Non-Tunai: ${formatRupiah(shiftInfo.totalNonCashSales)}%0A` +
      `• *TOTAL OMZET SHIFT: ${formatRupiah(totalOmset)}*%0A` +
      `--------------------------------%0A` +
      `• Fisik Tunai Laci: ${formatRupiah(actualCash)}%0A` +
      `• Selisih Kas: ${formatRupiah(cashDiscrepancy)}%0A` +
      `• *TOTAL KESELURUHAN: ${formatRupiah(grandTotalPhysicalPlusDigital)}*%0A` +
      `--------------------------------%0A` +
      `*RINCIAN PRODUK TERJUAL (${soldProducts.length} Jenis):*%0A` +
      soldProducts.map(p => `- ${p.name}: ${formatQtyString(p.unitsMap)} = ${formatRupiah(p.totalRevenue)}`).join('%0A') +
      `%0A--------------------------------%0A` +
      `Catatan: ${cashierNotes || '-'}`;

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:p-0">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Top Header Bar - Screen Only */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Nota Closing Shift Kasir</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Body */}
        <div ref={receiptRef} className="printable-receipt p-6 overflow-y-auto bg-amber-50/40 text-slate-900 font-mono text-xs space-y-4 print:p-0 print:bg-white print:space-y-2">
          
          {/* Store Info Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3 print:pb-1.5">
            <div className="text-xl print:text-sm font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
              🍎 TOKO BUAH SEGAR
            </div>
            <div className="text-[11px] print:text-[9.5px] font-bold text-slate-800 uppercase mt-0.5">
              LAPORAN CLOSING SHIFT KASIR
            </div>
            <div className="text-[10px] print:text-[8.5px] text-slate-600">Jl. Raya Pasar Buah No. 88, Jakarta</div>
            <div className="text-[10px] print:text-[8.5px] text-slate-600">Telp/WA: 0812-3456-7890</div>
          </div>

          {/* Shift Metadata */}
          <div className="text-[11px] print:text-[9px] space-y-1 print:space-y-0.5 border-b border-dashed border-slate-400 pb-3 print:pb-1.5">
            <div className="flex justify-between">
              <span>Kasir Bertugas:</span>
              <span className="font-bold">{shiftInfo.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu Buka Shift:</span>
              <span>{new Date(shiftInfo.startTime).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu Tutup Shift:</span>
              <span>{new Date(closedAt).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total Transaksi:</span>
              <span>{shiftTxs.length} Transaksi</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-1.5 print:space-y-1 border-b border-dashed border-slate-400 pb-3 print:pb-1.5">
            <div className="font-bold text-[10px] print:text-[8.5px] text-slate-500 uppercase border-b border-slate-300 pb-1">
              1. RINCIAN OMZET & KAS SHIFT
            </div>
            <div className="flex justify-between text-[11px] print:text-[9px]">
              <span>Modal Awal Kas Laci:</span>
              <span>{formatRupiah(shiftInfo.initialCash)}</span>
            </div>
            <div className="flex justify-between text-[11px] print:text-[9px] text-emerald-800 print:text-slate-900 font-bold">
              <span>(+) Penjualan Tunai:</span>
              <span>{formatRupiah(shiftInfo.totalCashSales)}</span>
            </div>
            <div className="flex justify-between text-[11px] print:text-[9px] text-blue-800 print:text-slate-900 font-bold">
              <span>(+) Penjualan Non-Tunai:</span>
              <span>{formatRupiah(shiftInfo.totalNonCashSales)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-xs print:text-[10px] text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL OMZET SHIFT:</span>
              <span className="text-emerald-700 print:text-slate-900">{formatRupiah(totalOmset)}</span>
            </div>
            
            <div className="pt-2 print:pt-1 space-y-1 print:space-y-0.5 text-[10px] print:text-[8.5px]">
              <div className="flex justify-between text-slate-600 print:text-slate-900">
                <span>Estimasi Tunai Laci:</span>
                <span>{formatRupiah(shiftInfo.expectedCashInDrawer)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold">
                <span>Fisik Tunai Di Laci:</span>
                <span>{formatRupiah(actualCash)}</span>
              </div>
              <div className={`flex justify-between font-bold ${cashDiscrepancy === 0 ? 'text-slate-700 print:text-slate-900' : cashDiscrepancy > 0 ? 'text-emerald-700 print:text-slate-900' : 'text-red-600 print:text-slate-900'}`}>
                <span>Selisih Kas Laci:</span>
                <span>{cashDiscrepancy > 0 ? `+${formatRupiah(cashDiscrepancy)}` : formatRupiah(cashDiscrepancy)}</span>
              </div>
            </div>

            <div className="flex justify-between font-black text-slate-950 bg-slate-100 print:bg-transparent p-2 print:p-0 rounded mt-2 print:mt-1 text-xs print:text-[9.5px] border border-slate-300 print:border-none">
              <span>TOTAL FISIK + NON-TUNAI:</span>
              <span>{formatRupiah(grandTotalPhysicalPlusDigital)}</span>
            </div>
          </div>

          {/* Sold Products List */}
          <div className="space-y-2 print:space-y-1 border-b border-dashed border-slate-400 pb-3 print:pb-1.5">
            <div className="font-bold text-[10px] print:text-[8.5px] text-slate-500 uppercase flex justify-between border-b border-slate-300 pb-1">
              <span>2. PRODUK BUAH TERJUAL ({soldProducts.length})</span>
              <span>OMZET</span>
            </div>

            {soldProducts.length === 0 ? (
              <div className="text-center py-2 text-slate-500 italic text-[10px] print:text-[8.5px]">
                Belum ada produk terjual pada shift ini.
              </div>
            ) : (
              soldProducts.map((prod, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-slate-200/60 pb-1.5 print:pb-1 last:border-none">
                  <div className="font-bold text-slate-900 text-[11px] print:text-[9px] flex justify-between">
                    <span className="truncate max-w-[130px]">{idx + 1}. {prod.name}</span>
                    <span className="font-bold text-slate-900">{formatRupiah(prod.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] print:text-[8.5px] text-slate-600 print:text-slate-900 pl-3 print:pl-1">
                    <span>Qty: <span className="font-bold text-slate-800 print:text-slate-900">{formatQtyString(prod.unitsMap)}</span></span>
                    <span>{prod.count}x Trx</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cashier Notes */}
          {cashierNotes && (
            <div className="text-[10px] print:text-[8.5px] text-slate-700 print:text-slate-900 border-b border-dashed border-slate-400 pb-2 print:pb-1">
              <span className="font-bold">Catatan Shift:</span> {cashierNotes}
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center text-[10px] print:text-[8px] text-slate-500 print:text-slate-900 space-y-0.5 pt-1">
            <div>Dicetak Pada: {new Date().toLocaleString('id-ID')}</div>
            <div className="font-bold text-slate-700 print:text-slate-900 mt-1">*** DOKUMEN TANDA TERIMA SHIFT ***</div>
            <div>Sistem Kasir Buah Segar Digital</div>
          </div>

        </div>

        {/* Screen Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Nota Thermal
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Kirim WA
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
