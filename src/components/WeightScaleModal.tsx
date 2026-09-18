import React, { useState, useEffect } from 'react';
import { X, Scale, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { FruitProduct, WeightUnit } from '../types';
import { formatRupiah, calculateItemPrice, getUnitLabel } from '../utils/weightUtils';
import { sounds } from '../utils/audioBeep';

interface WeightScaleModalProps {
  product: FruitProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: FruitProduct, quantity: number, unit: WeightUnit, notes?: string) => void;
}

export const WeightScaleModal: React.FC<WeightScaleModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(1.0);
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    // Reset defaults when product changes
    if (product.unitType === 'unit') {
      setUnit('pcs');
      setQuantity(1);
    } else {
      setUnit('kg');
      setQuantity(1.0);
    }
    setNotes('');
  }, [product]);

  const priceTotal = calculateItemPrice(product, quantity, unit);

  const handleAdjustWeight = (delta: number) => {
    setQuantity(prev => {
      const next = Math.max(0.1, Math.round((prev + delta) * 100) / 100);
      return next;
    });
  };

  const handleSetPreset = (val: number, selectedUnit: WeightUnit) => {
    setUnit(selectedUnit);
    setQuantity(val);
  };

  const handleConfirm = () => {
    if (quantity <= 0) return;
    sounds.playBarcodeBeep();
    onAddToCart(product, quantity, unit, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Scale className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Timbangan Digital Kasir</h3>
              <p className="text-xs text-emerald-100">Ukur Berat Buah Real-Time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Fruit Selected Info Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover shadow-2xs border border-slate-200"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">{product.category}</div>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{product.name}</h4>
              <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-3">
                <span>Harga Rp {product.sellingPriceKg.toLocaleString('id-ID')} / kg</span>
                <span className="text-emerald-700 font-semibold">Rp {(product.sellingPriceOns || Math.round(product.sellingPriceKg/10)).toLocaleString('id-ID')} / ons</span>
              </div>
            </div>
          </div>

          {/* Digital Scale LED Display */}
          <div className="bg-slate-950 p-4 rounded-xl border-2 border-slate-800 shadow-inner text-center">
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              SISTEM TIMBANGAN DIGITAL CAS-300
            </div>

            <div className="flex items-baseline justify-center gap-2 font-mono text-4xl sm:text-5xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              <span>{quantity.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
              <span className="text-xl sm:text-2xl text-emerald-600 font-bold uppercase">{unit}</span>
            </div>

            <div className="mt-2 text-xs font-mono text-amber-400 font-semibold border-t border-slate-800 pt-2 flex items-center justify-between px-2">
              <span>ESTIMASI HARGA:</span>
              <span className="text-base text-amber-300 font-bold">{formatRupiah(priceTotal)}</span>
            </div>
          </div>

          {/* Unit Selector Tabs */}
          {product.unitType === 'weight' && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Pilih Satuan Timbangan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['kg', 'ons', 'g'] as WeightUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      setUnit(u);
                      if (u === 'ons') setQuantity(5);
                      else if (u === 'g') setQuantity(500);
                      else setQuantity(1.0);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      unit === u
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {getUnitLabel(u)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Tombol Cepat (Preset Berat):
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSetPreset(0.5, 'kg')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300"
              >
                0.5 kg (5 Ons)
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(1.0, 'kg')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300"
              >
                1.0 kg
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(1.5, 'kg')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300"
              >
                1.5 kg
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(2.0, 'kg')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300"
              >
                2.0 kg
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(2.5, 'kg')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300"
              >
                2.5 kg
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(5, 'ons')}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg text-xs border border-amber-300"
              >
                5 Ons (½ kg)
              </button>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Atur Berat Presisi:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjustWeight(unit === 'ons' ? -1 : unit === 'g' ? -100 : -0.1)}
                className="p-2 bg-white text-slate-800 hover:bg-slate-200 rounded-lg border border-slate-300 font-bold active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <input
                type="number"
                step={unit === 'ons' ? '1' : unit === 'g' ? '50' : '0.05'}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-20 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded-lg py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() => handleAdjustWeight(unit === 'ons' ? 1 : unit === 'g' ? 100 : 0.1)}
                className="p-2 bg-white text-slate-800 hover:bg-slate-200 rounded-lg border border-slate-300 font-bold active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Catatan Kasir (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Pilihkan yang manis / sudah dipotong"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Total Tagihan Item:</div>
            <div className="text-lg font-extrabold text-emerald-800">{formatRupiah(priceTotal)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              + Masukkan Keranjang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
