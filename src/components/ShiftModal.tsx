import React, { useState } from 'react';
import { X, UserCheck, Banknote, ShieldCheck, Check, Printer } from 'lucide-react';
import { ShiftInfo } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftInfo: ShiftInfo;
  onCloseShift: (actualCash: number, notes?: string) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  shiftInfo,
  onCloseShift
}) => {
  if (!isOpen) return null;

  const [actualCash, setActualCash] = useState<number>(shiftInfo.expectedCashInDrawer);
  const [cashierNotes, setCashierNotes] = useState<string>('');

  const cashDiscrepancy = actualCash - shiftInfo.expectedCashInDrawer;
  const totalSalesThisShift = shiftInfo.totalCashSales + shiftInfo.totalNonCashSales;
  const grandTotalPhysicalPlusDigital = actualCash + shiftInfo.totalNonCashSales;

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(actualCash, cashierNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Laporan Shift Kasir</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirmClose} className="p-5 space-y-4">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Kasir Bertugas:</span>
              <span>{shiftInfo.cashierName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Jam Buka Shift:</span>
              <span>{new Date(shiftInfo.startTime).toLocaleTimeString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-600">Modal Kas Awal Laci:</span>
              <span className="font-bold text-slate-900">{formatRupiah(shiftInfo.initialCash)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-emerald-50 rounded-lg text-emerald-900">
              <span className="font-semibold">+ Penjualan Tunai:</span>
              <span className="font-extrabold">{formatRupiah(shiftInfo.totalCashSales)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-blue-50 rounded-lg text-blue-900">
              <span className="font-semibold">+ Penjualan Non-Tunai (QRIS/Debit):</span>
              <span className="font-extrabold">{formatRupiah(shiftInfo.totalNonCashSales)}</span>
            </div>

            <div className="flex justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-950 font-bold text-xs">
              <span>Total Omset Penjualan Shift:</span>
              <span>{formatRupiah(totalSalesThisShift)}</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-900 text-white rounded-xl font-extrabold text-xs mt-2">
              <span>ESTIMASI TUNAI DI LACI:</span>
              <span className="text-amber-400 text-sm">{formatRupiah(shiftInfo.expectedCashInDrawer)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Hitung Fisik Tunai Di Laci Kasir (Rp):
            </label>
            <input
              type="number"
              required
              value={actualCash}
              onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
              className="w-full text-base font-extrabold p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />

            {cashDiscrepancy !== 0 && (
              <div className={`mt-1 text-xs font-bold ${cashDiscrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {cashDiscrepancy > 0 ? `+ Surplus Kas: ${formatRupiah(cashDiscrepancy)}` : `- Selisih Minus: ${formatRupiah(cashDiscrepancy)}`}
              </div>
            )}
          </div>

          {/* Grand Total All Receipts (Physical Cash in Drawer + Non-Cash Digital) */}
          <div className="p-3 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-xl space-y-1 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              TOTAL KESELURUHAN (TUNAI FISIK LACI + NON-TUNAI)
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-emerald-100">
                Fisik: <span className="font-bold">{formatRupiah(actualCash)}</span> | Non-Tunai: <span className="font-bold">{formatRupiah(shiftInfo.totalNonCashSales)}</span>
              </div>
              <div className="text-base font-black text-amber-300 font-mono">
                {formatRupiah(grandTotalPhysicalPlusDigital)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Catatan Penutupan Shift:</label>
            <textarea
              rows={2}
              placeholder="Catatan penyerahan kasir..."
              value={cashierNotes}
              onChange={(e) => setCashierNotes(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Selesaikan Tutup Shift
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
