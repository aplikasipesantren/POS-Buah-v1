import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, KeyRound, Save, Check, Store } from 'lucide-react';
import { UserProfile, UserRole, Branch } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  branches: Branch[];
  onOpenLoginModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  setProfile,
  branches,
  onOpenLoginModal
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [pin, setPin] = useState(profile.pin);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSaved, setIsSaved] = useState(false);

  const currentBranch = branches.find(b => b.id === profile.branchId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name,
      email,
      phone,
      pin,
      avatarUrl
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in pb-16">
      
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-3">
        <div className="relative inline-block">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md mx-auto"
          />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900">{profile.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
              {profile.role === 'OWNER' && '👑 OWNER TOKO'}
              {profile.role === 'ADMIN' && '🛡️ ADMIN MANAGER'}
              {profile.role === 'KASIR' && '🛒 KASIR UTAMA'}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-amber-500" />
              {currentBranch?.name || 'Cabang Utama'}
            </span>
          </div>

          {onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="mt-3 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
            >
              <span>🔑 Ganti Akun / Login Otorisasi PIN</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">Informasi Profil Pengguna</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">PIN Otorisasi Transaksi (4-Digit)</label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Avatar Foto Profil</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Profil Berhasil Diperbarui!' : 'Simpan Perubahan Profil'}
        </button>
      </form>

    </div>
  );
};
