import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, Award, Check } from 'lucide-react';
import { Customer } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [memberType, setMemberType] = useState<'REGULAR' | 'VIP'>('REGULAR');
  const [initialPoints, setInitialPoints] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '-',
      address: address.trim() || '',
      memberType,
      points: initialPoints || 0,
      totalSpend: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString().slice(0,10),
      notes: notes.trim()
    };

    onAddCustomer(newCust);
    // Reset
    setName('');
    setPhone('');
    setAddress('');
    setMemberType('REGULAR');
    setInitialPoints(0);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Tambah Pelanggan Baru</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Nama Lengkap Pelanggan <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ibu Rina Susanti"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">No. Telepon / WA:</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kategori Member:</label>
              <div className="relative">
                <Award className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={memberType}
                  onChange={(e) => setMemberType(e.target.value as 'REGULAR' | 'VIP')}
                  className="w-full text-xs font-bold pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                >
                  <option value="REGULAR">Member Regular</option>
                  <option value="VIP">Member VIP ⭐</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Poin Awal (Bonus):</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={initialPoints || ''}
                onChange={(e) => setInitialPoints(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-extrabold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-amber-900"
              />
            </div>
          </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Alamat Lengkap Pengiriman (Untuk Delivery):
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Jl. Mawar No. 45, RT 02/05, Kec. Lowokwaru, Malang"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Catatan Tambahan (Opsional):</label>
            <input
              type="text"
              placeholder="Contoh: Suka buah mangga yang manis matang pohon"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Simpan Pelanggan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
