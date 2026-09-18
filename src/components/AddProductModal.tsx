import React, { useState } from 'react';
import { X, PackagePlus, Check, Tag, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { FruitProduct, FruitCategory } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<FruitProduct, 'id'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FruitCategory>('Lokal');
  const [barcode, setBarcode] = useState(`899100${Math.floor(10000 + Math.random() * 90000)}`);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80');
  const [costPriceKg, setCostPriceKg] = useState<number>(15000);
  const [sellingPriceKg, setSellingPriceKg] = useState<number>(25000);
  const [sellingPriceOns, setSellingPriceOns] = useState<number>(2600);
  const [stockKg, setStockKg] = useState<number>(20);
  const [minStockKg, setMinStockKg] = useState<number>(5);
  const [origin, setOrigin] = useState('Malang, Jawa Timur');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran file maksimal 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || sellingPriceKg <= 0) return;

    onAddProduct({
      name: name.trim(),
      category,
      barcode: barcode.trim() || `899100${Math.floor(10000 + Math.random() * 90000)}`,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
      costPriceKg,
      sellingPriceKg,
      sellingPriceOns: sellingPriceOns || Math.round(sellingPriceKg / 10),
      stockKg,
      minStockKg,
      unitType: 'weight',
      origin: origin.trim()
    });

    // Reset Form
    setName('');
    setCategory('Lokal');
    setCostPriceKg(15000);
    setSellingPriceKg(25000);
    setSellingPriceOns(2600);
    setStockKg(20);
    setOrigin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Tambah Produk Buah Baru</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Buah <span className="text-red-500">*</span>:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Apel Fuji Super Impor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kategori Buah:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FruitCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Lokal">Lokal</option>
                <option value="Impor">Impor</option>
                <option value="Organik">Organik</option>
                <option value="Potong & Jus">Potong & Jus</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kode Barcode:</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Modal / kg (Rp):</label>
              <input
                type="number"
                value={costPriceKg}
                onChange={(e) => setCostPriceKg(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Jual / kg (Rp):</label>
              <input
                type="number"
                required
                value={sellingPriceKg}
                onChange={(e) => {
                  const kgPrice = parseFloat(e.target.value) || 0;
                  setSellingPriceKg(kgPrice);
                  setSellingPriceOns(Math.round(kgPrice / 10));
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Harga Jual / ons (100g) (Rp):</label>
              <input
                type="number"
                value={sellingPriceOns}
                onChange={(e) => setSellingPriceOns(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Stok Awal (kg):</label>
              <input
                type="number"
                step="0.5"
                value={stockKg}
                onChange={(e) => setStockKg(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Asal Daerah / Negara:</label>
            <input
              type="text"
              placeholder="Contoh: Malang, Jawa Timur / Washington, USA"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Upload Foto Buah:</label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl p-3">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0 group bg-slate-100">
                  <img
                    src={imageUrl}
                    alt="Preview Buah"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0 text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{imageUrl ? 'Ganti Foto Buah' : 'Pilih Foto Buah'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-[10px] text-slate-500 font-medium">Format: JPG, PNG, WEBP (Maks 8MB)</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Simpan Produk Buah
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
