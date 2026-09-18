import React, { useState } from 'react';
import { KeyRound, ShieldAlert, X, Check } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean;
  title?: string;
  description?: string;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  title = 'Otorisasi PIN Admin / Owner',
  description = 'Kasir tidak diizinkan mengubah/menghapus transaksi tanpa izin Admin/Owner. Masukkan PIN Admin (Default: 1234).',
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMsg('Masukkan PIN terlebih dahulu!');
      return;
    }

    const isValid = onVerify(pin);
    if (isValid) {
      setPin('');
      setErrorMsg('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('PIN Admin / Owner Salah! Akses Ditolak.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in">
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-950" />
            <span className="text-sm">{title}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-950/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 text-center space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-2 my-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-xs'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl font-black text-slate-800 text-lg shadow-2xs transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 text-xs shadow-2xs transition-all active:scale-95"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl font-black text-slate-800 text-lg shadow-2xs transition-all active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-95 flex items-center justify-center"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 italic pt-1">
            Tips: Gunakan PIN 1234 jika belum diubah di Data Karyawan.
          </div>
        </div>
      </div>
    </div>
  );
};
