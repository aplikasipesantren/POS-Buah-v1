import React, { useState } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, UserCheck, Store, LogIn, 
  Crown, Shield, ShoppingBag, CheckCircle2, AlertCircle, Sparkles,
  Scale, QrCode, TrendingUp, X, Building2, KeyRound
} from 'lucide-react';
import { Employee, UserProfile, UserRole, Branch } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  employees: Employee[];
  branches: Branch[];
  currentProfile: UserProfile;
  onLoginSuccess: (profile: UserProfile, role: UserRole, branchId: string) => void;
  isInitialAuth?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  branches,
  currentProfile,
  onLoginSuccess,
  isInitialAuth = false
}) => {
  const [username, setUsername] = useState<string>('owner');
  const [password, setPassword] = useState<string>('owner123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'b1');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  // Quick Preset Selector helper
  const handleQuickPreset = (roleType: 'OWNER' | 'ADMIN' | 'KASIR') => {
    setErrorMsg('');
    if (roleType === 'OWNER') {
      setUsername('owner');
      setPassword('owner123');
    } else if (roleType === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('kasir');
      setPassword('kasir123');
    }
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Masukkan username atau email Anda');
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Masukkan password Anda');
      return;
    }

    // Match employee by email, nip, or username prefix
    let matchedEmp = employees.find(emp => {
      const empEmail = (emp.email || '').toLowerCase();
      const empNameFirst = emp.name.split(' ')[0].toLowerCase();
      const empNip = emp.nip.toLowerCase();

      return empEmail === cleanUsername || 
             empNameFirst === cleanUsername || 
             empNip === cleanUsername ||
             (cleanUsername.includes('owner') && emp.role === 'OWNER') ||
             (cleanUsername.includes('admin') && emp.role === 'ADMIN') ||
             (cleanUsername.includes('kasir') && emp.role === 'KASIR');
    });

    if (!matchedEmp) {
      // Fallback to first employee matching role keyword or default
      if (cleanUsername.includes('owner')) {
        matchedEmp = employees.find(e => e.role === 'OWNER') || employees[0];
      } else if (cleanUsername.includes('admin')) {
        matchedEmp = employees.find(e => e.role === 'ADMIN') || employees[0];
      } else if (cleanUsername.includes('kasir')) {
        matchedEmp = employees.find(e => e.role === 'KASIR') || employees[0];
      } else {
        matchedEmp = employees[0];
      }
    }

    // Validate password (flexible for demo: accept matching PIN, role123, 1234, 123456, or non-empty)
    const isValidPassword = 
      cleanPassword === matchedEmp.pin || 
      cleanPassword === `${matchedEmp.role.toLowerCase()}123` || 
      cleanPassword === 'owner123' || 
      cleanPassword === 'admin123' || 
      cleanPassword === 'kasir123' || 
      cleanPassword === '1234' || 
      cleanPassword === '123456';

    if (isValidPassword) {
      const updatedProfile: UserProfile = {
        id: matchedEmp.id,
        nip: matchedEmp.nip,
        name: matchedEmp.name,
        email: matchedEmp.email,
        phone: matchedEmp.phone,
        role: matchedEmp.role,
        branchId: selectedBranchId,
        pin: matchedEmp.pin,
        avatarUrl: matchedEmp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };

      onLoginSuccess(updatedProfile, matchedEmp.role, selectedBranchId);
      setErrorMsg('');
    } else {
      setErrorMsg('Username atau password yang Anda masukkan salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* 2-Grid Container Premium Light Theme */}
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200/90 my-auto animate-scale-up grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* Modal Close Button */}
        {!isInitialAuth && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs"
            title="Tutup Halaman Login"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* GRID 1: LEFT COLUMN - BRANDING & PREMIUM SHOWCASE (LIGHT THEME) */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-amber-50/60 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative overflow-hidden">
          
          {/* Subtle Ambient Glow Shapes */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-44 h-44 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Header Brand Badge */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-2xl shadow-md border border-emerald-400/30">
                  🍊
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    FruitKasir <span className="text-emerald-700 font-extrabold text-xs px-2 py-0.5 bg-emerald-100 rounded-full border border-emerald-300 ml-1">PRO</span>
                  </h1>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sistem POS & Inventori Buah
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-2">
                Kelola penjualan timbangan buah presisi, cetak stiker barcode, restock supplier, dan analisa laba bersih secara real-time.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Timbangan Presisi Kg & Ons</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Auto hitung total berdasar bobot riil dengan tera timbangan digital.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Label Barcode & Thermal</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Generate SKU otomatis dan cetak stiker harga langsung dari kasir.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Laporan Laba Harian</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Hitung omzet bersih dikurangi modal HPP buah segar per shift.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Branch Info Widget Footer */}
          <div className="relative z-10 mt-6 p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-amber-400 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                {activeBranch.name}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[9px] border border-emerald-500/30">
                ● ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate font-medium">
              📍 {activeBranch.address}
            </div>
          </div>

        </div>

        {/* GRID 2: RIGHT COLUMN - USERNAME & PASSWORD FORM (PREMIUM LIGHT FORM) */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5 bg-white flex flex-col justify-between">
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Header Greeting */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  🔐 Login Otorisasi Akses
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Selamat Datang Kembali 👋
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan Username dan Password akun pengguna Anda.
              </p>
            </div>

            {/* Quick Demo Credentials Badges */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Quick Fill Akun Demo:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('OWNER')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    username === 'owner' 
                      ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-2xs ring-1 ring-purple-400' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">👑 Owner</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">owner / owner123</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('ADMIN')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    username === 'admin' 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs ring-1 ring-blue-400' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">🛡️ Admin</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">admin / admin123</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('KASIR')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    username === 'kasir' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs ring-1 ring-emerald-400' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-1">🛒 Kasir</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">kasir / kasir123</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username Input Field */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Username / Email Akun:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan username (contoh: owner, admin, kasir)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Password:
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan password akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Branch Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Pilih Cabang Operasional:
              </label>
              <div className="relative">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      🏬 {b.name} ({b.code}) — {b.address}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600">Ingat sesi login di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Masuk ke Sistem POS</span>
              </button>
            </div>

          </form>

          {/* Footer Security Badge */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Terkoneksi dengan Enkripsi Otorisasi Pos
            </span>
            <span className="font-mono text-slate-400">v2.4 Pro Light</span>
          </div>

        </div>

      </div>

    </div>
  );
};
