import React, { useState } from 'react';
import { X, CreditCard, QrCode, Banknote, Building, CheckCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/weightUtils';
import { sounds } from '../utils/audioBeep';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  onCompletePayment: (
    method: PaymentMethod,
    cashPaid?: number,
    cashChange?: number,
    customerName?: string,
    notes?: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  tax,
  totalAmount,
  onCompletePayment
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashPaid, setCashPaid] = useState<number>(totalAmount);
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const cashChange = Math.max(0, cashPaid - totalAmount);
  const isInsufficientCash = paymentMethod === 'CASH' && cashPaid < totalAmount;

  const quickCashPresets = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
  ];

  const handleProcessPayment = () => {
    if (isInsufficientCash) return;

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    sounds.playSuccessSound();

    onCompletePayment(
      paymentMethod,
      paymentMethod === 'CASH' ? cashPaid : totalAmount,
      paymentMethod === 'CASH' ? cashChange : 0,
      customerName,
      notes
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base leading-tight">Pembayaran Kasir</h3>
            <p className="text-xs text-emerald-100">Total Tagihan: {formatRupiah(totalAmount)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Total Amount Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PEMBAYARAN</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{formatRupiah(totalAmount)}</div>
            <div className="text-xs text-slate-400 mt-0.5">({cartItems.length} Jenis Buah Ditimbang)</div>
            {Math.floor(totalAmount / 10000) > 0 && (
              <div className="mt-2 bg-amber-500/20 border border-amber-400/40 rounded-lg p-1.5 text-xs text-amber-200 flex items-center justify-center gap-1 font-bold">
                <span>🌟 Rewards Member:</span>
                <span className="text-amber-300 font-extrabold">+{Math.floor(totalAmount / 10000)} Poin</span>
                <span className="text-[10px] text-amber-200/80">(Tercatat di Struk)</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                Tunai
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                QRIS
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT')}
                className={`p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                  paymentMethod === 'DEBIT'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                Kartu / Debit
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building className="w-5 h-5 mb-1" />
                Transfer
              </button>
            </div>
          </div>

          {/* Cash Details */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">Uang Diterima Dari Pembeli:</label>
              
              <div className="flex gap-2">
                <span className="p-2.5 bg-slate-200 font-bold text-slate-700 rounded-lg text-sm">Rp</span>
                <input
                  type="number"
                  value={cashPaid || ''}
                  onChange={(e) => setCashPaid(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickCashPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashPaid(preset.value)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Change Display */}
              <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-300 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">UANG KEMBALIAN:</span>
                <span className="text-xl font-extrabold text-emerald-800">{formatRupiah(cashChange)}</span>
              </div>

              {isInsufficientCash && (
                <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Uang tunai kurang dari total tagihan!
                </div>
              )}
            </div>
          )}

          {/* QRIS View */}
          {paymentMethod === 'QRIS' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="text-xs font-bold text-slate-700">Scan Kode QRIS di Bawah Ini:</div>
              <div className="inline-block p-3 bg-white border-2 border-slate-900 rounded-xl shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=QRIS_FRUITKASIR_${totalAmount}`}
                  alt="QRIS Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-slate-500">Mendukung GoPay, OVO, ShopeePay, Dana, BCA, Mandiri QRIS</p>
            </div>
          )}

          {/* Optional Customer Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Pembeli (Opsional):</label>
            <input
              type="text"
              placeholder="Contoh: Ibu Rahma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isInsufficientCash}
            onClick={handleProcessPayment}
            className={`px-6 py-3 rounded-xl font-extrabold text-xs text-white shadow-md flex items-center gap-2 transition-transform active:scale-95 ${
              isInsufficientCash
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Selesaikan & Cetak Struk
          </button>
        </div>

      </div>
    </div>
  );
};
