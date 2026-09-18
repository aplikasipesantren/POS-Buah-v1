import React from 'react';
import { X, Printer, Share2, PlusCircle, CheckCircle2, Store } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onStartNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onStartNewTransaction
}) => {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && transaction && receiptRef.current) {
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
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

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
    const pointsInfo = transaction.pointsEarned !== undefined && transaction.pointsEarned > 0
      ? `%0APoin Diperoleh: +${transaction.pointsEarned} Poin%0ATotal Poin Member: ${transaction.totalCustomerPoints || 0} Poin`
      : '';

    const text = `*STRUK BELANJA TOKO BUAH SEGAR NUSANTARA*%0A` +
      `No: ${transaction.receiptNumber}%0A` +
      `Tanggal: ${new Date(transaction.timestamp).toLocaleString('id-ID')}%0A` +
      `Kasir: ${transaction.cashierName}%0A` +
      (transaction.customerName ? `Pelanggan: ${transaction.customerName}%0A` : '') +
      `--------------------------------%0A` +
      transaction.items.map(i => `${i.product.name}%0A  ${i.quantity} ${i.unit} x ${i.effectivePricePerUnit.toLocaleString('id-ID')} = ${formatRupiah(i.totalPrice)}`).join('%0A') +
      `%0A--------------------------------%0A` +
      `*TOTAL: ${formatRupiah(transaction.totalAmount)}*%0A` +
      `Metode: ${transaction.paymentMethod}` +
      pointsInfo +
      `%0A--------------------------------%0A` +
      `Terima Kasih Telah Belanja Buah Segar!`;

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:p-0">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Top Header - Screen Only */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Struk Belanja Transaksi</h3>
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
            <div className="text-xl sm:text-2xl print:text-sm font-black text-slate-900 tracking-tight flex items-center justify-center gap-1">
              🍎 TOKO BUAH SEGAR
            </div>
            <div className="text-[11px] print:text-[9.5px] font-bold text-slate-700">Retail & Grosir Buah Segar Nusantara</div>
            <div className="text-[10px] print:text-[8.5px] text-slate-500 mt-0.5">Jl. Raya Pasar Buah No. 88, Jakarta</div>
            <div className="text-[10px] print:text-[8.5px] text-slate-500">Telp/WA: 0812-3456-7890</div>
          </div>

          {/* Receipt Metadata */}
          <div className="text-[11px] print:text-[9px] space-y-0.5 border-b border-dashed border-slate-400 pb-2 print:pb-1.5">
            <div className="flex justify-between">
              <span>No. Struk:</span>
              <span className="font-bold">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{new Date(transaction.timestamp).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold">
              <span>Jenis Pembelian:</span>
              <span className={`px-1.5 py-0.5 print:p-0 rounded text-[10px] print:text-[8.5px] uppercase ${transaction.orderType === 'DELIVERY' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 print:bg-transparent print:border-none' : 'bg-emerald-100 text-emerald-900 border border-emerald-300 print:bg-transparent print:border-none'}`}>
                {transaction.orderType === 'DELIVERY' ? '🚚 DELIVERY' : 'TAKE AWAY'}
              </span>
            </div>
            {transaction.customerName && (
              <>
                <div className="flex justify-between text-emerald-800 print:text-slate-900 font-bold">
                  <span>Pelanggan/Member:</span>
                  <span className="text-right truncate max-w-[140px]">{transaction.customerName} {transaction.customerPhone ? `(${transaction.customerPhone})` : ''}</span>
                </div>
                {transaction.orderType === 'DELIVERY' && transaction.customerAddress && (
                  <div className="text-[10px] print:text-[8.5px] text-indigo-900 print:text-slate-900 bg-indigo-50/80 print:bg-transparent p-1.5 print:p-0 rounded border border-indigo-200 print:border-none mt-1">
                    <span className="font-bold">📍 Alamat Delivery:</span> {transaction.customerAddress}
                  </div>
                )}
                {transaction.pointsEarned !== undefined && transaction.pointsEarned > 0 && (
                  <div className="mt-2 print:mt-1 p-2 print:p-1 bg-amber-50 print:bg-transparent border border-amber-300 print:border-dashed print:border-slate-400 rounded-lg print:rounded-none space-y-0.5 text-slate-900">
                    <div className="flex justify-between text-amber-900 print:text-slate-900 font-extrabold text-[11px] print:text-[8.5px]">
                      <span>🌟 Poin Didapat Transaksi Ini:</span>
                      <span>+{transaction.pointsEarned} Poin</span>
                    </div>
                    {transaction.totalCustomerPoints !== undefined && (
                      <div className="flex justify-between text-slate-700 print:text-slate-900 text-[10px] print:text-[8px] font-bold">
                        <span>🪙 Total Poin Member Sekarang:</span>
                        <span>{transaction.totalCustomerPoints} Poin</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-2 print:space-y-1 border-b border-dashed border-slate-400 pb-3 print:pb-1.5">
            <div className="font-bold text-[10px] print:text-[8.5px] text-slate-500 uppercase flex justify-between border-b border-slate-300 pb-1">
              <span>ITEM BUAH</span>
              <span>TOTAL</span>
            </div>

            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900 text-[11px] print:text-[9px] leading-tight">{item.product.name}</div>
                <div className="flex justify-between text-[11px] print:text-[8.5px] text-slate-600 print:text-slate-900 pl-2 print:pl-1">
                  <span>
                    {item.quantity} {item.unit} @ Rp {item.effectivePricePerUnit.toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.totalPrice)}</span>
                </div>
                {item.notes && (
                  <div className="text-[10px] print:text-[8px] text-slate-500 print:text-slate-800 italic pl-2 print:pl-1">* {item.notes}</div>
                )}
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 print:space-y-0.5 text-[11px] print:text-[9px] border-b border-dashed border-slate-400 pb-2 print:pb-1.5">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600 print:text-slate-900">
                <span>Diskon:</span>
                <span>-{formatRupiah(transaction.discount)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-amber-900 print:text-slate-900">
                <span>Pajak (PB1/PPN):</span>
                <span>+{formatRupiah(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm print:text-xs text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL BELANJA:</span>
              <span>{formatRupiah(transaction.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-0.5 text-[11px] print:text-[9px] border-b border-dashed border-slate-400 pb-2 print:pb-1.5">
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span className="font-bold">{transaction.paymentMethod}</span>
            </div>
            {transaction.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(transaction.cashPaid || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 print:text-slate-900">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(transaction.cashChange || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Message */}
          <div className="text-center pt-2 print:pt-1 text-[10px] print:text-[8px] text-slate-600 print:text-slate-900 space-y-0.5">
            <p className="font-bold text-slate-800 print:text-slate-900">*** TERIMA KASIH ***</p>
            <p>Buah segar dipetik langsung dengan kualitas terbaik.</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
          </div>

        </div>

        {/* Footer Actions - Screen Only */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Struk
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
              Kirim WA
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartNewTransaction();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Transaksi Baru
          </button>
        </div>

      </div>
    </div>
  );
};
