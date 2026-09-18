import React, { useState } from 'react';
import { QrCode, Printer, Check, Copy } from 'lucide-react';
import { FruitProduct } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface BarcodeGeneratorViewProps {
  products: FruitProduct[];
}

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [stickerCount, setStickerCount] = useState<number>(6);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-base text-slate-900">Generator Stiker Barcode Timbangan</h2>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Cetak Lembar Stiker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Controls Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Pilih Buah Untuk Dibuatkan Stiker:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Jumlah Lembar Stiker Di-Cetak:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={stickerCount}
              onChange={(e) => setStickerCount(parseInt(e.target.value) || 1)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          {selectedProduct && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{selectedProduct.name}</div>
              <div>Harga / kg: <span className="font-bold text-emerald-800">{formatRupiah(selectedProduct.sellingPriceKg)}</span></div>
              <div>Harga / ons: <span className="font-bold text-amber-700">{formatRupiah(selectedProduct.sellingPriceOns || Math.round(selectedProduct.sellingPriceKg/10))}</span></div>
              <div className="font-mono text-slate-500 text-[10px]">Kode: {selectedProduct.barcode}</div>
            </div>
          )}
        </div>

        {/* Sticker Sheet Live Preview Grid */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
            Pratinjau Lembar Stiker Barcode Timbangan
          </h3>

          {selectedProduct && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {Array.from({ length: stickerCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border-2 border-slate-800 rounded-xl shadow-xs text-center space-y-1 font-mono text-[10px] leading-tight"
                >
                  <div className="font-extrabold text-slate-900 tracking-tight text-[11px]">🍎 TOKO BUAH SEGAR</div>
                  <div className="font-bold text-slate-800 line-clamp-1">{selectedProduct.name}</div>
                  
                  <div className="flex justify-around font-extrabold text-emerald-800 text-[11px] pt-0.5 border-t border-slate-200">
                    <span>{formatRupiah(selectedProduct.sellingPriceKg)}/kg</span>
                    <span className="text-amber-700">{formatRupiah(selectedProduct.sellingPriceOns || Math.round(selectedProduct.sellingPriceKg/10))}/ons</span>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="py-1">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${selectedProduct.barcode}`}
                      alt="Barcode"
                      className="w-16 h-16 object-contain mx-auto border border-slate-200 p-1"
                    />
                  </div>

                  <div className="font-bold text-slate-600 text-[9px] tracking-wider">{selectedProduct.barcode}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
